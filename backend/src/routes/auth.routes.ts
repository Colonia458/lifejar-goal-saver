import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';

const router = Router();

// Public authentication routes
router.post('/login', AuthController.login);
router.post('/signup', AuthController.signup);

// Protected routes (require authentication)
router.get('/profile', AuthController.getProfile);
router.post('/logout', AuthController.logout);

export default router;
