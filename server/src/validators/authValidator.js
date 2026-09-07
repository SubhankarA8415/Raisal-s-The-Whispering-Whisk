export function validateRegistration({ name, email, password }) {
  const errors = {}

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    errors.name = 'Name must be between 2 and 100 characters.'
  }

  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!password || password.length < 8 || password.length > 128) {
    errors.password = 'Password must be between 8 and 128 characters.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateLogin({ email, password }) {
  const errors = {}

  if (
    !email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!password || password.length < 1) {
    errors.password = 'Password is required.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateForgotPassword({ email }) {
  const errors = {}

  if (
    !email ||
    typeof email !== 'string' ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  ) {
    errors.email = 'Please enter a valid email address.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}

export function validateResetPassword({
  token,
  newPassword,
}) {
  const errors = {}

  if (
    !token ||
    typeof token !== 'string' ||
    !/^[a-f0-9]{64}$/i.test(token)
  ) {
    errors.token = 'Invalid password reset token.'
  }

  if (
    !newPassword ||
    typeof newPassword !== 'string' ||
    newPassword.length < 8 ||
    newPassword.length > 128
  ) {
    errors.newPassword =
      'Password must be between 8 and 128 characters.'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
