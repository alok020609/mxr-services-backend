const prisma = require('../config/database');

const DEFAULT_CONFIG = {
  triggers: {
    orderPlaced: false,
    orderShipped: false,
    invoiceCreated: false,
    invoiceSent: false,
  },
  details: {
    includeOrderSummary: true,
    includeInvoicePdf: true,
    includeShippingAddress: true,
  },
  contactNotificationEmail: null,
};

const MAIL_SETTINGS_ID = 'default';

/**
 * Get current mail settings (singleton). Returns default config if no row exists.
 */
async function getMailSettings() {
  let row = await prisma.mailSettings.findUnique({
    where: { id: MAIL_SETTINGS_ID },
  });
  if (!row || !row.config) {
    return {
      id: MAIL_SETTINGS_ID,
      config: { ...DEFAULT_CONFIG },
      updatedAt: new Date(),
    };
  }
  const config = typeof row.config === 'object' ? row.config : {};
  return {
    id: row.id,
    config: {
      triggers: { ...DEFAULT_CONFIG.triggers, ...(config.triggers || {}) },
      details: { ...DEFAULT_CONFIG.details, ...(config.details || {}) },
      contactNotificationEmail: config.contactNotificationEmail ?? DEFAULT_CONFIG.contactNotificationEmail,
    },
    updatedAt: row.updatedAt,
  };
}

/**
 * Update mail settings. Merges with existing config.
 */
async function updateMailSettings(body) {
  const { triggers, details, contactNotificationEmail } = body;
  const current = await getMailSettings();
  const newConfig = {
    triggers: { ...current.config.triggers, ...(triggers || {}) },
    details: { ...current.config.details, ...(details || {}) },
    contactNotificationEmail: contactNotificationEmail !== undefined ? contactNotificationEmail : current.config.contactNotificationEmail,
  };

  const updated = await prisma.mailSettings.upsert({
    where: { id: MAIL_SETTINGS_ID },
    create: {
      id: MAIL_SETTINGS_ID,
      config: newConfig,
    },
    update: { config: newConfig },
  });

  return {
    id: updated.id,
    config: typeof updated.config === 'object' ? updated.config : newConfig,
    updatedAt: updated.updatedAt,
  };
}

module.exports = {
  getMailSettings,
  updateMailSettings,
  DEFAULT_CONFIG,
  MAIL_SETTINGS_ID,
};
