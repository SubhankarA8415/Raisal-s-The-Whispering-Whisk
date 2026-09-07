import {
  getPublicHome,
  getAdminHome,
  assignHomeMedia,
  deleteHomeMedia,
} from '../services/homeService.js'

export async function getHome(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: { home: await getPublicHome() },
    })
  } catch (error) {
    next(error)
  }
}

export async function getAdminHomeData(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: { home: await getAdminHome() },
    })
  } catch (error) {
    next(error)
  }
}

export async function putHomeMedia(req, res, next) {
  try {
    const media = await assignHomeMedia(
      req.params.placement,
      req.body?.mediaId,
    )

    return res.status(200).json({
      success: true,
      message: 'Home media updated successfully.',
      data: { media },
    })
  } catch (error) {
    next(error)
  }
}

export async function removeHomeMedia(req, res, next) {
  try {
    const result = await deleteHomeMedia(req.params.placement)

    return res.status(200).json({
      success: true,
      message: 'Home media deleted successfully.',
      data: result,
    })
  } catch (error) {
    next(error)
  }
}
