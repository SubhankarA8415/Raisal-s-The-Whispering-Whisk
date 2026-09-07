import express from 'express'
import {
  getAdminHomeData,
  putHomeMedia,
  removeHomeMedia,
} from '../controllers/homeController.js'
import { authenticate } from '../middleware/auth.js'
import { requireAuthorizedAdmin } from '../middleware/authorization.js'

const router = express.Router()

router.use(authenticate, requireAuthorizedAdmin)
router.get('/', getAdminHomeData)
router.put('/media/:placement', putHomeMedia)
router.delete('/media/:placement', removeHomeMedia)

export default router
