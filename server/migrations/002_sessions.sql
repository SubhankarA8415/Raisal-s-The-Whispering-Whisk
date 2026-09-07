-- ============================================================
-- RAISAL'S BAKERY
-- User Sessions
-- Migration: 002
-- ============================================================

CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  user_id UUID NOT NULL
    REFERENCES users(id)
    ON DELETE CASCADE,

  token_hash TEXT NOT NULL UNIQUE,

  expires_at TIMESTAMPTZ NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT sessions_expiry_check
    CHECK (expires_at > created_at)
);

CREATE INDEX idx_sessions_user_id
  ON sessions(user_id);

CREATE INDEX idx_sessions_expires_at
  ON sessions(expires_at);