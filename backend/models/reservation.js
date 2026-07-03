import mongoose from 'mongoose';

const VALID_TIME_SLOTS = [
    '12:00 - 13:00',
    '13:00 - 14:00',
    '14:00 - 15:00',
    '15:00 - 16:00',
    '18:00 - 19:00',
    '19:00 - 20:00',
    '20:00 - 21:00',
    '21:00 - 22:00',
];

const reservationSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        tableId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Table',
            required: true,
        },
        reservationDate: {
            type: String,
            required: true,
            match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
        },
        timeSlot: {
            type: String,
            required: true,
            enum: {
                values: VALID_TIME_SLOTS,
                message: 'Invalid time slot provided',
            },
        },
        guestCount: {
            type: Number,
            required: true,
            min: [1, 'Guest count must be at least 1'],
        },
        status: {
            type: String,
            enum: ['booked', 'cancelled'],
            default: 'booked',
        },
    },
    { timestamps: true }
);


reservationSchema.index(
    { tableId: 1, reservationDate: 1, timeSlot: 1, status: 1 },
    {
        unique: true,
        partialFilterExpression: { status: 'booked' },
    }
); // Without partialFilterExpression, even cancelled reservations would block future bookings.

const Reservation = mongoose.model('Reservation', reservationSchema);

export { VALID_TIME_SLOTS };

export default Reservation;
