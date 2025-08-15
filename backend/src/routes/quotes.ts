import express from 'express';
import { body, validationResult } from 'express-validator';
import { runQuery, getRow, getAllRows } from '../models/database';
import { calculateDistance } from '../utils/googleMaps';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Calculate quote (public endpoint)
router.post('/calculate', [
  body('pickup_address').trim().isLength({ min: 1 }),
  body('pickup_lat').isFloat(),
  body('pickup_lng').isFloat(),
  body('dropoff_address').trim().isLength({ min: 1 }),
  body('dropoff_lat').isFloat(),
  body('dropoff_lng').isFloat(),
  body('weight_kg').optional().isFloat({ min: 0 }),
  body('loading_hours').isFloat({ min: 0 }).default(1),
  body('offloading_hours').isFloat({ min: 0 }).default(1),
  body('truck_type').optional().trim().default('4-ton'),
  body('notes').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      pickup_address,
      pickup_lat,
      pickup_lng,
      dropoff_address,
      dropoff_lat,
      dropoff_lng,
      weight_kg,
      loading_hours = 1,
      offloading_hours = 1,
      truck_type = '4-ton',
      notes
    } = req.body;

    // Get settings
    const settings = await getRow('SELECT * FROM settings WHERE id = 1');
    if (!settings) {
      return res.status(500).json({ error: 'Settings not configured' });
    }

    const pickup = { lat: pickup_lat, lng: pickup_lng };
    const dropoff = { lat: dropoff_lat, lng: dropoff_lng };
    const depot = { lat: settings.depot_lat, lng: settings.depot_lng };

    // Calculate distances for all legs
    const [leg1, leg2, leg3] = await Promise.all([
      calculateDistance(depot, pickup),      // depot → pickup
      calculateDistance(pickup, dropoff),    // pickup → dropoff
      calculateDistance(dropoff, depot)      // dropoff → depot
    ]);

    // Convert to kilometers
    const legs = {
      d1: leg1.distance / 1000,  // depot → pickup
      d2: leg2.distance / 1000,  // pickup → dropoff (visible to customer)
      d3: leg3.distance / 1000   // dropoff → depot
    };

    // Convert durations to hours
    const durations = {
      d1: leg1.duration / 3600,
      d2: leg2.duration / 3600,
      d3: leg3.duration / 3600,
      total: (leg1.duration + leg2.duration + leg3.duration) / 3600
    };

    // Calculate costs
    const totalKm = legs.d1 + legs.d2 + legs.d3;
    const visibleKm = legs.d2; // Only show pickup → dropoff to customer

    // Base distance cost (total km * rate)
    const baseKmCost = totalKm * settings.truck_rate_per_km;

    // Driver cost (based on total time including loading/offloading)
    const totalWorkTime = durations.total + loading_hours + offloading_hours;
    const driverCost = Math.ceil(totalWorkTime / 8) * settings.driver_rate_per_8h;

    // Extra time cost (loading/offloading beyond free hours)
    const freeLoadingHours = 1;
    const freeOffloadingHours = 1;
    const extraLoadingHours = Math.max(0, loading_hours - freeLoadingHours);
    const extraOffloadingHours = Math.max(0, offloading_hours - freeOffloadingHours);
    const extraTimeCost = (extraLoadingHours + extraOffloadingHours) * settings.extra_hour_rate;

    // Calculate totals
    const priceExVat = baseKmCost + driverCost + extraTimeCost;
    const vatAmount = priceExVat * (settings.vat_percent / 100);
    const priceIncVat = priceExVat + vatAmount;

    // Save quote to database
    const quoteResult = await runQuery(`
      INSERT INTO quotes (
        pickup_address, pickup_lat, pickup_lng,
        dropoff_address, dropoff_lat, dropoff_lng,
        weight_kg, notes, visible_km, total_km,
        price_ex_vat, price_inc_vat, driver_cost,
        extra_time_cost, base_km_cost, loading_hours,
        offloading_hours, truck_type, legs_km, durations_hours
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      pickup_address, pickup_lat, pickup_lng,
      dropoff_address, dropoff_lat, dropoff_lng,
      weight_kg || null, notes || null, visibleKm, totalKm,
      priceExVat, priceIncVat, driverCost,
      extraTimeCost, baseKmCost, loading_hours,
      offloading_hours, truck_type,
      JSON.stringify(legs), JSON.stringify(durations)
    ]);

    res.json({
      quote_id: quoteResult.id,
      visible_km: visibleKm,
      total_km: totalKm,
      price_ex_vat: priceExVat,
      price_inc_vat: priceIncVat,
      driver_cost: driverCost,
      extra_time_cost: extraTimeCost,
      base_km_cost: baseKmCost,
      legs_km: legs,
      durations_hours: durations,
      vat_percent: settings.vat_percent
    });
  } catch (error) {
    console.error('Quote calculation error:', error);
    res.status(500).json({ error: 'Failed to calculate quote' });
  }
});

// Get user's quotes (authenticated)
router.get('/my-quotes', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const quotes = await getAllRows(
      'SELECT * FROM quotes WHERE user_id = ? ORDER BY created_at DESC',
      [req.user!.id]
    );

    // Parse JSON fields
    const formattedQuotes = quotes.map(quote => ({
      ...quote,
      legs_km: JSON.parse(quote.legs_km),
      durations_hours: JSON.parse(quote.durations_hours)
    }));

    res.json(formattedQuotes);
  } catch (error) {
    console.error('Error fetching user quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Update quote with client details
router.put('/:id/client-details', [
  body('client_name').optional().trim(),
  body('company_name').optional().trim(),
  body('email').optional().isEmail().normalizeEmail(),
  body('phone').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { client_name, company_name, email, phone } = req.body;

    await runQuery(
      'UPDATE quotes SET client_name = ?, company_name = ?, email = ?, phone = ? WHERE id = ?',
      [client_name || null, company_name || null, email || null, phone || null, id]
    );

    res.json({ message: 'Client details updated successfully' });
  } catch (error) {
    console.error('Error updating client details:', error);
    res.status(500).json({ error: 'Failed to update client details' });
  }
});

export default router;