CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cloudinary_public_id TEXT NOT NULL UNIQUE,
  secure_url TEXT NOT NULL,
  resource_type TEXT NOT NULL CHECK (resource_type IN ('image', 'video')),
  folder TEXT NOT NULL,
  original_filename TEXT,
  format TEXT,
  bytes BIGINT CHECK (bytes IS NULL OR bytes >= 0),
  width INTEGER CHECK (width IS NULL OR width > 0),
  height INTEGER CHECK (height IS NULL OR height > 0),
  duration NUMERIC CHECK (duration IS NULL OR duration >= 0),
  alt_text TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_media_uploaded_by
  ON media(uploaded_by);

CREATE INDEX IF NOT EXISTS idx_media_resource_type
  ON media(resource_type);

CREATE INDEX IF NOT EXISTS idx_media_created_at
  ON media(created_at DESC);
