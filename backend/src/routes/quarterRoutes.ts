import { Router } from 'express';
import {
  createQuarter,
  getQuarters,
  getQuarterById,
  updateQuarter,
  deleteQuarter,
} from '../controllers/quarterController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN'), createQuarter);
router.get('/', getQuarters);
router.get('/:id', getQuarterById);
router.put('/:id', authorize('ADMIN'), updateQuarter);
router.delete('/:id', authorize('ADMIN'), deleteQuarter);

export default router;
