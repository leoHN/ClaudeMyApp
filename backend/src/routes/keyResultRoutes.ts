import { Router } from 'express';
import {
  createKeyResult,
  getKeyResults,
  updateKeyResult,
  updateProgress,
  deleteKeyResult,
} from '../controllers/keyResultController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createKeyResult);
router.get('/', getKeyResults);
router.put('/:id', updateKeyResult);
router.post('/:id/progress', updateProgress);
router.delete('/:id', deleteKeyResult);

export default router;
