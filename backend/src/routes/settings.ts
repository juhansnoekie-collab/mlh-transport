import express from 'express';
import { getRow } from '../models/database';

const router = express.Router();

// Get public settings (no authentication required)
router.get('/', async (req, res) => {
  try {
    const settings = await getRow('SELECT * FROM settings WHERE id = 1');
    
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    // Return only public settings
    res.json({
      vat_percent: settings.vat_percent,
      truck_types: [
        {
          id: '4-ton',
          name: '4 Ton Truck',
          rate_per_km: settings.truck_rate_per_km
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

export default router;