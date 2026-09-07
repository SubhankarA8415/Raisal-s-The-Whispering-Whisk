import cloudinary from '../config/cloudinary.js'
import pool from '../config/database.js'

function fail(code, message, fields) {
  const error = new Error(message)
  error.code = code
  if (fields) error.fields = fields
  throw error
}

function text(value, field, min, max, required = false) {
  if (value == null && !required) return null
  if (typeof value !== 'string' || (required && !value.trim()) || value.trim().length < min || value.trim().length > max) {
    fail('VALIDATION_ERROR', `${field} must contain ${min}–${max} characters.`, { [field]: `${field} must contain ${min}–${max} characters.` })
  }
  return value.trim()
}

function integer(value, field = 'displayOrder') {
  const n = Number(value)
  if (!Number.isInteger(n)) fail('VALIDATION_ERROR', `${field} must be an integer.`)
  return n
}

function bool(value, field = 'isVisible') {
  if (typeof value !== 'boolean') fail('VALIDATION_ERROR', `${field} must be a boolean.`)
  return value
}

function serializeMedia(row) {
  if (!row.media_id) return null
  return { id: row.media_id, url: row.media_url, resourceType: row.media_resource_type, altText: row.media_alt_text }
}

function serializeMember(row) {
  return { id: row.id, name: row.name, role: row.role, description: row.description, displayOrder: row.display_order, isVisible: row.is_visible, media: serializeMedia(row), createdAt: row.created_at, updatedAt: row.updated_at }
}

function serializeSection(row) {
  return { id: row.id, eyebrow: row.eyebrow, title: row.title, description: row.description, body: row.body, layout: row.layout, displayOrder: row.display_order, isVisible: row.is_visible, media: serializeMedia(row), createdAt: row.created_at, updatedAt: row.updated_at }
}

const memberSelect = `
  SELECT m.id, m.name, m.role, m.description, m.display_order, m.is_visible, m.created_at, m.updated_at,
         m.media_id, med.secure_url AS media_url, med.resource_type AS media_resource_type, med.alt_text AS media_alt_text
  FROM about_team_members m LEFT JOIN media med ON med.id = m.media_id
`
const sectionSelect = `
  SELECT s.id, s.eyebrow, s.title, s.description, s.body, s.layout, s.display_order, s.is_visible, s.created_at, s.updated_at,
         s.media_id, med.secure_url AS media_url, med.resource_type AS media_resource_type, med.alt_text AS media_alt_text
  FROM about_sections s LEFT JOIN media med ON med.id = s.media_id
`

export async function getPublicAbout() {
  const [sections, team] = await Promise.all([
    pool.query(`${sectionSelect} WHERE s.is_visible = TRUE ORDER BY s.display_order ASC, s.created_at ASC`),
    pool.query(`${memberSelect} WHERE m.is_visible = TRUE ORDER BY m.display_order ASC, m.created_at ASC`),
  ])
  return { sections: sections.rows.map(serializeSection), team: team.rows.map(serializeMember) }
}

export async function getAdminAbout() {
  const [sections, team] = await Promise.all([
    pool.query(`${sectionSelect} ORDER BY s.display_order ASC, s.created_at ASC`),
    pool.query(`${memberSelect} ORDER BY m.display_order ASC, m.created_at ASC`),
  ])
  return { sections: sections.rows.map(serializeSection), team: team.rows.map(serializeMember) }
}

export async function createTeamMember(data) {
  const name = text(data.name, 'Name', 2, 120, true)
  const role = text(data.role, 'Role', 2, 80, true)
  const description = text(data.description, 'Description', 1, 2000, true)
  const order = integer(data.displayOrder ?? 0)
  const visible = data.isVisible === undefined ? true : bool(data.isVisible)
  const mediaId = data.mediaId || null
  const result = await pool.query(`INSERT INTO about_team_members (name, role, description, media_id, display_order, is_visible) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`, [name, role, description, mediaId, order, visible])
  return getTeamMember(result.rows[0].id)
}

