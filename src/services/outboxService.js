const prisma = require('../config/database');
const { logger } = require('../utils/logger');

class OutboxService {
  static async publishEvent(eventType, payload, aggregateId, aggregateType) {
    const event = await prisma.eventStore.create({
      data: {
        eventType,
        payload,
        aggregateId,
        aggregateType,
        status: 'PENDING',
        version: 1,
      },
    });

    logger.info(`Event published to outbox: ${eventType}`, { eventId: event.id });
    return event;
  }

  static async markEventPublished(eventId) {
    await prisma.eventStore.update({
      where: { id: eventId },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  static async markEventFailed(eventId, error) {
    await prisma.eventStore.update({
      where: { id: eventId },
      data: {
        status: 'FAILED',
        error: error.message,
      },
    });
  }

  static async getPendingEvents(limit = 100) {
    return prisma.eventStore.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }

  static async retryFailedEvents(limit = 50) {
    return prisma.eventStore.findMany({
      where: {
        status: 'FAILED',
        retryCount: { lt: 3 },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    });
  }
}

module.exports = { OutboxService };


