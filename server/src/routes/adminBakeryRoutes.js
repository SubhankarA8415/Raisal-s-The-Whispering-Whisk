import express from 'express'
import {
  getAdminStatus, patchClosure, postHour, patchHour, removeHour,
} from '../controllers/bakeryController.js'
import { authenticate } from '../middleware/auth.js'
import { requireAuthorizedAdmin } from '../middleware/authorization.js'

const router = express.Router()
router.use(authenticate, requireAuthorizedAdmin)
router.get('/', getAdminStatus)
router.patch('/closure', patchClosure)
router.post('/hours', postHour)
router.patch('/hours/:id', patchHour)
router.delete('/hours/:id', removeHour)

export default router
