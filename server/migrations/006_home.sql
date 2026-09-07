-- Migration 006: Home page foundation.
--
-- The Home page layout and copy are fixed in the frontend. This table stores
-- only the media currently assigned to the predefined Home placeholders.
-- Product/menu data is intentionally kept outside this table.

CREATE TABLE IF NOT EXISTS home_page (
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

CREATE INDEX IF NOT EXISTS idx_home_page_placement
  ON home_page(placement);

CREATE INDEX IF NOT EXISTS idx_home_page_media_id
  ON home_page(media_id);

CREATE TABLE IF NOT EXISTS bakery_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL CHECK (char_length(trim(reviewer_name)) BETWEEN 2 AND 100),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL CHECK (char_length(trim(review_text)) BETWEEN 1 AND 2000),
  source TEXT NOT NULL DEFAULT 'customer' CHECK (source IN ('customer', 'admin')),
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bakery_reviews_published_created
  ON bakery_reviews(is_published, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_bakery_reviews_user
  ON bakery_reviews(user_id);
