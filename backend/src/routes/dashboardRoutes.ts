import { Router } from 'express';
import {
  getDashboardStats,
  getOKRHierarchy,
  getProgressTrend,
} from '../controllers/dashboardController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/stats', getDashboardStats);
router.get('/hierarchy', getOKRHierarchy);
router.get('/progress-trend', getProgressTrend);

export default router;
