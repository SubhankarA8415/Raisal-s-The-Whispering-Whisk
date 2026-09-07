-- ============================================================
-- Migration 010: Owner-controlled admin promotion lock
-- ============================================================
-- The lock is a server/database-enforced safety control.
-- Only the designated owner account can change it.
-- When locked, no admin can promote or authorize another admin.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS admin_control (
  id BOOLEAN PRIMARY KEY DEFAULT TRUE CHECK (id),
  owner_email TEXT NOT NULL UNIQUE,
  is_locked BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO admin_control (id, owner_email, is_locked)
VALUES (TRUE, 'raisalsbakery.dev@gmail.com', TRUE)
ON CONFLICT (id) DO NOTHING;

COMMIT;
