import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = process.env.DB_PATH || './database/mlh_transport.db';

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

export const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err);
  } else {
    console.log('Connected to SQLite database');
  }
});

export async function initializeDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          first_name TEXT NOT NULL,
          last_name TEXT NOT NULL,
          phone TEXT,
          company TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Admin users table
      db.run(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Settings table
      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          id INTEGER PRIMARY KEY,
          depot_address TEXT NOT NULL DEFAULT '9 Main Road, Klapmuts, Cape Town, South Africa',
          depot_lat REAL NOT NULL DEFAULT -33.8567,
          depot_lng REAL NOT NULL DEFAULT 18.8086,
          truck_rate_per_km REAL NOT NULL DEFAULT 10,
          driver_rate_per_8h REAL NOT NULL DEFAULT 400,
          extra_hour_rate REAL NOT NULL DEFAULT 500,
          vat_percent REAL NOT NULL DEFAULT 15,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Quotes table
      db.run(`
        CREATE TABLE IF NOT EXISTS quotes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          pickup_address TEXT NOT NULL,
          pickup_lat REAL,
          pickup_lng REAL,
          dropoff_address TEXT NOT NULL,
          dropoff_lat REAL,
          dropoff_lng REAL,
          weight_kg REAL,
          notes TEXT,
          visible_km REAL NOT NULL,
          total_km REAL NOT NULL,
          price_ex_vat REAL NOT NULL,
          price_inc_vat REAL NOT NULL,
          driver_cost REAL NOT NULL,
          extra_time_cost REAL NOT NULL,
          base_km_cost REAL NOT NULL,
          loading_hours REAL NOT NULL DEFAULT 1,
          offloading_hours REAL NOT NULL DEFAULT 1,
          truck_type TEXT NOT NULL DEFAULT '4-ton',
          legs_km TEXT NOT NULL, -- JSON string
          durations_hours TEXT NOT NULL, -- JSON string
          client_name TEXT,
          company_name TEXT,
          email TEXT,
          phone TEXT,
          status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users (id)
        )
      `);

      // Insert default settings if not exists
      db.run(`
        INSERT OR IGNORE INTO settings (id, depot_address, depot_lat, depot_lng, truck_rate_per_km, driver_rate_per_8h, extra_hour_rate, vat_percent)
        VALUES (1, '9 Main Road, Klapmuts, Cape Town, South Africa', -33.8567, 18.8086, 10, 400, 500, 15)
      `);

      // Create default admin user (password: admin123)
      const bcrypt = require('bcryptjs');
      const defaultAdminPassword = bcrypt.hashSync('admin123', 10);
      
      db.run(`
        INSERT OR IGNORE INTO admin_users (email, password_hash)
        VALUES ('admin@mlhtransport.co.za', ?)
      `, [defaultAdminPassword], (err) => {
        if (err) {
          console.error('Error creating default admin:', err);
          reject(err);
        } else {
          console.log('Database tables created successfully');
          console.log('Default admin user: admin@mlhtransport.co.za / admin123');
          resolve();
        }
      });
    });
  });
}

// Helper function to run queries with promises
export function runQuery(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Helper function to get single row
export function getRow(sql: string, params: any[] = []): Promise<any> {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// Helper function to get all rows
export function getAllRows(sql: string, params: any[] = []): Promise<any[]> {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}