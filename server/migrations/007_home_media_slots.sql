-- Migration 007: migrate existing databases from the old Home CMS structure
-- to the fixed frontend + predefined media-slot model.
--
-- bakery_reviews is intentionally preserved.

DROP TABLE IF EXISTS home_kitchen_items;
DROP TABLE IF EXISTS home_values;
DROP TABLE IF EXISTS home_hero;
DROP TABLE IF EXISTS home_story;
DROP TABLE IF EXISTS home_order_cta;
DROP TABLE IF EXISTS home_sections;
DROP TABLE IF EXISTS home_page;

CREATE TABLE home_page (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  placement TEXT NOT NULL UNIQUE CHECK (placement IN (
    'hero',
    'kitchen_1',
    'kitchen_2',
    'kitchen_3',
    'kitchen_4',
    'story'
  )),
  media_id UUID NOT NULL REFERENCES media(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_home_page_placement ON home_page(placement);
CREATE INDEX idx_home_page_media_id ON home_page(media_id);
