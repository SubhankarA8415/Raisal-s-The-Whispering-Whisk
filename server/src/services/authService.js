import crypto from 'crypto'

import pool from '../config/database.js'

import {
  hashPassword,
  verifyPassword,
} from '../utils/password.js'
import {
  AVATAR_IDS_LIST,
  isValidAvatarId,
} from '../utils/avatar.js'

export async function registerUser({
  name,
  email,
  password,
}) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const normalizedName = name.trim()
    const normalizedEmail = email.trim().toLowerCase()

    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail],
    )

    if (existingUser.rows.length > 0) {
      const error = new Error('Email is already registered.')
      error.code = 'EMAIL_EXISTS'
      throw error
    }

    const passwordHash = await hashPassword(password)

    const result = await client.query(
      `
        INSERT INTO users (
          name,
          email,
          password_hash,
          auth_provider,
          user_type,
          is_authorized
        )
        VALUES ($1, $2, $3, 'local', 'customer', false)
        RETURNING
          id,
          name,
          email,
          avatar_id,
          delivery_address,
          delivery_pincode,
          auth_provider,
          user_type,
          is_authorized,
          email_verified,
          created_at
      `,
      [
        normalizedName,
        normalizedEmail,
        passwordHash,
      ],
    )

    const user = result.rows[0]

    const sessionToken = crypto.randomBytes(32).toString('hex')

    const tokenHash = crypto
      .createHash('sha256')
      .update(sessionToken)
      .digest('hex')

    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    )

    await client.query(
      `
        INSERT INTO sessions (
          user_id,
          token_hash,
          expires_at
        )
        VALUES ($1, $2, $3)
      `,
      [
        user.id,
        tokenHash,
        expiresAt,
      ],
    )

    await client.query('COMMIT')

    return {
      user,
      session: {
        sessionToken,
        expiresAt,
      },
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function createSession(userId) {
  const sessionToken = crypto.randomBytes(32).toString('hex')

  const tokenHash = crypto
    .createHash('sha256')
    .update(sessionToken)
    .digest('hex')

  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  )

  await pool.query(
    `
      INSERT INTO sessions (
        user_id,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3)
    `,
    [
      userId,
      tokenHash,
      expiresAt,
    ],
  )

  return {
    sessionToken,
    expiresAt,
  }
}

