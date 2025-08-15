# Supabase Setup Guide for MLH Transport

This guide will walk you through setting up the Supabase backend for the MLH Transport website.

## 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Choose a name (e.g., "mlh-transport")
4. Set a secure database password
5. Choose a region close to South Africa (e.g., "West Europe")
6. Wait for the project to be created

## 2. Set Up Database Tables

You can run the SQL migrations in the Supabase SQL Editor:

1. Go to the SQL Editor in your Supabase dashboard
2. Copy and paste the contents of each file in the `supabase/migrations` directory
3. Run the SQL commands

Alternatively, you can use the Supabase CLI to run migrations:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

## 3. Deploy Edge Functions

You can deploy the Edge Functions using the Supabase CLI:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy the functions
supabase functions deploy calculate-quote
supabase functions deploy send-quote
```

## 4. Set Function Secrets

Set the required secrets for the Edge Functions:

```bash
# Google Maps API key
supabase secrets set GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Resend API key (for email)
supabase secrets set RESEND_API_KEY=your_resend_api_key

# WhatsApp Cloud API credentials
supabase secrets set WHATSAPP_TOKEN=your_whatsapp_token
supabase secrets set WHATSAPP_PHONE_ID=your_whatsapp_phone_id
```

## 5. Set Up Authentication

1. Go to Authentication > Settings in your Supabase dashboard
2. Under Email Auth, make sure "Enable Email Signup" is turned on
3. Set the Site URL to your website's URL (e.g., https://mlhtransport.co.za)
4. Save changes

## 6. Create Admin Users

The initial admin users are created in the SQL migrations:
- emroc259@gmail.com
- leona951@gmail.com

To set up their passwords:

1. Go to Authentication > Users in your Supabase dashboard
2. Find the users and click "Reset password"
3. Send them the password reset link
4. They can set their own password

Alternatively, you can use the Admin Dashboard to add more admin users once you're logged in.

## 7. Update Environment Variables

Update your `.env` file with your Supabase project URL and anon key:

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase dashboard under Settings > API.

## 8. Test the Setup

1. Run the website locally or deploy it
2. Try creating a quote
3. Log in to the admin dashboard
4. Check that quotes are being saved and displayed

## Troubleshooting

### Edge Functions Not Working

- Make sure all secrets are set correctly
- Check the function logs in the Supabase dashboard
- Verify that the functions are deployed correctly

### Authentication Issues

- Check that the Site URL is set correctly
- Verify that the admin users exist in the `admin_users` table
- Check for any errors in the browser console

### Database Issues

- Check that all tables are created correctly
- Verify that the RLS policies are set up correctly
- Check for any errors in the Supabase dashboard

## Getting Help

If you encounter any issues, please contact the developer for assistance.