function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function createPasswordResetEmail(resetUrl) {
  const safeResetUrl = escapeHtml(resetUrl)

  const text = `
Raisal's Bakery
Development Team

Reset your password

We received a request to reset the password for your Raisal's Bakery account.

Use the secure link below to choose a new password:
${resetUrl}

This link expires in 15 minutes and can only be used once.

If you did not request this password reset, you can safely ignore this email. Your account remains unchanged.

Raisal's Bakery Development Team
Account security & technical support
  `.trim()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>Raisal's Bakery Development Team - Reset your password</title>
</head>

<body style="margin:0; padding:0; background:#f5f2ef; font-family:Arial,Helvetica,sans-serif; color:#33251f;">
  <div style="max-width:620px; margin:0 auto; padding:36px 16px;">

    <div style="overflow:hidden; background:#ffffff; border:1px solid #e4dbd5; border-radius:18px; box-shadow:0 12px 35px rgba(61,41,35,0.07);">

      <div style="height:5px; background:#7a4032;"></div>

      <div style="padding:38px 38px 34px;">

        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0 0 32px;">
          <tr>
            <td>
              <div style="font-family:Georgia,'Times New Roman',serif; font-size:27px; line-height:1.2; font-weight:700; color:#7a4032;">
                Raisal's Bakery
              </div>
              <div style="margin-top:7px; font-size:11px; line-height:1.4; font-weight:700; letter-spacing:1.8px; text-transform:uppercase; color:#9a8177;">
                Development Team
              </div>
            </td>
            <td align="right" valign="top">
              <span style="display:inline-block; padding:6px 9px; border:1px solid #ddd2cc; border-radius:999px; font-size:10px; line-height:1; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#7a6259;">
                Account Security
              </span>
            </td>
          </tr>
        </table>

        <div style="margin:0 0 10px; font-size:12px; line-height:1.5; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:#a16b5a;">
          Password recovery
        </div>

        <h1 style="margin:0 0 18px; font-family:Georgia,'Times New Roman',serif; font-size:30px; line-height:1.25; color:#33251f;">
          Reset your password
        </h1>

        <p style="margin:0 0 16px; font-size:15px; line-height:1.7; color:#5f514b;">
          We received a request to reset the password for your Raisal's Bakery account.
        </p>

        <p style="margin:0 0 26px; font-size:15px; line-height:1.7; color:#5f514b;">
          Use the secure button below to choose a new password.
        </p>

        <div style="margin:0 0 28px;">
          <a
            href="${safeResetUrl}"
            style="display:inline-block; padding:14px 24px; border-radius:10px; background:#7a4032; color:#ffffff; text-decoration:none; font-size:14px; font-weight:700;"
          >
            Reset Password
          </a>
        </div>

        <div style="padding:16px 18px; border:1px solid #eadfd9; border-radius:12px; background:#faf8f6;">
          <p style="margin:0 0 6px; font-size:13px; line-height:1.6; font-weight:700; color:#4b3931;">
            This link expires in 15 minutes.
          </p>
          <p style="margin:0; font-size:13px; line-height:1.6; color:#75665f;">
            It can only be used once. If you did not request this reset, you can safely ignore this email. Your account remains unchanged.
          </p>
        </div>

        <p style="margin:26px 0 0; font-size:12px; line-height:1.7; color:#8b7d76;">
          For your security, never share this reset link with anyone.
        </p>

        <hr style="border:0; border-top:1px solid #e7ded9; margin:30px 0 22px;" />

        <p style="margin:0; font-size:12px; line-height:1.6; font-weight:700; color:#69574f;">
          Raisal's Bakery Development Team
        </p>
        <p style="margin:4px 0 0; font-size:11px; line-height:1.6; color:#9a8981;">
          Account security &amp; technical support
        </p>

      </div>
    </div>

    <p style="margin:18px 0 0; text-align:center; font-size:10px; line-height:1.5; color:#a49690;">
      This is an automated account-security email from Raisal's Bakery.
    </p>
  </div>
</body>
</html>
  `.trim()

  return {
    subject: "Raisal's Bakery Development Team - Reset your password",
    text,
    html,
  }
}
