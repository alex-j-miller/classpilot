import { Router } from 'express';
import {
  addStudent,
  addStudentValidator,
  classIdValidator,
  deleteStudent,
  deleteStudentValidator,
  listStudents,
} from '../controllers/studentController';

const router = Router();

router.get('/classes/:classId/students', classIdValidator, listStudents);
router.post('/classes/:classId/students', addStudentValidator, addStudent);
router.delete('/students/:id', deleteStudentValidator, deleteStudent);

export default router;
