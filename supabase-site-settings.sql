-- Site-wide settings (VIP Telegram link, etc.)
CREATE TABLE IF NOT EXISTS site_settings (
  id boolean PRIMARY KEY DEFAULT true CHECK (id = true),
  vip_telegram_url text NOT NULL DEFAULT 'https://t.me/YOUR_CHANNEL',
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO site_settings (id, vip_telegram_url)
VALUES (true, 'https://t.me/YOUR_CHANNEL')
ON CONFLICT (id) DO NOTHING;

CREATE OR REPLACE FUNCTION set_site_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_site_settings_updated_at ON site_settings;
CREATE TRIGGER trg_site_settings_updated_at
BEFORE UPDATE ON site_settings
FOR EACH ROW EXECUTE FUNCTION set_site_settings_updated_at();

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site_settings" ON site_settings;
CREATE POLICY "Public can read site_settings"
  ON site_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert site_settings" ON site_settings;
CREATE POLICY "Authenticated users can insert site_settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update site_settings" ON site_settings;
CREATE POLICY "Authenticated users can update site_settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);
