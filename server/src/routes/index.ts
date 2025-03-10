import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', authenticateToken, userRoutes);


export default router;