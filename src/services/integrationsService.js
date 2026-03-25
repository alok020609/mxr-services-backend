const prisma = require('../config/database');
const logger = require('../utils/logger');
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const { AdminSMSServiceService } = require('./adminSMSServiceService');
const { AdminEmailServiceService } = require('./adminEmailServiceService');

class IntegrationsService {
  // SMS integration with database config support
  static async sendSMS(phoneNumber, message) {
    let smsService = null;

    // Try to get active SMS service from database
    try {
      smsService = await AdminSMSServiceService.getActiveSMSService();
    } catch (error) {
      logger.warn('Could not get SMS service from database, falling back to env vars:', error.message);
    }

    // Fall back to environment variables if no service configured
    if (!smsService) {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        throw new Error('SMS service not configured. Please configure SMS service in admin panel or set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN environment variables.');
      }

      const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

      try {
        const result = await client.messages.create({
          body: message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phoneNumber,
        });

        return {
          success: true,
          messageId: result.sid,
          status: result.status,
        };
      } catch (error) {
        logger.error('Twilio SMS error:', error);
        throw error;
      }
    }

    // Use configured SMS service
    const config = smsService.config;

    switch (smsService.type) {
      case 'TWILIO':
        const twilioClient = twilio(config.accountSid, config.authToken);
        try {
          const result = await twilioClient.messages.create({
            body: message,
            from: config.phoneNumber,
            to: phoneNumber,
          });

          return {
            success: true,
            messageId: result.sid,
            status: result.status,
          };
        } catch (error) {
          logger.error('Twilio SMS error:', error);
          throw error;
        }

      case 'AWS_SNS':
        // TODO: Implement AWS SNS
        throw new Error('AWS SNS SMS service not yet implemented');

      case 'MESSAGEBIRD':
        // TODO: Implement MessageBird
        throw new Error('MessageBird SMS service not yet implemented');

      default:
        throw new Error(`Unsupported SMS service type: ${smsService.type}`);
    }
  }

  // Email integration with database config support
  static async sendEmail({ to, subject, text, html, cc, bcc, attachments }) {
    const defaultCc = 'info@mxrservices.in';
    const normalizeCc = (ccValue) => {
      if (!ccValue) return [];
      const list = Array.isArray(ccValue) ? ccValue : [ccValue];
      return list
        .filter(Boolean)
        // Allow comma-separated string input defensively
        .flatMap((v) => (typeof v === 'string' && v.includes(',') ? v.split(',') : [v]))
        .map((v) => String(v).trim())
        .filter(Boolean);
    };

    // Always include default CC, deduped case-insensitively.
    const ccList = (() => {
      const merged = [defaultCc, ...normalizeCc(cc)];
      const seen = new Set();
      const out = [];
      for (const addr of merged) {
        const key = addr.toLowerCase();
        if (seen.has(key)) continue;
        seen.add(key);
        out.push(addr);
      }
      return out;
    })();

    // Resend-first: if RESEND_API_KEY exists, route all transactional emails through Resend.
    if (process.env.RESEND_API_KEY) {
      const resendFromEmail =
        process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
      if (!resendFromEmail) {
        throw new Error('Resend sender email is not configured. Set RESEND_FROM_EMAIL (preferred).');
      }

      const resend = new Resend(process.env.RESEND_API_KEY);

      const normalizedAttachments = Array.isArray(attachments)
        ? attachments
            .map((a) => {
              if (!a || typeof a !== 'object') return null;
              const att = {};
              if (a.filename) att.filename = a.filename;
              if (a.path) att.path = a.path;
              if (a.content != null) att.content = a.content;
              // Resend requires `filename` for most attachment types.
              return att.filename ? att : null;
            })
            .filter(Boolean)
        : undefined;

      const from = `MXR Services <${resendFromEmail}>`;

      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        text,
        html,
        cc: ccList,
        bcc: bcc ? (Array.isArray(bcc) ? bcc : [bcc]) : undefined,
        attachments: normalizedAttachments,
      });

      if (error) {
        logger.error('Resend email sending error:', {
          to,
          subject,
          error: error.message || error,
        });
        throw new Error(error.message || 'Resend email sending failed');
      }

      return {
        success: true,
        messageId: data?.id || null,
        accepted: [],
        rejected: [],
      };
    }

    let emailService = null;

    let transporter = null;
    let fromAddress = null;

    // Priority 1: Use environment SMTP values when present
    if (process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const port = parseInt(process.env.SMTP_PORT, 10);
      const useSSL =
        process.env.SMTP_SECURE != null
          ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
          : port === 465;

      transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: port,
        secure: useSSL,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      fromAddress = process.env.SMTP_FROM || process.env.SMTP_USER;
    } else {
      // Priority 2: fall back to active email service from database
      try {
        emailService = await AdminEmailServiceService.getActiveEmailService();
      } catch (error) {
        logger.warn('Could not get email service from database, and env SMTP is missing:', error.message);
      }

      if (!emailService) {
        throw new Error('Email service not configured. Set env SMTP values or configure email service in admin panel.');
      }

      // Use configured email service
      const config = emailService.config;

      switch (emailService.type) {
        case 'SMTP':
          const port = config.port || 587;
          // Respect admin-configured secure flag (Zoho often requires STARTTLS on 587)
          const useSSL = typeof config.secure === 'boolean' ? config.secure : port === 465;

          transporter = nodemailer.createTransport({
            host: config.host,
            port: port,
            secure: useSSL,
            auth: {
              user: config.user,
              pass: config.password,
            },
          });

          fromAddress = config.from;
          break;

        case 'SENDGRID':
          // TODO: Implement SendGrid
          throw new Error('SendGrid email service not yet implemented');

        case 'MAILGUN':
          // TODO: Implement Mailgun
          throw new Error('Mailgun email service not yet implemented');

        case 'AWS_SES':
          // TODO: Implement AWS SES
          throw new Error('AWS SES email service not yet implemented');

        default:
          throw new Error(`Unsupported email service type: ${emailService.type}`);
      }
    }

    if (!transporter) {
      throw new Error('Email transporter not configured');
    }

    try {
      const mailOptions = {
        from: fromAddress,
        to: to,
        subject: subject,
        text: text,
        html: html,
      };

      mailOptions.cc = ccList;
      if (bcc) mailOptions.bcc = Array.isArray(bcc) ? bcc : [bcc];
      if (attachments) mailOptions.attachments = attachments;

      const info = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: info.messageId,
        accepted: info.accepted,
        rejected: info.rejected,
      };
    } catch (error) {
      logger.error('Email sending error:', error);
      throw error;
    }
  }

  // Marketing automation (Mailchimp/SendGrid)
  static async addToMarketingList(email, listId, tags = []) {
    // TODO: Implement Mailchimp/SendGrid API integration
    // This is a placeholder
    return {
      success: true,
      email,
      listId,
      tags,
    };
  }

  // Analytics tools (Google Analytics, Facebook Pixel)
  static async trackAnalyticsEvent(eventType, eventData) {
    // TODO: Implement Google Analytics/Facebook Pixel tracking
    await prisma.analyticsEvent.create({
      data: {
        eventType,
        metadata: eventData,
      },
    });

    return { success: true };
  }

  // CRM integration (Salesforce, HubSpot)
  static async syncToCRM(entityType, entityId, crmData) {
    // TODO: Implement Salesforce/HubSpot API integration
    const integration = await prisma.integration.findFirst({
      where: {
        type: 'CRM',
        isActive: true,
      },
    });

    if (!integration) {
      throw new Error('CRM integration not configured');
    }

    // Store sync record
    await prisma.integrationSync.create({
      data: {
        integrationId: integration.id,
        entityType,
        entityId,
        status: 'SYNCED',
        metadata: crmData,
      },
    });

    return { success: true };
  }

  // ERP integration
  static async syncToERP(entityType, entityId, erpData) {
    // TODO: Implement ERP API integration
    const integration = await prisma.integration.findFirst({
      where: {
        type: 'ERP',
        isActive: true,
      },
    });

    if (!integration) {
      throw new Error('ERP integration not configured');
    }

    await prisma.integrationSync.create({
      data: {
        integrationId: integration.id,
        entityType,
        entityId,
        status: 'SYNCED',
        metadata: erpData,
      },
    });

    return { success: true };
  }

  // WMS (Warehouse Management System) integration
  static async syncToWMS(orderId, wmsData) {
    // TODO: Implement WMS API integration
    const integration = await prisma.integration.findFirst({
      where: {
        type: 'WMS',
        isActive: true,
      },
    });

    if (!integration) {
      throw new Error('WMS integration not configured');
    }

    await prisma.integrationSync.create({
      data: {
        integrationId: integration.id,
        entityType: 'ORDER',
        entityId: orderId,
        status: 'SYNCED',
        metadata: wmsData,
      },
    });

    return { success: true };
  }

  // Social media integration
  static async postToSocialMedia(platform, content) {
    // TODO: Implement social media API integrations (Facebook, Instagram, Twitter, etc.)
    return {
      success: true,
      platform,
      postId: `post_${Date.now()}`,
    };
  }

  // Webhook management
  static async createWebhook(url, events, secret) {
    const webhook = await prisma.webhook.create({
      data: {
        url,
        events: events || [],
        secret: secret || require('crypto').randomBytes(32).toString('hex'),
        isActive: true,
      },
    });

    return webhook;
  }

  static async triggerWebhook(webhookId, eventType, payload) {
    const webhook = await prisma.webhook.findUnique({
      where: { id: webhookId },
    });

    if (!webhook || !webhook.isActive) {
      throw new Error('Webhook not found or inactive');
    }

    if (!webhook.events.includes(eventType)) {
      return { success: false, message: 'Event type not subscribed' };
    }

    // TODO: Actually send HTTP request to webhook URL
    // This is a placeholder
    const webhookLog = await prisma.webhookLog.create({
      data: {
        webhookId,
        eventType,
        payload,
        status: 'PENDING',
      },
    });

    return {
      success: true,
      logId: webhookLog.id,
    };
  }
}

module.exports = { IntegrationsService };


