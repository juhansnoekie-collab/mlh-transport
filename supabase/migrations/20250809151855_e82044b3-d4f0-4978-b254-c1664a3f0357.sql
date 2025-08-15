-- Create settings and quotes tables with RLS and helpful indexes
-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Settings table (single-row style; we'll allow public read, restrict writes for now)
CREATE TABLE IF NOT EXISTS public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  depot_address TEXT NOT NULL DEFAULT '9 Main Road, Klapmuts, Cape Town, South Africa',
  truck_rate_per_km NUMERIC NOT NULL DEFAULT 10,
  driver_rate_per_8h NUMERIC NOT NULL DEFAULT 400,
  extra_hour_rate NUMERIC NOT NULL DEFAULT 500,
  vat_percent NUMERIC NOT NULL DEFAULT 15,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public can read settings (needed for public pricing display), but cannot write
DROP POLICY IF EXISTS "Public can read settings" ON public.settings;
CREATE POLICY "Public can read settings"
ON public.settings
FOR SELECT
USING (true);

DROP POLICY IF EXISTS "No public writes to settings" ON public.settings;
CREATE POLICY "No public writes to settings"
ON public.settings
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Trigger to maintain updated_at on settings
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Quotes table to store generated quotes (inserts allowed from public; selections restricted for now)
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  pickup_address TEXT NOT NULL,
  dropoff_address TEXT NOT NULL,
  weight_kg NUMERIC,
  notes TEXT,
  visible_km NUMERIC NOT NULL,
  total_km NUMERIC NOT NULL,
  price_ex_vat NUMERIC NOT NULL,
  price_inc_vat NUMERIC NOT NULL,
  driver_cost NUMERIC NOT NULL,
  extra_time_cost NUMERIC NOT NULL,
  base_km_cost NUMERIC NOT NULL,
  loading_hours NUMERIC NOT NULL DEFAULT 1,
  offloading_hours NUMERIC NOT NULL DEFAULT 1,
  truck_type TEXT NOT NULL DEFAULT '4-ton',
  legs_km JSONB NOT NULL,
  durations_hours JSONB NOT NULL,
  client_name TEXT,
  company_name TEXT,
  email TEXT,
  phone TEXT
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts for quote submissions
DROP POLICY IF EXISTS "Public can insert quotes" ON public.quotes;
CREATE POLICY "Public can insert quotes"
ON public.quotes
FOR INSERT
TO anon
WITH CHECK (true);

-- Restrict selects for now (no public reads). We'll add admin access later when auth is added
DROP POLICY IF EXISTS "No public select on quotes" ON public.quotes;
CREATE POLICY "No public select on quotes"
ON public.quotes
FOR SELECT
TO anon
USING (false);

-- Useful index
CREATE INDEX IF NOT EXISTS idx_quotes_created_at ON public.quotes(created_at DESC);
