import nodemailer from 'nodemailer'

function getEmailConfig() {
  const required = [
    'EMAIL_HOST',
    'EMAIL_PORT',
    'EMAIL_USER',
    'EMAIL_PASSWORD',
    'EMAIL_FROM',
  ]

  const missing = required.filter(
    (name) => !process.env[name],
  )

  if (missing.length > 0) {
    const error = new Error(
      `Missing email configuration: ${missing.join(', ')}`,
    )
    error.code = 'EMAIL_CONFIGURATION_ERROR'
    throw error
  }

  return {
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
    requireTLS: process.env.EMAIL_SECURE !== 'true',
  }
}

const transporter = nodemailer.createTransport(
  getEmailConfig(),
)

export async function verifyEmailTransport() {
  await transporter.verify()
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}) {
  return transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  })
}
