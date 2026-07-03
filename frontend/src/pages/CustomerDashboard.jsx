import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import api from '../api/axios.js';

const TIME_SLOTS = [
    '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00',
    '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00',
];

const StatusBadge = ({ status }) => {
    if (status === 'booked') return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
            ● Booked
        </span>
    );
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            ✕ Cancelled
        </span>
    );
};

export default function CustomerDashboard() {
    const [reservations, setReservations] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [form, setForm] = useState({ reservationDate: '', timeSlot: '', guestCount: 1 });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [cancellingId, setCancellingId] = useState(null);

    const fetchReservations = async () => {
        try {
            const { data } = await api.get('/reservations/me');
            setReservations(data);
        } catch (err) {
            console.error('Failed to fetch reservations:', err);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => { fetchReservations(); }, []);

    const handleChange = (e) => {
        const val = e.target.name === 'guestCount' ? Number(e.target.value) : e.target.value;
        setForm({ ...form, [e.target.name]: val });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        setSubmitting(true);
        try {
            const { data } = await api.post('/reservations', form);
            setFormSuccess(`Table #${data.reservation.tableNumber} reserved successfully!`);
            setForm({ reservationDate: '', timeSlot: '', guestCount: 1 });
            fetchReservations();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to create reservation.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
        setCancellingId(id);
        try {
            await api.patch(`/reservations/${id}/cancel`);
            fetchReservations();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel reservation.');
        } finally {
            setCancellingId(null);
        }
    };

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />

            <main className="max-w-7xl mx-auto px-6 py-10">

                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white">My Reservations</h2>
                    <p className="text-gray-400 text-sm mt-1">Book a table or manage your existing reservations.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">

                    <div className="lg:col-span-2">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-5">Make a Reservation</h3>

                            {formError && (
                                <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">
                                    {formError}
                                </div>
                            )}
                            {formSuccess && (
                                <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg px-4 py-3 text-sm">
                                    {formSuccess}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Date</label>
                                    <input
                                        type="date"
                                        name="reservationDate"
                                        value={form.reservationDate}
                                        onChange={handleChange}
                                        min={today}
                                        required
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Time Slot</label>
                                    <select
                                        name="timeSlot"
                                        value={form.timeSlot}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                    >
                                        <option value="">Select a time slot</option>
                                        {TIME_SLOTS.map(slot => (
                                            <option key={slot} value={slot}>{slot}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                        Number of Guests
                                    </label>
                                    <input
                                        type="number"
                                        name="guestCount"
                                        value={form.guestCount}
                                        onChange={handleChange}
                                        min={1}
                                        max={10}
                                        required
                                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25 hover:-translate-y-0.5 mt-2"
                                >
                                    {submitting ? 'Booking...' : 'Book Table'}
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="lg:col-span-3">
                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                            <h3 className="text-lg font-semibold text-white mb-5">
                                Your Bookings
                                <span className="ml-2 text-xs font-normal text-gray-500">({reservations.length} total)</span>
                            </h3>

                            {loadingList ? (
                                <div className="text-center py-12 text-gray-500">Loading reservations...</div>
                            ) : reservations.length === 0 ? (
                                <div className="text-center py-12">
                                    <div className="text-4xl mb-3"></div>
                                    <p className="text-gray-400 font-medium">No reservations yet</p>
                                    <p className="text-gray-600 text-sm mt-1">Use the form to book your first table.</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {reservations.map((r) => (
                                        <div
                                            key={r._id}
                                            className={`rounded-xl border p-4 transition-all ${r.status === 'cancelled'
                                                ? 'bg-gray-800/40 border-gray-700/50 opacity-60'
                                                : 'bg-gray-800 border-gray-700 hover:border-gray-600'}`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <span className="text-white font-semibold text-sm">
                                                            Table #{r.tableId?.tableNumber}
                                                        </span>
                                                        <span className="text-gray-600 text-xs">·</span>
                                                        <span className="text-gray-400 text-xs">
                                                            Capacity: {r.tableId?.capacity}
                                                        </span>
                                                        <StatusBadge status={r.status} />
                                                    </div>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
                                                        <span> {r.reservationDate}</span>
                                                        <span> {r.timeSlot}</span>
                                                        <span> {r.guestCount} guest{r.guestCount > 1 ? 's' : ''}</span>
                                                    </div>
                                                </div>

                                                {r.status === 'booked' && (
                                                    <button
                                                        onClick={() => handleCancel(r._id)}
                                                        disabled={cancellingId === r._id}
                                                        className="shrink-0 text-xs bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white px-3 py-1.5 rounded-lg transition-all duration-200 disabled:opacity-50"
                                                    >
                                                        {cancellingId === r._id ? 'Cancelling...' : 'Cancel'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
