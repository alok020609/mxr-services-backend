const prisma = require('../config/database');
const { acquireLock, releaseLock } = require('../utils/lock');
const logger = require('../utils/logger');
const { retry } = require('../utils/retry');

/**
 * Consistency Service
 * 
 * Provides utilities for enforcing consistency guarantees across bounded contexts.
 * Supports both strong consistency (transactions, locks) and eventual consistency (events).
 */

/**
 * Executes an operation with strong consistency guarantees.
 * Uses database transactions and distributed locks.
 * 
 * @param {string} operationName - Name of the operation (for logging)
 * @param {Function} operation - The operation to execute
 * @param {object} options - Options for consistency enforcement
 * @param {string} [options.lockKey] - Redis lock key (optional)
 * @param {number} [options.lockTimeout=10000] - Lock timeout in ms
 * @param {number} [options.maxRetries=3] - Max retries for lock acquisition
 * @returns {Promise<any>} Result of the operation
 */
async function executeWithStrongConsistency(operationName, operation, options = {}) {
  const { lockKey, lockTimeout = 10000, maxRetries = 3 } = options;
  let lockId = null;

  try {
    // Acquire distributed lock if specified
    if (lockKey) {
      lockId = await retry(
        async () => await acquireLock(lockKey, lockTimeout),
        { retries: maxRetries, delay: 100 }
      );

      if (!lockId) {
        throw new Error(`Failed to acquire lock for ${operationName} after ${maxRetries} retries`);
      }

      logger.debug(`Acquired lock ${lockKey} for operation: ${operationName}`);
    }

    // Execute operation within transaction
    return await prisma.$transaction(async (tx) => {
      return await operation(tx);
    }, {
      maxWait: 10000, // Maximum time to wait for a transaction slot
      timeout: 30000, // Maximum time for transaction to complete
    });

  } catch (error) {
    logger.error(`Error in strongly consistent operation ${operationName}:`, error);
    throw error;
  } finally {
    // Release lock if acquired
    if (lockKey && lockId) {
      await releaseLock(lockKey, lockId);
      logger.debug(`Released lock ${lockKey} for operation: ${operationName}`);
    }
  }
}

/**
 * Executes an operation with eventual consistency guarantees.
 * Uses outbox pattern for reliable event publishing.
 * 
 * @param {string} operationName - Name of the operation (for logging)
 * @param {Function} operation - The operation to execute (receives tx and outboxService)
 * @param {object} options - Options for eventual consistency
 * @returns {Promise<any>} Result of the operation
 */
