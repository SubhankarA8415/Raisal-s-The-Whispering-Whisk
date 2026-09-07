import pool from '../config/database.js'
import { sendEmail } from './emailService.js'
import { createBakeryReviewEmail } from '../emails/bakeryReviewEmail.js'
import { getAvatarUrl } from '../config/cloudinary.js'

function fail(code, message, fields) {
  const error = new Error(message)
  error.code = code
  if (fields) error.fields = fields
  throw error
}

function validateRating(value) {
  const rating = Number(value)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    fail('VALIDATION_ERROR', 'Rating must be between 1 and 5.', { rating: 'Choose a rating from 1 to 5.' })
  }
  return rating
}

function validateReviewText(value) {
  if (typeof value !== 'string' || !value.trim() || value.trim().length > 2000) {
    fail('VALIDATION_ERROR', 'Review must contain 1–2000 characters.', { reviewText: 'Review must contain 1–2000 characters.' })
  }
  return value.trim()
}

function validateName(value) {
  if (typeof value !== 'string' || value.trim().length < 2 || value.trim().length > 100) {
    fail('VALIDATION_ERROR', 'Reviewer name must contain 2–100 characters.', { reviewerName: 'Reviewer name must contain 2–100 characters.' })
  }
  return value.trim()
}

function serializeReview(row) {
  return {
    id: row.id,
    userId: row.user_id,
    userType: row.user_type || null,
    reviewerName: row.reviewer_name,
    rating: Number(row.rating),
    reviewText: row.review_text,
    source: row.source,
    displayMode: row.display_mode,
    avatarId: row.avatar_id || null,
    avatarUrl: row.avatar_id ? getAvatarUrl(row.avatar_id, 96) : null,
    isPublished: row.is_published,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function listPublishedBakeryReviews(limit = 50) {
  const result = await pool.query(`
    SELECT r.id, r.user_id, r.reviewer_name, r.rating, r.review_text, r.source, r.display_mode,
           r.created_at, r.updated_at, u.avatar_id, u.user_type
    FROM bakery_reviews r
    LEFT JOIN users u ON u.id = r.user_id
    WHERE r.is_published = TRUE
    ORDER BY r.created_at DESC
    LIMIT $1
  `, [limit])
  return result.rows.map(serializeReview)
}

export async function getCustomerBakeryReview(userId) {
  const result = await pool.query(`
    SELECT r.id, r.user_id, r.reviewer_name, r.rating, r.review_text, r.source, r.display_mode,
           r.is_published, r.created_at, r.updated_at, u.avatar_id, u.user_type
    FROM bakery_reviews r
    LEFT JOIN users u ON u.id = r.user_id
    WHERE r.user_id = $1 AND r.source = 'customer'
    LIMIT 1
  `, [userId])
  return result.rows[0] ? serializeReview(result.rows[0]) : null
}

export async function createCustomerReview({ userId, rating, reviewText }) {
  const ratingNumber = validateRating(rating)
  const text = validateReviewText(reviewText)
  const userResult = await pool.query(`SELECT name, email, avatar_id, user_type FROM users WHERE id = $1`, [userId])
  const user = userResult.rows[0]
  if (!user) fail('USER_NOT_FOUND', 'User not found.')

  let review
  try {
    const result = await pool.query(`
      INSERT INTO bakery_reviews (user_id, reviewer_name, rating, review_text, source, display_mode, created_by, updated_by)
      VALUES ($1, $2, $3, $4, 'customer', 'customer', $1, $1)
      RETURNING id, user_id, reviewer_name, rating, review_text, source, display_mode, is_published, created_at, updated_at
    `, [userId, user.name, ratingNumber, text])
    review = serializeReview({ ...result.rows[0], avatar_id: user.avatar_id, user_type: user.user_type })
  } catch (error) {
    if (error.code === '23505') {
      fail('REVIEW_ALREADY_EXISTS', 'You have already reviewed our team. You can edit or delete your existing review.')
    }
    throw error
  }

  // Customer-care email is best-effort; a mail failure never undoes a saved review.
  if (user.email) {
    const email = createBakeryReviewEmail({
      customerName: user.name,
      rating: ratingNumber,
      reviewText: text,
    })
    sendEmail({ to: user.email, ...email }).catch((error) => {
      console.error(`[BAKERY_REVIEW_EMAIL_FAILED] ${error.message}`)
    })
  }

  return review
}

export async function updateCustomerReview({ reviewId, userId, rating, reviewText }) {
  const existing = await pool.query(`
    SELECT id FROM bakery_reviews
    WHERE id = $1 AND user_id = $2 AND source = 'customer'
  `, [reviewId, userId])
  if (!existing.rows[0]) fail('REVIEW_NOT_FOUND', 'Your review was not found.')

  const ratingNumber = validateRating(rating)
  const text = validateReviewText(reviewText)
  const result = await pool.query(`
    UPDATE bakery_reviews
    SET rating = $1,
        review_text = $2,
        reviewer_name = (SELECT name FROM users WHERE id = $3),
        updated_by = $3,
        updated_at = NOW()
    WHERE id = $4 AND user_id = $3 AND source = 'customer'
    RETURNING id, user_id, reviewer_name, rating, review_text, source, display_mode, is_published, created_at, updated_at
  `, [ratingNumber, text, userId, reviewId])
  const userResult = await pool.query(`SELECT avatar_id, user_type FROM users WHERE id = $1`, [userId])
  return serializeReview({ ...result.rows[0], avatar_id: userResult.rows[0]?.avatar_id || null, user_type: userResult.rows[0]?.user_type || null })
}

export async function deleteCustomerReview({ reviewId, userId }) {
  const result = await pool.query(`
    DELETE FROM bakery_reviews
    WHERE id = $1 AND user_id = $2 AND source = 'customer'
    RETURNING id
  `, [reviewId, userId])
  if (!result.rows[0]) fail('REVIEW_NOT_FOUND', 'Your review was not found.')
}

export async function listAdminBakeryReviews() {
  const result = await pool.query(`
    SELECT r.id, r.user_id, r.reviewer_name, r.rating, r.review_text, r.source, r.display_mode,
           r.is_published, r.created_by, r.updated_by, r.created_at, r.updated_at, u.avatar_id, u.user_type
    FROM bakery_reviews r
    LEFT JOIN users u ON u.id = r.user_id
    ORDER BY r.created_at DESC
  `)
  return result.rows.map(serializeReview)
}

export async function createAdminReview({ adminId, reviewerName, rating, reviewText }) {
  const name = validateName(reviewerName)
  const ratingNumber = validateRating(rating)
  const text = validateReviewText(reviewText)
  const result = await pool.query(`
    INSERT INTO bakery_reviews (reviewer_name, rating, review_text, source, display_mode, is_published, created_by, updated_by)
    VALUES ($1, $2, $3, 'admin', 'anonymous', TRUE, $4, $4)
    RETURNING id, user_id, reviewer_name, rating, review_text, source, display_mode, is_published, created_at, updated_at
  `, [name, ratingNumber, text, adminId])
  return serializeReview(result.rows[0])
}

export async function updateAdminReview({ adminId, reviewId, reviewerName, rating, reviewText }) {
  const updates = []
  const values = []
  const add = (column, value) => {
    updates.push(`${column} = $${values.length + 1}`)
    values.push(value)
  }

  if (reviewerName !== undefined) add('reviewer_name', validateName(reviewerName))
  if (rating !== undefined) add('rating', validateRating(rating))
  if (reviewText !== undefined) add('review_text', validateReviewText(reviewText))
  if (!updates.length) fail('VALIDATION_ERROR', 'No review fields were provided.')

  add('display_mode', 'anonymous')
  add('updated_by', adminId)
  values.push(reviewId)

  const result = await pool.query(`
    UPDATE bakery_reviews
    SET ${updates.join(', ')}, updated_at = NOW()
    WHERE id = $${values.length} AND source = 'admin'
    RETURNING id, user_id, reviewer_name, rating, review_text, source, display_mode, is_published, created_at, updated_at
  `, values)
  if (!result.rows[0]) fail('REVIEW_NOT_FOUND', 'Admin review not found.')
  return serializeReview(result.rows[0])
}

export async function adminDeleteAnyBakeryReview(reviewId) {
  // Admins may remove either kind of bakery-team review:
  // 1) a genuine customer-submitted review, or
  // 2) an administrator-entered collected/anonymous review.
  // This is intentionally broader than deleteCustomerReview(), which is
  // ownership-scoped and can only delete the signed-in customer's own review.
  const result = await pool.query(`
    DELETE FROM bakery_reviews
    WHERE id = $1
      AND source IN ('customer', 'admin')
    RETURNING id, source
  `, [reviewId])
  if (!result.rows[0]) fail('REVIEW_NOT_FOUND', 'Bakery team review not found.')
  return result.rows[0]
}
