import { v2 as cloudinary } from 'cloudinary'

function getCloudinaryConfig() {
  const required = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
  ]

  const missing = required.filter(
    (name) => !process.env[name],
  )

  if (missing.length > 0) {
    const error = new Error(
      `Missing Cloudinary configuration: ${missing.join(', ')}`,
    )
    error.code = 'CLOUDINARY_CONFIGURATION_ERROR'
    throw error
  }

  return {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  }
}

const config = getCloudinaryConfig()

cloudinary.config(config)

export default cloudinary

export function getCloudinaryFolder() {
  return (
    process.env.CLOUDINARY_FOLDER ||
    `raisals-bakery/${process.env.NODE_ENV === 'production' ? 'production' : 'development'}`
  )
}

export async function verifyCloudinary() {
  await cloudinary.api.ping()
}
export function getAvatarFolder() {
  return (
    process.env.CLOUDINARY_AVATAR_FOLDER ||
    'raisals-bakery/avatars'
  )
}

export function getAvatarUrl(avatarId, size = 256) {
  // Cloudinary's Media Library folder (asset_folder) is separate from the
  // asset's public ID when dynamic folders are used. The fixed avatars were
  // uploaded into the `raisals-bakery/avatars` asset folder with public IDs
  // `whisk00` ... `whisk19`, so the folder must not be prepended here.
  const publicId = avatarId

  return cloudinary.url(publicId, {
    secure: true,
    resource_type: 'image',
    type: 'upload',
    format: 'png',
    transformation: [
      {
        width: size,
        height: size,
        crop: 'fit',
        quality: 'auto',
        fetch_format: 'auto',
      },
    ],
  })
}

