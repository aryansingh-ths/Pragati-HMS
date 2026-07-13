import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Search, X } from 'lucide-react';

export default function Hero() {
  const [isManualGuest, setIsManualGuest] = useState(false);
  const [guestCount, setGuestCount] = useState("1 Adult");

  const handleGuestChange = (e) => {
    if (e.target.value === "manual") {
      setIsManualGuest(true);
      setGuestCount("4");
    } else {
      setGuestCount(e.target.value);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center bg-zinc-900 overflow-hidden">
      
      {/* Background Image Engine */}
      <div className="absolute inset-0 z-0">
        <motion.img 
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "easeOut" }}
          src="/images/hero-bg.png" 
          alt="Luxury Hotel Facade" 
          className="w-full h-full object-cover"
        />
        {/* Softer modern gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950/80 via-zinc-900/40 to-transparent"></div>
      </div>

      {/* Hero Content - Universally Appealing Copy */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-start mt-20 mb-24">
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-5xl md:text-6xl lg:text-7xl font-serif text-white tracking-wide leading-[1.15] mb-6 max-w-3xl drop-shadow-lg"
        >
          Elevated Luxury & <br />Timeless Comfort.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="text-base md:text-lg text-zinc-200 max-w-xl font-light leading-relaxed drop-shadow-md mb-8"
        >
          Experience a sanctuary where modern elegance meets intuitive service. Discover our signature suites, curated dining, and world-class amenities.
        </motion.p>

      </div>

      {/* Modern, Elegant Search Bar (No heavy black borders) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
        className="absolute bottom-0 left-0 w-full z-20 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
      >
        <div className="flex flex-col md:flex-row items-center w-full">
          
          {/* Check-in */}
          <div className="flex items-center flex-1 w-full px-8 py-5 md:border-r border-zinc-200 hover:bg-stone-50 transition-colors">
            <Calendar size={20} className="text-stone-500 mr-4" />
            <div className="flex flex-col w-full">
              <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-semibold mb-1">Check-in</span>
              <input type="date" className="bg-transparent text-sm font-medium text-zinc-900 outline-none w-full cursor-pointer" />
            </div>
          </div>

          {/* Check-out */}
          <div className="flex items-center flex-1 w-full px-8 py-5 md:border-r border-zinc-200 border-t md:border-t-0 hover:bg-stone-50 transition-colors">
            <Calendar size={20} className="text-stone-500 mr-4" />
            <div className="flex flex-col w-full">
              <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-semibold mb-1">Check-out</span>
              <input type="date" className="bg-transparent text-sm font-medium text-zinc-900 outline-none w-full cursor-pointer" />
            </div>
          </div>

          {/* Guests */}
          <div className="flex items-center flex-1 w-full px-8 py-5 border-t border-zinc-200 md:border-t-0 hover:bg-stone-50 transition-colors">
            <Users size={20} className="text-stone-500 mr-4" />
            <div className="flex flex-col w-full">
              <span className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 font-semibold mb-1">Guests</span>
              
              {!isManualGuest ? (
                <select 
                  value={guestCount}
                  onChange={handleGuestChange}
                  className="bg-transparent text-sm font-medium text-zinc-900 outline-none w-full cursor-pointer appearance-none"
                >
                  <option value="1 Adult">1 Adult</option>
                  <option value="2 Adults">2 Adults</option>
                  <option value="3 Adults">3 Adults</option>
                  <option value="manual">4+ Guests</option>
                </select>
              ) : (
                <div className="flex items-center w-full">
                  <input 
                    type="number" min="1" value={guestCount} onChange={(e) => setGuestCount(e.target.value)}
                    className="bg-transparent text-sm font-medium text-zinc-900 outline-none w-full border-b border-stone-300 focus:border-stone-600 pb-0.5" autoFocus
                  />
                  <button onClick={() => { setIsManualGuest(false); setGuestCount("1 Adult"); }} className="text-zinc-400 hover:text-zinc-800 ml-2">
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search Button - Modern dark tone */}
         <button
  onClick={() => document.getElementById('rooms-section')?.scrollIntoView({ behavior: 'smooth' })}
  className="flex-1 w-full self-stretch bg-orange-500 text-white px-8 py-6 md:py-0 text-xs font-bold uppercase tracking-[0.15em] hover:bg-orange-600 transition-all duration-300 flex items-center justify-center cursor-pointer shadow-md hover:shadow-lg"
>
  <Search size={16} className="mr-3" /> Check Availability
</button>

        </div>
      </motion.div>

    </div>
  );
}