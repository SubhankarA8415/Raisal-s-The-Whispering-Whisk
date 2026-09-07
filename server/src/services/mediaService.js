import cloudinary, {
  getCloudinaryFolder,
} from '../config/cloudinary.js'
import pool from '../config/database.js'

const ALLOWED_RESOURCE_TYPES = new Set([
  'image',
  'video',
])

function validateResourceType(resourceType) {
  if (!ALLOWED_RESOURCE_TYPES.has(resourceType)) {
    const error = new Error(
      'Unsupported media type. Allowed types are image and video.',
    )
    error.code = 'INVALID_MEDIA_TYPE'
    throw error
  }
}

function validatePublicId(publicId) {
  if (
    !publicId ||
    typeof publicId !== 'string' ||
    publicId.length > 512
  ) {
    const error = new Error(
      'A valid Cloudinary public ID is required.',
    )
    error.code = 'INVALID_MEDIA_PUBLIC_ID'
    throw error
  }
}

function validateUploadPayload(data) {
  if (!data || typeof data !== 'object') {
    const error = new Error('Media upload data is required.')
    error.code = 'INVALID_MEDIA_UPLOAD'
    throw error
  }

  validatePublicId(data.publicId)
  validateResourceType(data.resourceType)

  if (
    typeof data.secureUrl !== 'string' ||
    !data.secureUrl.startsWith('https://res.cloudinary.com/')
  ) {
    const error = new Error('Invalid Cloudinary secure URL.')
    error.code = 'INVALID_MEDIA_URL'
    throw error
  }

  const expectedFolder = getCloudinaryFolder()

  if (
    typeof data.folder !== 'string' ||
    data.folder !== expectedFolder ||
    !data.publicId.startsWith(`${expectedFolder}/`)
  ) {
    const error = new Error(
      'Media must belong to the current application upload folder.',
    )
    error.code = 'INVALID_MEDIA_FOLDER'
    throw error
  }
}

export function createUploadSignature(resourceType = 'image') {
  validateResourceType(resourceType)

  const timestamp = Math.floor(Date.now() / 1000)
  const folder = getCloudinaryFolder()

  const signature = cloudinary.utils.api_sign_request(
    {
      folder,
      timestamp,
    },
    process.env.CLOUDINARY_API_SECRET,
  )

  return {
    signature,
    timestamp,
    folder,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    resourceType,
  }
}

export async function registerUploadedMedia({
  userId,
  publicId,
  secureUrl,
  resourceType,
  folder,
  originalFilename,
  format,
  bytes,
  width,
  height,
  duration,
}) {
  validateUploadPayload({
    publicId,
    secureUrl,
    resourceType,
    folder,
  })

  // Verify that the asset actually exists in this Cloudinary account.
  // This prevents a client from registering an arbitrary URL/public ID.
  let asset

  try {
    asset = await cloudinary.api.resource(publicId, {
      resource_type: resourceType,
    })
  } catch (error) {
    const wrappedError = new Error(
      'The uploaded media could not be verified with Cloudinary.',
    )
    wrappedError.code = 'CLOUDINARY_MEDIA_NOT_FOUND'
    wrappedError.cause = error
    throw wrappedError
  }

  if (
    asset.secure_url !== secureUrl ||
    !asset.public_id.startsWith(`${folder}/`)
  ) {
    const error = new Error(
      'The uploaded media does not match the verified Cloudinary asset.',
    )
    error.code = 'MEDIA_VERIFICATION_FAILED'
    throw error
  }

  try {
    const result = await pool.query(
      `
        INSERT INTO media (
          cloudinary_public_id,
          secure_url,
          resource_type,
          folder,
          original_filename,
          format,
          bytes,
          width,
          height,
          duration,
          uploaded_by
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11
        )
        RETURNING
          id,
          cloudinary_public_id,
          secure_url,
          resource_type,
          folder,
          original_filename,
          format,
          bytes,
          width,
          height,
          duration,
          alt_text,
          uploaded_by,
          created_at,
          updated_at
      `,
      [
        asset.public_id,
        asset.secure_url,
        resourceType,
        folder,
        asset.original_filename || originalFilename || null,
        asset.format || format || null,
        Number.isFinite(asset.bytes) ? asset.bytes : (bytes ?? null),
        Number.isFinite(asset.width) ? asset.width : (width ?? null),
        Number.isFinite(asset.height) ? asset.height : (height ?? null),
        Number.isFinite(asset.duration) ? asset.duration : (duration ?? null),
        userId,
      ],
    )

    return result.rows[0]
  } catch (error) {
    if (error.code === '23505') {
      const existing = await pool.query(
        `
          SELECT
            id,
            cloudinary_public_id,
            secure_url,
            resource_type,
            folder,
            original_filename,
            format,
            bytes,
            width,
            height,
            duration,
            alt_text,
            uploaded_by,
            created_at,
            updated_at
          FROM media
          WHERE cloudinary_public_id = $1
        `,
        [publicId],
      )

      if (existing.rows.length > 0) {
        return existing.rows[0]
      }
    }

    throw error
  }
}

