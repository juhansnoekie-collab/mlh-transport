# Getting a Free Google Maps API Key

This guide will help you get a free Google Maps API key for your MLH Transport website.

## Step 1: Create a Google Cloud Platform Account

1. Go to [Google Cloud Platform](https://cloud.google.com/)
2. Click on "Get Started for Free" or "Sign In" if you already have a Google account
3. Follow the prompts to create a new account or sign in
4. You may need to enter credit card information, but you won't be charged unless you exceed the free tier limits ($200 monthly credit)

## Step 2: Create a New Project

1. Once logged in, go to the [Google Cloud Console](https://console.cloud.google.com/)
2. At the top of the page, click on the project dropdown and then click "New Project"
3. Name your project (e.g., "MLH Transport")
4. Click "Create"

## Step 3: Enable the Required APIs

1. In the Google Cloud Console, go to "APIs & Services" > "Library"
2. Search for and enable the following APIs (click on each one and then click "Enable"):
   - Maps JavaScript API
   - Places API
   - Distance Matrix API

## Step 4: Create an API Key

1. In the Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Your new API key will be displayed. Copy it to a safe place.

## Step 5: Restrict Your API Key (Recommended)

To secure your API key, you should restrict it:

1. In the Credentials page, find your API key and click "Edit API key"
2. Under "Application restrictions", select "HTTP referrers (websites)"
3. Add your domain (e.g., `*.aegisum.co.za/*`) to the list of allowed referrers
4. Under "API restrictions", select "Restrict key"
5. Select the APIs you enabled (Maps JavaScript API, Places API, Distance Matrix API)
6. Click "Save"

## Step 6: Use Your API Key in the MLH Transport Website

1. Open your MLH Transport website
2. Click on "Set API Key" in the quote calculator
3. Enter your Google Maps API key
4. Click "Save"

Your API key will be saved locally in your browser, and you'll be able to use the quote calculator with Google Maps integration.

## Free Tier Limits

Google Maps Platform offers a $200 monthly credit, which is more than enough for a small business website. Here are the free tier limits for the APIs you'll be using:

- Maps JavaScript API: 28,000 map loads per month
- Places API: 11,000 requests per month
- Distance Matrix API: 40,000 elements per month

If you exceed these limits, you'll be charged for additional usage. However, for a small business website, it's unlikely that you'll exceed these limits.