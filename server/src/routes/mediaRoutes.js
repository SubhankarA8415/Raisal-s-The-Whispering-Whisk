import express from 'express'

import {
  getUploadSignature,
  registerMedia,
  getMedia,
  removeMedia,
} from '../controllers/mediaController.js'
import { authenticate } from '../middleware/auth.js'
import { requireAuthorizedAdmin } from '../middleware/authorization.js'

const router = express.Router()

router.use(authenticate, requireAuthorizedAdmin)

router.get('/', getMedia)
router.post('/signature', getUploadSignature)
router.post('/', registerMedia)
router.delete('/', removeMedia)

export default router
