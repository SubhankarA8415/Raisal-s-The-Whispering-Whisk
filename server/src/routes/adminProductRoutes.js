import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireAuthorizedAdmin } from '../middleware/authorization.js'
import {
  getAdminProducts, postProduct, patchProduct, saveProductWithVariants, putProductVariants,
  postProductMedia, deleteProductMedia, removeProduct,
  postAdminReview, patchAdminReview, deleteAdminReview,
} from '../controllers/productController.js'

const router = express.Router()
router.use(authenticate, requireAuthorizedAdmin)
router.get('/', getAdminProducts)
router.post('/', postProduct)
router.patch('/:id', patchProduct)
router.put('/:id', saveProductWithVariants)
router.put('/:id/variants', putProductVariants)
router.post('/:id/media', postProductMedia)
router.delete('/:id/media', deleteProductMedia)
router.delete('/:id', removeProduct)
router.post('/:id/reviews', postAdminReview)
router.patch('/:id/reviews/:reviewId', patchAdminReview)
router.delete('/:id/reviews/:reviewId', deleteAdminReview)
export default router
