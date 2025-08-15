import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

interface QuoteRequest {
  pickup_address: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_address: string;
  dropoff_lat: number;
  dropoff_lng: number;
  weight_kg?: number;
  notes?: string;
  loading_hours: number;
  offloading_hours: number;
  truck_type: string;
}

interface DistanceResult {
  km: number;
  hours: number;
}

async function getDistanceAndDuration(
  origin: { lat: number; lng: number } | string,
  destination: { lat: number; lng: number } | string,
  apiKey: string
): Promise<DistanceResult> {
  const originStr = typeof origin === 'string' 
    ? origin 
    : `${origin.lat},${origin.lng}`;
  
  const destStr = typeof destination === 'string' 
    ? destination 
    : `${destination.lat},${destination.lng}`;
  
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(originStr)}&destinations=${encodeURIComponent(destStr)}&mode=driving&units=metric&key=${apiKey}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.status !== 'OK') {
    throw new Error(`Google API error: ${data.status}`);
  }
  
  const element = data.rows?.[0]?.elements?.[0];
  if (!element || element.status !== 'OK') {
    throw new Error(`No route found: ${element?.status || 'unknown error'}`);
  }
  
  const km = element.distance.value / 1000;
  const hours = element.duration.value / 3600;
  
  return { km, hours };
}

serve(async (req) => {
  try {
    // Get API key from environment
    const googleMapsApiKey = Deno.env.get('GOOGLE_MAPS_API_KEY');
    if (!googleMapsApiKey) {
      return new Response(
        JSON.stringify({ error: 'Google Maps API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Parse request
    const { data } = await req.json();
    const quoteRequest = data as QuoteRequest;
    
    if (!quoteRequest.pickup_address || !quoteRequest.dropoff_address) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get settings
    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .select('*')
      .limit(1)
      .single();
      
    if (settingsError) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch settings' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    const settings = settingsData;
    const depot = settings.depot_address;
    
    // Calculate distances
    const pickup = { lat: quoteRequest.pickup_lat, lng: quoteRequest.pickup_lng };
    const dropoff = { lat: quoteRequest.dropoff_lat, lng: quoteRequest.dropoff_lng };
    
    const [leg1, leg2, leg3] = await Promise.all([
      getDistanceAndDuration(depot, pickup, googleMapsApiKey),
      getDistanceAndDuration(pickup, dropoff, googleMapsApiKey),
      getDistanceAndDuration(dropoff, depot, googleMapsApiKey),
    ]);
    
    // Calculate costs
    const totalKm = leg1.km + leg2.km + leg3.km;
    const visibleKm = leg2.km;
    const totalHours = leg1.hours + leg2.hours + leg3.hours + quoteRequest.loading_hours + quoteRequest.offloading_hours;
    const driverDays = Math.max(1, Math.ceil(totalHours / 8));
    const driverCost = driverDays * settings.driver_rate_per_8h;
    const extraTimeCost = 
      Math.max(0, quoteRequest.loading_hours - 1) * settings.extra_hour_rate + 
      Math.max(0, quoteRequest.offloading_hours - 1) * settings.extra_hour_rate;
    const baseKmCost = totalKm * settings.truck_rate_per_km;
    const priceExVat = baseKmCost + driverCost + extraTimeCost;
    const priceIncVat = priceExVat * (1 + settings.vat_percent / 100);
    
    // Prepare response
    const result = {
      visible_km: visibleKm,
      total_km: totalKm,
      price_ex_vat: priceExVat,
      price_inc_vat: priceIncVat,
      driver_cost: driverCost,
      extra_time_cost: extraTimeCost,
      base_km_cost: baseKmCost,
      legs_km: { d1: leg1.km, d2: leg2.km, d3: leg3.km },
      durations_hours: { 
        d1: leg1.hours, 
        d2: leg2.hours, 
        d3: leg3.hours, 
        total: totalHours 
      },
    };
    
    return new Response(
      JSON.stringify(result),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});