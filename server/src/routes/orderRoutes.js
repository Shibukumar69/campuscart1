import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getShopOrders,
  getAssignedDeliveries,
  getOrderById,
  updateOrderStatus,
  verifyDeliveryOtp,
} from '../controllers/orderController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', authorizeRoles('STUDENT', 'ADMIN'), createOrder);
router.get('/my', authorizeRoles('STUDENT'), getMyOrders);
router.get('/shop', authorizeRoles('SHOP_OWNER', 'ADMIN'), getShopOrders);
router.get('/assigned-deliveries', authorizeRoles('DELIVERY_AGENT', 'ADMIN'), getAssignedDeliveries);
router.get('/:orderId', getOrderById);
router.patch('/:orderId/status', authorizeRoles('SHOP_OWNER', 'DELIVERY_AGENT', 'ADMIN'), updateOrderStatus);
router.post('/:orderId/verify-otp', authorizeRoles('DELIVERY_AGENT', 'ADMIN'), verifyDeliveryOtp);

export default router;
