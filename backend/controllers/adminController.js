import Reservation from '../models/reservation.js'
import Table from '../models/table.js'

// get all reservations with some date if given, else all
export const getAllReservations = async (req, res) => {
    try {
        const filter = {};

        if (req.query.date) {
            filter.reservationDate = req.query.date;
        }

        const reservations = await Reservation.find(filter)
            .populate('userId', 'name email role')
            .populate('tableId', 'tableNumber capacity')
            .sort({ reservationDate: 1, timeSlot: 1 });

        return res.status(200).json(reservations);
    }

    catch (error) {
        return res.status(500).json({
            message: `Failed to fetch reservations: ${error.message}`
        });
    }
};

// update any time, date or table of reservation
export const updateReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                message: 'Reservation not found'
            });
        }

        const { reservationDate, timeSlot, guestCount, tableId, status } = req.body;

        // check if any existing table with selected date, slot or table is there or not
        const newDate = reservationDate || reservation.reservationDate;
        const newSlot = timeSlot || reservation.timeSlot;
        const newTableId = tableId || reservation.tableId;

        if (reservationDate || timeSlot || tableId) {
            const conflict = await Reservation.findOne({
                _id: { $ne: reservation._id }, // exclude current reservation
                tableId: newTableId,
                reservationDate: newDate,
                timeSlot: newSlot,
                status: 'booked',
            });

            if (conflict) {
                return res.status(409).json({
                    message: "That table is already booked for selected date and time slot",
                });
            }
        }

        if (reservationDate) {
            reservation.reservationDate = reservationDate;
        }
        if (timeSlot) {
            reservation.timeSlot = timeSlot;
        }
        if (guestCount) {
            reservation.guestCount = guestCount;
        }
        if (tableId) {
            reservation.tableId = tableId;
        }
        if (status) {
            reservation.status = status;
        }

        await reservation.save();

        return res.status(200).json({
            message: 'Reservation updated successfully', reservation
        });
    }
    catch (error) {
        return res.status(500).json({
            message: `Failed to update reservation: ${error.message}`
        });
    }
}

// delete any reservation
export const cancelAnyReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({
                message: 'Reservation not found'
            });
        }

        if (reservation.status === 'cancelled') {
            return res.status(400).json({
                message: 'Reservation is already cancelled'
            });
        }

        reservation.status = 'cancelled';

        await reservation.save();

        return res.status(200).json({
            message: 'Reservation cancelled successfully', reservation
        });

    }
    catch (error) {
        return res.status(500).json({ message: `Failed to cancel reservation: ${error.message}` });
    }
};

// return data of all tables in sorted order
export const getAllTables = async (req, res) => {
    try {
        const tables = await Table.find().sort({
            tableNumber: 1
        });

        return res.status(200).json(tables);
    }
    catch (error) {
        return res.status(500).json({
            message: `Failed to fetch tables: ${error.message}`
        });
    }
};

// create a new table
export const createTable = async (req, res) => {
    try {
        const { tableNumber, capacity } = req.body;

        if (!tableNumber || !capacity) {
            return res.status(400).json({
                message: 'Please provide tableNumber and capacity'
            });
        }

        if (capacity < 1) {
            return res.status(400).json({
                message: 'Capacity must be at least 1'
            });
        }

        const existing = await Table.findOne({ tableNumber });

        if (existing) {
            return res.status(409).json({
                message: `Table number ${tableNumber} already exists`
            });
        }

        const table = await Table.create({
            tableNumber, capacity
        });

        return res.status(201).json({
            message: 'Table created successfully', table
        });
    }
    catch (error) {
        return res.status(500).json({
            message: `Failed to create table: ${error.message}`
        });
    }
};

// update the table capacity or its number
export const updateTable = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);

        if (!table) {
            return res.status(404).json({
                message: 'Table not found'
            });
        }

        const { tableNumber, capacity } = req.body;

        if (tableNumber) {
            table.tableNumber = tableNumber;
        }

        if (capacity) {
            if (capacity < 1) {
                return res.status(400).json({
                    message: 'Capacity must be at least 1'
                });
            }

            table.capacity = capacity;
        }

        await table.save();

        return res.status(200).json({
            message: 'Table updated successfully!!'
        });
    }
    catch (error) {
        return res.status(500).json({
            message: `Failed to update table: ${error.message}`
        });
    }
};

// delete the table
export const deleteTable = async (req, res) => {
    try {
        const table = await Table.findById(req.params.id);

        if (!table) {
            return res.status(404).json({
                message: 'Table not found'
            });
        }

        // Prevent deletion if there are active bookings on this table
        const activeBookings = await Reservation.findOne({
            tableId: table._id,
            status: 'booked',
        });

        if (activeBookings) {
            return res.status(400).json({
                message: 'cannot delete table with active reservations. cancel them first.',
            });
        }

        await table.deleteOne();

        return res.status(200).json({
            message: 'Table deleted successfully'
        });
    } catch (error) {
        return res.status(500).json({
            message: `Failed to delete table: ${error.message}`
        });
    }
};