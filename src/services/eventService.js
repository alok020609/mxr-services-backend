const prisma = require('../config/database');
const { OutboxService } = require('./outboxService');
const logger = require('../utils/logger');

// Domain Events
const DOMAIN_EVENTS = {
  ORDER_PLACED: 'ORDER_PLACED',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  ORDER_SHIPPED: 'ORDER_SHIPPED',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  INVENTORY_UPDATED: 'INVENTORY_UPDATED',
  PRODUCT_CREATED: 'PRODUCT_CREATED',
  USER_REGISTERED: 'USER_REGISTERED',
};

class EventService {
  static async publish(eventType, payload, aggregateId, aggregateType) {
    // Publish to outbox
    const event = await OutboxService.publishEvent(
      eventType,
      payload,
      aggregateId,
      aggregateType
    );

    // TODO: Trigger event consumers asynchronously
    // This would be handled by a background worker

    return event;
  }

  static async getEvents(aggregateId, aggregateType) {
    return prisma.eventStore.findMany({
      where: {
        aggregateId,
        aggregateType,
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async replayEvents(aggregateId, aggregateType, fromVersion = 0) {
    const events = await prisma.eventStore.findMany({
      where: {
        aggregateId,
        aggregateType,
        version: { gte: fromVersion },
      },
      orderBy: { version: 'asc' },
    });

    return events;
  }

  static async getEvent(eventId) {
    return prisma.eventStore.findUnique({
      where: { id: eventId },
    });
  }
}

// Event Consumers
class EventConsumer {
  constructor(eventType, handler) {
    this.eventType = eventType;
    this.handler = handler;
  }

  async consume(event) {
    try {
      await this.handler(event);
      await OutboxService.markEventPublished(event.id);
    } catch (error) {
      logger.error(`Event consumption failed: ${this.eventType}`, {
        eventId: event.id,
        error: error.message,
      });
      await OutboxService.markEventFailed(event.id, error);
      throw error;
    }
  }
}

// Register event consumers
const eventConsumers = new Map();

const registerConsumer = (eventType, handler) => {
  const consumer = new EventConsumer(eventType, handler);
  eventConsumers.set(eventType, consumer);
  return consumer;
};

const getConsumer = (eventType) => {
  return eventConsumers.get(eventType);
};

module.exports = {
  EventService,
  EventConsumer,
  registerConsumer,
  getConsumer,
  DOMAIN_EVENTS,
};


