-- ============================================================
-- RAISAL'S BAKERY
-- User Profile Avatars
-- Migration: 019
-- ============================================================

ALTER TABLE users
  ADD COLUMN avatar_id VARCHAR(20) NOT NULL DEFAULT 'whisk00';

-- Give existing accounts a varied initial avatar from the fixed
-- 20-avatar catalog. The assignment is intentionally random.
UPDATE users
SET avatar_id = 'whisk' || LPAD(
  FLOOR(RANDOM() * 20)::INTEGER::TEXT,
  2,
  '0'
)
WHERE avatar_id = 'whisk00';

ALTER TABLE users
  ADD CONSTRAINT users_avatar_id_check
  CHECK (avatar_id ~ '^whisk(0[0-9]|1[0-9])$');
