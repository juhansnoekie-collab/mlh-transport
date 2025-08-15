# MLH Transport Website Setup Steps

## 1. Connect to Your Existing Supabase Project

Your Supabase project URL is: https://supabase.com/dashboard/project/ujoirmojetkdqiohwdon

### Get Your Supabase Keys

1. Go to https://supabase.com/dashboard/project/ujoirmojetkdqiohwdon
2. Click on "Project Settings" in the left sidebar
3. Click on "API" in the submenu
4. You'll see two important values:
   - **Project URL**: `https://ujoirmojetkdqiohwdon.supabase.co`
   - **anon/public key**: A long string starting with "eyJh..."

These keys need to be added to your website's environment.

## 2. Run the SQL Migrations

1. Go to https://supabase.com/dashboard/project/ujoirmojetkdqiohwdon
2. Click on "SQL Editor" in the left sidebar
3. Click "New Query"
4. Copy and paste the following SQL code:

```sql
-- Create settings and quotes tables with RLS and helpful indexes
-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

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

-- Create admin_users table
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Only authenticated users can read admin_users
DROP POLICY IF EXISTS "Authenticated users can read admin_users" ON public.admin_users;
CREATE POLICY "Authenticated users can read admin_users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (true);

-- No public access to admin_users
DROP POLICY IF EXISTS "No public access to admin_users" ON public.admin_users;
CREATE POLICY "No public access to admin_users"
ON public.admin_users
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Insert initial admin users
INSERT INTO public.admin_users (id, email)
VALUES 
  (gen_random_uuid(), 'emroc259@gmail.com'),
  (gen_random_uuid(), 'leona951@gmail.com')
ON CONFLICT (email) DO NOTHING;

-- Insert initial settings if not exists
INSERT INTO public.settings (depot_address, truck_rate_per_km, driver_rate_per_8h, extra_hour_rate, vat_percent)
VALUES ('9 Main Road, Klapmuts, Cape Town, South Africa', 10, 400, 500, 15)
ON CONFLICT DO NOTHING;
```

5. Click "Run" to execute the SQL

## 3. Set Up Edge Functions

For this step, you'll need to install the Supabase CLI on your server. Here's how:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref ujoirmojetkdqiohwdon

# Deploy the functions
cd /workspace/project/mlh-haul-quote
supabase functions deploy calculate-quote
supabase functions deploy send-quote
```

## 4. Set Function Secrets

```bash
# Set Google Maps API key
supabase secrets set GOOGLE_MAPS_API_KEY=AIzaSyBZGOdDz9oz6oZe3v19mCkOp52CrKhr22Q

# For email and WhatsApp, you'll need to sign up for these services:
# - Resend (https://resend.com) for email
# - WhatsApp Business API (https://developers.facebook.com/docs/whatsapp/cloud-api/get-started)

# Once you have the keys, set them:
supabase secrets set RESEND_API_KEY=your_resend_api_key
supabase secrets set WHATSAPP_TOKEN=your_whatsapp_token
supabase secrets set WHATSAPP_PHONE_ID=your_whatsapp_phone_id
```

## 5. Update Your Website Environment

Create a `.env` file in your website root with:

```
VITE_SUPABASE_URL=https://ujoirmojetkdqiohwdon.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_from_step_1
```

## 6. Install Dependencies and Run

```bash
cd /workspace/project/mlh-haul-quote
npm install
npm run build
npm run preview
```

## 7. Deploy to Your Server

```bash
# On your Ubuntu server
cd /var/www/html
git clone https://github.com/fdgsrhnsxtr/mlh-haul-quote.git
cd mlh-haul-quote
git checkout backend-integration
npm install
npm run build

# Configure Nginx to serve the site
sudo nano /etc/nginx/sites-available/mlh-transport

# Add this configuration:
server {
    listen 80;
    server_name aegisum.co.za www.aegisum.co.za;
    
    location / {
        root /var/www/html/mlh-haul-quote/dist;
        try_files $uri $uri/ /index.html;
    }
}

# Enable the site
sudo ln -s /etc/nginx/sites-available/mlh-transport /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up HTTPS with Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d aegisum.co.za -d www.aegisum.co.za
```

## 8. Log In to Admin Dashboard

1. Go to https://aegisum.co.za/admin
2. Use one of the admin emails:
   - emroc259@gmail.com
   - leona951@gmail.com
3. If this is your first login, you'll need to set a password via "Forgot Password"

## Need Help?

If you encounter any issues, please contact the developer for assistance.