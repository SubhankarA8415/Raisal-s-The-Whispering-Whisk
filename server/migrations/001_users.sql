-- ============================================================
-- RAISAL'S BAKERY
-- Users
-- Migration: 001
-- ============================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  name VARCHAR(100) NOT NULL,

  email VARCHAR(255) NOT NULL UNIQUE,

  password_hash TEXT,

  auth_provider VARCHAR(20) NOT NULL DEFAULT 'local',

  user_type VARCHAR(20) NOT NULL DEFAULT 'customer',

  is_authorized BOOLEAN NOT NULL DEFAULT FALSE,

  email_verified BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT users_name_check
    CHECK (char_length(trim(name)) BETWEEN 2 AND 100),

  CONSTRAINT users_auth_provider_check
    CHECK (auth_provider IN ('local', 'google')),

  CONSTRAINT users_user_type_check
    CHECK (user_type IN ('customer', 'admin')),

  CONSTRAINT users_google_password_check
    CHECK (
      auth_provider = 'google'
      OR password_hash IS NOT NULL
    )
);