import express from 'express'
import {
  getBakeryReviews,
  getMyBakeryReview,
  createReview,
  updateReview,
  removeReview,
} from '../controllers/bakeryReviewController.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()
router.get('/', getBakeryReviews)
router.get('/mine', authenticate, getMyBakeryReview)
router.post('/', authenticate, createReview)
router.patch('/:id', authenticate, updateReview)
router.delete('/:id', authenticate, removeReview)
export default router
