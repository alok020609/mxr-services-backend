const prisma = require('../config/database');
const logger = require('../utils/logger');

class FeatureFlagService {
  static async evaluate(flagKey, context = {}) {
    const flag = await prisma.featureFlag.findUnique({
      where: { key: flagKey },
      include: {
        rules: {
          where: { isActive: true },
          orderBy: { priority: 'desc' },
        },
        overrides: {
          where: { isActive: true },
        },
      },
    });

    if (!flag || !flag.isEnabled) {
      return false;
    }

    // Check for user override
    if (context.userId) {
      const userOverride = flag.overrides.find((o) => o.userId === context.userId);
      if (userOverride) {
        return userOverride.enabled;
      }
    }

    // Check rollout percentage
    if (flag.rolloutPercentage < 100) {
      const hash = this.hashContext(flagKey, context);
      const percentage = (hash % 100) + 1;
      if (percentage > flag.rolloutPercentage) {
        return false;
      }
    }

    // Evaluate rules
    for (const rule of flag.rules) {
      if (this.evaluateRule(rule, context)) {
        return rule.enabled;
      }
    }

    // Default to flag enabled state
    return flag.isEnabled;
  }

  static hashContext(flagKey, context) {
    const str = `${flagKey}:${JSON.stringify(context)}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  static evaluateRule(rule, context) {
    if (!rule.conditions || rule.conditions.length === 0) {
      return true;
    }

    return rule.conditions.every((condition) => {
      const value = context[condition.field];
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'not_equals':
          return value !== condition.value;
        case 'greater_than':
          return parseFloat(value) > parseFloat(condition.value);
        case 'less_than':
          return parseFloat(value) < parseFloat(condition.value);
        case 'contains':
          return String(value).includes(condition.value);
        case 'in':
          return condition.value.includes(value);
        default:
          return false;
      }
    });
  }

  static async recordEvaluation(flagKey, context, result) {
    await prisma.featureFlagEvaluation.create({
      data: {
        flagKey,
        context: context || {},
        result,
      },
    });
  }

  static async getFlag(flagKey) {
    return prisma.featureFlag.findUnique({
      where: { key: flagKey },
      include: {
        rules: true,
        overrides: true,
        category: true,
      },
    });
  }

  static async getAllFlags() {
    return prisma.featureFlag.findMany({
      where: { isActive: true },
      include: {
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async createFlag(data) {
    return prisma.featureFlag.create({
      data: {
        key: data.key,
        name: data.name,
        description: data.description,
        isEnabled: data.isEnabled || false,
        rolloutPercentage: data.rolloutPercentage || 0,
        categoryId: data.categoryId,
      },
    });
  }

  static async updateFlag(flagKey, data) {
    return prisma.featureFlag.update({
      where: { key: flagKey },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.isEnabled !== undefined && { isEnabled: data.isEnabled }),
        ...(data.rolloutPercentage !== undefined && { rolloutPercentage: data.rolloutPercentage }),
      },
    });
  }

  static async getUsageStats(flagKey, startDate, endDate) {
    const evaluations = await prisma.featureFlagEvaluation.findMany({
      where: {
        flagKey,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    const total = evaluations.length;
    const enabled = evaluations.filter((e) => e.result === true).length;
    const disabled = total - enabled;

    return {
      total,
      enabled,
      disabled,
      enabledPercentage: total > 0 ? (enabled / total) * 100 : 0,
    };
  }
}

module.exports = { FeatureFlagService };


