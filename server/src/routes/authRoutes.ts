import { Router } from 'express';
import { login, loginValidator, me, register, registerValidator } from '../controllers/authController';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/me', requireAuth, me);

export default router;
