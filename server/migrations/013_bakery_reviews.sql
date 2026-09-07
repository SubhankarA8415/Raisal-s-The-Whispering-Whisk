-- ============================================================
-- Migration 013: Bakery Team Reviews
-- ============================================================
-- Separate from product_reviews.
-- Customer reviews represent the overall Raisal's Bakery team.
-- Customers: one review per account, editable/deletable by owner.
-- Admin reviews: manually entered collected reviews, not linked to
-- a customer account; admins can create/edit/delete them.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS bakery_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL CHECK (char_length(trim(reviewer_name)) BETWEEN 2 AND 100),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL CHECK (char_length(trim(review_text)) BETWEEN 1 AND 2000),
  source TEXT NOT NULL DEFAULT 'customer' CHECK (source IN ('customer', 'admin')),
  display_mode TEXT NOT NULL DEFAULT 'customer' CHECK (display_mode IN ('customer', 'anonymous')),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (source = 'customer' AND user_id IS NOT NULL AND display_mode = 'customer')
    OR
    (source = 'admin' AND user_id IS NULL AND display_mode = 'anonymous')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_bakery_reviews_customer
  ON bakery_reviews(user_id)
  WHERE source = 'customer' AND user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bakery_reviews_published_created
  ON bakery_reviews(is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bakery_reviews_source_created
  ON bakery_reviews(source, created_at DESC);

COMMIT;
