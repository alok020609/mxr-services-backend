const nodemailer = require('nodemailer');
const logger = require('./logger');
const { Resend } = require('resend');

// Check if SMTP is configured via environment
const isSMTPConfigured = () => {
  return !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
};

// Transporter from env (lazy-created when env is set)
let envTransporter = null;
const getEnvTransporter = () => {
  if (envTransporter) return envTransporter;
  if (!isSMTPConfigured()) return null;
  const port = parseInt(process.env.SMTP_PORT, 10);
  const useSSL =
    process.env.SMTP_SECURE != null
      ? String(process.env.SMTP_SECURE).toLowerCase() === 'true'
      : port === 465;
  envTransporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: useSSL,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  envTransporter.verify((err) => {
    if (err) logger.warn('SMTP configuration error:', err);
    else logger.info('SMTP transporter configured successfully');
  });
  return envTransporter;
};

/**
 * Get email transporter and from address.
 * Priority: env SMTP (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) first,
 * then admin panel SMTP (EmailService) as fallback.
 * @returns {Promise<{ transporter: object, from: string } | null>}
 */
const getTransporter = async () => {
  if (isSMTPConfigured()) {
    const t = getEnvTransporter();
    return t ? { transporter: t, from: process.env.SMTP_FROM || process.env.SMTP_USER } : null;
  }

  try {
    const prisma = require('../config/database');
    const emailService = await prisma.emailService.findFirst({
      where: { type: 'SMTP', isActive: true },
      orderBy: { isDefault: 'desc' },
    });
    if (emailService?.config) {
      const config = emailService.config;
      const port = config.port || 587;
      // Respect admin-configured secure flag (Zoho often requires STARTTLS on 587)
      const useSSL = typeof config.secure === 'boolean' ? config.secure : port === 465;
      const transporter = nodemailer.createTransport({
        host: config.host,
        port,
        secure: useSSL,
        auth: { user: config.user, pass: config.password },
      });
      return { transporter, from: config.from || config.user };
    }
  } catch (err) {
    logger.warn('Could not load SMTP from admin EmailService:', err.message);
  }
  return null;
};

/**
 * Send verification email
 * @param {string} email - Recipient email address
 * @param {string} token - Verification token
 * @param {string} firstName - User's first name (optional)
 */
