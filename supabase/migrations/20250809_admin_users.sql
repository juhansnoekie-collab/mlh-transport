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