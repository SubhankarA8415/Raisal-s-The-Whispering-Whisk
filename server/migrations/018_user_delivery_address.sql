BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS delivery_address TEXT,
  ADD COLUMN IF NOT EXISTS delivery_pincode VARCHAR(6);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_delivery_address_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_delivery_address_check
      CHECK (delivery_address IS NULL OR char_length(trim(delivery_address)) BETWEEN 5 AND 500);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_delivery_pincode_check') THEN
    ALTER TABLE users ADD CONSTRAINT users_delivery_pincode_check
      CHECK (delivery_pincode IS NULL OR delivery_pincode ~ '^[0-9]{6}$');
  END IF;
END $$;

COMMIT;
