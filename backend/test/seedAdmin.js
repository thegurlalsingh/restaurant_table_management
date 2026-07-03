import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/user.js';

dotenv.config({ path: "../.env" });

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected for seeding...');

        const existingAdmin = await User.findOne({ email: 'admin@restaurant.com' });

        if (!existingAdmin) {
            await User.create({
                name: 'Restaurant Admin',
                email: 'admin@restaurant.com',
                passwordHash: 'admin123',
                role: 'admin',
            });

            console.log('Admin user created: admin@restaurant.com / admin123');
        }
        else {
            console.log('Admin user already exists, skipping.');
        }

        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error.message);

        process.exit(1);
    }
};

seedData();
