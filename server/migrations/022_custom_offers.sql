BEGIN;

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_offer_type_check;

ALTER TABLE products
  ADD CONSTRAINT products_offer_type_check
    CHECK (offer_type IN ('percentage', 'fixed', 'buy_get', 'custom'));

ALTER TABLE products
  DROP CONSTRAINT IF EXISTS products_custom_offer_text_check;

ALTER TABLE products
  ADD CONSTRAINT products_custom_offer_text_check
    CHECK (
      offer_type <> 'custom'
      OR offer_text IS NOT NULL AND char_length(trim(offer_text)) BETWEEN 1 AND 120
    );

COMMIT;
