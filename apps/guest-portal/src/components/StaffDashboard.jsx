import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, AlertCircle, Wrench, HelpCircle } from 'lucide-react';
import BookingsLog from './BookingsLog';

export default function StaffDashboard({ token }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/rooms');
      const json = await response.json();
      setRooms(json.data.rooms);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRooms(); }, []);

  const updateStatus = async (roomId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/api/rooms/${roomId}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` // Presenting the security badge to the backend!
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setRooms(rooms.map(r => r.room_id === roomId ? { ...r, status: newStatus } : r));
      } else {
        const errorData = await response.json();
        alert(`Update failed: ${errorData.error || 'Unauthorized'}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'AVAILABLE': return <CheckCircle2 size={14} className="text-emerald-600" />;
      case 'CLEANING': return <Sparkles size={14} className="text-cyan-600" />;
      case 'DIRTY': return <AlertCircle size={14} className="text-amber-600" />;
      case 'MAINTENANCE': return <Wrench size={14} className="text-rose-600" />;
      default: return <HelpCircle size={14} className="text-slate-500" />;
    }
  };

  if (loading) return <div className="text-center py-20 text-slate-500 text-sm">Loading Live Operations Grid...</div>;

  return (
    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-xl font-bold text-slate-900">Operations Control Center</h2>
        <p className="text-xs text-slate-500 mt-0.5">Real-time status configurations and housekeeping tracks.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-[10px] font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-3.5">Room Number</th>
              <th className="px-6 py-3.5">Classification</th>
              <th className="px-6 py-3.5">Live Status</th>
              <th className="px-6 py-3.5 text-right">Operational State Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rooms.map((room) => (
              <tr key={room.room_id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">{room.room_number}</td>
                <td className="px-6 py-4 text-cyan-700 font-medium">{room.room_type}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    {getStatusIcon(room.status)}
                    {room.status}
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <select 
                    value={room.status}
                    onChange={(e) => updateStatus(room.room_id, e.target.value)}
                    className="bg-white border border-slate-300 text-slate-800 text-xs rounded-lg p-1.5 outline-none cursor-pointer max-w-[160px] inline-block"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="OCCUPIED">Occupied</option>
                    <option value="CLEANING">Cleaning</option>
                    <option value="DIRTY">Dirty</option>
                    <option value="MAINTENANCE">Maintenance</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <BookingsLog token={token} />
    </motion.div>
  );
}