import { createClient } from '@supabase/supabase-js';

// Supabase connection details
// URL: https://ujoirmojetkdqiohwdon.supabase.co
// Project: https://supabase.com/dashboard/project/ujoirmojetkdqiohwdon
const supabaseUrl = 'https://ujoirmojetkdqiohwdon.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqb2lybW9qZXRrZHFpb2h3ZG9uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjI1MzA0NzcsImV4cCI6MjAzODEwNjQ3N30.Yd-Yk-Wd-Yk-Wd-Yk-Wd-Yk-Wd-Yk-Wd-Yk-Wd-Yk-Wd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Settings = {
  id?: string;
  depot_address: string;
  truck_rate_per_km: number;
  driver_rate_per_8h: number;
  extra_hour_rate: number;
  vat_percent: number;
  created_at?: string;
  updated_at?: string;
};

export type Quote = {
  id?: string;
  created_at?: string;
  pickup_address: string;
  dropoff_address: string;
  weight_kg?: number;
  notes?: string;
  visible_km: number;
  total_km: number;
  price_ex_vat: number;
  price_inc_vat: number;
  driver_cost: number;
  extra_time_cost: number;
  base_km_cost: number;
  loading_hours: number;
  offloading_hours: number;
  truck_type: string;
  legs_km: {
    d1: number;
    d2: number;
    d3: number;
  };
  durations_hours: {
    d1: number;
    d2: number;
    d3: number;
    total: number;
  };
  client_name?: string;
  company_name?: string;
  email?: string;
  phone?: string;
};

export type AdminUser = {
  email: string;
  id: string;
  created_at: string;
};

// Helper functions
export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single();
    
  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }
  
  return data;
}

export async function updateSettings(settings: Partial<Settings>): Promise<boolean> {
  const { error } = await supabase
    .from('settings')
    .update(settings)
    .eq('id', settings.id);
    
  if (error) {
    console.error('Error updating settings:', error);
    return false;
  }
  
  return true;
}

export async function getQuotes(): Promise<Quote[]> {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching quotes:', error);
    return [];
  }
  
  return data || [];
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('id')
    .eq('id', userId)
    .single();
    
  if (error || !data) {
    return false;
  }
  
  return true;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching admin users:', error);
    return [];
  }
  
  return data || [];
}

export async function addAdminUser(email: string): Promise<boolean> {
  const { error } = await supabase
    .from('admin_users')
    .insert({ id: crypto.randomUUID(), email });
    
  if (error) {
    console.error('Error adding admin user:', error);
    return false;
  }
  
  return true;
}

export async function removeAdminUser(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('admin_users')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error removing admin user:', error);
    return false;
  }
  
  return true;
}