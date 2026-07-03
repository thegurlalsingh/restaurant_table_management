import express from 'express';
import { getAllReservations, updateReservation, cancelAnyReservation, getAllTables, createTable, updateTable, deleteTable } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication AND admin role
router.use(protect, adminOnly);

router.get('/reservations', getAllReservations);
router.patch('/reservations/:id', updateReservation);
router.patch('/reservations/:id/cancel', cancelAnyReservation);

router.get('/tables', getAllTables);
router.post('/tables', createTable);
router.patch('/tables/:id', updateTable);
router.delete('/tables/:id', deleteTable);

export default router;
