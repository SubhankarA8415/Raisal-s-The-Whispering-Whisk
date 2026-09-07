-- ============================================================
-- Migration 015: Finalize Bakery Team Review Flow
-- ============================================================
-- Bakery Team Reviews are completely separate from product_reviews.
--
-- Customer review:
--   - one review per logged-in customer
--   - customer owns edit/delete
--   - admins may delete it
--
-- Admin-entered collected review:
--   - no customer user_id
--   - admin supplies reviewer name, rating and description
--   - always anonymous with respect to the admin account
--   - admins may edit/delete it
-- ============================================================

BEGIN;

ALTER TABLE bakery_reviews
  ADD COLUMN IF NOT EXISTS display_mode TEXT;

-- Normalize legacy rows first.
UPDATE bakery_reviews
SET source = 'customer'
WHERE source IS NULL OR source NOT IN ('customer', 'admin');

-- Admin-entered reviews must never carry a customer account identity.
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
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bakery_reviews_display_mode_check'
  ) THEN
    ALTER TABLE bakery_reviews
      ADD CONSTRAINT bakery_reviews_display_mode_check
      CHECK (display_mode IN ('customer', 'anonymous'));
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'bakery_reviews_source_mode_check'
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

-- Exactly one whole-bakery/team review per customer account.
CREATE UNIQUE INDEX IF NOT EXISTS uq_bakery_reviews_customer
  ON bakery_reviews(user_id)
  WHERE source = 'customer' AND user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_bakery_reviews_source_created
  ON bakery_reviews(source, created_at DESC);

COMMIT;
