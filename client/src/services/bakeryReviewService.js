import api from './api.js'

export const getBakeryReviews = () =>
  api('/bakery-reviews', { suppressError: true })

export const getMyBakeryReview = () =>
  api('/bakery-reviews/mine', { suppressError: true })

export const createBakeryReview = (data) =>
  api('/bakery-reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateBakeryReview = (id, data) =>
  api(`/bakery-reviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const deleteBakeryReview = (id) =>
  api(`/bakery-reviews/${id}`, { method: 'DELETE' })

export const getAdminBakeryReviews = () =>
  api('/admin/bakery-reviews')

export const createAdminBakeryReview = (data) =>
  api('/admin/bakery-reviews', {
    method: 'POST',
    body: JSON.stringify(data),
  })

export const updateAdminBakeryReview = (id, data) =>
  api(`/admin/bakery-reviews/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })

export const adminDeleteAnyBakeryReview = (id) =>
  api(`/admin/bakery-reviews/${id}`, { method: 'DELETE' })
