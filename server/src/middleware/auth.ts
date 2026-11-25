import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface AuthPayload {
  teacherId: string;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const token = authHeader.replace('Bearer ', '').trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as AuthPayload;
    req.teacherId = payload.teacherId;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}
