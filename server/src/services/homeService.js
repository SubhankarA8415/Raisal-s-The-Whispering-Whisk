import cloudinary from '../config/cloudinary.js'
import pool from '../config/database.js'

const HOME_PLACEMENTS = new Set([
  'hero',
  'kitchen_1',
  'kitchen_2',
  'kitchen_3',
  'kitchen_4',
  'story',
])

function fail(code, message, extra = {}) {
  const error = new Error(message)
  error.code = code
  Object.assign(error, extra)
  throw error
}

function validatePlacement(placement) {
  if (typeof placement !== 'string' || !HOME_PLACEMENTS.has(placement)) {
    fail('INVALID_HOME_PLACEMENT', 'Invalid Home media placement.')
  }
  return placement
}

function validateMediaId(mediaId) {
  if (typeof mediaId !== 'string' || !mediaId.trim()) {
    fail('VALIDATION_ERROR', 'mediaId is required.', {
      fields: { mediaId: 'A valid media ID is required.' },
    })
  }
  return mediaId.trim()
}

async function getMedia(client, mediaId) {
  const result = await client.query(
    `
      SELECT id, cloudinary_public_id, secure_url, resource_type, folder,
             original_filename, format, bytes, width, height, duration, alt_text
      FROM media
      WHERE id = $1
    `,
    [mediaId],
  )

  if (!result.rows[0]) {
    fail('MEDIA_NOT_FOUND', 'The selected media was not found.')
  }

  return result.rows[0]
}

function serializeMedia(row) {
  if (!row) return null

  return {
    id: row.id,
    mediaId: row.id,
    publicId: row.cloudinary_public_id,
    url: row.secure_url,
    resourceType: row.resource_type,
    folder: row.folder,
    originalFilename: row.original_filename,
    format: row.format,
    bytes: row.bytes,
    width: row.width,
    height: row.height,
    duration: row.duration,
    altText: row.alt_text,
  }
}

async function getHomeMediaMap(client = pool) {
  const result = await client.query(`
    SELECT
      hp.placement,
      m.id,
      m.cloudinary_public_id,
      m.secure_url,
      m.resource_type,
      m.folder,
      m.original_filename,
      m.format,
      m.bytes,
      m.width,
      m.height,
      m.duration,
      m.alt_text
    FROM home_page hp
    INNER JOIN media m ON m.id = hp.media_id
    ORDER BY hp.placement
  `)

  const media = {}
  for (const placement of HOME_PLACEMENTS) media[placement] = null
  for (const row of result.rows) media[row.placement] = serializeMedia(row)
  return media
}

export async function getPublicHome() {
  return {
    media: await getHomeMediaMap(),
  }
}

export async function getAdminHome() {
  return {
    media: await getHomeMediaMap(),
  }
}

async function destroyCloudinaryMedia(media) {
  try {
    const result = await cloudinary.uploader.destroy(
      media.cloudinary_public_id,
      {
        resource_type: media.resource_type,
        invalidate: true,
      },
    )

    if (result.result !== 'ok' && result.result !== 'not found') {
      fail('CLOUDINARY_DELETE_ERROR', 'Cloudinary did not confirm media deletion.')
    }

    return result.result
  } catch (error) {
    if (error.code === 'CLOUDINARY_DELETE_ERROR') throw error

    const wrapped = new Error('Unable to delete the media from Cloudinary.')
    wrapped.code = 'CLOUDINARY_DELETE_ERROR'
    wrapped.cause = error
    throw wrapped
  }
}

export async function assignHomeMedia(placement, mediaId) {
  validatePlacement(placement)
  mediaId = validateMediaId(mediaId)

  const client = await pool.connect()
  let oldMedia = null
  let cloudinaryDeleted = false

  try {
    await client.query('BEGIN')

    const newMedia = await getMedia(client, mediaId)

    const existingResult = await client.query(
      `
        SELECT hp.media_id, m.id, m.cloudinary_public_id, m.resource_type
        FROM home_page hp
        INNER JOIN media m ON m.id = hp.media_id
        WHERE hp.placement = $1
        FOR UPDATE
      `,
      [placement],
    )
    oldMedia = existingResult.rows[0] || null

    if (oldMedia && oldMedia.id === newMedia.id) {
      await client.query('COMMIT')
      return serializeMedia(newMedia)
    }

    const updateResult = await client.query(
      `
        UPDATE home_page
        SET media_id = $2, updated_at = NOW()
        WHERE placement = $1
        RETURNING placement
      `,
      [placement, newMedia.id],
    )

    if (!updateResult.rows[0]) {
      fail(
        'HOME_SLOT_NOT_FOUND',
        'The requested Home media slot does not exist.',
      )
    }

    if (oldMedia) {
      // Delete the old Cloudinary asset before committing the DB change.
      // If Cloudinary refuses the deletion, the transaction is rolled back
      // and the existing Home media remains active.
      await destroyCloudinaryMedia(oldMedia)
      cloudinaryDeleted = true

      await client.query('DELETE FROM media WHERE id = $1', [oldMedia.id])
    }

    await client.query('COMMIT')
    return serializeMedia(newMedia)
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // Ignore rollback errors while preserving the original failure.
    }

    // If the old Cloudinary asset was already deleted but the transaction
    // could not commit, restore the DB state is impossible without another
    // Cloudinary upload. Surface a clear synchronization error rather than
    // pretending the operation succeeded.
    if (cloudinaryDeleted && oldMedia) {
      const wrapped = new Error(
        'Home media replacement could not be completed after the old Cloudinary asset was deleted. Please retry the replacement.',
      )
      wrapped.code = 'HOME_MEDIA_SYNC_ERROR'
      wrapped.cause = error
      throw wrapped
    }

    throw error
  } finally {
    client.release()
  }
}

export async function deleteHomeMedia(placement) {
  validatePlacement(placement)

  const client = await pool.connect()
  let media = null
  let cloudinaryDeleted = false

  try {
    await client.query('BEGIN')

    const result = await client.query(
      `
        SELECT
          hp.media_id,
          m.id,
          m.cloudinary_public_id,
          m.resource_type
        FROM home_page hp
        INNER JOIN media m ON m.id = hp.media_id
        WHERE hp.placement = $1
        FOR UPDATE
      `,
      [placement],
    )

    media = result.rows[0] || null

    if (!media) {
      await client.query('COMMIT')
      return null
    }

    // The Home slot is permanent. Removing its media only clears the
    // media_id; the placement row itself must never be deleted.
    await client.query(
      `
        UPDATE home_page
        SET media_id = NULL, updated_at = NOW()
        WHERE placement = $1
      `,
      [placement],
    )

    await destroyCloudinaryMedia(media)
    cloudinaryDeleted = true

    // ON DELETE SET NULL is also enforced by the database, so the media row
    // can now be removed without deleting the permanent Home slot.
    await client.query('DELETE FROM media WHERE id = $1', [media.id])

    await client.query('COMMIT')

    return {
      mediaId: media.id,
      publicId: media.cloudinary_public_id,
    }
  } catch (error) {
    try {
      await client.query('ROLLBACK')
    } catch {
      // Preserve the original failure.
    }

    if (cloudinaryDeleted && media) {
      const wrapped = new Error(
        'Home media was removed from Cloudinary but the database update could not be completed. Please retry the operation.',
      )
      wrapped.code = 'HOME_MEDIA_SYNC_ERROR'
      wrapped.cause = error
      throw wrapped
    }

    throw error
  } finally {
    client.release()
  }
}

export { HOME_PLACEMENTS }
