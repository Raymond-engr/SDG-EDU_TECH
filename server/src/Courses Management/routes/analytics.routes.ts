import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller';
import { authenticateToken, authorize } from '../../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Attendance tracking
router.post('/attendance/login', analyticsController.trackAttendance);
router.post('/attendance/logout', analyticsController.recordLogout);

// Learning outcome tracking
router.