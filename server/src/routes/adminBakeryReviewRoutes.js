import express from 'express'
import {
  getAdminReviews,
  createAdminBakeryReview,
  patchAdminBakeryReview,
  removeAdminBakeryReview,
} from '../controllers/bakeryReviewController.js'
import { authenticate } from '../middleware/auth.js'
import { requireAuthorizedAdmin } from '../middleware/authorization.js'

const router = express.Router()
router.use(authenticate, requireAuthorizedAdmin)
router.get('/', getAdminReviews)
router.post('/', createAdminBakeryReview)
router.patch('/:id', patchAdminBakeryReview)
router.delete('/:id', removeAdminBakeryReview)
export default router
