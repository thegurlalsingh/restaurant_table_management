import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Table from '../models/table.js';

dotenv.config({ path: "../.env" });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log('MongoDB Connected for seeding...');

        const existingTables = await Table.countDocuments();

        if (existingTables === 0) {
            await Table.insertMany([
                { tableNumber: 1, capacity: 2 },
                { tableNumber: 2, capacity: 2 },
                { tableNumber: 3, capacity: 4 },
                { tableNumber: 4, capacity: 4 },
                { tableNumber: 5, capacity: 4 },
                { tableNumber: 6, capacity: 6 },
                { tableNumber: 7, capacity: 6 },
                { tableNumber: 8, capacity: 8 },
                { tableNumber: 9, capacity: 8 },
                { tableNumber: 10, capacity: 10 },
            ]);
            console.log('10 tables seeded successfully');
        }
        else {
            console.log(`Tables already exist (${existingTables} found), skipping.`);
        }

        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error.message);

        process.exit(1);
    }
};

seedData();