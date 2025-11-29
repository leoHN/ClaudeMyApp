import { Router } from 'express';
import {
  getPendingApprovals,
  approveOrReject,
  getApprovalHistory,
} from '../controllers/approvalController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/pending', authorize('ADMIN', 'DEPARTMENT_HEAD'), getPendingApprovals);
router.post('/:id/review', authorize('ADMIN', 'DEPARTMENT_HEAD'), approveOrReject);
router.get('/history', getApprovalHistory);

export default router;
