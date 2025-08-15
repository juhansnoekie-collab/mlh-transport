import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { supabase, Settings, Quote, AdminUser } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const ZAR = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });

const Admin: React.FC = () => {
  const { user, signOut } = useAuth();
  
  // Settings state
  const [settings, setSettings] = useState<Settings>({
    depot_address: '9 Main Road, Klapmuts, Cape Town, South Africa',
    truck_rate_per_km: 10,
    driver_rate_per_8h: 400,
    extra_hour_rate: 500,
    vat_percent: 15,
  });
  
  // Quotes state
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loadingQuotes, setLoadingQuotes] = useState(true);
  const [loadingSettings, setLoadingSettings] = useState(true);
  
  // Admin users state
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  // Load settings from Supabase
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('*')
          .limit(1)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setSettings({
            depot_address: data.depot_address,
            truck_rate_per_km: data.truck_rate_per_km,
            driver_rate_per_8h: data.driver_rate_per_8h,
            extra_hour_rate: data.extra_hour_rate,
            vat_percent: data.vat_percent,
          });
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load settings',
          variant: 'destructive'
        });
      } finally {
        setLoadingSettings(false);
      }
    };
    
    fetchSettings();
  }, []);
  
  // Load quotes from Supabase
  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const { data, error } = await supabase
          .from('quotes')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (error) throw error;
        
        setQuotes(data || []);
      } catch (error) {
        console.error('Error fetching quotes:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load quotes',
          variant: 'destructive'
        });
      } finally {
        setLoadingQuotes(false);
      }
    };
    
    fetchQuotes();
  }, []);
  
  // Load admin users from Supabase
  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setAdminUsers(data || []);
      } catch (error) {
        console.error('Error fetching admin users:', error);
        toast({ 
          title: 'Error', 
          description: 'Failed to load admin users',
          variant: 'destructive'
        });
      } finally {
        setLoadingAdmins(false);
      }
    };
    
    fetchAdminUsers();
  }, []);

  // Save settings to Supabase
  const saveSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .update({
          depot_address: settings.depot_address,
          truck_rate_per_km: settings.truck_rate_per_km,
          driver_rate_per_8h: settings.driver_rate_per_8h,
          extra_hour_rate: settings.extra_hour_rate,
          vat_percent: settings.vat_percent,
        })
        .eq('id', 1) // Assuming there's only one settings record with ID 1
        .select();
        
      if (error) throw error;
      
      toast({ 
        title: 'Success', 
        description: 'Settings updated successfully' 
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to save settings',
        variant: 'destructive'
      });
    }
  };
  
  // Add new admin user
  const addAdminUser = async () => {
    if (!newAdminEmail) {
      toast({ 
        title: 'Error', 
        description: 'Please enter an email address',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      // First check if user already exists
      const { data: existingUser, error: checkError } = await supabase
        .from('admin_users')
        .select('*')
        .eq('email', newAdminEmail)
        .single();
        
      if (existingUser) {
        toast({ 
          title: 'Error', 
          description: 'This email is already an admin',
          variant: 'destructive'
        });
        return;
      }
      
      // Create the user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: newAdminEmail,
        password: '25C07s@06A09W', // Default password
        email_confirm: true,
      });
      
      if (error) throw error;
      
      // Add the user to admin_users table
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          email: newAdminEmail,
          id: data.user.id,
        });
        
      if (insertError) throw insertError;
      
      // Refresh admin users list
      const { data: updatedAdmins, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      
      setAdminUsers(updatedAdmins || []);
      setNewAdminEmail('');
      
      toast({ 
        title: 'Success', 
        description: 'Admin user added successfully' 
      });
    } catch (error: any) {
      console.error('Error adding admin user:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to add admin user',
        variant: 'destructive'
      });
    }
  };
  
  // Remove admin user
  const removeAdminUser = async (email: string) => {
    if (!email) return;
    
    try {
      // First get the user ID
      const { data: userData, error: userError } = await supabase
        .from('admin_users')
        .select('id')
        .eq('email', email)
        .single();
        
      if (userError) throw userError;
      
      // Delete from admin_users table
      const { error: deleteError } = await supabase
        .from('admin_users')
        .delete()
        .eq('email', email);
        
      if (deleteError) throw deleteError;
      
      // Delete from auth.users
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(
        userData.id
      );
      
      if (authDeleteError) throw authDeleteError;
      
      // Refresh admin users list
      const { data: updatedAdmins, error: fetchError } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      
      setAdminUsers(updatedAdmins || []);
      
      toast({ 
        title: 'Success', 
        description: 'Admin user removed successfully' 
      });
    } catch (error: any) {
      console.error('Error removing admin user:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to remove admin user',
        variant: 'destructive'
      });
    }
  };
  
  // Change admin password
  const changePassword = async () => {
    if (!adminPassword || adminPassword !== confirmPassword) {
      toast({ 
        title: 'Error', 
        description: 'Passwords do not match',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: adminPassword,
      });
      
      if (error) throw error;
      
      setAdminPassword('');
      setConfirmPassword('');
      setShowPasswordDialog(false);
      
      toast({ 
        title: 'Success', 
        description: 'Password updated successfully' 
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to change password',
        variant: 'destructive'
      });
    }
  };

  return (
    <main className="container py-10 grid gap-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage settings, view quotes, and administer users</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{user?.email}</span>
          <Button variant="outline" onClick={() => signOut()}>Sign Out</Button>
        </div>
      </header>

      <Tabs defaultValue="settings">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="quotes">Quotes</TabsTrigger>
          <TabsTrigger value="admins">Admin Users</TabsTrigger>
        </TabsList>
        
        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Pricing Settings</CardTitle>
              <CardDescription>Configure depot address and pricing parameters</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Depot Address</Label>
                <Input 
                  value={settings.depot_address} 
                  onChange={(e) => setSettings({...settings, depot_address: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label>4 Ton Truck Rate (R/km)</Label>
                <Input 
                  type="number" 
                  value={settings.truck_rate_per_km} 
                  onChange={(e) => setSettings({...settings, truck_rate_per_km: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Driver Rate per 8h (ZAR)</Label>
                <Input 
                  type="number" 
                  value={settings.driver_rate_per_8h} 
                  onChange={(e) => setSettings({...settings, driver_rate_per_8h: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label>Extra Hour Rate (ZAR)</Label>
                <Input 
                  type="number" 
                  value={settings.extra_hour_rate} 
                  onChange={(e) => setSettings({...settings, extra_hour_rate: Number(e.target.value)})} 
                />
              </div>
              <div className="space-y-2">
                <Label>VAT (%)</Label>
                <Input 
                  type="number" 
                  value={settings.vat_percent} 
                  onChange={(e) => setSettings({...settings, vat_percent: Number(e.target.value)})} 
                />
              </div>
              <div className="md:col-span-2">
                <Button variant="hero" onClick={saveSettings}>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="quotes" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Quotes</CardTitle>
              <CardDescription>View detailed information about recent quotes</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingQuotes ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : quotes.length > 0 ? (
                <div className="space-y-6">
                  {quotes.map((quote, index) => (
                    <div key={quote.id || index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">
                          {quote.client_name ? `${quote.client_name} (${quote.company_name || 'No company'})` : 'Anonymous Quote'}
                        </h3>
                        <span className="text-sm text-muted-foreground">
                          {new Date(quote.created_at || '').toLocaleString('en-ZA')}
                        </span>
                      </div>
                      
                      <div className="grid gap-2 md:grid-cols-2 mb-3">
                        <div><span className="text-muted-foreground">Pickup:</span> {quote.pickup_address}</div>
                        <div><span className="text-muted-foreground">Drop-off:</span> {quote.dropoff_address}</div>
                        <div><span className="text-muted-foreground">Visible km:</span> {quote.visible_km.toFixed(1)}</div>
                        <div><span className="text-muted-foreground">Total km (internal):</span> {quote.total_km.toFixed(1)}</div>
                      </div>
                      
                      <Separator className="my-2" />
                      
                      <div className="grid gap-2 md:grid-cols-3 mb-2">
                        <div>Base distance cost: {ZAR.format(quote.base_km_cost)}</div>
                        <div>Driver cost: {ZAR.format(quote.driver_cost)}</div>
                        <div>Extra time cost: {ZAR.format(quote.extra_time_cost)}</div>
                      </div>
                      
                      <div className="grid gap-2 md:grid-cols-2">
                        <div>Ex VAT: {ZAR.format(quote.price_ex_vat)}</div>
                        <div>Inc VAT: {ZAR.format(quote.price_inc_vat)}</div>
                      </div>
                      
                      {quote.notes && (
                        <div className="mt-3 p-2 bg-muted rounded">
                          <span className="text-sm font-medium">Notes:</span> {quote.notes}
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <details className="text-sm">
                          <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                            View internal details
                          </summary>
                          <div className="mt-2 p-2 bg-muted rounded text-xs">
                            <div><span className="font-medium">Depot:</span> {settings.depot_address}</div>
                            <div><span className="font-medium">Legs:</span> depot→pickup {quote.legs_km.d1.toFixed(1)} km | pickup→drop {quote.legs_km.d2.toFixed(1)} km | drop→depot {quote.legs_km.d3.toFixed(1)} km</div>
                            <div><span className="font-medium">Durations:</span> depot→pickup {quote.durations_hours.d1.toFixed(2)} h | pickup→drop {quote.durations_hours.d2.toFixed(2)} h | drop→depot {quote.durations_hours.d3.toFixed(2)} h</div>
                            <div><span className="font-medium">Loading:</span> {quote.loading_hours} h | <span className="font-medium">Offloading:</span> {quote.offloading_hours} h</div>
                            <div><span className="font-medium">Total time:</span> {quote.durations_hours.total.toFixed(2)} h</div>
                            <div><span className="font-medium">Contact:</span> {quote.email || 'No email'} | {quote.phone || 'No phone'}</div>
                          </div>
                        </details>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No quotes yet. Generate one on the homepage.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="admins" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>Manage admin access to the dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="newAdmin">Add New Admin</Label>
                    <Input 
                      id="newAdmin" 
                      type="email" 
                      placeholder="email@example.com" 
                      value={newAdminEmail} 
                      onChange={(e) => setNewAdminEmail(e.target.value)} 
                    />
                  </div>
                  <Button onClick={addAdminUser}>Add Admin</Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium mb-3">Current Admins</h3>
                  {loadingAdmins ? (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : adminUsers.length > 0 ? (
                    <div className="space-y-2">
                      {adminUsers.map((admin) => (
                        <div key={admin.id} className="flex justify-between items-center p-2 border rounded">
                          <span>{admin.email}</span>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => removeAdminUser(admin.email)}
                            disabled={admin.email === user?.email} // Can't remove yourself
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No admin users found.</p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                    <DialogTrigger asChild>
                      <Button variant="outline">Change My Password</Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Change Password</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="newPassword">New Password</Label>
                          <Input 
                            id="newPassword" 
                            type="password" 
                            value={adminPassword} 
                            onChange={(e) => setAdminPassword(e.target.value)} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password</Label>
                          <Input 
                            id="confirmPassword" 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                          />
                        </div>
                        <Button onClick={changePassword} className="w-full">Update Password</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  );
};

export default Admin;
