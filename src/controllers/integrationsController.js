const { IntegrationsService } = require('../services/integrationsService');
const { asyncHandler } = require('../utils/asyncHandler');

const sendSMS = asyncHandler(async (req, res) => {
  const { phoneNumber, message } = req.body;

  const result = await IntegrationsService.sendSMS(phoneNumber, message);

  res.json({
    success: true,
    data: result,
  });
});

const sendEmail = asyncHandler(async (req, res) => {
  const { to, subject, text, html, cc, bcc, attachments } = req.body;

  const result = await IntegrationsService.sendEmail({
    to,
    subject,
    text,
    html,
    cc,
    bcc,
    attachments,
  });

  res.json({
    success: true,
    data: result,
  });
});

const addToMarketingList = asyncHandler(async (req, res) => {
  const { email, listId, tags } = req.body;

  const result = await IntegrationsService.addToMarketingList(email, listId, tags);

  res.json({
    success: true,
    data: result,
  });
});

const trackAnalyticsEvent = asyncHandler(async (req, res) => {
  const { eventType, eventData } = req.body;

  const result = await IntegrationsService.trackAnalyticsEvent(eventType, eventData);

  res.json({
    success: true,
    data: result,
  });
});

const syncToCRM = asyncHandler(async (req, res) => {
  const { entityType, entityId, crmData } = req.body;

  const result = await IntegrationsService.syncToCRM(entityType, entityId, crmData);

  res.json({
    success: true,
    data: result,
  });
});

const syncToERP = asyncHandler(async (req, res) => {
  const { entityType, entityId, erpData } = req.body;

  const result = await IntegrationsService.syncToERP(entityType, entityId, erpData);

  res.json({
    success: true,
    data: result,
  });
});

const syncToWMS = asyncHandler(async (req, res) => {
  const { orderId, wmsData } = req.body;

  const result = await IntegrationsService.syncToWMS(orderId, wmsData);

  res.json({
    success: true,
    data: result,
  });
});

const postToSocialMedia = asyncHandler(async (req, res) => {
  const { platform, content } = req.body;

  const result = await IntegrationsService.postToSocialMedia(platform, content);

  res.json({
    success: true,
    data: result,
  });
});

const createWebhook = asyncHandler(async (req, res) => {
  const { url, events, secret } = req.body;

  const webhook = await IntegrationsService.createWebhook(url, events, secret);

  res.status(201).json({
    success: true,
    data: webhook,
  });
});

const triggerWebhook = asyncHandler(async (req, res) => {
  const { webhookId, eventType, payload } = req.body;

  const result = await IntegrationsService.triggerWebhook(webhookId, eventType, payload);

  res.json({
    success: true,
    data: result,
  });
});

module.exports = {
  sendSMS,
  sendEmail,
  addToMarketingList,
  trackAnalyticsEvent,
  syncToCRM,
  syncToERP,
  syncToWMS,
  postToSocialMedia,
  createWebhook,
  triggerWebhook,
};


