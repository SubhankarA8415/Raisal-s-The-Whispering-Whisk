import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  saveProductAndVariants,
  replaceVariants,
  attachProductMedia,
  removeProductMedia,
  deleteProduct,
  listProductReviews,
  createCustomerReview,
  updateCustomerReview,
  deleteCustomerReview as deleteCustomerReviewService,
  createAdminReview,
  updateAdminReview,
  deleteAdminReview as deleteAdminReviewService,
} from '../services/productService.js'

export async function getProducts(req, res, next) {
  try {
    const products = await listProducts({ category: req.query.category || '', includeUnavailable: req.query.availability === 'all', offersOnly: req.query.offers === 'true' })
    res.status(200).json({ success: true, data: { products } })
  } catch (error) { next(error) }
}

export async function getProductDetails(req, res, next) {
  try { res.status(200).json({ success: true, data: { product: await getProduct(req.params.id) } }) } catch (error) { next(error) }
}

export async function getAdminProducts(req, res, next) {
  try { res.status(200).json({ success: true, data: { products: await listProducts({ includeUnavailable: true }) } }) } catch (error) { next(error) }
}

export async function postProduct(req, res, next) {
  try { res.status(201).json({ success: true, data: { product: await createProduct(req.body) } }) } catch (error) { next(error) }
}

export async function patchProduct(req, res, next) {
  try { res.status(200).json({ success: true, data: { product: await updateProduct(req.params.id, req.body) } }) } catch (error) { next(error) }
}

export async function saveProductWithVariants(req, res, next) {
  try { res.status(200).json({ success: true, data: { product: await saveProductAndVariants(req.params.id, req.body, req.body.variants) } }) } catch (error) { next(error) }
}

export async function putProductVariants(req, res, next) {
  try { res.status(200).json({ success: true, data: { product: await replaceVariants(req.params.id, req.body.variants) } }) } catch (error) { next(error) }
}

export async function postProductMedia(req, res, next) {
  try { res.status(201).json({ success: true, data: { media: await attachProductMedia(req.params.id, req.body.mediaId, req.body.displayOrder) } }) } catch (error) { next(error) }
}

export async function deleteProductMedia(req, res, next) {
  try { res.status(200).json({ success: true, data: await removeProductMedia(req.params.id, req.body.mediaId) }) } catch (error) { next(error) }
}

export async function removeProduct(req, res, next) {
  try { res.status(200).json({ success: true, data: await deleteProduct(req.params.id) }) } catch (error) { next(error) }
}

export async function getReviews(req, res, next) {
  try { res.status(200).json({ success: true, data: await listProductReviews(req.params.id) }) } catch (error) { next(error) }
}

export async function postCustomerReview(req, res, next) {
  try { res.status(201).json({ success: true, data: { review: await createCustomerReview(req.params.id, req.user, req.body.rating, req.body.reviewText) } }) } catch (error) { next(error) }
}

export async function patchCustomerReview(req, res, next) {
  try { res.status(200).json({ success: true, data: { review: await updateCustomerReview(req.params.reviewId, req.user.id, req.body.rating, req.body.reviewText) } }) } catch (error) { next(error) }
}

export async function deleteCustomerReview(req, res, next) {
  try { res.status(200).json({ success: true, data: await deleteCustomerReviewService(req.params.reviewId, req.user.id) }) } catch (error) { next(error) }
}

export async function postAdminReview(req, res, next) {
  try { res.status(201).json({ success: true, data: { review: await createAdminReview(req.params.id, req.user.id, req.body) } }) } catch (error) { next(error) }
}

export async function patchAdminReview(req, res, next) {
  try { res.status(200).json({ success: true, data: { review: await updateAdminReview(req.params.reviewId, req.user.id, req.body) } }) } catch (error) { next(error) }
}

export async function deleteAdminReview(req, res, next) {
  try { res.status(200).json({ success: true, data: await deleteAdminReviewService(req.params.reviewId) }) } catch (error) { next(error) }
}
