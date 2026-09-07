BEGIN;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS offer_type TEXT NOT NULL DEFAULT 'percentage',
  ADD COLUMN IF NOT EXISTS offer_value NUMERIC(10,2) NOT NULL DEFAULT 0;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_offer_type_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_offer_type_check
      CHECK (offer_type IN ('percentage', 'fixed'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_offer_value_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_offer_value_check
      CHECK (offer_value >= 0 AND (offer_type <> 'percentage' OR offer_value <= 100));
  END IF;
END $$;

-- Convert the earlier text-based offer format when it contains a recognizable
-- percentage or fixed rupee discount. Unrecognized legacy offers are disabled
-- rather than guessing a price. The old offer_text is retained for compatibility.
UPDATE products
SET
  offer_type = 'percentage',
  offer_value = (regexp_replace(trim(offer_text), '[^0-9.]', '', 'g'))::numeric
WHERE offer_enabled = TRUE
  AND offer_text IS NOT NULL
  AND position('%' IN offer_text) > 0
  AND regexp_replace(trim(offer_text), '[^0-9.]', '', 'g') <> '';

UPDATE products
SET
  offer_type = 'fixed',
  offer_value = (regexp_replace(trim(offer_text), '[^0-9.]', '', 'g'))::numeric
WHERE offer_enabled = TRUE
  AND offer_text IS NOT NULL
  AND position('%' IN offer_text) = 0
  AND (position('₹' IN offer_text) > 0 OR position('OFF' IN upper(offer_text)) > 0)
  AND regexp_replace(trim(offer_text), '[^0-9.]', '', 'g') <> '';

UPDATE products
SET offer_enabled = FALSE
WHERE offer_enabled = TRUE
  AND (offer_value IS NULL OR offer_value <= 0);

CREATE INDEX IF NOT EXISTS idx_products_active_offers
  ON products(offer_enabled, offer_type)
  WHERE offer_enabled = TRUE;

COMMIT;
