import { Router } from 'express';
import { getAllShops, getShopById, updateShop } from '../controllers/shopController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', getAllShops);
router.get('/:shopId', getShopById);
router.patch('/:shopId', authenticate, authorizeRoles('SHOP_OWNER', 'ADMIN'), updateShop);

export default router;
