const prisma = require('../config/database');
const { logger } = require('../utils/logger');

class ObservabilityService {
  // SLA Definitions
  static getSLADefinitions() {
    return {
      api: {
        uptime: 99.9, // 99.9% uptime
        target: '99.9%',
        measurement: 'monthly',
      },
      database: {
        uptime: 99.95,
        target: '99.95%',
        measurement: 'monthly',
      },
      payment: {
        uptime: 99.99,
        target: '99.99%',
        measurement: 'monthly',
      },
    };
  }

  // SLO Definitions
  static getSLODefinitions() {
    return {
      api: {
        responseTime: {
          p50: 200, // 50th percentile < 200ms
          p95: 500, // 95th percentile < 500ms
          p99: 1000, // 99th percentile < 1000ms
        },
        errorRate: {
          target: 0.001, // 0.1% error rate
          threshold: 0.01, // 1% error rate (alert)
        },
        availability: {
          target: 0.999, // 99.9% availability
          threshold: 0.99, // 99% availability (alert)
        },
      },
      database: {
        queryTime: {
          p50: 50,
          p95: 200,
          p99: 500,
        },
        connectionPool: {
          utilization: 0.8, // 80% max utilization
        },
      },
    };
  }

  // Error Budget Calculation
  static calculateErrorBudget(slo, timeWindow) {
    const availability = slo.availability.target;
    const windowSeconds = timeWindow * 24 * 60 * 60; // Convert days to seconds
    const errorBudget = (1 - availability) * windowSeconds;

    return {
      totalBudget: errorBudget,
      budgetUnit: 'seconds',
      timeWindow,
    };
  }

  // Track SLO metrics
  static async recordSLOMetric(service, metricType, value, timestamp = new Date()) {
    await prisma.sloMetric.create({
      data: {
        service,
        metricType, // RESPONSE_TIME, ERROR_RATE, AVAILABILITY
        value,
        timestamp,
      },
    });
  }

  // Get SLO status
  static async getSLOStatus(service, startDate, endDate) {
    const metrics = await prisma.sloMetric.findMany({
      where: {
        service,
        timestamp: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    const slo = this.getSLODefinitions()[service];
    if (!slo) {
      return { error: 'SLO not defined for service' };
    }

    const responseTimes = metrics.filter((m) => m.metricType === 'RESPONSE_TIME').map((m) => m.value);
    const errors = metrics.filter((m) => m.metricType === 'ERROR').length;
    const total = metrics.length;

    const status = {
      service,
      period: { startDate, endDate },
      metrics: {
        responseTime: {
          p50: this.percentile(responseTimes, 50),
          p95: this.percentile(responseTimes, 95),
          p99: this.percentile(responseTimes, 99),
          targets: slo.responseTime,
          compliant: this.checkResponseTimeCompliance(responseTimes, slo.responseTime),
        },
        errorRate: {
          actual: total > 0 ? errors / total : 0,
          target: slo.errorRate.target,
          threshold: slo.errorRate.threshold,
          compliant: total > 0 ? errors / total <= slo.errorRate.target : true,
        },
      },
    };

    return status;
  }

  static percentile(values, p) {
    if (!values || values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[index] || 0;
  }

  static checkResponseTimeCompliance(responseTimes, targets) {
    if (!responseTimes || responseTimes.length === 0) return true;
    const p50 = this.percentile(responseTimes, 50);
    const p95 = this.percentile(responseTimes, 95);
    const p99 = this.percentile(responseTimes, 99);

    return (
      p50 <= targets.p50 &&
      p95 <= targets.p95 &&
      p99 <= targets.p99
    );
  }

  // Alert Thresholds
  static getAlertThresholds() {
    return {
      critical: {
        responseTime: 2000, // ms
        errorRate: 0.05, // 5%
        availability: 0.95, // 95%
      },
      warning: {
        responseTime: 1000, // ms
        errorRate: 0.01, // 1%
        availability: 0.99, // 99%
      },
      info: {
        responseTime: 500, // ms
        errorRate: 0.001, // 0.1%
        availability: 0.999, // 99.9%
      },
    };
  }

  // Check if alert should be triggered
  static async checkAlertConditions(service) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const metrics = await prisma.sloMetric.findMany({
      where: {
        service,
        timestamp: {
          gte: oneHourAgo,
        },
      },
    });

    const thresholds = this.getAlertThresholds();
    const alerts = [];

    const responseTimes = metrics.filter((m) => m.metricType === 'RESPONSE_TIME').map((m) => m.value);
    const errors = metrics.filter((m) => m.metricType === 'ERROR').length;
    const total = metrics.length;

    if (responseTimes.length > 0) {
      const p95 = this.percentile(responseTimes, 95);
      if (p95 > thresholds.critical.responseTime) {
        alerts.push({
          severity: 'CRITICAL',
          type: 'RESPONSE_TIME',
          value: p95,
          threshold: thresholds.critical.responseTime,
        });
      } else if (p95 > thresholds.warning.responseTime) {
        alerts.push({
          severity: 'WARNING',
          type: 'RESPONSE_TIME',
          value: p95,
          threshold: thresholds.warning.responseTime,
        });
      }
    }

    if (total > 0) {
      const errorRate = errors / total;
      if (errorRate > thresholds.critical.errorRate) {
        alerts.push({
          severity: 'CRITICAL',
          type: 'ERROR_RATE',
          value: errorRate,
          threshold: thresholds.critical.errorRate,
        });
      } else if (errorRate > thresholds.warning.errorRate) {
        alerts.push({
          severity: 'WARNING',
          type: 'ERROR_RATE',
          value: errorRate,
          threshold: thresholds.warning.errorRate,
        });
      }
    }

    return alerts;
  }

  // SLO Reporting
  static async generateSLOReport(service, period = 'daily') {
    const now = new Date();
    let startDate;
    let endDate = now;

    switch (period) {
      case 'daily':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'weekly':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'monthly':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const status = await this.getSLOStatus(service, startDate, endDate);
    const errorBudget = this.calculateErrorBudget(
      this.getSLODefinitions()[service],
      period === 'daily' ? 1 : period === 'weekly' ? 7 : 30
    );
    const alerts = await this.checkAlertConditions(service);

    return {
      service,
      period,
      startDate,
      endDate,
      status,
      errorBudget,
      alerts,
      generatedAt: now,
    };
  }
}

module.exports = { ObservabilityService };


