BEGIN;
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS offer_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS offer_text TEXT;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_offer_text_length_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_offer_text_length_check
      CHECK (offer_text IS NULL OR char_length(trim(offer_text)) BETWEEN 1 AND 120);
  END IF;
END $$;
CREATE INDEX IF NOT EXISTS idx_products_active_offers ON products(offer_enabled) WHERE offer_enabled = TRUE;
COMMIT;
