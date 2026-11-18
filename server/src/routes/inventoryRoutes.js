import { Router } from 'express';
import {
  getInventory,
  getLowStockAlerts,
  getLedger,
  restockProduct,
  adjustStock,
} from '../controllers/inventoryController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorizeRoles('SHOP_OWNER', 'ADMIN'));

router.get('/', getInventory);
router.get('/low-stock', getLowStockAlerts);
router.get('/ledger', getLedger);
router.post('/restock', restockProduct);
router.post('/adjust', adjustStock);

export default router;
