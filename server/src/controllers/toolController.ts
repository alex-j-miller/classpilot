import { Request, Response } from 'express';
import { body } from 'express-validator';
import Classroom from '../models/Classroom';
import PairRule from '../models/PairRule';
import Student from '../models/Student';
import { validateRequest } from '../middleware/validateRequest';
import { generateGroups, generateValidPairs } from '../utils/pairing';

export const classToolValidator = [body('classId').isMongoId().withMessage('Valid class id is required')];

export const groupToolValidator = [
  ...classToolValidator,
  body('groupSize').isInt({ min: 2, max: 10 }).withMessage('Group size must be between 2 and 10'),
];

async function loadTeacherClass(classId: string, teacherId: string) {
  return Classroom.findOne({ _id: classId, teacherId });
}

export async function randomStudent(req: Request, res: Response): Promise<void> {
  if (!validateRequest(req, res)) {
    return;
  }

  const classroom = await loadTeacherClass(req.body.classId, req.teacherId as string);
  if (!classroom) {
    res.status(404).json({ message: 'Class not found' });
    return;
  }

  const students = await Student.find({ classId: classroom.id }).select('_id displayName');
  if (!students.length) {
    res.status(400).json({ message: 'No students in class' });
    return;
  }

  const pick = students[Math.floor(Math.random() * students.length)];
  res.json({ student: pick });
}

export async function generatePairs(req: Request, res: Response): Promise<void> {
  if (!validateRequest(req, res)) {
    return;
  }

  const classroom = await loadTeacherClass(req.body.classId, req.teacherId as string);
  if (!classroom) {
    res.status(404).json({ message: 'Class not found' });
    return;
  }

  const students = await Student.find({ classId: classroom.id }).select('_id displayName');
  const rules = await PairRule.find({ classId: classroom.id, ruleType: 'neverPair' }).select('studentA studentB');

  const pairs = generateValidPairs(
    students.map((student) => ({ _id: String(student._id), displayName: student.displayName })),
    rules.map((rule) => ({ studentA: String(rule.studentA), studentB: String(rule.studentB) }))
  );

  if (!pairs) {
    res.status(400).json({
      message: 'Could not generate valid pairs with current never-pair rules. Please adjust rules.',
    });
    return;
  }

  res.json({ pairs });
}

export async function generateGroupSets(req: Request, res: Response): Promise<void> {
  if (!validateRequest(req, res)) {
    return;
  }

  const classroom = await loadTeacherClass(req.body.classId, req.teacherId as string);
  if (!classroom) {
    res.status(404).json({ message: 'Class not found' });
    return;
  }

  const students = await Student.find({ classId: classroom.id }).select('_id displayName readingScore mathScore tags');
  const groups = generateGroups(students, Number(req.body.groupSize));

  res.json({ groups });
}