export async function loginUser({
  email,
  password,
}) {
  const normalizedEmail = email.trim().toLowerCase()

  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        avatar_id,
        delivery_address,
        delivery_pincode,
        auth_provider,
        user_type,
        is_authorized,
        email_verified,
        created_at
      FROM users
      WHERE email = $1
    `,
    [normalizedEmail],
  )

  const user = result.rows[0]

  // Use the same error for all authentication failures.
  if (
    !user ||
    user.auth_provider !== 'local' ||
    !user.password_hash
  ) {
    const error = new Error('Invalid email or password.')
    error.code = 'INVALID_CREDENTIALS'
    throw error
  }

  const passwordValid = await verifyPassword(
    password,
    user.password_hash,
  )

  if (!passwordValid) {
    const error = new Error('Invalid email or password.')
    error.code = 'INVALID_CREDENTIALS'
    throw error
  }

  const sessionToken = crypto.randomBytes(32).toString('hex')

  const tokenHash = crypto
    .createHash('sha256')
    .update(sessionToken)
    .digest('hex')

  const expiresAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000,
  )

  await pool.query(
    `
      INSERT INTO sessions (
        user_id,
        token_hash,
        expires_at
      )
      VALUES ($1, $2, $3)
    `,
    [
      user.id,
      tokenHash,
      expiresAt,
    ],
  )

  delete user.password_hash

  return {
    user,
    session: {
      sessionToken,
      expiresAt,
    },
  }
}

export async function logoutUser(sessionToken) {
  const tokenHash = crypto
    .createHash('sha256')
    .update(sessionToken)
    .digest('hex')

  await pool.query(
    `
      DELETE FROM sessions
      WHERE token_hash = $1
    `,
    [tokenHash],
  )
}

export async function loginWithGoogle({
  googleId,
  email,
  name,
}) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const normalizedEmail = email.trim().toLowerCase()

    // 1. Check if this Google account is already linked
    let result = await client.query(
      `
        SELECT
          id,
          name,
          email,
          avatar_id,
          delivery_address,
          delivery_pincode,
          auth_provider,
          user_type,
          is_authorized,
          email_verified,
          created_at
        FROM users
        WHERE google_id = $1
        FOR UPDATE
      `,
      [googleId],
    )

    let user = result.rows[0]

    // 2. If not linked, check whether the email already exists
    if (!user) {
      result = await client.query(
        `
          SELECT
            id,
            name,
            email,
            avatar_id,
            delivery_address,
            delivery_pincode,
            auth_provider,
            user_type,
            is_authorized,
            email_verified,
            created_at
          FROM users
          WHERE email = $1
          FOR UPDATE
        `,
        [normalizedEmail],
      )

      user = result.rows[0]

      // Existing account → link Google
      if (user) {
        result = await client.query(
          `
            UPDATE users
            SET
              google_id = $1,
              email_verified = true,
              updated_at = NOW()
            WHERE id = $2
            RETURNING
              id,
              name,
              email,
              avatar_id,
              delivery_address,
              delivery_pincode,
              auth_provider,
              user_type,
              is_authorized,
              email_verified,
              created_at
          `,
          [googleId, user.id],
        )

        user = result.rows[0]
      }
    }

    // 3. Completely new Google account
    if (!user) {
      result = await client.query(
        `
          INSERT INTO users (
            name,
            email,
            google_id,
            auth_provider,
            user_type,
            is_authorized,
            email_verified
          )
          VALUES (
            $1,
            $2,
            $3,
            'google',
            'customer',
            false,
            true
          )
          RETURNING
            id,
            name,
            email,
            avatar_id,
            delivery_address,
            delivery_pincode,
            auth_provider,
            user_type,
            is_authorized,
            email_verified,
            created_at
        `,
        [
          name.trim(),
          normalizedEmail,
          googleId,
        ],
      )

      user = result.rows[0]
    }

    // 4. Create our own session
    const sessionToken = crypto.randomBytes(32).toString('hex')

    const tokenHash = crypto
      .createHash('sha256')
      .update(sessionToken)
      .digest('hex')

    const expiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    )

    await client.query(
      `
        INSERT INTO sessions (
          user_id,
          token_hash,
          expires_at
        )
        VALUES ($1, $2, $3)
      `,
      [
        user.id,
        tokenHash,
        expiresAt,
      ],
    )

    await client.query('COMMIT')

    return {
      user,
      session: {
        sessionToken,
        expiresAt,
      },
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function updateCurrentUser(userId, { name, deliveryAddress, deliveryPincode, avatarId }) {
  const trimmedName = name?.trim()

  if (!trimmedName) {
    const error = new Error('Name is required.')
    error.code = 'INVALID_NAME'
    throw error
  }

  if (trimmedName.length < 2 || trimmedName.length > 100) {
    const error = new Error('Name must be between 2 and 100 characters long.')
    error.code = 'INVALID_NAME'
    throw error
  }

  const trimmedAddress = deliveryAddress?.trim() || null
  const trimmedPincode = deliveryPincode?.trim() || null

  if (avatarId !== undefined && avatarId !== null && !isValidAvatarId(avatarId)) {
    const error = new Error('Please select a valid profile avatar.')
    error.code = 'INVALID_AVATAR_ID'
    throw error
  }

  if (trimmedAddress && (trimmedAddress.length < 5 || trimmedAddress.length > 500)) {
    const error = new Error('Delivery address must be between 5 and 500 characters long.')
    error.code = 'INVALID_ADDRESS'
    throw error
  }

  if (trimmedPincode && !/^\d{6}$/.test(trimmedPincode)) {
    const error = new Error('Pincode must be exactly 6 digits.')
    error.code = 'INVALID_PINCODE'
    throw error
  }

  const result = await pool.query(
    `
      UPDATE users
      SET
        name = $1,
        delivery_address = $2,
        delivery_pincode = $3,
        avatar_id = CASE
          WHEN $6::boolean THEN $4::text
          ELSE avatar_id
        END,
        updated_at = NOW()
      WHERE id = $5
      RETURNING
        id,
        name,
        email,
        avatar_id,
        delivery_address,
        delivery_pincode,
        auth_provider,
        user_type,
        is_authorized,
        email_verified,
        created_at,
        updated_at
    `,
    [trimmedName, trimmedAddress, trimmedPincode, avatarId ?? null, userId, avatarId !== undefined],
  )

  if (result.rows.length === 0) {
    const error = new Error('User not found.')
    error.code = 'USER_NOT_FOUND'
    throw error
  }

  return result.rows[0]
}

export function getAvatarCatalog() {
  return AVATAR_IDS_LIST.map((avatarId) => ({
    id: avatarId,
  }))
}

export async function createPasswordResetToken(email) {
  const normalizedEmail = email.trim().toLowerCase()

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const result = await client.query(
      `
        SELECT
          id,
          email,
          delivery_address,
          delivery_pincode,
          auth_provider,
          password_hash
        FROM users
        WHERE email = $1
        FOR UPDATE
      `,
      [normalizedEmail],
    )

    const user = result.rows[0]

    /*
      Always return the same external result whether
      the account exists or not.
    */

    if (!user) {
      await client.query('COMMIT')

      return {
        found: false,
      }
    }

    /*
      Google-only accounts do not have a local password.
      Do not create a password-reset token for them.
    */

    if (
      user.auth_provider !== 'local' ||
      !user.password_hash
    ) {
      await client.query('COMMIT')

      return {
        found: true,
        resetAllowed: false,
      }
    }

    /*
      Invalidate previous unused reset tokens.
    */

    await client.query(
      `
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE user_id = $1
          AND used_at IS NULL
      `,
      [user.id],
    )

    /*
      Generate a cryptographically secure token.
    */

    const resetToken = crypto
      .randomBytes(32)
      .toString('hex')

    /*
      Store only the SHA-256 hash.
    */

    const tokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex')

    /*
      Token expires after 15 minutes.
    */

    const expiresAt = new Date(
      Date.now() + 15 * 60 * 1000,
    )

    await client.query(
      `
        INSERT INTO password_reset_tokens (
          user_id,
          token_hash,
          expires_at
        )
        VALUES ($1, $2, $3)
      `,
      [
        user.id,
        tokenHash,
        expiresAt,
      ],
    )

    await client.query('COMMIT')

    /*
      Return the token internally so the controller/service
      layer can construct and send the reset email.

      Do NOT return this directly from the HTTP response.
    */

    return {
      found: true,
      resetAllowed: true,
      email: user.email,
      resetToken,
      expiresAt,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function resetUserPassword(token, newPassword) {
  if (
    !token ||
    typeof token !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(token)
  ) {
    const error = new Error('Invalid password reset token.')
    error.code = 'INVALID_RESET_TOKEN'
    throw error
  }

  if (!newPassword || typeof newPassword !== 'string') {
    const error = new Error('Password is required.')
    error.code = 'INVALID_PASSWORD'
    throw error
  }

  if (newPassword.length < 8) {
    const error = new Error(
      'Password must be at least 8 characters long.',
    )
    error.code = 'INVALID_PASSWORD'
    throw error
  }

  if (newPassword.length > 128) {
    const error = new Error(
      'Password must not exceed 128 characters.',
    )
    error.code = 'INVALID_PASSWORD'
    throw error
  }

  const tokenHash = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex')

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const result = await client.query(
      `
        SELECT
          prt.id,
          prt.user_id,
          prt.expires_at,
          prt.used_at,
          u.auth_provider,
          u.password_hash
        FROM password_reset_tokens prt
        INNER JOIN users u
          ON u.id = prt.user_id
        WHERE prt.token_hash = $1
        FOR UPDATE
      `,
      [tokenHash],
    )

    if (result.rows.length === 0) {
      const error = new Error(
        'Invalid or expired password reset link.',
      )
      error.code = 'INVALID_RESET_TOKEN'
      throw error
    }

    const resetToken = result.rows[0]

    if (resetToken.used_at) {
      const error = new Error(
        'This password reset link has already been used.',
      )
      error.code = 'RESET_TOKEN_USED'
      throw error
    }

    if (
      new Date(resetToken.expires_at).getTime() <=
      Date.now()
    ) {
      const error = new Error(
        'This password reset link has expired.',
      )
      error.code = 'RESET_TOKEN_EXPIRED'
      throw error
    }

    if (
      resetToken.auth_provider !== 'local' ||
      !resetToken.password_hash
    ) {
      const error = new Error(
        'Password reset is not available for this account.',
      )
      error.code = 'PASSWORD_RESET_NOT_AVAILABLE'
      throw error
    }

    const passwordHash = await hashPassword(
      newPassword,
    )

    const updateResult = await client.query(
      `
        UPDATE users
        SET
          password_hash = $1,
          updated_at = NOW()
        WHERE id = $2
      `,
      [
        passwordHash,
        resetToken.user_id,
      ],
    )

    if (updateResult.rowCount !== 1) {
      const error = new Error('User not found.')
      error.code = 'USER_NOT_FOUND'
      throw error
    }

    await client.query(
      `
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE id = $1
      `,
      [resetToken.id],
    )

    /*
      A successful password reset invalidates every
      existing session for this user.
    */

    await client.query(
      `
        DELETE FROM sessions
        WHERE user_id = $1
      `,
      [resetToken.user_id],
    )

    /*
      Invalidate any other outstanding reset tokens too.
      This guarantees that only the reset operation that
      succeeded can be used.
    */

    await client.query(
      `
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE user_id = $1
          AND used_at IS NULL
      `,
      [resetToken.user_id],
    )

    await client.query('COMMIT')

    return {
      success: true,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}
