import api from './api.js'

export async function adminTest() {
  return api('/admin/test')
}

export async function getAllUsers() {
  return api('/admin/users')
}

export async function promoteUser(userId) {
  return api('/admin/promote', {
    method: 'POST',
    body: JSON.stringify({
      userId,
    }),
  })
}

export async function authorizeAdmin(userId) {
  return api('/admin/authorize', {
    method: 'POST',
    body: JSON.stringify({
      userId,
    }),
  })
}

export async function bootstrapAdmin(userId, secret) {
  return api('/admin/bootstrap', {
    method: 'POST',
    body: JSON.stringify({
      userId,
      secret,
    }),
  })
}
export async function getAdminControl() {
  return api('/admin/control')
}

export async function lockAdminControl() {
  return api('/admin/control/lock', { method: 'POST' })
}

export async function unlockAdminControl() {
  return api('/admin/control/unlock', { method: 'POST' })
}
