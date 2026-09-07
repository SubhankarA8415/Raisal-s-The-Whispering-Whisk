import express from 'express'

import { 
    adminTest,
    bootstrapAdmin,
    promoteAdmin,
    authorizeAdminUser,
    getUsers,
    getControl,
    lockControl,
    unlockControl,
 } from '../controllers/adminController.js'
import { authenticate } from '../middleware/auth.js'
import { requireAuthorizedAdmin } from '../middleware/authorization.js'
import { bootstrapRateLimiter } from '../middleware/security.js'

const router = express.Router()

router.get(
  '/test',
  authenticate,
  requireAuthorizedAdmin,
  adminTest,
)

router.post(
  '/bootstrap',
  bootstrapRateLimiter,
  bootstrapAdmin,
)

router.post(
  '/promote',
  authenticate,
  requireAuthorizedAdmin,
  promoteAdmin,
)

router.post(
  '/authorize',
  authenticate,
  requireAuthorizedAdmin,
  authorizeAdminUser,
)


router.get(
  '/control',
  authenticate,
  requireAuthorizedAdmin,
  getControl,
)

router.post(
  '/control/lock',
  authenticate,
  requireAuthorizedAdmin,
  lockControl,
)

router.post(
  '/control/unlock',
  authenticate,
  requireAuthorizedAdmin,
  unlockControl,
)

router.get(
  '/users',
  authenticate,
  requireAuthorizedAdmin,
  getUsers,
)

export default router