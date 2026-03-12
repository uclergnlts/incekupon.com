-- Daily banko (featured match) table
CREATE TABLE IF NOT EXISTS daily_banko (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  league text NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  match_time timestamptz NOT NULL,
  prediction text NOT NULL,
  odds numeric(6,2) NOT NULL DEFAULT 1.50,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Only one banko per day
CREATE UNIQUE INDEX IF NOT EXISTS daily_banko_date_unique ON daily_banko (date);

-- Index for quick lookup
CREATE INDEX IF NOT EXISTS daily_banko_date_idx ON daily_banko (date DESC);

-- RLS: public read, authenticated write
ALTER TABLE daily_banko ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read daily_banko"
  ON daily_banko FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert daily_banko"
  ON daily_banko FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update daily_banko"
  ON daily_banko FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete daily_banko"
  ON daily_banko FOR DELETE
  TO authenticated
  USING (true);
