# Restaurant Reservation Management System

A full-stack web application for managing restaurant table reservations. The system allows customers to book tables for specific dates and time slots, preventing double booking and capacity violations. It also provides an administrative interface for managing all reservations and tables.

## Technologies Used
- Frontend: React (Vite), Tailwind CSS v3, React Router v6, Axios
- Backend: Node.js, Express.js
- Database: MongoDB, Mongoose
- Authentication: JSON Web Tokens (JWT), bcryptjs

## Setup Instructions

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (running locally or a MongoDB Atlas URI)

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://127.0.0.1:27017/restaurant_reservation
   JWT_SECRET=your_jwt_secret_key_here
   ```
4. Run the database seeder to create the default Admin account and initial tables:
   ```bash
   node test/seedAdmin.js
   node test/seedTables.js
   ```
5. Start the backend server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:3000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### 4. Default Admin Credentials
- Email: admin@restaurant.com
- Password: admin123

## Architecture & Logic

### Assumptions
- The restaurant operates on fixed hourly time slots (e.g., 18:00 - 19:00).
- Tables have fixed capacities and a reservation is assigned to a single table.
- A user can book multiple tables for different times, but the system assumes one table per reservation record.

### Reservation Availability and Conflict Logic
The system prevents double booking through two layers of validation:
1. **Application Logic:** When a customer requests a reservation, the system queries the database for tables with sufficient capacity. It then filters out any tables that already have an active (`booked`) reservation for the requested date and time slot. The first available table is assigned.
2. **Database Constraints:** A compound unique index exists on the `Reservation` collection for the fields `{ tableId, reservationDate, timeSlot, status }` with a partial filter expression for `status: 'booked'`. This guarantees at the database level that no two active reservations can occupy the same table at the same time.

### Role-Based Access Control (RBAC)
- **Authentication:** All protected endpoints require a valid JWT passed in the `Authorization` header as a Bearer token.
- **Authorization:** 
  - **Customers** can access their own data. Endpoints like `PATCH /reservations/:id/cancel` verify that the `userId` on the reservation matches the ID encoded in the requesting user's token.
  - **Admins** have unrestricted access to all reservations and table management routes. An `adminOnly` middleware checks if the `role` property in the user's token is exactly `admin`.

### Known Limitations
- The system currently assigns the first available table that meets the capacity requirement, rather than trying to optimize table allocation (e.g., assigning a party of 2 to a 2-top instead of a 4-top if both are available).
- Time slots are hardcoded into the application logic and database schema validation, requiring a code deployment to change operating hours.

### Improvement Opportunities with More Time
- Implement a more intelligent table allocation algorithm to maximize restaurant occupancy.
- Add email notifications (e.g., using SendGrid or Nodemailer) for booking confirmations and cancellations.
- Allow customers to book multiple tables for large parties that exceed a single table's capacity.
- Add real-time updates via WebSockets (e.g., Socket.io) so the admin dashboard reflects new bookings instantly without refreshing.
- Implement pagination for the admin reservation list to handle large datasets efficiently.
