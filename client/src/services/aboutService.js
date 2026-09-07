import api from './api.js'

export const getAbout = () => api('/about', { suppressError: true })
export const getAdminAbout = () => api('/admin/about')
export const createTeamMember = (data) => api('/admin/about/team', { method: 'POST', body: JSON.stringify(data) })
export const updateTeamMember = (id, data) => api(`/admin/about/team/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteTeamMember = (id) => api(`/admin/about/team/${id}`, { method: 'DELETE' })
export const createAboutSection = (data) => api('/admin/about/sections', { method: 'POST', body: JSON.stringify(data) })
export const updateAboutSection = (id, data) => api(`/admin/about/sections/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
export const deleteAboutSection = (id) => api(`/admin/about/sections/${id}`, { method: 'DELETE' })
