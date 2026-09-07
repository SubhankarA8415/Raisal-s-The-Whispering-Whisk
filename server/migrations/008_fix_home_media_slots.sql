-- ============================================================
-- Migration 008: Fix Home media slots
-- ============================================================
-- Purpose:
--   Keep Home media slots permanently present.
--   Removing/replacing media must only change media_id; the slot
--   itself must never be deleted.
--
-- Current expected slots:
--   hero
--   kitchen_1
--   kitchen_2
--   kitchen_3
--   kitchen_4
--   story
--
-- This migration does NOT delete Cloudinary assets.
-- It also does NOT delete rows from the media table.
-- ============================================================

BEGIN;

-- 1. Remove the old foreign-key behavior so we can replace it
--    with ON DELETE SET NULL.
ALTER TABLE home_page
    DROP CONSTRAINT IF EXISTS home_page_media_id_fkey;

-- 2. A Home slot is allowed to have no media.
ALTER TABLE home_page
    ALTER COLUMN media_id DROP NOT NULL;

-- 3. If a media record is deleted, automatically empty the Home
--    slot instead of deleting the Home slot or blocking the delete.
ALTER TABLE home_page
    ADD CONSTRAINT home_page_media_id_fkey
    FOREIGN KEY (media_id)
    REFERENCES media(id)
    ON DELETE SET NULL;

-- 4. Remove the old Featured Product media slots.
--    Featured products will belong to the future Product/Menu system,
--    not the Home media-slot table.
DELETE FROM home_page
WHERE placement IN ('featured_1', 'featured_2', 'featured_3');

-- 5. Ensure every permanent Home media slot exists.
--    Existing rows and their current media assignments are preserved.
INSERT INTO home_page (placement, media_id)
VALUES
    ('hero', NULL),
    ('kitchen_1', NULL),
    ('kitchen_2', NULL),
    ('kitchen_3', NULL),
    ('kitchen_4', NULL),
    ('story', NULL)
ON CONFLICT (placement) DO NOTHING;

COMMIT;
