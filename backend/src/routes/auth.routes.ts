import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { registerSchema, loginSchema } from '../validators/type';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
