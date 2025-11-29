import { Router } from 'express';
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
} from '../controllers/companyController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', authorize('ADMIN'), createCompany);
router.get('/', getCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', authorize('ADMIN'), updateCompany);
router.delete('/:id', authorize('ADMIN'), deleteCompany);

export default router;
