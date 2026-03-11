-- ============================================
-- Bahiis App - Supabase Migration
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın
-- ============================================

-- 1. Coupons tablosu
CREATE TABLE coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost')),
  total_odds numeric(10,2) NOT NULL DEFAULT 1.00,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Matches tablosu
CREATE TABLE matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id uuid NOT NULL REFERENCES coupons(id) ON DELETE CASCADE,
  league text NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  match_time timestamptz NOT NULL,
  prediction text NOT NULL,
  odds numeric(6,2) NOT NULL DEFAULT 1.00,
  result text NOT NULL DEFAULT 'pending' CHECK (result IN ('pending', 'won', 'lost')),
  sort_order smallint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Spor Toto Weeks tablosu
CREATE TABLE spor_toto_weeks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_label text NOT NULL,
  date date NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 4. Spor Toto Matches tablosu
CREATE TABLE spor_toto_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id uuid NOT NULL REFERENCES spor_toto_weeks(id) ON DELETE CASCADE,
  match_number smallint NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  prediction text NOT NULL CHECK (prediction ~ '^(1|0|2)(-(1|0|2)){0,2}$'),
  actual_result text CHECK (actual_result IN ('1', '0', '2')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Indexler
CREATE INDEX idx_coupons_date ON coupons(date DESC);
CREATE INDEX idx_coupons_status ON coupons(status);
CREATE INDEX idx_matches_coupon_id ON matches(coupon_id);
CREATE INDEX idx_spor_toto_matches_week_id ON spor_toto_matches(week_id);

-- 6. Kupon durumu otomatik hesaplama trigger'ı
CREATE OR REPLACE FUNCTION recalculate_coupon_status()
RETURNS TRIGGER AS $$
DECLARE
  v_coupon_id uuid;
  v_total_matches int;
  v_won_matches int;
  v_lost_matches int;
  v_total_odds numeric(10,2);
BEGIN
  v_coupon_id := COALESCE(NEW.coupon_id, OLD.coupon_id);

  SELECT count(*),
         count(*) FILTER (WHERE result = 'won'),
         count(*) FILTER (WHERE result = 'lost')
  INTO v_total_matches, v_won_matches, v_lost_matches
  FROM matches WHERE coupon_id = v_coupon_id;

  -- Toplam oran hesapla (oranların çarpımı)
  SELECT COALESCE(exp(sum(ln(odds))), 1)
  INTO v_total_odds
  FROM matches WHERE coupon_id = v_coupon_id;

  UPDATE coupons SET
    total_odds = round(v_total_odds, 2),
    status = CASE
      WHEN v_lost_matches > 0 THEN 'lost'
      WHEN v_won_matches = v_total_matches AND v_total_matches > 0 THEN 'won'
      ELSE 'pending'
    END
  WHERE id = v_coupon_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_recalculate_coupon
AFTER INSERT OR UPDATE OR DELETE ON matches
FOR EACH ROW EXECUTE FUNCTION recalculate_coupon_status();

-- 7. Row Level Security (RLS)
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE spor_toto_weeks ENABLE ROW LEVEL SECURITY;
ALTER TABLE spor_toto_matches ENABLE ROW LEVEL SECURITY;

-- Herkes okuyabilir (public)
CREATE POLICY "Public read coupons" ON coupons FOR SELECT USING (true);
CREATE POLICY "Public read matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read spor_toto_weeks" ON spor_toto_weeks FOR SELECT USING (true);
CREATE POLICY "Public read spor_toto_matches" ON spor_toto_matches FOR SELECT USING (true);

-- Sadece giriş yapmış kullanıcı (admin) yazabilir
CREATE POLICY "Admin insert coupons" ON coupons FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update coupons" ON coupons FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete coupons" ON coupons FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert matches" ON matches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update matches" ON matches FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete matches" ON matches FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert spor_toto_weeks" ON spor_toto_weeks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update spor_toto_weeks" ON spor_toto_weeks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete spor_toto_weeks" ON spor_toto_weeks FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin insert spor_toto_matches" ON spor_toto_matches FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Admin update spor_toto_matches" ON spor_toto_matches FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Admin delete spor_toto_matches" ON spor_toto_matches FOR DELETE USING (auth.role() = 'authenticated');
