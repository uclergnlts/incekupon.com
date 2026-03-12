-- Existing databases: add played coupon proof link to coupons
ALTER TABLE coupons
  ADD COLUMN IF NOT EXISTS played_coupon_url text;

UPDATE coupons
SET played_coupon_url = 'https://example.com/link-eklenmedi'
WHERE played_coupon_url IS NULL OR btrim(played_coupon_url) = '';

ALTER TABLE coupons
  ALTER COLUMN played_coupon_url SET NOT NULL;
