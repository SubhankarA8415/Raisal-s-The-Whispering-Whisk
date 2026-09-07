import crypto from 'crypto'
import pool from '../config/database.js'

export async function authenticate(req, res, next) {
  try {
    const sessionToken = req.cookies.session

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'NOT_AUTHENTICATED',
          message: 'Authentication required.',
        },
      })
    }

    const tokenHash = crypto
      .createHash('sha256')
      .update(sessionToken)
      .digest('hex')

    const result = await pool.query(
      `
        SELECT
          s.id AS session_id,
          s.expires_at,
          u.id,
          u.name,
          u.email,
          u.avatar_id,
          u.delivery_address,
          u.delivery_pincode,
          u.auth_provider,
          u.user_type,
          u.is_authorized,
          u.email_verified
        FROM sessions s
        INNER JOIN users u
          ON u.id = s.user_id
        WHERE s.token_hash = $1
          AND s.expires_at > NOW()
      `,
      [tokenHash],
    )

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_SESSION',
          message: 'Session is invalid or expired.',
        },
      })
    }

    req.user = result.rows[0]

    await pool.query(
      `
        UPDATE sessions
        SET last_used_at = NOW()
        WHERE id = $1
      `,
      [req.user.session_id],
    )

    next()
  } catch (error) {
    next(error)
  }
}