import React from 'react';
import { motion } from 'framer-motion';
import { Flower2, Coffee, Bath, Car, Wifi, UtensilsCrossed } from 'lucide-react';

// Updated copy to appeal to both modern and traditional hospitality clients
const modernAmenities = [
  { icon: <Flower2 size={20} />, title: "Signature Wellness", desc: "Premium therapeutic lounges, custom wellness treatments, and aromatherapy sessions." },
  { icon: <Bath size={20} />, title: "Thermal Pools", desc: "Temperature-controlled infinity pools engineered to integrate with local landscape views." },
  { icon: <UtensilsCrossed size={20} />, title: "24/7 Fine Dining", desc: "Curated room service options alongside fully integrated digital dining features." },
  { icon: <Car size={20} />, title: "Chauffeur Service", desc: "Complimentary airport and local transfers available for premium booking tier guests." },
  { icon: <Wifi size={20} />, title: "Enterprise Connectivity", desc: "High-speed multi-node Wi-Fi grids seamlessly active across all property structures." },
  { icon: <Coffee size={20} />, title: "Lounge & Artisanal Tea", desc: "Daily signature high tea collections, fresh pastries, and boutique bean curations." }
];

// Vibrant spring animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: "blur(0px)",
    transition: { type: "spring", stiffness: 90, damping: 20 } 
  }
};

export default function Amenities() {
  return (
    <section id="amenities-section" className="py-24 bg-white border-t border-zinc-200 overflow-hidden relative">
      
      {/* Decorative Top Accent Glow to tie into the Peach Footer/Theme updates */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[1px] bg-gradient-to-r from-transparent via-orange-200/50 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">Curated Privileges</p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-serif text-zinc-900 tracking-tight"
          >
            Property <span className="text-zinc-400 italic font-light">Amenities.</span>
          </motion.h2>
          <div className="w-12 h-[1px] bg-orange-200 mx-auto mt-6" />
        </div>

        {/* Interactive Responsive Grid Container */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          {modernAmenities.map((item, index) => (
            <motion.div 
              key={index}
              variants={cardVariants}
              whileHover={{ y: -6, scale: 1.01 }}
              className="group p-6 bg-zinc-50/50 border border-zinc-200/60 rounded-xl flex items-start gap-4 transition-all duration-300 hover:bg-white hover:border-orange-100 hover:shadow-[0_15px_30px_-10px_rgba(251,146,60,0.05)] cursor-default"
            >
              {/* Dynamic Icon Wrapper */}
              <div className="shrink-0 text-zinc-500 p-3.5 bg-white border border-zinc-200 rounded-xl shadow-xs group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 group-hover:scale-110 transition-all duration-300">
                {item.icon}
              </div>
              
              <div className="pt-1">
                <h3 className="text-base font-serif text-zinc-900 font-bold mb-1.5 tracking-tight group-hover:text-zinc-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-zinc-500 font-light leading-relaxed pr-2">
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
        
      </div>
    </section>
  );
}