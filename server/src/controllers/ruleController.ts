import { Request, Response } from 'express';
import { body, param } from 'express-validator';
import Classroom from '../models/Classroom';
import PairRule from '../models/PairRule';
import Student from '../models/Student';
import { validateRequest } from '../middleware/validateRequest';

export const classRulesValidator = [param('classId').isMongoId().withMessage('Valid class id required')];

export const createRuleValidator = [
  ...classRulesValidator,
  body('studentA').isMongoId(),
  body('studentB').isMongoId(),
  body('ruleType').optional().equals('neverPair'),
];

export const deleteRuleValidator = [param('id').isMongoId().withMessage('Valid rule id required')];

async function ensureTeacherClass(classId: string, teacherId: string) {
  return Classroom.findOne({ _id: classId, teacherId });
}

export async function listRules(req: Request, res: Response): Promise<void> {
  if (!validateRequest(req, res)) {
    return;
  }

  const classroom = await ensureTeacherClass(String(req.params.classId), req.teacherId as string);
  if (!classroom) {
    res.status(404).json({ message: 'Class not found' });
    return;
  }

  const rules = await PairRule.find({ classId: classroom.id })
    .populate('studentA', 'displayName')
    .populate('studentB', 'displayName');

  res.json({ rules });
}

export async function createRule(req: Request, res: Response): Promise<void> {
  if (!validateRequest(req, res)) {
    return;
  }

  const classroom = await ensureTeacherClass(String(req.params.classId), req.teacherId as string);
  if (!classroom) {
    res.status(404).json({ message: 'Class not found' });
    return;
  }

  if (req.body.studentA === req.body.studentB) {
    res.status(400).json({ message: 'Rule requires two different students' });
    return;
  }

  const students = await Student.find({
    _id: { $in: [req.body.studentA, req.body.studentB] },
    classId: classroom.id,
  });

  if (students.length !== 2) {
    res.status(400).json({ message: 'Students must belong to this class' });
    return;
  }

  const [studentA, studentB] = [req.body.studentA, req.body.studentB].sort();

  const rule = await PairRule.findOneAndUpdate(
    { classId: classroom.id, studentA, studentB, ruleType: 'neverPair' },
    { classId: classroom.id, studentA, studentB, ruleType: 'neverPair' },
    { upsert: true, new: true }
  );

  res.status(201).json({ rule });
}

export async function deleteRule(req: Request, res: Response): Promise<void> {
  if (!validateRequest(req, res)) {
    return;
  }

  const rule = await PairRule.findById(req.params.id);
  if (!rule) {
    res.status(404).json({ message: 'Rule not found' });
    return;
  }

  const classroom = await ensureTeacherClass(String(rule.classId), req.teacherId as string);
  if (!classroom) {
    res.status(403).json({ message: 'Forbidden' });
    return;
  }

  await PairRule.deleteOne({ _id: rule.id });
  res.status(204).send();
}
