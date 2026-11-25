import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import Classroom from '../models/Classroom';
import Student from '../models/Student';
import PairRule from '../models/PairRule';
import { validateRequest } from '../middleware/validateRequest';

export const classIdValidator = [param('classId').isMongoId().withMessage('Valid class id required')];

export const addStudentValidator = [
  ...classIdValidator,
  body('displayName').trim().isLength({ min: 2, max: 60 }).withMessage('Display name is required'),
  body('readingScore').optional({ values: 'falsy' }).isFloat({ min: 0, max: 100 }),
  body('mathScore').optional({ values: 'falsy' }).isFloat({ min: 0, max: 100 }),
  body('tags').optional().isArray({ max: 12 }),
  body('tags.*').optional().isString().isLength({ min: 1, max: 24 }),
];

export const deleteStudentValidator = [param('id').isMongoId().withMessage('Valid student id required')];

async function findTeacherClass(classId: string, teacherId: string) {
  return Classroom.findOne({ _id: classId, teacherId });
}

export async function listStudents(req: Request, res: Response): Promise<void> {
  if (!validateRequest(req, res)) {
    return;
  }

  const classroom = await findTeacherClass(String(req.params.classId), req.teacherId as string);
  if (!classroom) {
    res.status(404).json({ message: 'Class not found' });
    return;
  }

  const students = await Student.find({ classId: classroom.id }).sort({ displayName: 1 });
  res.json({ students });
}

export async function addStudent(req: Request, res: Response): Promise<void> {
  if (!validateRequest(req, res)) {
    return;
  }

  const classroom = await findTeacherClass(String(req.params.classId), req.teacherId as string);
  if (!classroom) {
    res.status(404).json({ message: 'Class not found' });
    return;
  }

  const payload = {
    classId: classroom.id,
    displayName: String(req.body.displayName).trim(),
    readingScore: req.body.readingScore === '' ? undefined : req.body.readingScore,
    mathScore: req.body.mathScore === '' ? undefined : req.body.mathScore,
    tags: Array.isArray(req.body.tags) ? req.body.tags : undefined,
  };

  const student = await Student.create(payload);
  res.status(201).json({ student });
}

export async function deleteStudent(req: Request, res: Response): Promise<void> {
  if (!validateRequest(req, res)) {
    return;
  }

  const student = await Student.findById(req.params.id);
  if (!student) {
    res.status(404).json({ message: 'Student not found' });
    return;
  }

  const classroom = await findTeacherClass(String(student.classId), req.teacherId as string);
  if (!classroom) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  await Promise.all([
    PairRule.deleteMany({
      classId: classroom.id,
      $or: [{ studentA: student.id }, { studentB: student.id }],
    }),
    Student.deleteOne({ _id: student.id }),
  ]);

  res.status(204).send();
}
