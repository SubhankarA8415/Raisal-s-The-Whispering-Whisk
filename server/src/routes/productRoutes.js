import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { requireAuthorizedAdmin } from '../middleware/authorization.js'
import {
  getProducts, getProductDetails, getReviews,
  postCustomerReview, patchCustomerReview, deleteCustomerReview,
} from '../controllers/productController.js'

const router = express.Router()
router.get('/', getProducts)
router.get('/:id', getProductDetails)
router.get('/:id/reviews', getReviews)
router.post('/:id/reviews', authenticate, postCustomerReview)
router.patch('/:id/reviews/:reviewId', authenticate, patchCustomerReview)
router.delete('/:id/reviews/:reviewId', authenticate, deleteCustomerReview)
export default router
