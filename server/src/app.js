import express from 'express'
import cors from 'cors'

import { securityMiddleware } from './middleware/security.js'
import cookieMiddleware from './middleware/cookies.js'
import { errorHandler } from './middleware/errorHandler.js'

import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import mediaRoutes from './routes/mediaRoutes.js'
import homeRoutes from './routes/homeRoutes.js'
import adminHomeRoutes from './routes/adminHomeRoutes.js'
import bakeryReviewRoutes from './routes/bakeryReviewRoutes.js'
import adminBakeryReviewRoutes from './routes/adminBakeryReviewRoutes.js'
import productRoutes from './routes/productRoutes.js'
import adminProductRoutes from './routes/adminProductRoutes.js'
import aboutRoutes from './routes/aboutRoutes.js'
import adminAboutRoutes from './routes/adminAboutRoutes.js'
import bakeryRoutes from './routes/bakeryRoutes.js'
import adminBakeryRoutes from './routes/adminBakeryRoutes.js'

const app = express()

const allowedOrigins = (
  process.env.CLIENT_URL ||
  'http://localhost:5173'
)
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests such as Postman/curl.
      if (!origin) {
        return callback(null, true)
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      const error = new Error(
        'Request origin is not allowed.',
      )
      error.code = 'CORS_ORIGIN_NOT_ALLOWED'

      return callback(error)
    },
    credentials: true,
  }),
)

app.use(express.json({ limit: '100kb' }))
app.use(cookieMiddleware)
app.use(securityMiddleware)

app.use('/api/auth', authRoutes)
app.use('/api/home', homeRoutes)
app.use('/api/bakery-reviews', bakeryReviewRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/admin/home', adminHomeRoutes)
app.use('/api/admin/bakery-reviews', adminBakeryReviewRoutes)
app.use('/api/admin/media', mediaRoutes)
app.use('/api/about', aboutRoutes)
app.use('/api/admin/about', adminAboutRoutes)
app.use('/api/bakery', bakeryRoutes)
app.use('/api/admin/bakery', adminBakeryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/admin/products', adminProductRoutes)

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: "Raisal's Bakery API is running",
  })
})

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: 'The requested API endpoint was not found.',
    },
  })
})

/*
  Express error handler must be registered last.
  Without this, service errors such as INVALID_CREDENTIALS
  fall through to Express' default error response and the
  client cannot reliably display our API error structure.
*/
app.use(errorHandler)

export default app
