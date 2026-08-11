import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateRequest } from '../middlewares/validationMiddleware';
import { loginSchema } from '../validators/authValidator';
import { authenticateToken } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authenticateToken, AuthController.getMe);

export default router;
