import {
  createUploadSignature,
  registerUploadedMedia,
  deleteMedia,
  listMedia,
} from '../services/mediaService.js'

export function getUploadSignature(req, res, next) {
  try {
    const { resourceType = 'image' } = req.body || {}

    const data = createUploadSignature(resourceType)

    return res.status(200).json({
      success: true,
      data,
    })
  } catch (error) {
    next(error)
  }
}

export async function registerMedia(req, res, next) {
  try {
    const {
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
    } = req.body || {}

    const media = await registerUploadedMedia({
      userId: req.user.id,
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
    })

    return res.status(201).json({
      success: true,
      message: 'Media registered successfully.',
      data: {
        media,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function getMedia(req, res, next) {
  try {
    const media = await listMedia()

    return res.status(200).json({
      success: true,
      data: {
        media,
      },
    })
  } catch (error) {
    next(error)
  }
}

export async function removeMedia(req, res, next) {
  try {
    const { mediaId } = req.body || {}

    const result = await deleteMedia({
      mediaId,
      userId: req.user.id,
    })

    return res.status(200).json({
      success: true,
      message: 'Media deleted successfully.',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
