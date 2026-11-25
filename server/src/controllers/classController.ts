import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import Classroom from '../models/Classroom';
import Student from '../models/Student';
import PairRule from '../models/PairRule';
import { validateRequest } from '../middleware/validateRequest';

export const createClassValidator = [body('name').trim().isLength({ min: 1, max: 100 })];

export const deleteClassValidator = [param('id').isMongoId().withMessage('Valid class id required')];

export async function listClasses(req: Request, res: Response): Promise<void> {
  const classes = await Classroom.find({ teacherId: req.teacherId }).sort({ createdAt: -1 });
  res.json({ classes });
}

export async function createClass(req: Request, res: Response): Promise<void> {
  if (!validateRequest(req, res)) {
    return;
  }

  const classroom = await Classroom.create({
    teacherId: req.teacherId,
    name: String(req.body.name).trim(),
  });

  res.status(201).json({ classroom });
}

export async function deleteClass(req: Request, res: Response): Promise<void> {
  if (!validateRequest(req, res)) {
    return;
  }

  const classroom = await Classroom.findOne({ _id: req.params.id, teacherId: req.teacherId });
  if (!classroom) {
    res.status(404).json({ message: 'Class not found' });
    return;
  }

  await Promise.all([
    Student.deleteMany({ classId: classroom.id }),
    PairRule.deleteMany({ classId: classroom.id }),
    Classroom.deleteOne({ _id: classroom.id }),
  ]);

  res.status(204).send();
}