const sendVerificationEmail = async (email, token, firstName = '') => {
  let from = null;
  let sendFn = null;

  if (process.env.RESEND_API_KEY) {
    const resendFromEmail =
      process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!resendFromEmail) {
      logger.warn(`Email verification skipped - Resend sender not configured. Would send to: ${email}`);
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    from = `MXR Services <${resendFromEmail}>`;

    sendFn = async ({ to, subject, text, html }) => {
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        text,
        html,
      });
      if (error) throw new Error(error.message || 'Resend email send failed');
      return data?.id || null;
    };
  } else {
    const transport = await getTransporter();
    if (!transport) {
      logger.warn(`Email verification skipped - SMTP not configured. Would send to: ${email}`);
      return;
    }
    const { transporter, from: transportFrom } = transport;
    from = transportFrom;
    sendFn = async ({ to, subject, text, html }) => {
      const info = await transporter.sendMail({ from, to, subject, text, html });
      return info.messageId;
    };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  // Link points to frontend so user lands on the app; frontend calls GET /api/v1/auth/verify-email/:token
  const verificationUrl = `${frontendUrl}/verify-email?token=${token}`;
  
  const greeting = firstName ? `Hello ${firstName},` : 'Hello,';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #ffffff;">
            <h1 style="color: #333333; margin: 0;">E-commerce Store</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 20px; background-color: #f4f4f4;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333333; margin: 0 0 20px 0;">Verify Your Email Address</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    ${greeting}
                  </p>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    Thank you for registering! Please verify your email address by clicking the button below:
                  </p>
                  <table role="presentation" style="width: 100%; margin: 30px 0;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="${verificationUrl}" style="display: inline-block; padding: 14px 28px; background-color: #007bff; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="color: #007bff; font-size: 14px; word-break: break-all; margin: 10px 0 0 0;">
                    ${verificationUrl}
                  </p>
                  <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 30px 0 0 0; border-top: 1px solid #eeeeee; padding-top: 20px;">
                    This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
    Verify Your Email Address
    
    ${greeting}
    
    Thank you for registering! Please verify your email address by visiting the following link:
    
    ${verificationUrl}
    
    This verification link will expire in 24 hours. If you didn't create an account, please ignore this email.
  `;

  try {
    const messageId = await sendFn({
      to: email,
      subject: 'Verify Your Email Address',
      text: textContent,
      html: htmlContent,
    });
    logger.info(`Verification email sent to ${email}: ${messageId}`);
  } catch (error) {
    logger.error(`Failed to send verification email to ${email}:`, error);
    // Don't throw - we don't want email failures to break registration
  }
};

/**
 * Send password reset email
 * @param {string} email - Recipient email address
 * @param {string} token - Password reset token
 * @param {string} firstName - User's first name (optional)
 */
const sendPasswordResetEmail = async (email, token, firstName = '') => {
  let from = null;
  let sendFn = null;

  if (process.env.RESEND_API_KEY) {
    const resendFromEmail =
      process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!resendFromEmail) {
      logger.warn(`Password reset email skipped - Resend sender not configured. Would send to: ${email}`);
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    from = `MXR Services <${resendFromEmail}>`;

    sendFn = async ({ to, subject, text, html }) => {
      const { data, error } = await resend.emails.send({
        from,
        to,
        subject,
        text,
        html,
      });
      if (error) throw new Error(error.message || 'Resend email send failed');
      return data?.id || null;
    };
  } else {
    const transport = await getTransporter();
    if (!transport) {
      logger.warn(`Password reset email skipped - SMTP not configured. Would send to: ${email}`);
      return;
    }
    const { transporter, from: transportFrom } = transport;
    from = transportFrom;
    sendFn = async ({ to, subject, text, html }) => {
      const info = await transporter.sendMail({ from, to, subject, text, html });
      return info.messageId;
    };
  }

  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  const resetUrl = `${frontendUrl}/reset-password?token=${token}`;
  
  const greeting = firstName ? `Hello ${firstName},` : 'Hello,';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #ffffff;">
            <h1 style="color: #333333; margin: 0;">E-commerce Store</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 20px; background-color: #f4f4f4;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="color: #333333; margin: 0 0 20px 0;">Reset Your Password</h2>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 20px 0;">
                    ${greeting}
                  </p>
                  <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                    We received a request to reset your password. Click the button below to create a new password:
                  </p>
                  <table role="presentation" style="width: 100%; margin: 30px 0;">
                    <tr>
                      <td style="text-align: center;">
                        <a href="${resetUrl}" style="display: inline-block; padding: 14px 28px; background-color: #dc3545; color: #ffffff; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset Password</a>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 30px 0 0 0;">
                    Or copy and paste this link into your browser:
                  </p>
                  <p style="color: #dc3545; font-size: 14px; word-break: break-all; margin: 10px 0 0 0;">
                    ${resetUrl}
                  </p>
                  <p style="color: #999999; font-size: 12px; line-height: 1.6; margin: 30px 0 0 0; border-top: 1px solid #eeeeee; padding-top: 20px;">
                    This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const textContent = `
    Reset Your Password
    
    ${greeting}
    
    We received a request to reset your password. Please visit the following link to create a new password:
    
    ${resetUrl}
    
    This password reset link will expire in 1 hour. If you didn't request a password reset, please ignore this email and your password will remain unchanged.
  `;

  try {
    const messageId = await sendFn({
      to: email,
      subject: 'Reset Your Password',
      text: textContent,
      html: htmlContent,
    });
    logger.info(`Password reset email sent to ${email}: ${messageId}`);
  } catch (error) {
    logger.error(`Failed to send password reset email to ${email}:`, error);
    // Don't throw - we don't want email failures to break password reset
  }
};

/**
 * Send contact form submission notification to admin. Uses getTransporter() (admin SMTP or env).
 * Non-blocking: log and return on failure.
 * @param {string} toEmail - Admin email to receive the notification
 * @param {object} submission - ContactSubmission fields: name, email, phone, message, freeSiteVisit, userId
 */
const sendContactSubmissionNotification = async (toEmail, submission) => {
  if (!toEmail || typeof toEmail !== 'string' || !toEmail.trim()) return;

  let from = null;
  let sendFn = null;
  if (process.env.RESEND_API_KEY) {
    const resendFromEmail =
      process.env.RESEND_FROM_EMAIL || process.env.SMTP_FROM || process.env.SMTP_USER;
    if (!resendFromEmail) {
      logger.warn('Contact submission notification skipped - Resend sender not configured.');
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    from = `MXR Services <${resendFromEmail}>`;
    sendFn = async ({ to, subject, text, html }) => {
      const { error } = await resend.emails.send({
        from,
        to,
        subject,
        text,
        html,
      });
      if (error) throw new Error(error.message || 'Resend email send failed');
    };
  } else {
    const transport = await getTransporter();
    if (!transport) {
      logger.warn('Contact submission notification skipped - SMTP not configured.');
      return;
    }
    const { transporter, from: transportFrom } = transport;
    from = transportFrom;
    sendFn = async ({ to, subject, text, html }) => {
      await transporter.sendMail({ from, to, subject, text, html });
    };
  }

  const { name, email, phone, message, freeSiteVisit } = submission;
  const phoneLine = phone ? `<p><strong>Phone:</strong> ${phone}</p>` : '';
  const siteVisitLine = freeSiteVisit ? '<p><strong>Free site visit requested:</strong> Yes</p>' : '';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>New Contact Submission</title></head>
    <body style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phoneLine}
      ${siteVisitLine}
      <p><strong>Message:</strong></p>
      <p style="white-space: pre-wrap;">${(message || '').replace(/</g, '&lt;')}</p>
    </body>
    </html>
  `;
  const textContent = `New Contact Form Submission\n\nName: ${name}\nEmail: ${email}${phone ? `\nPhone: ${phone}` : ''}${freeSiteVisit ? '\nFree site visit: Yes' : ''}\n\nMessage:\n${message || ''}`;
  try {
    await sendFn({
      to: toEmail.trim(),
      subject: 'New Contact Form Submission',
      text: textContent,
      html: htmlContent,
    });
    logger.info(`Contact submission notification sent to ${toEmail}`);
  } catch (error) {
    logger.error('Failed to send contact submission notification:', error);
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendContactSubmissionNotification,
  isSMTPConfigured,
  getTransporter,
};

