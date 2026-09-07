import pool from '../config/database.js'

export async function bootstrapFirstAdmin(userId, secret) {
  if (secret !== process.env.ADMIN_BOOTSTRAP_SECRET) {
    const error = new Error('Invalid bootstrap credentials.')
    error.code = 'INVALID_BOOTSTRAP_SECRET'
    throw error
  }

  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    // Serialize the one-time bootstrap operation. This prevents two
    // simultaneous requests from both becoming the first admin.
    await client.query(
      'SELECT pg_advisory_xact_lock(8392741)'
    )

    const existingAdmin = await client.query(
      `
        SELECT id
        FROM users
        WHERE user_type = 'admin'
          AND is_authorized = true
        FOR UPDATE
      `,
    )

    if (existingAdmin.rows.length > 0) {
      const error = new Error(
        'The first admin has already been created.',
      )
      error.code = 'BOOTSTRAP_ALREADY_COMPLETED'
      throw error
    }

    const result = await client.query(
      `
        UPDATE users
        SET
          user_type = 'admin',
          is_authorized = true,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          name,
          email,
          auth_provider,
          user_type,
          is_authorized,
          email_verified,
          created_at,
          updated_at
      `,
      [userId],
    )

    if (result.rows.length === 0) {
      const error = new Error('User not found.')
      error.code = 'USER_NOT_FOUND'
      throw error
    }

    await client.query('COMMIT')

    return result.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function promoteToAdmin(targetUserId, adminUserId) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const control = await client.query(
      `SELECT is_locked, owner_email FROM admin_control WHERE id = TRUE FOR UPDATE`,
    )

    if (control.rows.length === 0) {
      const error = new Error('Admin control state is not configured.')
      error.code = 'ADMIN_CONTROL_NOT_CONFIGURED'
      throw error
    }

    if (control.rows[0].is_locked) {
      const error = new Error('Admin promotion is locked by the owner.')
      error.code = 'ADMIN_PROMOTION_LOCKED'
      throw error
    }

    const target = await client.query(
      `
        SELECT
          id,
          name,
          email,
          user_type,
          is_authorized
        FROM users
        WHERE id = $1
        FOR UPDATE
      `,
      [targetUserId],
    )

    if (target.rows.length === 0) {
      const error = new Error('User not found.')
      error.code = 'USER_NOT_FOUND'
      throw error
    }

    if (targetUserId === adminUserId) {
      const error = new Error('You cannot modify your own admin status.')
      error.code = 'SELF_ADMIN_MODIFICATION'
      throw error
    }

    const result = await client.query(
      `
        UPDATE users
        SET
          user_type = 'admin',
          is_authorized = false,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          name,
          email,
          auth_provider,
          user_type,
          is_authorized,
          email_verified,
          created_at,
          updated_at
      `,
      [targetUserId],
    )

    await client.query('COMMIT')

    return result.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function authorizeAdmin(targetUserId, adminUserId) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const control = await client.query(
      `SELECT is_locked, owner_email FROM admin_control WHERE id = TRUE FOR UPDATE`,
    )

    if (control.rows.length === 0) {
      const error = new Error('Admin control state is not configured.')
      error.code = 'ADMIN_CONTROL_NOT_CONFIGURED'
      throw error
    }

    if (control.rows[0].is_locked) {
      const error = new Error('Admin authorization is locked by the owner.')
      error.code = 'ADMIN_PROMOTION_LOCKED'
      throw error
    }

    if (targetUserId === adminUserId) {
      const error = new Error(
        'You cannot authorize yourself.',
      )
      error.code = 'SELF_ADMIN_MODIFICATION'
      throw error
    }

    const target = await client.query(
      `
        SELECT
          id,
          name,
          email,
          user_type,
          is_authorized
        FROM users
        WHERE id = $1
        FOR UPDATE
      `,
      [targetUserId],
    )

    if (target.rows.length === 0) {
      const error = new Error('User not found.')
      error.code = 'USER_NOT_FOUND'
      throw error
    }

    if (target.rows[0].user_type !== 'admin') {
      const error = new Error(
        'Only an admin can be authorized.',
      )
      error.code = 'NOT_AN_ADMIN'
      throw error
    }

    const result = await client.query(
      `
        UPDATE users
        SET
          is_authorized = true,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          name,
          email,
          auth_provider,
          user_type,
          is_authorized,
          email_verified,
          created_at,
          updated_at
      `,
      [targetUserId],
    )

    await client.query('COMMIT')

    return result.rows[0]
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function getAllUsers() {
  const result = await pool.query(
    `
      SELECT
        id,
        name,
        email,
        auth_provider,
        user_type,
        is_authorized,
        email_verified,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC
    `,
  )

  return result.rows
}

export async function getAdminControl() {
  const result = await pool.query(
    `SELECT is_locked, owner_email, updated_at FROM admin_control WHERE id = TRUE`,
  )

  if (result.rows.length === 0) {
    const error = new Error('Admin control state is not configured.')
    error.code = 'ADMIN_CONTROL_NOT_CONFIGURED'
    throw error
  }

  return {
    isLocked: result.rows[0].is_locked,
    ownerEmail: result.rows[0].owner_email,
    updatedAt: result.rows[0].updated_at,
  }
}

async function setAdminControlLock(userId, locked) {
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const control = await client.query(
      `SELECT owner_email FROM admin_control WHERE id = TRUE FOR UPDATE`,
    )

    if (control.rows.length === 0) {
      const error = new Error('Admin control state is not configured.')
      error.code = 'ADMIN_CONTROL_NOT_CONFIGURED'
      throw error
    }

    const actor = await client.query(
      `SELECT email, user_type, is_authorized FROM users WHERE id = $1 FOR UPDATE`,
      [userId],
    )

    if (actor.rows.length === 0) {
      const error = new Error('User not found.')
      error.code = 'USER_NOT_FOUND'
      throw error
    }

    const isOwner =
      actor.rows[0].user_type === 'admin' &&
      actor.rows[0].is_authorized === true &&
      actor.rows[0].email.trim().toLowerCase() ===
        control.rows[0].owner_email.trim().toLowerCase()

    if (!isOwner) {
      const error = new Error('Only the designated owner can change admin control.')
      error.code = 'ADMIN_CONTROL_OWNER_ONLY'
      throw error
    }

    const result = await client.query(
      `
        UPDATE admin_control
        SET is_locked = $1, updated_at = NOW()
        WHERE id = TRUE
        RETURNING is_locked, owner_email, updated_at
      `,
      [locked],
    )

    await client.query('COMMIT')

    return {
      isLocked: result.rows[0].is_locked,
      ownerEmail: result.rows[0].owner_email,
      updatedAt: result.rows[0].updated_at,
    }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export async function lockAdminControl(userId) {
  return setAdminControlLock(userId, true)
}

export async function unlockAdminControl(userId) {
  return setAdminControlLock(userId, false)
}
