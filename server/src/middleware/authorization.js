export function requireAdmin(req, res, next) {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ADMIN_ACCESS_REQUIRED',
        message: 'Admin access is required.',
      },
    })
  }

  next()
}

export function requireAuthorizedAdmin(req, res, next) {
  if (
    req.user.user_type !== 'admin' ||
    !req.user.is_authorized
  ) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'ADMIN_NOT_AUTHORIZED',
        message: 'You are not authorized to access this resource.',
      },
    })
  }

  next()
}