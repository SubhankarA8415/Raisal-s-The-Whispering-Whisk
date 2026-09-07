import express from 'express'

import { validateBody } from '../middleware/validation.js'
import {
  register,
  login,
  getCurrentUser,
  logout,
  googleLogin,
  googleCallback,
  updateCurrentUser,
  forgotPassword,
  resetPassword,
  getAvatars,
} from '../controllers/authController.js'

import {
  validateRegistration,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
} from '../validators/authValidator.js'

import { authenticate } from '../middleware/auth.js'
import {
  authRateLimiter,
  passwordResetRateLimiter,
} from '../middleware/security.js'

const router = express.Router()

router.post(
  '/register',
  authRateLimiter,
  validateBody(validateRegistration),
  register,
)

router.post(
  '/login',
  authRateLimiter,
  validateBody(validateLogin),
  login,
)

router.get(
  '/avatars',
  getAvatars,
)

router.get(
  '/me',
  authenticate,
  getCurrentUser,
)

router.post(
  '/logout',
  logout,
)

router.get(
  '/google',
  authRateLimiter,
  googleLogin,
)

router.get(
  '/google/callback',
  googleCallback,
)

router.patch(
  '/me',
  authenticate,
  updateCurrentUser,
)

router.post(
  '/forgot-password',
  passwordResetRateLimiter,
  validateBody(validateForgotPassword),
  forgotPassword,
)

router.post(
  '/reset-password',
  passwordResetRateLimiter,
  validateBody(validateResetPassword),
  resetPassword,
)

export default router