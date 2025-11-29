import { Router } from 'express';
import {
  createObjective,
  getObjectives,
  getObjectiveById,
  updateObjective,
  deleteObjective,
} from '../controllers/objectiveController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', createObjective);
router.get('/', getObjectives);
router.get('/:id', getObjectiveById);
router.put('/:id', updateObjective);
router.delete('/:id', deleteObjective);

export default router;
