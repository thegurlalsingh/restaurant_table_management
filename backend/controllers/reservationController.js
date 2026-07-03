import Reservation, { VALID_TIME_SLOTS } from '../models/reservation.js';
import Table from '../models/table.js';

export const createReservation = async (req, res) => {
    try {
        const { reservationDate, timeSlot, guestCount } = req.body;

        if (!reservationDate || !timeSlot || !guestCount) {
            return res.status(400).json({
                message: "Please provide proper reservation date, time slot and guest count"
            });
        }

        if (!VALID_TIME_SLOTS.includes(timeSlot)) {
            return res.status(400).json({
                message: "Invalid time slot", validSlots: VALID_TIME_SLOTS
            });
        };

        if (!Number.isInteger(Number(guestCount)) || guestCount < 1) {
            return res.status(400).json({
                message: "Guest count must be atleast 1!"
            });
        }

        // Finding suitable table with desired guest capacity
        const suitableTables = await Table.find({ capacity: { $gte: guestCount } });

        if (suitableTables.length === 0) {
            return res.status(404).json({
                message: "No tables available with sufficient capacity"
            });
        }

        const bookedTableIds = await Reservation.find({
            reservationDate, timeSlot, status: 'booked', tableId: { $in: suitableTables.map((t) => t._id) },
        }).distinct('tableId');

        const availableTable = suitableTables.find(
            (t) => !bookedTableIds.some((id) => id.equals(t._id))
        );

        if (!availableTable) {
            return res.status(409).json({
                message: "No available tables for the selected date and time slot. Please choose a different slot"
            });
        }

        const reservation = await Reservation.create({
            userId: req.user._id,
            tableId: availableTable._id,
            reservationDate,
            timeSlot,
            guestCount,
            status: 'booked',
        });

        return res.status(201).json({
            message: 'Reservation created successfully',
            reservation: {
                ...reservation.toObject(),
                tableNumber: availableTable.tableNumber,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ message: `Failed to create reservation: ${error.message}` });
    }
};

export const cancelMyReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                message: "Reservation not found"
            });
        }

        if (reservation.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                message: "Forbidden: You can only cancel your own reservation!!"
            });
        }

        if (reservation.status === "cancelled") {
            return res.status(400).json({
                message: "Reservation is already cancelled"
            });
        }

        reservation.status = 'cancelled';
        await reservation.save();

        return res.status(200).json({
            message: "Reservation cancelled successfully", reservation
        });
    }
    catch (error) {
        return res.status(500).json({
            message: `Failed to cancel reservation: ${error.message}`
        });
    }
};

export const getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ userId: req.user._id })
            .populate('tableId', 'tableNumber capacity')
            .sort({ reservationDate: 1, timeSlot: 1 });

        return res.status(200).json(reservations);
    }
    catch (error) {
        return res.status(500).json({ message: `Failed to fetch reservations: ${error.message}` });
    }
};