export async function deleteMedia({
  mediaId,
  userId,
}) {
  if (!mediaId || typeof mediaId !== 'string') {
    const error = new Error('A valid media ID is required.')
    error.code = 'INVALID_MEDIA_ID'
    throw error
  }

  const result = await pool.query(
    `
      SELECT
        id,
        cloudinary_public_id,
        resource_type
      FROM media
      WHERE id = $1
    `,
    [mediaId],
  )

  if (result.rows.length === 0) {
    const error = new Error('Media not found.')
    error.code = 'MEDIA_NOT_FOUND'
    throw error
  }

  const media = result.rows[0]

  // Home media is managed through the Home media endpoints so that the
  // Home mapping and Cloudinary asset are removed together. Prevent the
  // generic media endpoint from deleting an asset that is still assigned
  // to a Home placeholder.
  const homeReference = await pool.query(
    `SELECT placement FROM home_page WHERE media_id = $1 LIMIT 1`,
    [media.id],
  )

  if (homeReference.rows.length > 0) {
    const error = new Error(
      'This media is assigned to the Home page. Manage it from Home Media instead.',
    )
    error.code = 'MEDIA_IN_USE'
    throw error
  }

  const productReference = await pool.query(
    `SELECT product_id FROM product_media WHERE media_id = $1 LIMIT 1`,
    [media.id],
  )

  if (productReference.rows.length > 0) {
    const error = new Error(
      'This media is assigned to a product. Manage it from the Product Editor instead.',
    )
    error.code = 'MEDIA_IN_USE'
    throw error
  }

  const aboutReference = await pool.query(
    `SELECT id FROM about_team_members WHERE media_id = $1 UNION ALL SELECT id FROM about_sections WHERE media_id = $1 LIMIT 1`,
    [media.id],
  )

  if (aboutReference.rows.length > 0) {
    const error = new Error('This media is assigned to the About Us page. Manage it from About Us Studio instead.')
    error.code = 'MEDIA_IN_USE'
    throw error
  }

  try {
    const cloudinaryResult = await cloudinary.uploader.destroy(
      media.cloudinary_public_id,
      {
        resource_type: media.resource_type,
        invalidate: true,
      },
    )

    if (
      cloudinaryResult.result !== 'ok' &&
      cloudinaryResult.result !== 'not found'
    ) {
      const error = new Error(
        'Cloudinary did not confirm media deletion.',
      )
      error.code = 'CLOUDINARY_DELETE_ERROR'
      throw error
    }

    await pool.query(
      `
        DELETE FROM media
        WHERE id = $1
      `,
      [media.id],
    )

    return {
      id: media.id,
      publicId: media.cloudinary_public_id,
      result: cloudinaryResult.result,
    }
  } catch (error) {
    if (error.code === 'CLOUDINARY_DELETE_ERROR') {
      throw error
    }

    const wrappedError = new Error(
      'Unable to delete the media from Cloudinary.',
    )
    wrappedError.code = 'CLOUDINARY_DELETE_ERROR'
    wrappedError.cause = error
    throw wrappedError
  }
}

export async function listMedia() {
  const result = await pool.query(
    `
      SELECT
        id,
        cloudinary_public_id,
        secure_url,
        resource_type,
        folder,
        original_filename,
        format,
        bytes,
        width,
        height,
        duration,
        alt_text,
        uploaded_by,
        created_at,
        updated_at
      FROM media
      ORDER BY created_at DESC
    `,
  )

  return result.rows
}
