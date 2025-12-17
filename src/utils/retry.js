const { logger } = require('../utils/logger');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, options = {}) => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    onRetry = null,
  } = options;

  let lastError;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        throw error;
      }

      if (onRetry) {
        onRetry(error, attempt + 1);
      }

      logger.warn(`Retry attempt ${attempt + 1}/${maxRetries}`, {
        error: error.message,
        delay,
      });

      await sleep(delay);
      delay = Math.min(delay * backoffFactor, maxDelay);
    }
  }

  throw lastError;
};

const retryWithExponentialBackoff = async (fn, maxRetries = 3) => {
  return retryWithBackoff(fn, {
    maxRetries,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
  });
};

module.exports = {
  retryWithBackoff,
  retryWithExponentialBackoff,
};


