import express from 'express';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';
import { runQuery, getRow, getAllRows } from '../models/database';
import { authenticateAdmin, AuthRequest } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication
router.use(authenticateAdmin);

// Get all settings (admin only)
router.get('/settings', async (req: AuthRequest, res) => {
  try {
    const settings = await getRow('SELECT * FROM settings WHERE id = 1');
    
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching admin settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update settings (admin only)
router.put('/settings', [
  body('depot_address').trim().isLength({ min: 1 }),
  body('depot_lat').isFloat(),
  body('depot_lng').isFloat(),
  body('truck_rate_per_km').isFloat({ min: 0 }),
  body('driver_rate_per_8h').isFloat({ min: 0 }),
  body('extra_hour_rate').isFloat({ min: 0 }),
  body('vat_percent').isFloat({ min: 0, max: 100 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      depot_address,
      depot_lat,
      depot_lng,
      truck_rate_per_km,
      driver_rate_per_8h,
      extra_hour_rate,
      vat_percent
    } = req.body;

    await runQuery(`
      UPDATE settings SET 
        depot_address = ?, depot_lat = ?, depot_lng = ?,
        truck_rate_per_km = ?, driver_rate_per_8h = ?,
        extra_hour_rate = ?, vat_percent = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `, [
      depot_address, depot_lat, depot_lng,
      truck_rate_per_km, driver_rate_per_8h,
      extra_hour_rate, vat_percent
    ]);

    res.json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get all quotes (admin only)
router.get('/quotes', async (req: AuthRequest, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const quotes = await getAllRows(`
      SELECT q.*, u.first_name, u.last_name, u.email as user_email
      FROM quotes q
      LEFT JOIN users u ON q.user_id = u.id
      ORDER BY q.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    // Parse JSON fields
    const formattedQuotes = quotes.map(quote => ({
      ...quote,
      legs_km: JSON.parse(quote.legs_km),
      durations_hours: JSON.parse(quote.durations_hours)
    }));

    res.json(formattedQuotes);
  } catch (error) {
    console.error('Error fetching admin quotes:', error);
    res.status(500).json({ error: 'Failed to fetch quotes' });
  }
});

// Get quote by ID (admin only)
router.get('/quotes/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    
    const quote = await getRow(`
      SELECT q.*, u.first_name, u.last_name, u.email as user_email
      FROM quotes q
      LEFT JOIN users u ON q.user_id = u.id
      WHERE q.id = ?
    `, [id]);

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    // Parse JSON fields
    const formattedQuote = {
      ...quote,
      legs_km: JSON.parse(quote.legs_km),
      durations_hours: JSON.parse(quote.durations_hours)
    };

    res.json(formattedQuote);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({ error: 'Failed to fetch quote' });
  }
});

// Get all admin users (admin only)
router.get('/admin-users', async (req: AuthRequest, res) => {
  try {
    const adminUsers = await getAllRows(
      'SELECT id, email, created_at FROM admin_users ORDER BY created_at DESC'
    );

    res.json(adminUsers);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Failed to fetch admin users' });
  }
});

// Add new admin user (admin only)
router.post('/admin-users', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Check if admin already exists
    const existingAdmin = await getRow('SELECT id FROM admin_users WHERE email = ?', [email]);
    if (existingAdmin) {
      return res.status(400).json({ error: 'Admin user already exists with this email' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin user
    const result = await runQuery(
      'INSERT INTO admin_users (email, password_hash) VALUES (?, ?)',
      [email, passwordHash]
    );

    res.status(201).json({
      message: 'Admin user created successfully',
      admin: {
        id: result.id,
        email
      }
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

// Remove admin user (admin only)
router.delete('/admin-users/:id', async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Don't allow deleting yourself
    if (parseInt(id) === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    const result = await runQuery('DELETE FROM admin_users WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    res.json({ message: 'Admin user deleted successfully' });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json({ error: 'Failed to delete admin user' });
  }
});

// Change admin password (admin only)
router.put('/change-password', [
  body('currentPassword').exists(),
  body('newPassword').isLength({ min: 6 })
], async (req: AuthRequest, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get current admin user
    const adminUser = await getRow(
      'SELECT password_hash FROM admin_users WHERE id = ?',
      [req.user!.id]
    );

    if (!adminUser) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, adminUser.password_hash);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Update password
    await runQuery(
      'UPDATE admin_users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, req.user!.id]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

export default router;