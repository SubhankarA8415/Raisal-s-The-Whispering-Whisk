import 'dotenv/config'

import app from './app.js'
import pool from './config/database.js'

import { verifyEmailTransport } from './services/emailService.js'
import { verifyCloudinary } from './config/cloudinary.js'

const PORT = process.env.PORT || 5000

async function startServer() {
  try {
    // ============================================
    // DATABASE CONNECTION TEST
    // ============================================

    const result = await pool.query('SELECT NOW()')

    console.log('PostgreSQL connection successful')
    console.log('Database time:', result.rows[0].now)

    // ============================================
    // EMAIL CONNECTION TEST
    // ============================================

    try {
      await verifyEmailTransport()
      console.log('Email SMTP connection successful')
    } catch (error) {
      console.warn('Email SMTP verification failed')
      console.warn(error.message)

      if (process.env.NODE_ENV === 'production') {
        throw error
      }

      console.warn(
        'Continuing in development mode. Password-reset emails may be unavailable.',
      )
    }

    // ============================================
    // CLOUDINARY CONNECTION TEST
    // ============================================

    try {
      await verifyCloudinary()
      console.log('Cloudinary connection successful')
    } catch (error) {
      console.warn('Cloudinary verification failed')
      console.warn(error.message)

      if (process.env.NODE_ENV === 'production') {
        throw error
      }

      console.warn(
        'Continuing in development mode. Media uploads may be unavailable.',
      )
    }

    // ============================================
    // START SERVER
    // ============================================

    app.listen(PORT, () => {
      console.log(
        `Raisal's Bakery API running on port ${PORT}`,
      )
    })
  } catch (error) {
    console.error('Server startup failed')
    console.error(error.message)

    process.exit(1)
  }
}

startServer()
