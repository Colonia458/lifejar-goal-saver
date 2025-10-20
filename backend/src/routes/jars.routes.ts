import { Router } from 'express';
import { JarController } from '../controllers/jars.controller';
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Protected routes (require authentication)
router.post('/', authenticateUser, JarController.createJar);
router.get('/', authenticateUser, JarController.getUserJars);
router.get('/:id', authenticateUser, JarController.getJarById);
router.put('/:id', authenticateUser, JarController.updateJar);
router.delete('/:id', authenticateUser, JarController.deleteJar);

// Public routes (no authentication required)
router.get('/public/:id', JarController.getPublicJar);

export default router;

