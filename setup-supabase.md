# Setting Up Supabase Backend for MLH Transport

This guide will help you set up a Supabase backend for your MLH Transport website in the future.

## What is Supabase?

Supabase is an open-source Firebase alternative that provides a PostgreSQL database, authentication, storage, and serverless functions. It's a great option for adding a backend to your MLH Transport website.

## Why Use Supabase?

With Supabase, you can:
- Store quotes and settings in a database
- Add user authentication for the admin dashboard
- Create serverless functions for email and WhatsApp integration
- Set up a secure backend for your website

## Step 1: Create a Supabase Account

1. Go to [Supabase](https://supabase.com/)
2. Click on "Start for Free"
3. Sign up with your GitHub account or email

## Step 2: Create a New Project

1. Once logged in, click on "New Project"
2. Choose a name for your project (e.g., "MLH Transport")
3. Set a secure password for the database
4. Choose a region close to South Africa (e.g., "Africa (Johannesburg)")
5. Click "Create New Project"

## Step 3: Set Up the Database

1. In your Supabase project, go to the "SQL Editor" tab
2. Create the necessary tables for your MLH Transport website:

```sql
-- Function to auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Settings table
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

-- Trigger to maintain updated_at on settings
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Quotes table
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

-- Insert default settings
INSERT INTO public.settings (depot_address, truck_rate_per_km, driver_rate_per_8h, extra_hour_rate, vat_percent)
VALUES ('9 Main Road, Klapmuts, Cape Town, South Africa', 10, 400, 500, 15);
```

## Step 4: Set Up Authentication

1. In your Supabase project, go to the "Authentication" tab
2. Under "Providers", enable "Email" authentication
3. Configure email templates for password recovery, etc.

## Step 5: Create Edge Functions for Email and WhatsApp

1. In your Supabase project, go to the "Edge Functions" tab
2. Create a new function for sending emails:

```typescript
// send-email.ts
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';

serve(async (req) => {
  const { quote, email } = await req.json();

  // Send email using Resend
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${resendApiKey}`,
    },
    body: JSON.stringify({
      from: 'quotes@mlhtransport.co.za',
      to: email,
      subject: 'Your MLH Transport Quote',
      html: `<p>Thank you for your quote request. Please find your quote attached.</p>`,
      attachments: [
        {
          filename: 'quote.pdf',
          content: quote.pdf,
        },
      ],
    }),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
```

3. Create a new function for sending WhatsApp messages:

```typescript
// send-whatsapp.ts
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.0.0';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const whatsappToken = Deno.env.get('WHATSAPP_TOKEN') || '';
const whatsappPhoneId = Deno.env.get('WHATSAPP_PHONE_ID') || '';

serve(async (req) => {
  const { quote, phone } = await req.json();

  // Send WhatsApp message using WhatsApp Business API
  const res = await fetch(`https://graph.facebook.com/v17.0/${whatsappPhoneId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${whatsappToken}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: phone,
      type: 'template',
      template: {
        name: 'quote_notification',
        language: {
          code: 'en_US',
        },
        components: [
          {
            type: 'body',
            parameters: [
              {
                type: 'text',
                text: quote.id,
              },
            ],
          },
        ],
      },
    }),
  });

  const data = await res.json();

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
    status: 200,
  });
});
```

## Step 6: Connect Your Website to Supabase

1. Install the Supabase client:

```bash
npm install @supabase/supabase-js
```

2. Create a Supabase client in your application:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseKey);
```

3. Update your application to use Supabase for storing quotes and settings

## Step 7: Set Up Email and WhatsApp Integration

1. Sign up for [Resend](https://resend.com/) for email integration
2. Sign up for [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/cloud-api/get-started) for WhatsApp integration
3. Add your API keys to Supabase Edge Functions

## Next Steps

Once you have set up Supabase, you can:
- Add user authentication for the admin dashboard
- Store quotes and settings in the database
- Send quotes via email and WhatsApp
- Add more features to your MLH Transport website