const prisma = require('../config/database');
const logger = require('../utils/logger');

class SagaService {
  static async createSaga(sagaType, payload) {
    const saga = await prisma.saga.create({
      data: {
        sagaType,
        payload,
        status: 'PENDING',
        currentStep: 0,
      },
    });

    logger.info(`Saga created: ${sagaType}`, { sagaId: saga.id });
    return saga;
  }

  static async executeStep(sagaId, stepIndex, stepData) {
    const saga = await prisma.saga.findUnique({
      where: { id: sagaId },
    });

    if (!saga) {
      throw new Error('Saga not found');
    }

    // Update saga step
    await prisma.saga.update({
      where: { id: sagaId },
      data: {
        currentStep: stepIndex,
        stepData: {
          ...saga.stepData,
          [stepIndex]: stepData,
        },
      },
    });

    return saga;
  }

  static async completeSaga(sagaId) {
    await prisma.saga.update({
      where: { id: sagaId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  }

  static async compensateSaga(sagaId, error) {
    const saga = await prisma.saga.findUnique({
      where: { id: sagaId },
    });

    if (!saga) {
      throw new Error('Saga not found');
    }

    // Execute compensation steps in reverse order
    logger.info(`Compensating saga: ${sagaId}`, { error: error.message });

    await prisma.saga.update({
      where: { id: sagaId },
      data: {
        status: 'COMPENSATING',
        error: error.message,
      },
    });

    // TODO: Execute compensation logic based on saga type
    // This would reverse all completed steps

    await prisma.saga.update({
      where: { id: sagaId },
      data: {
        status: 'COMPENSATED',
      },
    });
  }

  static async getSaga(sagaId) {
    return prisma.saga.findUnique({
      where: { id: sagaId },
    });
  }
}

module.exports = { SagaService };


