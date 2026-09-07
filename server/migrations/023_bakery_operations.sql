BEGIN;

CREATE TABLE IF NOT EXISTS bakery_operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week SMALLINT NOT NULL,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bakery_operating_hours_day_check CHECK (day_of_week BETWEEN 1 AND 7),
  CONSTRAINT bakery_operating_hours_time_check CHECK (open_time < close_time),
  CONSTRAINT bakery_operating_hours_day_unique UNIQUE (day_of_week)
);

CREATE TABLE IF NOT EXISTS bakery_closure (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  note VARCHAR(300),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT bakery_closure_single_row CHECK (id = 1),
  CONSTRAINT bakery_closure_note_check CHECK (note IS NULL OR char_length(trim(note)) BETWEEN 1 AND 300)
);

INSERT INTO bakery_closure (id, is_closed, note)
VALUES (1, FALSE, NULL)
ON CONFLICT (id) DO NOTHING;

COMMIT;
