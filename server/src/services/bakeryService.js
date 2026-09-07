import pool from '../config/database.js'

const DAY_NAMES = {
  1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday',
  5: 'Friday', 6: 'Saturday', 7: 'Sunday',
}

function fail(message, fields) {
  const error = new Error(message)
  error.code = 'VALIDATION_ERROR'
  if (fields) error.fields = fields
  throw error
}

function validateDay(value) {
  const day = Number(value)
  if (!Number.isInteger(day) || day < 1 || day > 7) {
    fail('Please select a valid day.', { dayOfWeek: 'Day must be between Monday and Sunday.' })
  }
  return day
}

function validateTime(value, field) {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    fail(`${field} must be a valid time.`, { [field]: `${field} must use HH:MM format.` })
  }
  return value
}

function validateRange(openTime, closeTime) {
  const open = validateTime(openTime, 'openTime')
  const close = validateTime(closeTime, 'closeTime')
  if (open >= close) {
    fail('Closing time must be later than opening time.', { closeTime: 'Closing time must be later than opening time.' })
  }
  return { open, close }
}

function serializeHour(row) {
  return {
    id: row.id,
    dayOfWeek: Number(row.day_of_week),
    dayName: DAY_NAMES[Number(row.day_of_week)],
    openTime: String(row.open_time).slice(0, 5),
    closeTime: String(row.close_time).slice(0, 5),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function serializeClosure(row) {
  return {
    isClosed: row.is_closed === true,
    note: row.note || null,
    updatedAt: row.updated_at,
  }
}

async function getClosure() {
  const result = await pool.query('SELECT id, is_closed, note, updated_at FROM bakery_closure WHERE id = 1')
  if (!result.rows[0]) {
    await pool.query('INSERT INTO bakery_closure (id, is_closed, note) VALUES (1, FALSE, NULL) ON CONFLICT (id) DO NOTHING')
    const retry = await pool.query('SELECT id, is_closed, note, updated_at FROM bakery_closure WHERE id = 1')
    return serializeClosure(retry.rows[0])
  }
  return serializeClosure(result.rows[0])
}

async function getHours() {
  const result = await pool.query(`
    SELECT id, day_of_week, open_time, close_time, created_at, updated_at
    FROM bakery_operating_hours
    ORDER BY day_of_week ASC
  `)
  return result.rows.map(serializeHour)
}

export async function getBakeryStatus() {
  const [closure, hours] = await Promise.all([getClosure(), getHours()])
  return { closure, hours }
}

export async function updateBakeryClosure(isClosed, note) {
  if (typeof isClosed !== 'boolean') {
    fail('Closure status must be true or false.', { isClosed: 'Closure status must be true or false.' })
  }

  let cleanNote = null
  if (note != null && String(note).trim()) {
    cleanNote = String(note).trim()
    if (cleanNote.length > 300) {
      fail('Closure note must be 300 characters or fewer.', { note: 'Closure note must be 300 characters or fewer.' })
    }
  }

  if (!isClosed) cleanNote = null

  const result = await pool.query(`
    UPDATE bakery_closure
    SET is_closed = $1, note = $2, updated_at = NOW()
    WHERE id = 1
    RETURNING id, is_closed, note, updated_at
  `, [isClosed, cleanNote])

  if (!result.rows[0]) {
    const inserted = await pool.query(`
      INSERT INTO bakery_closure (id, is_closed, note)
      VALUES (1, $1, $2)
      RETURNING id, is_closed, note, updated_at
    `, [isClosed, cleanNote])
    return serializeClosure(inserted.rows[0])
  }

  return serializeClosure(result.rows[0])
}

export async function createOperatingHour(data) {
  const day = validateDay(data.dayOfWeek)
  const { open, close } = validateRange(data.openTime, data.closeTime)
  const result = await pool.query(`
    INSERT INTO bakery_operating_hours (day_of_week, open_time, close_time)
    VALUES ($1, $2, $3)
    RETURNING id, day_of_week, open_time, close_time, created_at, updated_at
  `, [day, open, close])
  return serializeHour(result.rows[0])
}

export async function updateOperatingHour(id, data) {
  const existing = await pool.query('SELECT id, day_of_week, open_time, close_time FROM bakery_operating_hours WHERE id = $1', [id])
  if (!existing.rows[0]) {
    const error = new Error('Operating-hour entry not found.')
    error.code = 'OPERATING_HOUR_NOT_FOUND'
    throw error
  }

  const current = existing.rows[0]
  const day = data.dayOfWeek === undefined ? Number(current.day_of_week) : validateDay(data.dayOfWeek)
  const openValue = data.openTime === undefined ? String(current.open_time).slice(0, 5) : data.openTime
  const closeValue = data.closeTime === undefined ? String(current.close_time).slice(0, 5) : data.closeTime
  const { open, close } = validateRange(openValue, closeValue)

  const result = await pool.query(`
    UPDATE bakery_operating_hours
    SET day_of_week = $1, open_time = $2, close_time = $3, updated_at = NOW()
    WHERE id = $4
    RETURNING id, day_of_week, open_time, close_time, created_at, updated_at
  `, [day, open, close, id])
  return serializeHour(result.rows[0])
}

export async function deleteOperatingHour(id) {
  const result = await pool.query('DELETE FROM bakery_operating_hours WHERE id = $1 RETURNING id', [id])
  if (!result.rows[0]) {
    const error = new Error('Operating-hour entry not found.')
    error.code = 'OPERATING_HOUR_NOT_FOUND'
    throw error
  }
  return { id }
}
