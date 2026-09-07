import {
  listPublishedBakeryReviews,
  getCustomerBakeryReview,
  createCustomerReview,
  updateCustomerReview,
  deleteCustomerReview,
  listAdminBakeryReviews,
  createAdminReview,
  updateAdminReview,
  adminDeleteAnyBakeryReview,
} from '../services/bakeryReviewService.js'

export async function getBakeryReviews(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: { reviews: await listPublishedBakeryReviews() },
    })
  } catch (error) { next(error) }
}

export async function getMyBakeryReview(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: { review: await getCustomerBakeryReview(req.user.id) },
    })
  } catch (error) { next(error) }
}

export async function createReview(req, res, next) {
  try {
    return res.status(201).json({
      success: true,
      message: 'Review submitted successfully.',
      data: { review: await createCustomerReview({
        userId: req.user.id,
        rating: req.body?.rating,
        reviewText: req.body?.reviewText,
      }) },
    })
  } catch (error) { next(error) }
}

export async function updateReview(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      message: 'Review updated successfully.',
      data: { review: await updateCustomerReview({
        reviewId: req.params.id,
        userId: req.user.id,
        rating: req.body?.rating,
        reviewText: req.body?.reviewText,
      }) },
    })
  } catch (error) { next(error) }
}

export async function removeReview(req, res, next) {
  try {
    await deleteCustomerReview({ reviewId: req.params.id, userId: req.user.id })
    return res.status(200).json({ success: true, message: 'Review deleted successfully.' })
  } catch (error) { next(error) }
}

export async function getAdminReviews(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      data: { reviews: await listAdminBakeryReviews() },
    })
  } catch (error) { next(error) }
}

export async function createAdminBakeryReview(req, res, next) {
  try {
    return res.status(201).json({
      success: true,
      message: 'Bakery team review added successfully.',
      data: { review: await createAdminReview({
        adminId: req.user.id,
        reviewerName: req.body?.reviewerName,
        rating: req.body?.rating,
        reviewText: req.body?.reviewText,
      }) },
    })
  } catch (error) { next(error) }
}

export async function patchAdminBakeryReview(req, res, next) {
  try {
    return res.status(200).json({
      success: true,
      message: 'Bakery team review updated successfully.',
      data: { review: await updateAdminReview({
        adminId: req.user.id,
        reviewId: req.params.id,
        reviewerName: req.body?.reviewerName,
        rating: req.body?.rating,
        reviewText: req.body?.reviewText,
      }) },
    })
  } catch (error) { next(error) }
}

export async function removeAdminBakeryReview(req, res, next) {
  try {
    await adminDeleteAnyBakeryReview(req.params.id)
    return res.status(200).json({ success: true, message: 'Bakery team review deleted successfully.' })
  } catch (error) { next(error) }
}
