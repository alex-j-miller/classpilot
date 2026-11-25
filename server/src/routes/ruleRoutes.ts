import { Router } from 'express';
import {
  classRulesValidator,
  createRule,
  createRuleValidator,
  deleteRule,
  deleteRuleValidator,
  listRules,
} from '../controllers/ruleController';

const router = Router();

router.get('/classes/:classId/rules', classRulesValidator, listRules);
router.post('/classes/:classId/rules', createRuleValidator, createRule);
router.delete('/rules/:id', deleteRuleValidator, deleteRule);

export default router;
