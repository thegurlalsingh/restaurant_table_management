import mongoose from 'mongoose';

const tableSchema = new mongoose.Schema({
    tableNumber: {
        type: Number,
        required: true,
    },
    capacity: {
        type: Number,
        required: true,
        min: 1,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
})

const Table = mongoose.model('Table', tableSchema);
export default Table;