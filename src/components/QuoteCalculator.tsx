import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { loadGoogleMaps } from './GoogleMapsLoader';
import AddressAutocomplete from './AddressAutocomplete';
import { toast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import { supabase, Quote } from '@/lib/supabase';

const ZAR = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });

// Local storage keys
const GMAPS_KEY = 'mlh_gmaps_key';

const QuoteCalculator: React.FC = () => {
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem(GMAPS_KEY) || '');
  const [gmapsReady, setGmapsReady] = useState(false);

  const [pickupText, setPickupText] = useState('');
  const [dropoffText, setDropoffText] = useState('');
  const [pickupPlace, setPickupPlace] = useState<google.maps.places.PlaceResult | null>(null);
  const [dropoffPlace, setDropoffPlace] = useState<google.maps.places.PlaceResult | null>(null);

  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [loadingHours, setLoadingHours] = useState<number>(1);
  const [offloadingHours, setOffloadingHours] = useState<number>(1);
  const [truckType, setTruckType] = useState('4-ton');

  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState<null | {
    visibleKm: number;
    totalKm: number;
    priceExVat: number;
    priceIncVat: number;
    driverCost: number;
    extraTimeCost: number;
    baseKmCost: number;
    durations: { d1: number; d2: number; d3: number; total: number };
    legs: { d1: number; d2: number; d3: number };
    quoteId?: string;
  }>(null);

  // Load Google Maps API
  useEffect(() => {
    if (!apiKey) return;
    loadGoogleMaps(apiKey)
      .then(() => setGmapsReady(true))
      .catch(() => {
        setGmapsReady(false);
        toast({ title: 'Google Maps', description: 'Failed to load Maps API. Check your API key.' });
      });
  }, [apiKey]);

  // Submit quote to backend
  const submitQuote = useCallback(async () => {
    if (!gmapsReady) {
      toast({ title: 'Google Maps', description: 'Enter a valid Google Maps API key first.' });
      return;
    }
    if (!pickupPlace?.geometry || !dropoffPlace?.geometry) {
      toast({ title: 'Addresses required', description: 'Please select valid Pickup and Drop-off addresses from suggestions.' });
      return;
    }

    try {
      setCalculating(true);
      
      // Get coordinates
      const pickupLocation = pickupPlace.geometry?.location;
      const dropoffLocation = dropoffPlace.geometry?.location;
      
      if (!pickupLocation || !dropoffLocation) {
        throw new Error('Invalid location data');
      }
      
      // Call Supabase Edge Function to calculate quote
      const { data, error } = await supabase.functions.invoke('calculate-quote', {
        body: {
          data: {
            pickup_address: pickupText,
            pickup_lat: pickupLocation.lat(),
            pickup_lng: pickupLocation.lng(),
            dropoff_address: dropoffText,
            dropoff_lat: dropoffLocation.lat(),
            dropoff_lng: dropoffLocation.lng(),
            weight_kg: weightKg || undefined,
            notes: notes || undefined,
            loading_hours: loadingHours,
            offloading_hours: offloadingHours,
            truck_type: truckType,
          }
        }
      });
      
      if (error) throw error;
      
      // Save quote to database
      const quoteData: Omit<Quote, 'id' | 'created_at'> = {
        pickup_address: pickupText,
        dropoff_address: dropoffText,
        weight_kg: weightKg || undefined,
        notes: notes || undefined,
        visible_km: data.visible_km,
        total_km: data.total_km,
        price_ex_vat: data.price_ex_vat,
        price_inc_vat: data.price_inc_vat,
        driver_cost: data.driver_cost,
        extra_time_cost: data.extra_time_cost,
        base_km_cost: data.base_km_cost,
        loading_hours: loadingHours,
        offloading_hours: offloadingHours,
        truck_type: truckType,
        legs_km: data.legs_km,
        durations_hours: data.durations_hours,
      };
      
      const { data: savedQuote, error: saveError } = await supabase
        .from('quotes')
        .insert(quoteData)
        .select()
        .single();
        
      if (saveError) {
        console.error('Error saving quote:', saveError);
        // Continue with the quote even if saving fails
      }
      
      // Format result for display
      const resultData = {
        visibleKm: data.visible_km,
        totalKm: data.total_km,
        priceExVat: data.price_ex_vat,
        priceIncVat: data.price_inc_vat,
        driverCost: data.driver_cost,
        extraTimeCost: data.extra_time_cost,
        baseKmCost: data.base_km_cost,
        durations: data.durations_hours,
        legs: data.legs_km,
        quoteId: savedQuote?.id,
      };
      
      setResult(resultData);
    } catch (e: any) {
      console.error('Calculation error:', e);
      toast({ 
        title: 'Calculation failed', 
        description: e?.message || 'Please try again.',
        variant: 'destructive'
      });
    } finally {
      setCalculating(false);
    }
  }, [gmapsReady, pickupPlace, dropoffPlace, pickupText, dropoffText, weightKg, loadingHours, offloadingHours, truckType, notes]);

  const handleSaveApiKey = useCallback(() => {
    localStorage.setItem(GMAPS_KEY, apiKey);
    toast({ title: 'Saved', description: 'Google Maps API key saved locally.' });
    if (apiKey) {
      loadGoogleMaps(apiKey).then(() => setGmapsReady(true));
    }
  }, [apiKey]);

  // Get settings from Supabase for VAT display
  const [vatPercent, setVatPercent] = useState(15);
  
  useEffect(() => {
    const fetchSettings = async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('vat_percent')
        .limit(1)
        .single();
        
      if (!error && data) {
        setVatPercent(data.vat_percent);
      }
    };
    
    fetchSettings();
  }, []);
  
  const vatNote = useMemo(() => `VAT ${vatPercent}%`, [vatPercent]);

  // PDF generation and quote sending
  const [openDialog, setOpenDialog] = useState(false);
  const [clientName, setClientName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [sendVia, setSendVia] = useState<'email' | 'whatsapp'>('email');
  const [sending, setSending] = useState(false);

  // Generate and download PDF
  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    const line = (y: number, text: string) => { doc.text(text, 14, y); };

    doc.setFontSize(16);
    line(20, 'MLH Transport - Quote');
    doc.setFontSize(11);
    line(30, `Date: ${new Date().toLocaleString('en-ZA')}`);
    line(38, `Client: ${clientName || '-'}  |  Company: ${companyName || '-'}`);
    line(46, `Email: ${email || '-'}  |  Phone: ${phone || '-'}`);
    line(56, `Pickup: ${pickupText}`);
    line(64, `Drop-off: ${dropoffText}`);
    line(72, `Weight: ${weightKg || '-'} kg`);
    line(82, `Route (visible to client): ${result.visibleKm.toFixed(1)} km`);

    line(96, `Base distance cost: ${ZAR.format(result.baseKmCost)}`);
    line(104, `Driver cost: ${ZAR.format(result.driverCost)}`);
    line(112, `Extra time cost: ${ZAR.format(result.extraTimeCost)}`);
    line(122, `Subtotal (ex VAT): ${ZAR.format(result.priceExVat)}`);
    const vatAmount = result.priceIncVat - result.priceExVat;
    line(130, `${vatNote}: ${ZAR.format(vatAmount)}`);
    line(138, `Total (inc VAT): ${ZAR.format(result.priceIncVat)}`);

    line(154, 'Internal (not shown to customer online):');
    line(162, `Quote ID: ${result.quoteId || 'Not saved'}`);
    line(170, `Legs km: depot→pickup ${result.legs.d1.toFixed(1)} | pickup→drop ${result.legs.d2.toFixed(1)} | drop→depot ${result.legs.d3.toFixed(1)}`);

    doc.save(`MLH-Quote-${Date.now()}.pdf`);
    
    // Send quote via email or WhatsApp
    sendQuote();
  };
  
  // Send quote via email or WhatsApp
  const sendQuote = async () => {
    if (!result?.quoteId) {
      toast({ 
        title: 'Error', 
        description: 'Quote ID not found. Please try again.',
        variant: 'destructive'
      });
      return;
    }
    
    const contactInfo = sendVia === 'email' ? email : phone;
    if (!contactInfo) {
      toast({ 
        title: 'Error', 
        description: `Please enter a valid ${sendVia === 'email' ? 'email address' : 'phone number'}.`,
        variant: 'destructive'
      });
      return;
    }
    
    try {
      setSending(true);
      
      const { data, error } = await supabase.functions.invoke('send-quote', {
        body: {
          data: {
            quote_id: result.quoteId,
            method: sendVia,
            email: sendVia === 'email' ? email : undefined,
            phone: sendVia === 'whatsapp' ? phone : undefined,
            client_name: clientName,
            company_name: companyName,
          }
        }
      });
      
      if (error) throw error;
      
      toast({ 
        title: 'Success', 
        description: `Quote sent via ${sendVia === 'email' ? 'email' : 'WhatsApp'}.` 
      });
      
      setOpenDialog(false);
    } catch (e: any) {
      console.error('Error sending quote:', e);
      toast({ 
        title: 'Sending failed', 
        description: e?.message || `Failed to send via ${sendVia}. Please try downloading the PDF instead.`,
        variant: 'destructive'
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section aria-labelledby="quote" className="relative">
      <Card className="backdrop-blur supports-[backdrop-filter]:bg-background/80 shadow-[var(--shadow-elegant)] transition-transform will-change-transform hover:-translate-y-0.5">
        <CardHeader>
          <CardTitle id="quote">Instant Quote</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="gmaps">Google Maps API Key (stored locally)</Label>
              <div className="flex gap-2">
                <Input id="gmaps" type="password" placeholder="Paste your Google Maps API key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                <Button variant="secondary" onClick={handleSaveApiKey}>Save</Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Truck Type</Label>
              <Select value={truckType} onValueChange={setTruckType}>
                <SelectTrigger><SelectValue placeholder="Select truck" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="4-ton">4 Ton Truck</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <AddressAutocomplete id="pickup" label="Pickup Address" placeholder="Start typing..." value={pickupText} onChange={setPickupText} onPlaceResolved={setPickupPlace} />
            <AddressAutocomplete id="dropoff" label="Drop-off Address" placeholder="Start typing..." value={dropoffText} onChange={setDropoffText} onPlaceResolved={setDropoffPlace} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input id="weight" type="number" min={0} value={weightKg} onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : '')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loadH">Loading time (hours)</Label>
              <Input id="loadH" type="number" min={0} value={loadingHours} onChange={(e) => setLoadingHours(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">First hour is free.</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="offloadH">Offloading time (hours)</Label>
              <Input id="offloadH" type="number" min={0} value={offloadingHours} onChange={(e) => setOffloadingHours(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">First hour is free.</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any special instructions..." />
          </div>

          <div className="flex items-center gap-3">
            <Button variant="hero" onClick={submitQuote} disabled={calculating}>{calculating ? 'Calculating…' : 'Get Quote'}</Button>
            {result && (
              <span className="text-sm text-muted-foreground">Distance shown to client: {result.visibleKm.toFixed(1)} km</span>
            )}
          </div>

          {result && (
            <div className="grid gap-2">
              <div className="text-2xl font-semibold">{ZAR.format(result.priceIncVat)} <span className="text-sm font-normal text-muted-foreground">incl. {vatNote}</span></div>
              <div className="text-sm text-muted-foreground">Ex VAT: {ZAR.format(result.priceExVat)}</div>

              <div className="pt-2">
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button>Approve & Download PDF</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Client Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3 py-2">
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="cname">Name</Label>
                          <Input id="cname" value={clientName} onChange={(e) => setClientName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company">Company</Label>
                          <Input id="company" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                        </div>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone</Label>
                          <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Send via</Label>
                        <div className="flex gap-3">
                          <label className="flex items-center gap-2 text-sm"><input type="radio" name="send" checked={sendVia==='email'} onChange={() => setSendVia('email')} /> Email</label>
                          <label className="flex items-center gap-2 text-sm"><input type="radio" name="send" checked={sendVia==='whatsapp'} onChange={() => setSendVia('whatsapp')} /> WhatsApp</label>
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <Button onClick={downloadPDF} disabled={sending}>
                          {sending ? 'Sending...' : 'Generate & Send PDF'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

export default QuoteCalculator;
