import { Router } from 'express';
import {
  createClass,
  createClassValidator,
  deleteClass,
  deleteClassValidator,
  listClasses,
} from '../controllers/classController';

const router = Router();

router.get('/', listClasses);
router.post('/', createClassValidator, createClass);
router.delete('/:id', deleteClassValidator, deleteClass);

export default router;
