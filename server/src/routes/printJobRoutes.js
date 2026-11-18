import { Router } from 'express';
import {
  createPrintJob,
  getMyPrintJobs,
  getShopPrintQueue,
  updatePrintJobStatus,
  downloadPrintFile,
  getRateCard,
} from '../controllers/printJobController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';
import { uploadPrintPdf } from '../middleware/upload.js';

const router = Router();

router.get('/rate-card', getRateCard);

router.use(authenticate);

router.post('/', authorizeRoles('STUDENT', 'ADMIN'), uploadPrintPdf.single('document'), createPrintJob);
router.get('/my', authorizeRoles('STUDENT'), getMyPrintJobs);
router.get('/queue', authorizeRoles('SHOP_OWNER', 'ADMIN'), getShopPrintQueue);
router.patch('/:jobId/status', authorizeRoles('SHOP_OWNER', 'ADMIN'), updatePrintJobStatus);
router.get('/:jobId/download', downloadPrintFile);

export default router;
