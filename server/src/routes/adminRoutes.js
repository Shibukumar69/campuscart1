import { Router } from 'express';
import {
  getAdminStats,
  getUsers,
  updateUserStatus,
  getPendingVendors,
  updateVendorApproval,
  getAuditLogs,
} from '../controllers/adminController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.use(authenticate, authorizeRoles('ADMIN'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:userId', updateUserStatus);
router.get('/vendors/pending', getPendingVendors);
router.patch('/vendors/:shopId/approval', updateVendorApproval);
router.get('/audit-logs', getAuditLogs);

export default router;
