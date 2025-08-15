import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getRow } from '../models/database';

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    isAdmin?: boolean;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user still exists
    const user = await getRow(
      'SELECT id, email FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = {
      id: user.id,
      email: user.email,
      isAdmin: false
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

export const authenticateAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if admin user still exists
    const adminUser = await getRow(
      'SELECT id, email FROM admin_users WHERE id = ?',
      [decoded.id]
    );

    if (!adminUser) {
      return res.status(401).json({ error: 'Admin user not found' });
    }

    req.user = {
      id: adminUser.id,
      email: adminUser.email,
      isAdmin: true
    };

    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid admin token' });
  }
};