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
    <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 0 12px;">
      <div style="border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background: #ffffff;">
        <div style="padding: 16px 20px; background: linear-gradient(90deg, #2563eb 0%, #06b6d4 100%);">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="width: 56px; vertical-align: middle;">
                <img
                  src="https://mxrservices.in/mainlogo.png"
                  alt="MXR Services"
                  style="width: 48px; height: 48px; object-fit: contain; display: block; border-radius: 12px; background: rgba(255,255,255,0.25);"
                />
              </td>
              <td style="vertical-align: middle;">
                <div style="font-size: 14px; color: #e0f2fe; font-weight: 700; margin-bottom: 2px;">MXR Services</div>
                <div style="font-size: 20px; color: #ffffff; font-weight: 800;">Package Selection Confirmation</div>
              </td>
            </tr>
          </table>
        </div>

        <div style="padding: 20px;">
          <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 14px; padding: 14px 16px; margin-bottom: 16px;">
            <div style="font-size: 14px; color: #0c4a6e; font-weight: 800; margin-bottom: 6px;">
              Hello ${escapeHtml(user.firstName || userName || '')}${user.firstName ? ',' : ''}
            </div>
            <div style="font-size: 14px; color: #334155; line-height: 1.6;">
              Thank you for your interest. We have received your package selection.
            </div>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px; margin-bottom: 16px;">
            <div style="font-size: 14px; font-weight: 900; color: #111827; margin-bottom: 12px;">
              Package Summary
            </div>

            <table style="width:100%; border-collapse: collapse;">
              <tbody>
                <tr>
                  <td style="padding: 10px 8px; font-weight: 700; color: #1f2937; width: 30%;">Category</td>
                  <td style="padding: 10px 8px;">
                    <span style="display:inline-block; background:#dbeafe; color:#1d4ed8; border:1px solid #bfdbfe; padding:6px 10px; border-radius: 999px; font-size: 13px; font-weight: 700;">${escapeHtml(category)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 8px; font-weight: 700; color: #1f2937;">Package Name</td>
                  <td style="padding: 10px 8px;">
                    <span style="display:inline-block; background:#fef3c7; color:#92400e; border:1px solid #fde68a; padding:6px 10px; border-radius: 999px; font-size: 13px; font-weight: 700;">${escapeHtml(name)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 8px; font-weight: 700; color: #1f2937;">Price</td>
                  <td style="padding: 10px 8px;">
                    <span style="display:inline-block; background:#dcfce7; color:#166534; border:1px solid #bbf7d0; padding:6px 10px; border-radius: 999px; font-size: 13px; font-weight: 700;">${escapeHtml(price)}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 10px 8px; font-weight: 700; color: #1f2937;">Popular</td>
                  <td style="padding: 10px 8px;">
                    <span style="display:inline-block; background:${isPopular ? '#dbeafe' : '#f3f4f6'}; color:${isPopular ? '#1d4ed8' : '#374151'}; border:1px solid #e5e7eb; padding:6px 10px; border-radius: 999px; font-size: 13px; font-weight: 700;">${isPopular ? 'Yes' : 'No'}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 16px; margin-bottom: 16px;">
            <div style="font-size: 14px; font-weight: 900; color: #111827; margin-bottom: 10px;">Features</div>
            <div style="line-height: 1.4;">
              ${features
                .map(
                  (f) => `
                    <span style="display:inline-block; background:#e0f2fe; color:#075985; border:1px solid #bae6fd; padding:8px 10px; border-radius: 999px; font-size: 13px; font-weight: 700; margin: 0 8px 10px 0;">
                      ${escapeHtml(f)}
                    </span>
                  `
                )
                .join('')}
            </div>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 14px; padding: 14px 16px;">
            <div style="font-size: 14px; font-weight: 900; color: #166534; margin-bottom: 6px;">Next Steps</div>
            <div style="font-size: 14px; color: #14532d; line-height: 1.6;">
              One of our team members will talk to you regarding this package.
            </div>
          </div>
        </div>

        <div style="padding: 14px 20px; background: #f8fafc; color: #6b7280; font-size: 13px; border-top: 1px solid #e5e7eb;">
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
        <div style="font-family: Arial, sans-serif; max-width: 720px; margin: 0 auto; padding: 0;">
          <div style="border-radius: 16px; overflow: hidden; background: #0b5fff;">
            <div style="padding: 18px 20px; display: flex; align-items: center; gap: 14px;">
              <img
                src="https://mxrservices.in/mainlogo.png"
                width="56"
                height="56"
                alt="MXR Services"
                style="display:block; border-radius: 12px; background:#ffffff;"
              />
              <div>
                <div style="font-size: 13px; color: rgba(255,255,255,0.9); font-weight: 600; letter-spacing: 0.2px;">
                  MXR Services
                </div>
                <div style="font-size: 20px; font-weight: 800; color: #ffffff; line-height: 1.2;">
                  New Package Selection Lead
                </div>
              </div>
            </div>
          </div>

          <div style="padding: 18px 20px; background: #ffffff; border: 1px solid #e5e7eb; border-top: 0; border-radius: 0 0 16px 16px;">
            <div style="margin-top: 0;">
              <div style="font-size: 14px; font-weight: 900; color: #111827; margin-bottom: 10px;">
                Lead Details
              </div>

              <div style="background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 14px; padding: 12px 14px;">
                <table style="width:100%; border-collapse: collapse;">
                  <tbody>
                    <tr>
                      <td style="padding: 8px 0; width: 32%; font-size: 12px; font-weight: 700; color: #6b7280;">Name</td>
                      <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #111827;">${escapeHtml(userName)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #6b7280;">Email</td>
                      <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #111827;">${escapeHtml(userEmail)}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #6b7280;">Phone</td>
                      <td style="padding: 8px 0; font-size: 13px; font-weight: 700; color: #111827;">${escapeHtml(phone || '')}</td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 0; font-size: 12px; font-weight: 700; color: #6b7280;">Lead ID</td>
                      <td style="padding: 8px 0; font-size: 13px; font-weight: 800; color: #0b5fff;">${escapeHtml(submission.id)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style="margin-top: 16px;">
              <div style="font-size: 14px; font-weight: 900; color: #111827; margin-bottom: 10px;">
                Selected Package Summary
              </div>

              <div style="background: #ffffff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 14px 16px;">
                <ul style="margin: 0; padding-left: 18px; color: #111827; line-height: 1.8;">
                  <li><strong style="color:#0b5fff;">Category:</strong> ${escapeHtml(category)}</li>
                  <li><strong style="color:#0b5fff;">Package:</strong> ${escapeHtml(name)}</li>
                  <li><strong style="color:#0b5fff;">Price:</strong> ${escapeHtml(price)}</li>
                  <li><strong style="color:#0b5fff;">Popular:</strong> ${isPopular ? 'Yes' : 'No'}</li>
                </ul>
              </div>
            </div>

            <div style="margin-top: 16px;">
              <div style="font-size: 14px; font-weight: 900; color: #111827; margin-bottom: 10px;">
                Full Payload
              </div>
              ${asJsonPreBlock(selectedPackage)}
            </div>

            <div style="margin-top: 18px; padding-top: 14px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">
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

