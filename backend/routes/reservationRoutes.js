import express from 'express';
import { createReservation, getMyReservations, cancelMyReservation } from '../controllers/reservationController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createReservation);
router.get('/me', protect, getMyReservations);
router.patch('/:id/cancel', protect, cancelMyReservation);

export default router;
