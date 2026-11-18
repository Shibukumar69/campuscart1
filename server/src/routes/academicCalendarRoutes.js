import { Router } from 'express';
import {
  getAcademicEvents,
  createAcademicEvent,
  updateAcademicEvent,
  deleteAcademicEvent,
} from '../controllers/academicCalendarController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Publicly viewable by logged in students/vendors/admins
router.get('/', getAcademicEvents);

router.post('/', authenticate, authorizeRoles('ADMIN'), createAcademicEvent);
router.patch('/:eventId', authenticate, authorizeRoles('ADMIN'), updateAcademicEvent);
router.delete('/:eventId', authenticate, authorizeRoles('ADMIN'), deleteAcademicEvent);

export default router;
