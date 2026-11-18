import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/categories', getCategories);
router.get('/', getProducts);
router.get('/:productId', getProductById);

router.post('/', authenticate, authorizeRoles('SHOP_OWNER', 'ADMIN'), createProduct);
router.patch('/:productId', authenticate, authorizeRoles('SHOP_OWNER', 'ADMIN'), updateProduct);
router.delete('/:productId', authenticate, authorizeRoles('SHOP_OWNER', 'ADMIN'), deleteProduct);

export default router;
