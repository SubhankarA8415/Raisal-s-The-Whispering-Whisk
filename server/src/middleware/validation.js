export function validateBody(validator) {
  return (req, res, next) => {
    const body =
      req.body &&
      typeof req.body === 'object' &&
      !Array.isArray(req.body)
        ? req.body
        : {}

    const result = validator(body)

    if (!result.valid) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Please check the provided information.',
          fields: result.errors,
        },
      })
    }

    next()
  }
}
