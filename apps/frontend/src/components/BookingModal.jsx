import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, CreditCard, CheckCircle, User, Mail, Phone, Users, FileText } from 'lucide-react';

export default function BookingModal({ roomClass, onClose }) {
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestIdNumber, setGuestIdNumber] = useState('');
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [status, setStatus] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights * roomClass.base_price : 0;
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const response = await fetch('http://localhost:3000/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone,
          guest_id_number: guestIdNumber,
          room_type_id: roomClass.room_type_id,
          check_in_date: checkIn,
          check_out_date: checkOut,
          total_price: calculateTotal(),
          source: 'DIRECT'
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || data.error || 'Validation failed');
      setStatus('success');
      setTimeout(() => onClose(), 1800);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
      >
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden relative max-h-[90vh] flex flex-col">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Book {roomClass.name}</h2>
              <p className="text-xs text-cyan-600 font-medium">{roomClass.name} Package</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"><X size={20} /></button>
          </div>

          <form onSubmit={handleBooking} className="p-5 space-y-4 overflow-y-auto">
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                <div className="relative">
                  <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <input type="text" required placeholder="John Doe" onChange={(e) => setGuestName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-2 text-xs text-slate-800 outline-none focus:border-cyan-500 transition-all" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input type="email" required placeholder="john@example.com" onChange={(e) => setGuestEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-2 text-xs text-slate-800 outline-none focus:border-cyan-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Contact Details</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <Phone size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input type="tel" placeholder="Phone Number" required value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-2 text-xs text-slate-800 outline-none focus:border-cyan-500 transition-all" />
                    </div>
                    <div className="relative">
                      <FileText size={14} className="absolute left-3 top-2.5 text-slate-400" />
                      <input type="text" placeholder="Govt. ID Number" required value={guestIdNumber} onChange={(e) => setGuestIdNumber(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-2 text-xs text-slate-800 outline-none focus:border-cyan-500 transition-all" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Check-In</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input type="date" required onChange={(e) => setCheckIn(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-2 text-xs text-slate-800 outline-none focus:border-cyan-500 transition-all" />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Check-Out</label>
                  <div className="relative">
                    <Calendar size={14} className="absolute left-3 top-2.5 text-slate-400" />
                    <input type="date" required onChange={(e) => setCheckOut(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-2 text-xs text-slate-800 outline-none focus:border-cyan-500 transition-all" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Number of Guests</label>
                <div className="relative">
                  <Users size={14} className="absolute left-3 top-2.5 text-slate-400" />
                  <select value={numberOfGuests} onChange={(e) => setNumberOfGuests(parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-2 text-xs text-slate-800 outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer">
                    {[1, 2, 3, 4, 5, 6].map(num => (
                      <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex justify-between items-center">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium"><CreditCard size={14} /> Total Estimate</div>
              <span className="text-lg font-black text-slate-900">₹{calculateTotal().toLocaleString('en-IN')}</span>
            </div>

            {status === 'error' && <div className="text-rose-600 text-xs bg-rose-50 border border-rose-200 p-2.5 rounded-lg text-center font-medium">{errorMessage}</div>}
            {status === 'success' && <div className="text-emerald-600 text-xs bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg flex items-center justify-center gap-1.5 font-bold"><CheckCircle size={14} /> Reservation Confirmed!</div>}
            {numberOfGuests > 3 && <div className="text-amber-600 text-xs bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-center font-medium">For more than 3 guests, please book an additional room.</div>}

            <motion.button whileTap={{ scale: 0.98 }} disabled={status === 'loading' || status === 'success' || calculateTotal() <= 0 || numberOfGuests > 3} className={`w-full py-2.5 rounded-xl font-bold text-xs text-white shadow-xs transition-all ${status === 'loading' || calculateTotal() <= 0 || numberOfGuests > 3 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-950 hover:bg-slate-800 cursor-pointer'}`}>
              {status === 'loading' ? 'Processing Transaction...' : 'Confirm Hotel Booking'}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}