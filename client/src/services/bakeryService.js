import api from './api.js'

export const getBakeryStatus = () => api('/bakery', { suppressError: true })
export const getAdminBakeryStatus = () => api('/admin/bakery')
export const updateBakeryClosure = (isClosed, note) => api('/admin/bakery/closure', { method: 'PATCH', body: JSON.stringify({ isClosed, note }) })
export const createOperatingHour = (data) => api('/admin/bakery/hours', { method: 'POST', body: JSON.stringify(data) })
export const updateOperatingHour = (id, data) => api(`/admin/bakery/hours/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteOperatingHour = (id) => api(`/admin/bakery/hours/${id}`, { method: 'DELETE' })
