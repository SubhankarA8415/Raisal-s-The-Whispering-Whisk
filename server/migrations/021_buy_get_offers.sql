BEGIN;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS offer_buy_quantity INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS offer_free_quantity INTEGER NOT NULL DEFAULT 1;

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_offer_type_check;

ALTER TABLE products
  ADD CONSTRAINT products_offer_type_check
    CHECK (offer_type IN ('percentage', 'fixed', 'buy_get'));

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_offer_buy_quantity_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_offer_buy_quantity_check
      CHECK (offer_buy_quantity >= 1);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_offer_free_quantity_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_offer_free_quantity_check
      CHECK (offer_free_quantity >= 1);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_buy_get_offer_quantities_check') THEN
    ALTER TABLE products ADD CONSTRAINT products_buy_get_offer_quantities_check
      CHECK (
        offer_type <> 'buy_get'
        OR (offer_buy_quantity >= 1 AND offer_free_quantity >= 1)
      );
  END IF;
END $$;

COMMIT;
