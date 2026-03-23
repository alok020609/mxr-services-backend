const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const logger = require('../utils/logger');
const mailSettingsService = require('../services/mailSettingsService');
const { IntegrationsService } = require('../services/integrationsService');

function normalizeSelectedPackage(body) {
  if (body && typeof body === 'object' && body.selectedPackage && typeof body.selectedPackage === 'object') {
    return body.selectedPackage;
  }
  return body;
}

function parseBoolean(value) {
  if (value === true || value === false) return value;
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function asJsonPreBlock(obj) {
  const json = JSON.stringify(obj, null, 2);
  return `<pre style="background:#f6f8fa;border:1px solid #e5e7eb;padding:12px;border-radius:8px;white-space:pre-wrap;word-break:break-word;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,'Liberation Mono','Courier New',monospace;font-size:12px;color:#111827;">${escapeHtml(json)}</pre>`;
}

const submitPackageSelection = asyncHandler(async (req, res) => {
  // Authenticated endpoint; req.user is set by auth middleware
  const payload = normalizeSelectedPackage(req.body);

  const category = payload?.category;
  const name = payload?.name;
  const price = payload?.price;
  const isPopular = parseBoolean(payload?.isPopular);
  const features = payload?.features;

  if (!category || typeof category !== 'string' || !category.trim()) {
    return res.status(400).json({ success: false, error: 'category is required' });
  }
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, error: 'name is required' });
  }
  if (price === undefined || price === null || !(typeof price === 'string' || typeof price === 'number')) {
    return res.status(400).json({ success: false, error: 'price must be a string or number' });
  }
  if (isPopular === undefined) {
    return res.status(400).json({ success: false, error: 'isPopular must be a boolean' });
  }
  if (!Array.isArray(features) || !features.every((f) => typeof f === 'string')) {
    return res.status(400).json({ success: false, error: 'features must be an array of strings' });
  }

  const user = req.user;
  const userEmail = user?.email;
  if (!userEmail) {
    return res.status(400).json({ success: false, error: 'User email not available' });
  }

  const userName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || `${payload.name}`;
  const phone = user.phone || null;

  const selectedPackage = {
    ...payload,
    category,
    name,
    price,
    isPopular,
    features,
  };

  const fullMessageHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto;">
      <div style="padding: 18px 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <div style="margin-bottom: 14px;">
          <div style="font-size: 14px; color: #6b7280;">MXR Services</div>
          <div style="font-size: 20px; font-weight: 700; color: #111827;">Package Selection Confirmation</div>
        </div>

        <div style="margin-top: 12px;">
          <p style="margin: 0 0 10px 0; font-size: 14px; color: #374151;">
            Hello ${escapeHtml(user.firstName || userName || '')}${user.firstName ? ',' : ''} <br/>
            Thank you for your interest. We have received your package selection.
          </p>
        </div>

        <div style="margin-top: 18px;">
          <div style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 8px;">
            Selected Package Details
          </div>
          <table style="width:100%; border-collapse: collapse;">
            <tbody>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600; width: 30%;">Category</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(category)}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Package Name</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Price</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(price)}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Popular</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">${isPopular ? 'Yes' : 'No'}</td>
              </tr>
              <tr>
                <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Features</td>
                <td style="padding: 10px; border: 1px solid #e5e7eb;">
                  <ul style="margin:0; padding-left: 18px;">
                    ${features.map((f) => `<li style="margin: 2px 0;">${escapeHtml(f)}</li>`).join('')}
                  </ul>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin-top: 18px;">
          <div style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 8px;">
            Next Steps
          </div>
          <p style="margin: 0; font-size: 14px; color: #374151;">
            One of our team members will talk to you regarding this package.
          </p>
        </div>

        <div style="margin-top: 22px; padding-top: 14px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">
          Regards,<br/>
          <strong style="color:#111827;">MXR Services</strong>
        </div>
      </div>
    </div>
  `;

  const fullMessageText = `MXR Services\n\nHello ${user.firstName || userName || ''}${user.firstName ? ',' : ''}\n\nThank you for your interest. We have received your package selection.\n\nSelected Package Details:\n- Category: ${category}\n- Package Name: ${name}\n- Price: ${price}\n- Popular: ${isPopular ? 'Yes' : 'No'}\n- Features:\n${features.map((f) => `  - ${f}`).join('\n')}\n\nNext Steps:\nOne of our team members will talk to you regarding this package.\n\nRegards,\nMXR Services`;

  // Save lead/inquiry for admin review (reuse existing ContactSubmission model)
  const submission = await prisma.contactSubmission.create({
    data: {
      name: userName,
      email: userEmail,
      phone,
      freeSiteVisit: false,
      userId: user.id ?? null,
      status: 'NEW',
      message: JSON.stringify(
        {
          selectedPackage: {
            ...selectedPackage,
          },
        },
        null,
        2
      ),
    },
  });

  // 1) Email confirmation to user (non-blocking)
  const userSubject = `MXR Services - Package Selection Confirmation: ${name}`;
  try {
    await IntegrationsService.sendEmail({
      to: userEmail,
      subject: userSubject,
      text: fullMessageText,
      html: fullMessageHtml,
    });
  } catch (err) {
    logger.error('Failed to send package selection confirmation email', {
      userEmail,
      submissionId: submission.id,
      error: err.message,
    });
    return res.status(502).json({
      success: false,
      error: 'Package selection saved, but confirmation email could not be sent. Please try again.',
      data: { id: submission.id, createdAt: submission.createdAt },
    });
  }

  // 2) Notify internal team/admin email (non-blocking)
  mailSettingsService
    .getMailSettings()
    .then((s) => s.config?.contactNotificationEmail)
    .then((toNotify) => {
      const recipient =
        (toNotify && typeof toNotify === 'string' && toNotify.trim() ? toNotify.trim() : '') ||
        (process.env.CONTACT_NOTIFICATION_EMAIL || process.env.SMTP_USER || '').trim();

      if (!recipient) return;

      const adminSubject = `MXR Services - New Package Selection Lead: ${name}`;
      const adminHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto;">
          <div style="padding: 18px 20px; border: 1px solid #e5e7eb; border-radius: 12px;">
            <div style="margin-bottom: 10px;">
              <div style="font-size: 14px; color: #6b7280;">MXR Services</div>
              <div style="font-size: 20px; font-weight: 700; color: #111827;">New Package Selection Lead</div>
            </div>

            <div style="margin-top: 12px;">
              <div style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 8px;">
                Lead Submitted By
              </div>
              <table style="width:100%; border-collapse: collapse;">
                <tbody>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600; width: 30%;">Name</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(userName)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Email</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(userEmail)}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Phone</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(phone || '')}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px; border: 1px solid #e5e7eb; font-weight: 600;">Lead ID</td>
                    <td style="padding: 10px; border: 1px solid #e5e7eb;">${escapeHtml(submission.id)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="margin-top: 18px;">
              <div style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 8px;">
                Selected Package Summary
              </div>
              <ul style="margin:0; padding-left: 18px;">
                <li><strong>Category:</strong> ${escapeHtml(category)}</li>
                <li><strong>Package:</strong> ${escapeHtml(name)}</li>
                <li><strong>Price:</strong> ${escapeHtml(price)}</li>
                <li><strong>Popular:</strong> ${isPopular ? 'Yes' : 'No'}</li>
              </ul>
            </div>

            <div style="margin-top: 18px;">
              <div style="font-size: 14px; font-weight: 700; color: #111827; margin-bottom: 8px;">
                Full Payload
              </div>
              ${asJsonPreBlock(selectedPackage)}
            </div>

            <div style="margin-top: 22px; padding-top: 14px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">
              Regards,<br/>
              <strong style="color:#111827;">MXR Services</strong>
            </div>
          </div>
        </div>
      `;

      const adminText = `MXR Services\n\nNew package selection lead\n\nSubmitted By:\n- Name: ${userName}\n- Email: ${userEmail}\n- Phone: ${phone || ''}\n- Lead ID: ${submission.id}\n\nSelected Package:\n- Category: ${category}\n- Package Name: ${name}\n- Price: ${price}\n- Popular: ${isPopular ? 'Yes' : 'No'}\n\nFull Payload:\n${JSON.stringify(selectedPackage, null, 2)}`;

      return IntegrationsService.sendEmail({
        to: recipient,
        subject: adminSubject,
        text: adminText,
        html: adminHtml,
      });
    })
    .catch((err) => {
      logger.error('Failed to resolve mail settings for package selection notification', {
        submissionId: submission.id,
        error: err.message,
      });
    });

  return res.status(201).json({
    success: true,
    data: { id: submission.id, createdAt: submission.createdAt },
    message: 'Package selection received. Our team will contact you shortly.',
  });
});

module.exports = {
  submitPackageSelection,
};

