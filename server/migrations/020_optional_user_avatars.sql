-- ============================================================
-- RAISAL'S BAKERY
-- Optional User Profile Avatars
-- Migration: 020
-- ============================================================

-- Avatar selection is optional. An unset avatar is represented by NULL.
-- Migration 019 initially created avatar_id as NOT NULL with a temporary
-- random/default assignment. Drop those constraints BEFORE clearing the
-- existing values so the migration succeeds atomically.
ALTER TABLE users
  ALTER COLUMN avatar_id DROP NOT NULL,
  ALTER COLUMN avatar_id DROP DEFAULT;

-- Start existing accounts in the profile-less state.
UPDATE users
SET avatar_id = NULL
WHERE avatar_id IS NOT NULL;
