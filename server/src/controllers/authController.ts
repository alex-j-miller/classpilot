import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body } from 'express-validator';
import Teacher from '../models/Teacher';
import { validateRequest } from '../middleware/validateRequest';

export const registerValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

function signToken(teacherId: string): string {
  return jwt.sign({ teacherId }, process.env.JWT_SECRET as string, { expiresIn: '7d' });
}

export async function register(req: Request, res: Response): Promise<void> {
  if (!validateRequest(req, res)) {
    return;
  }

  const email = String(req.body.email).toLowerCase().trim();
  const password = String(req.body.password);

  const existing = await Teacher.findOne({ email });
  if (existing) {
    res.status(409).json({ message: 'Email is already in use' });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const teacher = await Teacher.create({ email, passwordHash });

  const token = signToken(teacher.id);
  res.status(201).json({ token, teacher: { id: teacher.id, email: teacher.email } });
}

export async function login(req: Request, res: Response): Promise<void> {
  if (!validateRequest(req, res)) {
    return;
  }

  const email = String(req.body.email).toLowerCase().trim();
  const password = String(req.body.password);

  const teacher = await Teacher.findOne({ email });
  if (!teacher) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const matches = await bcrypt.compare(password, teacher.passwordHash);
  if (!matches) {
    res.status(401).json({ message: 'Invalid email or password' });
    return;
  }

  const token = signToken(teacher.id);
  res.json({ token, teacher: { id: teacher.id, email: teacher.email } });
}

export async function me(req: Request, res: Response): Promise<void> {
  const teacher = await Teacher.findById(req.teacherId).select('_id email createdAt');
  if (!teacher) {
    res.status(404).json({ message: 'Teacher not found' });
    return;
  }

  res.json({ teacher: { id: teacher.id, email: teacher.email, createdAt: teacher.createdAt } });
}
