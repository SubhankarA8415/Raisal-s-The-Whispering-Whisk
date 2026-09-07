import express from 'express'
import { getAdminAboutData, postTeamMember, patchTeamMember, removeTeamMember, postSection, patchSection, removeSection } from '../controllers/aboutController.js'
import { authenticate } from '../middleware/auth.js'
import { requireAuthorizedAdmin } from '../middleware/authorization.js'
const router = express.Router()
router.use(authenticate, requireAuthorizedAdmin)
router.get('/', getAdminAboutData)
router.post('/team', postTeamMember)
router.patch('/team/:id', patchTeamMember)
router.delete('/team/:id', removeTeamMember)
router.post('/sections', postSection)
router.patch('/sections/:id', patchSection)
router.delete('/sections/:id', removeSection)
export default router
