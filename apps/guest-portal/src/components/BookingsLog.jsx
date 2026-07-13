import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Trash2 } from 'lucide-react';

export default function BookingsLog({ token }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookingsLog = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/bookings');
      const json = await response.json();
      setBookings(json.data.bookings);
    } catch (err) {
      console.error('Failed to pull booking records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookingsLog(); }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you absolutely sure you want to cancel this booking?")) return;

    try {
      const response = await fetch(`http://localhost:3000/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        // Optimistically update frontend table row state to showing CANCELLED
        setBookings(bookings.map(b => b.booking_id === bookingId ? { ...b, booking_status: 'CANCELLED' } : b));
      } else {
        const errData = await response.json();
        alert(`Cancellation failed: ${errData.error}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (loading) return <div className="text-center py-12 text-slate-500 text-xs">Parsing master reservations ledger...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Master Reservations Log</h2>
          <p className="text-xs text-slate-500 mt-0.5">Live collection of system transactions and room allocations.</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total Entries</span>
          <span className="text-2xl font-black text-slate-900">{bookings.length}</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Guest Details</th>
              <th className="px-6 py-3.5">Room Info</th>
              <th className="px-6 py-3.5">Schedule Allocation</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Total Billing</th>
              <th className="px-6 py-3.5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {bookings.map((log) => (
              <tr key={log.booking_id} className="hover:bg-slate-50/40 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold">{log.guest_name?.[0] || 'G'}</div>
                    <div>
                      <p className="font-bold text-slate-900">{log.guest_name}</p>
                      <p className="text-[10px] text-slate-400">{log.guest_email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <p className="font-bold text-slate-900">Room {log.room_number}</p>
                  <p className="text-[10px] font-medium text-cyan-600 uppercase tracking-wide">{log.room_type}</p>
                </td>
                <td className="px-6 py-4 text-slate-700 font-medium">
                  <div className="flex items-center gap-1">
                    <Calendar size={12} className="text-slate-400" />
                    <span>{formatDate(log.check_in_date)}</span>
                    <span className="text-slate-300 mx-1">→</span>
                    <span>{formatDate(log.check_out_date)}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                    log.booking_status === 'CANCELLED' 
                      ? 'bg-rose-50 text-rose-600 border-rose-100' 
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {log.booking_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-black text-slate-900 text-sm">
                  ₹{parseFloat(log.total_price).toLocaleString('en-IN')}
                </td>
                <td className="px-6 py-4 text-center">
                  <button
                    disabled={log.booking_status === 'CANCELLED'}
                    onClick={() => handleCancel(log.booking_id)}
                    className={`p-2 rounded-xl transition-all ${
                      log.booking_status === 'CANCELLED'
                        ? 'text-slate-300 bg-slate-50 cursor-not-allowed'
                        : 'text-rose-500 hover:text-rose-700 hover:bg-rose-50 cursor-pointer'
                    }`}
                    title="Cancel Booking"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}