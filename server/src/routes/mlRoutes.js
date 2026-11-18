import { Router } from 'express';
import {
  getProductForecast,
  getReorderRecommendations,
  createDraftPurchaseOrder,
  triggerTraining,
} from '../controllers/mlController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorizeRoles('SHOP_OWNER', 'ADMIN'));

router.get('/forecast/:productId', getProductForecast);
router.get('/recommendations', getReorderRecommendations);
router.post('/purchase-order', createDraftPurchaseOrder);
router.post('/train', authorizeRoles('ADMIN'), triggerTraining);

export default router;
