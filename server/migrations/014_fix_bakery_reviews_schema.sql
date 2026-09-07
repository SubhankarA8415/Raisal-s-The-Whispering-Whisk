-- ============================================================
-- Migration 014: Fix existing Bakery Team Reviews schema
-- ============================================================
-- Migration 006 already created bakery_reviews. Therefore migration
-- 013's CREATE TABLE IF NOT EXISTS cannot add newer columns/constraints
-- when that table already exists. This migration upgrades the existing
-- table in place without touching product_reviews.
--
-- Customer reviews:
--   source = customer, user_id required, display_mode = customer
--   one review per customer account
--
-- Admin-entered collected reviews:
--   source = admin, user_id must be NULL, display_mode = anonymous
-- ============================================================

BEGIN;

ALTER TABLE bakery_reviews
  ADD COLUMN IF NOT EXISTS display_mode TEXT;

-- Normalize legacy rows before enforcing the new source/display-mode rules.
UPDATE bakery_reviews
SET source = 'customer'
WHERE source IS NULL OR source NOT IN ('customer', 'admin');

-- Backfill the new column according to the existing review source.
UPDATE bakery_reviews
SET user_id = NULL
WHERE source = 'admin' AND user_id IS NOT NULL;

UPDATE bakery_reviews
SET display_mode = CASE
  WHEN source = 'admin' THEN 'anonymous'
  ELSE 'customer'
END
WHERE display_mode IS NULL;

ALTER TABLE bakery_reviews
  ALTER COLUMN display_mode SET DEFAULT 'customer',
  ALTER COLUMN display_mode SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'bakery_reviews'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) = 'CHECK ((display_mode = ANY (ARRAY[''customer''::text, ''anonymous''::text])))'
  ) THEN
    ALTER TABLE bakery_reviews
      ADD CONSTRAINT bakery_reviews_display_mode_check
      CHECK (display_mode IN ('customer', 'anonymous'));
  END IF;
END $$;

-- Enforce the intended relationship between review source and ownership.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conrelid = 'bakery_reviews'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%source%user_id%display_mode%'
  ) THEN
    ALTER TABLE bakery_reviews
      ADD CONSTRAINT bakery_reviews_source_mode_check
      CHECK (
        (source = 'customer' AND user_id IS NOT NULL AND display_mode = 'customer')
        OR
        (source = 'admin' AND user_id IS NULL AND display_mode = 'anonymous')
      );
  END IF;
END $$;

-- Exactly one customer review per account.
CREATE UNIQUE INDEX IF NOT EXISTS uq_bakery_reviews_customer
  ON bakery_reviews(user_id)
  WHERE source = 'customer' AND user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bakery_reviews_source_created
  ON bakery_reviews(source, created_at DESC);

COMMIT;
