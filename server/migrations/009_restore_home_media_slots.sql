-- ============================================================
-- Migration 009: Restore permanent Home media slots
-- ============================================================
-- This is a data-repair migration for databases where an earlier
-- Home-media DELETE endpoint accidentally removed a slot row.
--
-- Existing rows/media assignments are preserved.
-- No media rows or Cloudinary assets are deleted.
-- ============================================================

BEGIN;

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
