function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function createProductReviewEmail({ customerName, productName, rating, reviewText }) {
  const safeName = escapeHtml(customerName)
  const safeProduct = escapeHtml(productName)
  const safeReview = escapeHtml(reviewText)
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating)
  const positive = rating >= 4

  const subject = positive
    ? "Thank you for the love — Raisal's Bakery ❤️"
    : "We'd love to make your next Raisal's Bakery experience better"

  const heading = positive
    ? 'Thank you for the love! ❤️'
    : 'We want to do better for you.'

  const intro = positive
    ? `We're genuinely delighted that you enjoyed your experience with ${safeProduct}. Your kind rating means a lot to everyone at Raisal's Bakery.`
    : `Thank you for taking the time to share your experience with ${safeProduct}. We're sorry we didn't give you the experience you were hoping for.`

  const body = positive
    ? `Your feedback gives our team a little extra joy behind the scenes. We hope to have the pleasure of baking something special for you again soon.`
    : `If you have a moment, we'd genuinely appreciate knowing what we could improve — the taste, presentation, portion, service, or anything else that mattered to you. Honest feedback helps us become better.`

  const text = `
Raisal's Bakery

Hi ${customerName},

${heading}

${intro}

Your rating: ${stars}

Your review:
"${reviewText}"

${body}

Thank you for choosing Raisal's Bakery.

With gratitude,
Raisal's Bakery Team
  `.trim()

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#f5f2ef;font-family:Arial,Helvetica,sans-serif;color:#33251f;">
  <div style="max-width:620px;margin:0 auto;padding:36px 16px;">
    <div style="overflow:hidden;background:#fff;border:1px solid #e4dbd5;border-radius:18px;box-shadow:0 12px 35px rgba(61,41,35,.07);">
      <div style="height:5px;background:#7a4032;"></div>
      <div style="padding:38px;">
        <div style="font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:700;color:#7a4032;">Raisal's Bakery</div>
        <div style="margin-top:7px;font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;color:#9a8177;">Made with care</div>

        <div style="margin-top:34px;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:#a16b5a;">A little note from us</div>
        <h1 style="margin:8px 0 18px;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.25;color:#33251f;">${heading}</h1>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#5f514b;">Hi ${safeName},</p>
        <p style="margin:0 0 18px;font-size:15px;line-height:1.75;color:#5f514b;">${intro}</p>

        <div style="margin:24px 0;padding:18px;border:1px solid #eadfd9;border-radius:14px;background:#faf8f6;">
          <div style="font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;color:#8b756b;">Your review</div>
          <div style="margin-top:8px;font-size:22px;letter-spacing:2px;color:#d28a43;">${stars}</div>
          <div style="margin-top:5px;font-size:13px;color:#75665f;">${safeProduct}</div>
          <p style="margin:14px 0 0;font-size:14px;line-height:1.7;color:#5f514b;">“${safeReview}”</p>
        </div>

        <p style="margin:0;font-size:15px;line-height:1.75;color:#5f514b;">${body}</p>
        <p style="margin:26px 0 0;font-size:15px;line-height:1.75;color:#5f514b;">Thank you for choosing Raisal's Bakery. We truly appreciate you.</p>

        <hr style="border:0;border-top:1px solid #e7ded9;margin:30px 0 22px;" />
        <p style="margin:0;font-size:12px;font-weight:700;color:#69574f;">Raisal's Bakery Team</p>
        <p style="margin:4px 0 0;font-size:11px;color:#9a8981;">Thank you for helping us grow.</p>
      </div>
    </div>
    <p style="margin:18px 0 0;text-align:center;font-size:10px;color:#a49690;">This is a customer-care email from Raisal's Bakery.</p>
  </div>
</body>
</html>
  `.trim()

  return { subject, text, html }
}
