import { Router } from 'express';
import {
  classToolValidator,
  generateGroupSets as generateGroups,
  generatePairs,
  groupToolValidator,
  randomStudent,
} from '../controllers/toolController';

const router = Router();

router.post('/random-student', classToolValidator, randomStudent);
router.post('/generate-pairs', classToolValidator, generatePairs);
router.post('/generate-groups', groupToolValidator, generateGroups);

export default router;
