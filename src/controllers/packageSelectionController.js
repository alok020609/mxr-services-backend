const prisma = require('../config/database');
const { asyncHandler } = require('../utils/asyncHandler');
const logger = require('../utils/logger');
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

const EMAIL_FONT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif";

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

  const featuresHtml = features
    .map((f) => `<li style="margin:0 0 6px 0;padding:0;">${escapeHtml(f)}</li>`)
    .join('');

  const fullMessageHtml = `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#f4f4f5;">
  <tr>
    <td align="center" style="padding:24px 12px;font-family:${EMAIL_FONT};">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;border-collapse:collapse;background:#ffffff;border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="height:3px;line-height:3px;font-size:0;background:#2563eb;">&nbsp;</td>
        </tr>
        <tr>
          <td style="padding:20px 24px;border-bottom:1px solid #e4e4e7;background:#ffffff;">
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;">
              <tr>
                <td width="48" valign="middle" style="padding:0;">
                  <img src="https://mxrservices.in/mainlogo.png" width="48" height="48" alt="MXR Services" style="display:block;width:48px;height:48px;object-fit:contain;border-radius:8px;border:0;" />
                </td>
                <td valign="middle" style="padding:0 0 0 14px;">
                  <div style="font-size:11px;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;font-weight:600;">MXR Services</div>
                  <div style="font-size:16px;font-weight:600;color:#0f172a;line-height:1.3;margin-top:4px;">Package selection confirmation</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 8px 0;font-size:14px;color:#0f172a;font-weight:600;line-height:1.5;">
              Hello ${escapeHtml(user.firstName || userName || '')}${user.firstName ? ',' : ''}
            </p>
            <p style="margin:0 0 24px 0;font-size:14px;color:#334155;line-height:1.6;">
              Thank you for your interest. We have received your package selection.
            </p>
            <p style="margin:0 0 10px 0;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;font-weight:600;">Package summary</p>
            <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;margin-bottom:24px;">
              <tr>
                <td style="padding:10px 0;vertical-align:top;width:34%;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#64748b;font-weight:600;border-bottom:1px solid #f4f4f5;">Category</td>
                <td style="padding:10px 0;font-size:14px;color:#0f172a;line-height:1.5;border-bottom:1px solid #f4f4f5;">${escapeHtml(category)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;vertical-align:top;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#64748b;font-weight:600;border-bottom:1px solid #f4f4f5;">Package</td>
                <td style="padding:10px 0;font-size:14px;color:#0f172a;line-height:1.5;border-bottom:1px solid #f4f4f5;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;vertical-align:top;font-size:12px;letter-spacing:0.04em;text-transform:uppercase;color:#64748b;font-weight:600;">Price</td>
                <td style="padding:10px 0;font-size:14px;font-weight:600;color:#0f172a;line-height:1.5;">${escapeHtml(String(price))}</td>
              </tr>
            </table>
            <p style="margin:0 0 10px 0;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;font-weight:600;">Features</p>
            <ul style="margin:0 0 24px 0;padding-left:20px;color:#334155;font-size:14px;line-height:1.5;">
              ${featuresHtml}
            </ul>
            <div style="border:1px solid #e4e4e7;border-radius:8px;background:#f8fafc;padding:16px 18px;">
              <p style="margin:0 0 6px 0;font-size:12px;letter-spacing:0.06em;text-transform:uppercase;color:#64748b;font-weight:600;">Next steps</p>
              <p style="margin:0;font-size:14px;color:#334155;line-height:1.6;">
                One of our team members will contact you about this package.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 24px;border-top:1px solid #e4e4e7;background:#fafafa;">
            <p style="margin:0;font-size:12px;color:#64748b;line-height:1.5;">Regards,<br /><span style="color:#0f172a;font-weight:600;">MXR Services</span></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
  `;

  const fullMessageText = `MXR Services\n\nHello ${user.firstName || userName || ''}${user.firstName ? ',' : ''}\n\nThank you for your interest. We have received your package selection.\n\nSelected Package Details:\n- Category: ${category}\n- Package Name: ${name}\n- Price: ${price}\n- Features:\n${features.map((f) => `  - ${f}`).join('\n')}\n\nNext Steps:\nOne of our team members will contact you about this package.\n\nRegards,\nMXR Services`;

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

  // Email confirmation to user (non-blocking)
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

  return res.status(201).json({
    success: true,
    data: { id: submission.id, createdAt: submission.createdAt },
    message: 'Package selection received. Our team will contact you shortly.',
  });
});

module.exports = {
  submitPackageSelection,
};

