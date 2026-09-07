import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

export const securityMiddleware = [
  helmet(),

  rateLimit({
    windowMs: 15 * 60 * 1000,
    // The API is used by a browser-based SPA, so development can
    // legitimately generate many requests while navigating/testing.
    // Keep a generous global ceiling; auth/reset limiters remain strict.
    limit: 1000,
    standardHeaders: true,
    legacyHeaders: false,
  }),
]

export const bootstrapRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
})

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'AUTH_RATE_LIMITED',
        message:
          'Too many authentication attempts. Please try again later.',
      },
    })
  },
})

export const passwordResetRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'PASSWORD_RESET_RATE_LIMITED',
        message:
          'Too many password reset requests. Please try again later.',
      },
    })
  },
})
