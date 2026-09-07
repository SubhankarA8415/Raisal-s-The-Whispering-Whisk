-- ============================================================
-- Migration 011: Dynamic Menu / Products
-- ============================================================
-- Products, flexible categories, dynamic variants, up to five
-- product media items, product reviews, and WhatsApp cart support.
--
-- Existing Home/media/admin systems are intentionally untouched.
-- ============================================================

BEGIN;

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(trim(name)) BETWEEN 2 AND 150),
  slug TEXT NOT NULL UNIQUE CHECK (char_length(trim(slug)) BETWEEN 2 AND 180),
  category TEXT NOT NULL CHECK (char_length(trim(category)) BETWEEN 2 AND 100),
  description TEXT NOT NULL CHECK (char_length(trim(description)) BETWEEN 1 AND 3000),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category
  ON products(category);

CREATE INDEX IF NOT EXISTS idx_products_available_category
  ON products(is_available, category);

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label TEXT NOT NULL CHECK (char_length(trim(label)) BETWEEN 1 AND 80),
  weight_grams INTEGER CHECK (weight_grams IS NULL OR weight_grams > 0),
  serves INTEGER CHECK (serves IS NULL OR serves > 0),
  price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
  display_order INTEGER NOT NULL CHECK (display_order >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product_order
  ON product_variants(product_id, display_order);

CREATE TABLE IF NOT EXISTS product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  media_id UUID NOT NULL UNIQUE REFERENCES media(id) ON DELETE RESTRICT,
  display_order SMALLINT NOT NULL CHECK (display_order BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_product_media_product_order
  ON product_media(product_id, display_order);

CREATE TABLE IF NOT EXISTS product_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewer_name TEXT NOT NULL CHECK (char_length(trim(reviewer_name)) BETWEEN 2 AND 100),
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT NOT NULL CHECK (char_length(trim(review_text)) BETWEEN 1 AND 2000),
  source TEXT NOT NULL DEFAULT 'customer' CHECK (source IN ('customer', 'admin')),
  display_mode TEXT NOT NULL DEFAULT 'customer' CHECK (display_mode IN ('customer', 'anonymous', 'bakery_team')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (
    (source = 'customer' AND user_id IS NOT NULL AND display_mode = 'customer')
    OR
    (source = 'admin' AND user_id IS NULL AND display_mode IN ('anonymous', 'bakery_team'))
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_product_reviews_customer
  ON product_reviews(product_id, user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_created
  ON product_reviews(product_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_published
  ON product_reviews(product_id, rating);


-- Seed only the products and sizes/prices explicitly supplied by the bakery.
-- Serving counts are left NULL because the supplied menu does not specify them.
INSERT INTO products (name, slug, category, description)
VALUES
('Cream Baked Cheesecake','cream-baked-cheesecake','Baked Cheesecake','Rich, velvety cheesecake baked to golden perfection, with a smooth creamy centre and a buttery biscuit base. A timeless classic made for pure comfort in every indulgent bite.'),
('Blueberry Baked Cheesecake','blueberry-baked-cheesecake','Baked Cheesecake','Silky, creamy cheesecake crowned with vibrant blueberry topping, balancing gentle sweetness with a bright fruity tang over a buttery biscuit base.'),
('Strawberry Baked Cheesecake','strawberry-baked-cheesecake','Baked Cheesecake','Luxuriously creamy baked cheesecake finished with a glossy strawberry layer. Sweet, fruity and irresistibly smooth from the first bite to the last.'),
('Pineapple Baked Cheesecake','pineapple-baked-cheesecake','Baked Cheesecake','Golden, creamy cheesecake lifted with refreshing pineapple glaze and a fruity finish. A tropical twist balancing rich cheesecake goodness with sunny sweetness.'),
('Mango Baked Cheesecake','mango-baked-cheesecake','Baked Cheesecake','Velvety baked cheesecake infused with luscious mango and finished with a bright tropical topping. Creamy, fruity and wonderfully indulgent.'),
('Caramel Baked Cheesecake','caramel-baked-cheesecake','Baked Cheesecake','Slow-baked creamy cheesecake draped in silky caramel sweetness over a buttery biscuit base. Deeply comforting, rich and made for caramel lovers.'),
('Nutella Baked Cheesecake','nutella-baked-cheesecake','Baked Cheesecake','Ultra-creamy baked cheesecake paired with rich chocolate-hazelnut goodness for a decadent, melt-in-the-mouth dessert that is hard to resist.'),
('Lotus Biscoff Baked Cheesecake','lotus-biscoff-baked-cheesecake','Baked Cheesecake','Creamy baked cheesecake layered with smooth Biscoff flavour and finished with caramelised biscuit crumble. Warm, spiced, crunchy and wonderfully indulgent.'),
('All 7 Flavours Cheesecake','all-7-flavours-cheesecake','Baked Cheesecake','A celebration for every cheesecake lover—seven signature flavours gathered into one indulgent box, from fruity favourites to rich chocolate, caramel and Biscoff.'),
('Blueberry No-Bake Cheesecake','blueberry-no-bake-cheesecake','No-Bake Cheesecake','Light, silky cheesecake over a crisp biscuit base, finished with juicy blueberry. Cool, creamy and refreshingly fruity.'),
('Strawberry No-Bake Cheesecake','strawberry-no-bake-cheesecake','No-Bake Cheesecake','Cloud-soft cheesecake on a buttery biscuit base, topped with bright strawberry sweetness. Fresh, creamy and wonderfully smooth.'),
('Pineapple No-Bake Cheesecake','pineapple-no-bake-cheesecake','No-Bake Cheesecake','Cool, creamy cheesecake paired with a bright pineapple topping and fruity finish. Refreshing, tropical and delightfully easy to love.'),
('Mango No-Bake Cheesecake','mango-no-bake-cheesecake','No-Bake Cheesecake','Silky mango-infused cheesecake resting on a buttery biscuit base and finished with a luscious tropical topping. Cool, creamy and bursting with mango goodness.'),
('Nutella No-Bake Cheesecake','nutella-no-bake-cheesecake','No-Bake Cheesecake','Smooth chilled cheesecake layered with rich chocolate-hazelnut flavour over a crisp biscuit base. Creamy, decadent and made for chocolate cravings.'),
('Caramel No-Bake Cheesecake','caramel-no-bake-cheesecake','No-Bake Cheesecake','Velvety chilled cheesecake finished with a generous caramel touch over a buttery biscuit base. Smooth, sweet and irresistibly comforting.'),
('Lotus Biscoff No-Bake Cheesecake','lotus-biscoff-no-bake-cheesecake','No-Bake Cheesecake','Light, creamy cheesecake layered with signature Biscoff flavour and finished with caramelised biscuit crumble. Cool, crunchy and deliciously spiced.'),
('Classic Tiramisu','classic-tiramisu','Tiramisu','A dreamy coffee-kissed dessert with soft, creamy layers and a delicate cocoa finish. Rich, smooth and deeply satisfying—pure comfort in every spoonful.'),
('Lotus Biscoff Tiramisu','lotus-biscoff-tiramisu','Tiramisu','Creamy coffee-kissed layers meet the warm caramelised spice of Lotus Biscoff, finished with a delicious biscuit touch. A luscious twist on a classic favourite.'),
('Nutella Tiramisu','nutella-tiramisu','Tiramisu','Silky coffee-infused layers meet rich chocolate-hazelnut goodness, finished with a tempting cocoa touch. Creamy, decadent and made for serious dessert cravings.')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO product_variants (product_id, label, weight_grams, serves, price, display_order)
SELECT id, CASE WHEN slug='all-7-flavours-cheesecake' THEN '600g' ELSE '300g' END, CASE WHEN slug='all-7-flavours-cheesecake' THEN 600 ELSE 300 END, NULL, CASE slug
  WHEN 'cream-baked-cheesecake' THEN 200 WHEN 'blueberry-baked-cheesecake' THEN 260 WHEN 'strawberry-baked-cheesecake' THEN 260 WHEN 'pineapple-baked-cheesecake' THEN 270 WHEN 'mango-baked-cheesecake' THEN 290 WHEN 'caramel-baked-cheesecake' THEN 260 WHEN 'nutella-baked-cheesecake' THEN 270 WHEN 'lotus-biscoff-baked-cheesecake' THEN 290 WHEN 'all-7-flavours-cheesecake' THEN 700 END, 0
FROM products WHERE slug IN ('cream-baked-cheesecake','blueberry-baked-cheesecake','strawberry-baked-cheesecake','pineapple-baked-cheesecake','mango-baked-cheesecake','caramel-baked-cheesecake','nutella-baked-cheesecake','lotus-biscoff-baked-cheesecake','all-7-flavours-cheesecake')
ON CONFLICT (product_id, display_order) DO NOTHING;

INSERT INTO product_variants (product_id, label, weight_grams, serves, price, display_order)
SELECT id, '180g', 180, NULL, CASE slug WHEN 'blueberry-no-bake-cheesecake' THEN 165 WHEN 'strawberry-no-bake-cheesecake' THEN 165 WHEN 'pineapple-no-bake-cheesecake' THEN 165 WHEN 'mango-no-bake-cheesecake' THEN 185 WHEN 'nutella-no-bake-cheesecake' THEN 185 WHEN 'caramel-no-bake-cheesecake' THEN 175 WHEN 'lotus-biscoff-no-bake-cheesecake' THEN 185 END, 0
FROM products WHERE category='No-Bake Cheesecake'
ON CONFLICT (product_id, display_order) DO NOTHING;

INSERT INTO product_variants (product_id, label, weight_grams, serves, price, display_order)
SELECT id, '200g', 200, NULL, CASE slug WHEN 'classic-tiramisu' THEN 220 WHEN 'lotus-biscoff-tiramisu' THEN 250 WHEN 'nutella-tiramisu' THEN 240 END, 0
FROM products WHERE category='Tiramisu'
ON CONFLICT (product_id, display_order) DO NOTHING;

COMMIT;
