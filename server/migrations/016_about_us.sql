-- Flexible About Us content and team management.
CREATE TABLE IF NOT EXISTS about_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow TEXT,
  title TEXT NOT NULL CHECK (char_length(trim(title)) BETWEEN 1 AND 160),
  description TEXT,
  body TEXT,
  media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  layout TEXT NOT NULL DEFAULT 'split' CHECK (layout IN ('split','full','center')),
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_about_sections_order ON about_sections(is_visible, display_order, created_at);

CREATE TABLE IF NOT EXISTS about_team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 120),
  role TEXT NOT NULL CHECK (char_length(trim(role)) BETWEEN 2 AND 80),
  description TEXT NOT NULL CHECK (char_length(trim(description)) BETWEEN 1 AND 2000),
  media_id UUID REFERENCES media(id) ON DELETE SET NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_about_team_order ON about_team_members(is_visible, display_order, created_at);
