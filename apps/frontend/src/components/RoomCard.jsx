import React from 'react';
import { motion } from 'framer-motion';
import { Users, Bed, ArrowRight, Ban } from 'lucide-react';

export default function RoomCard({ roomClass, onBookClick }) {
  const isFullyBooked = parseInt(roomClass.available_rooms) === 0;

  const getRoomImage = (type) => {
    const t = (type || '').toLowerCase();
    
    // 1. Check for specific unique keywords FIRST
    if (t.includes('presidential') || t.includes('villa')) return "/images/room-presidential.png";
    if (t.includes('courtyard')) return "/images/room-courtyard.png";
    if (t.includes('royal')) return "/images/room-royal.png";
    if (t.includes('maharaja')) return "/images/room-maharaja.png";
    if (t.includes('deluxe')) return "/images/room-delux.png";
    if (t.includes('standard')) return "/images/room-standard.png";
    
    // 2. Generic fallbacks LAST
    if (t.includes('suite')) return "/images/room-maharaja.png"; // Fallback for any other type of suite
    return "/images/room-heritage.png"; 
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      whileHover={!isFullyBooked ? { y: -6, scale: 1.02 } : { scale: 1.0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`bg-white border border-zinc-200 rounded-lg overflow-hidden group flex flex-col h-full transition-shadow relative ${
        isFullyBooked 
          ? 'shadow-inner opacity-75 cursor-not-allowed' 
          : 'hover:shadow-[0_15px_35px_-10px_rgba(0,0,0,0.1)]'
      }`}
    >
      {/* Availability Badge */}
      {!isFullyBooked ? (
        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md text-zinc-900 px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.2em] z-10 rounded-sm shadow-sm">
          {roomClass.available_rooms} Available
        </div>
      ) : (
        <div className="absolute top-2.5 right-2.5 bg-zinc-900/90 backdrop-blur-md text-white px-2 py-0.5 text-[7px] font-bold uppercase tracking-[0.2em] z-10 rounded-sm shadow-sm">
          Fully Booked
        </div>
      )}

      {/* Panoramic Image with Fully Booked Overlay */}
      <div className="relative aspect-[2/1] overflow-hidden bg-zinc-100">
        <img 
          src={getRoomImage(roomClass.name)} 
          alt={roomClass.name}
          className={`w-full h-full object-cover transition-all duration-[1500ms] ease-out ${
            isFullyBooked 
              ? 'grayscale brightness-50 scale-105' 
              : 'group-hover:scale-110'
          }`}
        />
        <div className={`absolute inset-0 transition-opacity duration-500 ${
          isFullyBooked 
            ? 'bg-gradient-to-t from-black/70 via-black/40 to-black/20 opacity-100' 
            : 'bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100'
        }`}></div>
        
        {/* Fully Booked Center Overlay Text */}
        {isFullyBooked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10">
            <Ban size={28} className="text-white/60 mb-1.5" strokeWidth={1.5} />
            <p className="text-white/90 text-[10px] font-bold uppercase tracking-[0.3em]">Fully Booked</p>
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className={`p-3.5 flex flex-col flex-1 relative bg-white z-10 ${isFullyBooked ? 'opacity-60' : ''}`}>
        
        {/* Title Row */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-base font-serif text-zinc-900 capitalize font-bold tracking-tight group-hover:text-zinc-600 transition-colors leading-none mb-1">
              {roomClass.name}
            </h3>
            <p className="text-zinc-400 text-[8px] font-bold uppercase tracking-[0.2em]">
              {parseInt(roomClass.total_rooms)} {parseInt(roomClass.total_rooms) === 1 ? 'Room' : 'Rooms'} in Class
            </p>
          </div>
        </div>

        {/* Action / Pricing Bar */}
        <div className="mt-auto pt-2.5 flex items-end justify-between border-t border-zinc-100">
          
          <div className="flex flex-col gap-1">
            {/* Tiny Inline Utility Badges */}
            <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-medium">
              <Users size={10} className="text-zinc-400" /> 
              <span>{roomClass.capacity_adult}</span>
              <div className="w-[3px] h-[3px] bg-zinc-300 rounded-full mx-0.5"></div>
              <Bed size={10} className="text-zinc-400" />
            </div>
            
            {/* Price */}
            <p className="text-sm font-serif font-black text-zinc-900 leading-none">
              ₹{parseFloat(roomClass.base_price).toLocaleString('en-IN')} 
              <span className="text-[7px] uppercase tracking-widest text-zinc-400 font-bold font-sans ml-1">/ Night</span>
            </p>
          </div>
          
          {/* Interactive Button */}
          <button 
            onClick={() => !isFullyBooked && onBookClick(roomClass)}
            disabled={isFullyBooked}
            className={`group/btn flex items-center gap-1.5 px-3 py-1.5 text-[8px] uppercase tracking-[0.15em] font-bold transition-all rounded overflow-hidden ${
              !isFullyBooked 
                ? 'bg-zinc-900 text-white hover:bg-zinc-700 shadow-sm active:scale-95 cursor-pointer' 
                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
            }`}
          >
            {!isFullyBooked ? (
              <>Reserve <ArrowRight size={10} className="group-hover/btn:translate-x-1 transition-transform" /></>
            ) : 'Full'}
          </button>

        </div>
      </div>
    </motion.div>
  );
}