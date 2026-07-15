import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

// Updated for universal modern luxury (SaaS ready)
const modernDiningVenues = [
  { 
    title: "The Signature Room", 
    subtitle: "Fine Dining",
    desc: "A masterclass in contemporary gastronomy, featuring seasonal tasting menus and an award-winning cellar.", 
    image: "/images/dining-1.png" 
  },
  { 
    title: "Terrace & Vine", 
    subtitle: "Al Fresco",
    desc: "Global cuisine served under the open sky. The perfect setting for golden hour cocktails and light Mediterranean fare.", 
    image: "/images/dining-2.png" 
  },
  { 
    title: "The Reserve Lounge", 
    subtitle: "Spirits & Cigars",
    desc: "An intimate, moody enclave pouring rare single malts, artisanal spirits, and classic handcrafted cocktails.", 
    image: "/images/dining-3.png" 
  }
];

// Framer Motion Animation Sequence
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 80, damping: 20 } 
  }
};

export default function Dining() {
  return (
    <section id="dining-section" className="py-32 bg-white relative overflow-hidden">
      
      {/* Background Accent Lines */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-zinc-200 to-transparent"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Modern Header - Left Aligned for an editorial feel */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
              Culinary Excellence
            </p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }} 
              whileInView={{ opacity: 1, y: 0 }} 
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-serif text-zinc-900 tracking-tight"
            >
              Taste the <span className="text-zinc-400 italic font-light">Extraordinary.</span>
            </motion.h2>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="hidden md:block text-zinc-500 font-light max-w-sm text-sm"
          >
            From Michelin-caliber tasting menus to casual sunset lounges, our dining venues are destinations in themselves.
          </motion.div>
        </div>

        {/* Editorial Staggered Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12"
        >
          {modernDiningVenues.map((venue, index) => (
            <motion.div 
              key={index}
              variants={itemVariants}
              // The magic stagger: pushes the middle column down on desktop screens
              className={`group cursor-pointer flex flex-col ${index === 1 ? 'md:mt-16' : ''}`}
            >
              {/* Image Container */}
              <div className="relative overflow-hidden bg-zinc-100 aspect-[3/4] mb-6">
                <img 
                  src={venue.image} 
                  alt={venue.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1500ms] ease-out" 
                />
                
                {/* Hover Overlay Button */}
                <div className="absolute inset-0 bg-zinc-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="bg-white text-zinc-900 px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl">
                    Reserve Table <ArrowRight size={14} />
                  </div>
                </div>
              </div>

              {/* Minimalist Text Block */}
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-3 border-b border-zinc-100 pb-3">
                  <h3 className="text-2xl font-serif text-zinc-900 tracking-tight group-hover:text-zinc-600 transition-colors">
                    {venue.title}
                  </h3>
                  <span className="text-[9px] uppercase tracking-[0.2em] font-semibold text-zinc-400">
                    {venue.subtitle}
                  </span>
                </div>
                <p className="text-sm font-light text-zinc-500 leading-relaxed">
                  {venue.desc}
                </p>
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}