export async function getTeamMember(id) {
  const result = await pool.query(`${memberSelect} WHERE m.id = $1`, [id])
  if (!result.rows[0]) fail('TEAM_MEMBER_NOT_FOUND', 'Team member not found.')
  return serializeMember(result.rows[0])
}

export async function updateTeamMember(id, data) {
  const existing = await getTeamMember(id)
  const name = data.name === undefined ? existing.name : text(data.name, 'Name', 2, 120, true)
  const role = data.role === undefined ? existing.role : text(data.role, 'Role', 2, 80, true)
  const description = data.description === undefined ? existing.description : text(data.description, 'Description', 1, 2000, true)
  const order = data.displayOrder === undefined ? existing.displayOrder : integer(data.displayOrder)
  const visible = data.isVisible === undefined ? existing.isVisible : bool(data.isVisible)
  const mediaId = data.mediaId === undefined ? (existing.media?.id || null) : (data.mediaId || null)
  const result = await pool.query(`UPDATE about_team_members SET name=$1, role=$2, description=$3, media_id=$4, display_order=$5, is_visible=$6, updated_at=NOW() WHERE id=$7 RETURNING id`, [name, role, description, mediaId, order, visible, id])
  return getTeamMember(result.rows[0].id)
}

export async function deleteTeamMember(id) {
  const existing = await getTeamMember(id)
  await pool.query('DELETE FROM about_team_members WHERE id = $1', [id])
  return { id, mediaId: existing.media?.id || null }
}

export async function createSection(data) {
  const title = text(data.title, 'Title', 1, 160, true)
  const eyebrow = text(data.eyebrow, 'Eyebrow', 0, 100)
  const description = text(data.description, 'Description', 0, 600)
  const body = text(data.body, 'Body', 0, 5000)
  const layout = ['split','full','center'].includes(data.layout) ? data.layout : 'split'
  const order = integer(data.displayOrder ?? 0)
  const visible = data.isVisible === undefined ? true : bool(data.isVisible)
  const mediaId = data.mediaId || null
  const result = await pool.query(`INSERT INTO about_sections (eyebrow,title,description,body,media_id,layout,display_order,is_visible) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`, [eyebrow, title, description, body, mediaId, layout, order, visible])
  return getSection(result.rows[0].id)
}

export async function getSection(id) {
  const result = await pool.query(`${sectionSelect} WHERE s.id = $1`, [id])
  if (!result.rows[0]) fail('ABOUT_SECTION_NOT_FOUND', 'About section not found.')
  return serializeSection(result.rows[0])
}

export async function updateSection(id, data) {
  const existing = await getSection(id)
  const title = data.title === undefined ? existing.title : text(data.title, 'Title', 1, 160, true)
  const eyebrow = data.eyebrow === undefined ? existing.eyebrow : text(data.eyebrow, 'Eyebrow', 0, 100)
  const description = data.description === undefined ? existing.description : text(data.description, 'Description', 0, 600)
  const body = data.body === undefined ? existing.body : text(data.body, 'Body', 0, 5000)
  const layout = data.layout === undefined ? existing.layout : (['split','full','center'].includes(data.layout) ? data.layout : fail('VALIDATION_ERROR','Invalid section layout.'))
  const order = data.displayOrder === undefined ? existing.displayOrder : integer(data.displayOrder)
  const visible = data.isVisible === undefined ? existing.isVisible : bool(data.isVisible)
  const mediaId = data.mediaId === undefined ? (existing.media?.id || null) : (data.mediaId || null)
  await pool.query(`UPDATE about_sections SET eyebrow=$1,title=$2,description=$3,body=$4,media_id=$5,layout=$6,display_order=$7,is_visible=$8,updated_at=NOW() WHERE id=$9`, [eyebrow,title,description,body,mediaId,layout,order,visible,id])
  return getSection(id)
}

export async function deleteSection(id) {
  const existing = await getSection(id)
  await pool.query('DELETE FROM about_sections WHERE id=$1', [id])
  return { id, mediaId: existing.media?.id || null }
}