async function executeWithEventualConsistency(operationName, operation, options = {}) {
  const outboxService = require('./outboxService');

  try {
    return await prisma.$transaction(async (tx) => {
      // Execute operation and allow it to add events to outbox
      const result = await operation(tx, outboxService);
      
      // Events are added to outbox within the same transaction
      // They will be processed asynchronously by background workers
      
      logger.debug(`Operation ${operationName} completed with eventual consistency`);
      return result;
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

  } catch (error) {
    logger.error(`Error in eventually consistent operation ${operationName}:`, error);
    throw error;
  }
}

/**
 * Validates optimistic locking version before update.
 * Throws error if version mismatch (concurrent modification detected).
 * 
 * @param {object} tx - Prisma transaction
 * @param {string} model - Prisma model name (e.g., 'product', 'order')
 * @param {string} id - Record ID
 * @param {number} expectedVersion - Expected version number
 * @returns {Promise<boolean>} True if version matches
 * @throws {Error} If version mismatch
 */
async function validateVersion(tx, model, id, expectedVersion) {
  const record = await tx[model].findUnique({
    where: { id },
    select: { version: true }
  });

  if (!record) {
    throw new Error(`${model} with id ${id} not found`);
  }

  if (record.version !== expectedVersion) {
    throw new Error(
      `Version mismatch for ${model} ${id}. Expected ${expectedVersion}, got ${record.version}. Concurrent modification detected.`
    );
  }

  return true;
}

/**
 * Updates a record with optimistic locking.
 * Increments version field automatically.
 * 
 * @param {object} tx - Prisma transaction
 * @param {string} model - Prisma model name
 * @param {string} id - Record ID
 * @param {number} expectedVersion - Expected version number
 * @param {object} data - Update data (version will be auto-incremented)
 * @returns {Promise<object>} Updated record
 * @throws {Error} If version mismatch
 */
async function updateWithOptimisticLock(tx, model, id, expectedVersion, data) {
  // Validate version first
  await validateVersion(tx, model, id, expectedVersion);

  // Update with version increment
  return await tx[model].update({
    where: { id },
    data: {
      ...data,
      version: { increment: 1 }
    }
  });
}

/**
 * Checks if an operation should use strong or eventual consistency.
 * Based on context and operation type.
 * 
 * @param {string} context - Bounded context name (auth, catalog, orders, etc.)
 * @param {string} operationType - Operation type (create, update, delete, read)
 * @param {string} resourceType - Resource type (user, product, order, etc.)
 * @returns {string} 'strong' or 'eventual'
 */
function getConsistencyLevel(context, operationType, resourceType) {
  // Strong consistency rules
  const strongConsistencyRules = {
    auth: ['create', 'update', 'delete'], // All auth operations
    orders: ['create', 'update'], // Order creation and updates
    payments: ['create', 'update'], // All payment operations
    inventory: ['create', 'update'], // All inventory operations
  };

  // Check if operation requires strong consistency
  if (strongConsistencyRules[context]?.includes(operationType)) {
    return 'strong';
  }

  // Eventual consistency for:
  // - Search index updates
  // - Analytics
  // - Notifications (non-critical)
  // - Recommendations
  const eventualConsistencyResources = ['searchIndex', 'analytics', 'recommendations'];
  if (eventualConsistencyResources.includes(resourceType)) {
    return 'eventual';
  }

  // Default to strong for safety
  return 'strong';
}

/**
 * Compensates a failed operation by executing compensating actions.
 * Used in saga pattern for distributed transactions.
 * 
 * @param {string} operationName - Name of the failed operation
 * @param {object} operationData - Data from the failed operation
 * @param {Array<Function>} compensatingActions - Array of compensating action functions
 * @returns {Promise<void>}
 */
async function compensate(operationName, operationData, compensatingActions) {
  logger.warn(`Compensating operation: ${operationName}`, operationData);

  // Execute compensating actions in reverse order
  for (let i = compensatingActions.length - 1; i >= 0; i--) {
    try {
      await compensatingActions[i](operationData);
      logger.info(`Compensating action ${i} completed for ${operationName}`);
    } catch (error) {
      logger.error(`Compensating action ${i} failed for ${operationName}:`, error);
      // Continue with other compensating actions even if one fails
    }
  }

  logger.info(`Compensation completed for ${operationName}`);
}

/**
 * Ensures idempotency for an operation.
 * Checks if operation was already performed using idempotency key.
 * 
 * @param {string} idempotencyKey - Unique idempotency key
 * @param {Function} operation - The operation to execute
 * @returns {Promise<any>} Result of operation or cached result
 */
async function executeWithIdempotency(idempotencyKey, operation) {
  // Check if operation already performed
  const existing = await prisma.idempotencyKey.findUnique({
    where: { key: idempotencyKey }
  });

  if (existing && existing.responseBody) {
    logger.info(`Idempotent operation: returning cached result for key ${idempotencyKey}`);
    return {
      ...JSON.parse(existing.responseBody),
      _cached: true
    };
  }

  // Create idempotency record
  await prisma.idempotencyKey.upsert({
    where: { key: idempotencyKey },
    update: {},
    create: {
      key: idempotencyKey,
      requestBody: {},
      createdAt: new Date()
    }
  });

  try {
    // Execute operation
    const result = await operation();

    // Cache result
    await prisma.idempotencyKey.update({
      where: { key: idempotencyKey },
      data: {
        responseBody: JSON.stringify(result),
        responseStatus: 200,
        completedAt: new Date()
      }
    });

    return result;
  } catch (error) {
    // Mark as failed
    await prisma.idempotencyKey.update({
      where: { key: idempotencyKey },
      data: {
        status: 'FAILED',
        error: error.message,
        completedAt: new Date()
      }
    });
    throw error;
  }
}

module.exports = {
  executeWithStrongConsistency,
  executeWithEventualConsistency,
  validateVersion,
  updateWithOptimisticLock,
  getConsistencyLevel,
  compensate,
  executeWithIdempotency,
};


