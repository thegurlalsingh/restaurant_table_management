import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import api from '../api/axios.js';

const TIME_SLOTS = [
    '12:00 - 13:00', '13:00 - 14:00', '14:00 - 15:00', '15:00 - 16:00',
    '18:00 - 19:00', '19:00 - 20:00', '20:00 - 21:00', '21:00 - 22:00',
];

const StatusBadge = ({ status }) => {
    if (status === 'booked') return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">Booked</span>
    );
    return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Cancelled</span>
    );
};

// ---- Edit Reservation Modal ----
function EditModal({ reservation, onClose, onSaved }) {
    const [form, setForm] = useState({
        reservationDate: reservation.reservationDate,
        timeSlot: reservation.timeSlot,
        guestCount: reservation.guestCount,
        status: reservation.status,
    });
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        const val = e.target.name === 'guestCount' ? Number(e.target.value) : e.target.value;
        setForm({ ...form, [e.target.name]: val });
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setError('');
        setSaving(true);
        try {
            await api.patch(`/admin/reservations/${reservation._id}`, form);
            onSaved();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update reservation.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
                <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-semibold text-white">Edit Reservation</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-xl leading-none">✕</button>
                </div>

                {error && (
                    <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">⚠️ {error}</div>
                )}

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Date</label>
                        <input type="date" name="reservationDate" value={form.reservationDate} onChange={handleChange} required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Time Slot</label>
                        <select name="timeSlot" value={form.timeSlot} onChange={handleChange} required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all">
                            {TIME_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Guests</label>
                        <input type="number" name="guestCount" value={form.guestCount} onChange={handleChange} min={1} max={10} required
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Status</label>
                        <select name="status" value={form.status} onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all">
                            <option value="booked">Booked</option>
                            <option value="cancelled">Cancelled</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose}
                            className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold py-2.5 rounded-lg transition-all border border-gray-700 text-sm">
                            Cancel
                        </button>
                        <button type="submit" disabled={saving}
                            className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all text-sm">
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ---- Main Admin Dashboard ----
export default function AdminDashboard() {
    const [reservations, setReservations] = useState([]);
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('reservations'); // 'reservations' | 'tables'
    const [dateFilter, setDateFilter] = useState('');
    const [editingReservation, setEditingReservation] = useState(null);
    const [cancellingId, setCancellingId] = useState(null);

    // Table management state
    const [tableForm, setTableForm] = useState({ tableNumber: '', capacity: '' });
    const [tableFormError, setTableFormError] = useState('');
    const [tableFormSuccess, setTableFormSuccess] = useState('');
    const [savingTable, setSavingTable] = useState(false);
    const [deletingTableId, setDeletingTableId] = useState(null);

    const fetchReservations = async (date = '') => {
        setLoading(true);
        try {
            const url = date ? `/admin/reservations?date=${date}` : '/admin/reservations';
            const { data } = await api.get(url);
            setReservations(data);
        } catch (err) {
            console.error('Failed to fetch reservations:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTables = async () => {
        try {
            const { data } = await api.get('/admin/tables');
            setTables(data);
        } catch (err) {
            console.error('Failed to fetch tables:', err);
        }
    };

    useEffect(() => {
        fetchReservations();
        fetchTables();
    }, []);

    const handleDateFilter = (e) => {
        setDateFilter(e.target.value);
        fetchReservations(e.target.value);
    };

    const clearFilter = () => {
        setDateFilter('');
        fetchReservations('');
    };

    const handleCancelReservation = async (id) => {
        if (!window.confirm('Cancel this reservation?')) return;
        setCancellingId(id);
        try {
            await api.patch(`/admin/reservations/${id}/cancel`);
            fetchReservations(dateFilter);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to cancel.');
        } finally {
            setCancellingId(null);
        }
    };

    const handleCreateTable = async (e) => {
        e.preventDefault();
        setTableFormError('');
        setTableFormSuccess('');
        setSavingTable(true);
        try {
            await api.post('/admin/tables', {
                tableNumber: Number(tableForm.tableNumber),
                capacity: Number(tableForm.capacity),
            });
            setTableFormSuccess(`✅ Table #${tableForm.tableNumber} created successfully!`);
            setTableForm({ tableNumber: '', capacity: '' });
            fetchTables();
        } catch (err) {
            setTableFormError(err.response?.data?.message || 'Failed to create table.');
        } finally {
            setSavingTable(false);
        }
    };

    const handleDeleteTable = async (id, tableNumber) => {
        if (!window.confirm(`Delete Table #${tableNumber}? This cannot be undone.`)) return;
        setDeletingTableId(id);
        try {
            await api.delete(`/admin/tables/${id}`);
            fetchTables();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete table.');
        } finally {
            setDeletingTableId(null);
        }
    };

    const bookedCount = reservations.filter(r => r.status === 'booked').length;
    const cancelledCount = reservations.filter(r => r.status === 'cancelled').length;

    return (
        <div className="min-h-screen bg-gray-950">
            <Navbar />
            {editingReservation && (
                <EditModal
                    reservation={editingReservation}
                    onClose={() => setEditingReservation(null)}
                    onSaved={() => fetchReservations(dateFilter)}
                />
            )}

            <main className="max-w-7xl mx-auto px-6 py-10">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
                    <p className="text-gray-400 text-sm mt-1">Manage all reservations and tables.</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Total</p>
                        <p className="text-3xl font-bold text-white mt-1">{reservations.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Reservations</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Active</p>
                        <p className="text-3xl font-bold text-violet-400 mt-1">{bookedCount}</p>
                        <p className="text-xs text-gray-500 mt-1">Booked</p>
                    </div>
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Tables</p>
                        <p className="text-3xl font-bold text-amber-400 mt-1">{tables.length}</p>
                        <p className="text-xs text-gray-500 mt-1">Available</p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 mb-6 bg-gray-900 border border-gray-800 rounded-xl p-1 w-fit">
                    <button
                        onClick={() => setActiveTab('reservations')}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'reservations' ? 'bg-violet-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Reservations
                    </button>
                    <button
                        onClick={() => setActiveTab('tables')}
                        className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'tables' ? 'bg-violet-600 text-white shadow' : 'text-gray-400 hover:text-white'}`}
                    >
                        Tables
                    </button>
                </div>

                {/* ---- RESERVATIONS TAB ---- */}
                {activeTab === 'reservations' && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                        {/* Filter Bar */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="flex items-center gap-2">
                                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap">Filter by Date:</label>
                                <input
                                    type="date"
                                    value={dateFilter}
                                    onChange={handleDateFilter}
                                    className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-500 transition-all"
                                />
                            </div>
                            {dateFilter && (
                                <button onClick={clearFilter}
                                    className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-2 rounded-lg transition-all">
                                    Clear
                                </button>
                            )}
                            <span className="ml-auto text-xs text-gray-500">{reservations.length} result{reservations.length !== 1 ? 's' : ''}</span>
                        </div>

                        {/* Table */}
                        {loading ? (
                            <div className="text-center py-12 text-gray-500">Loading...</div>
                        ) : reservations.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-4xl mb-3">📋</div>
                                <p className="text-gray-400 font-medium">No reservations found</p>
                                {dateFilter && <p className="text-gray-600 text-sm mt-1">Try clearing the date filter.</p>}
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-xl border border-gray-800">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-800 bg-gray-800/50">
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Customer</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Table</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Time Slot</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Guests</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-800">
                                        {reservations.map((r) => (
                                            <tr key={r._id} className={`transition-colors ${r.status === 'cancelled' ? 'opacity-50' : 'hover:bg-gray-800/50'}`}>
                                                <td className="px-4 py-3">
                                                    <div className="text-white font-medium">{r.userId?.name}</div>
                                                    <div className="text-gray-500 text-xs">{r.userId?.email}</div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-300">#{r.tableId?.tableNumber} <span className="text-gray-600 text-xs">(cap: {r.tableId?.capacity})</span></td>
                                                <td className="px-4 py-3 text-gray-300">{r.reservationDate}</td>
                                                <td className="px-4 py-3 text-gray-300 whitespace-nowrap">{r.timeSlot}</td>
                                                <td className="px-4 py-3 text-gray-300">{r.guestCount}</td>
                                                <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setEditingReservation(r)}
                                                            className="text-xs bg-gray-700 hover:bg-violet-600 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-all border border-gray-600 hover:border-violet-500"
                                                        >
                                                            Edit
                                                        </button>
                                                        {r.status === 'booked' && (
                                                            <button
                                                                onClick={() => handleCancelReservation(r._id)}
                                                                disabled={cancellingId === r._id}
                                                                className="text-xs bg-red-500/10 hover:bg-red-500 border border-red-500/20 hover:border-red-500 text-red-400 hover:text-white px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                                                            >
                                                                {cancellingId === r._id ? '...' : 'Cancel'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {/* ---- TABLES TAB ---- */}
                {activeTab === 'tables' && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
                        {/* Add Table Form */}
                        <div className="lg:col-span-2">
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-5">Add New Table</h3>
                                {tableFormError && <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 text-sm">⚠️ {tableFormError}</div>}
                                {tableFormSuccess && <div className="mb-4 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg px-4 py-3 text-sm">{tableFormSuccess}</div>}
                                <form onSubmit={handleCreateTable} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Table Number</label>
                                        <input type="number" value={tableForm.tableNumber}
                                            onChange={e => setTableForm({ ...tableForm, tableNumber: e.target.value })}
                                            placeholder="e.g. 11" min={1} required
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Capacity</label>
                                        <input type="number" value={tableForm.capacity}
                                            onChange={e => setTableForm({ ...tableForm, capacity: e.target.value })}
                                            placeholder="e.g. 4" min={1} required
                                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all" />
                                    </div>
                                    <button type="submit" disabled={savingTable}
                                        className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-violet-500/25">
                                        {savingTable ? 'Adding...' : 'Add Table'}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Tables List */}
                        <div className="lg:col-span-3">
                            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                                <h3 className="text-lg font-semibold text-white mb-5">
                                    All Tables
                                    <span className="ml-2 text-xs font-normal text-gray-500">({tables.length} total)</span>
                                </h3>
                                {tables.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">No tables found.</div>
                                ) : (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        {tables.map(t => (
                                            <div key={t._id} className="bg-gray-800 border border-gray-700 rounded-xl p-4 flex flex-col gap-2 hover:border-gray-600 transition-all">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-white font-semibold text-sm">Table #{t.tableNumber}</p>
                                                        <p className="text-gray-400 text-xs mt-0.5">👥 {t.capacity} seats</p>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDeleteTable(t._id, t.tableNumber)}
                                                        disabled={deletingTableId === t._id}
                                                        className="text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-red-400 px-4 py-2 rounded-lg transition-all duration-200 border border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Delete table"
                                                    >
                                                        {deletingTableId === t._id ? "..." : "Delete Table"}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
