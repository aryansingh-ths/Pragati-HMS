import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Maximize2 } from 'lucide-react';

const galleryImages = [
  { id: 1, src: "/images/gallery-1.png", alt: "Architectural Exterior", span: "col-span-2 row-span-2" },
  { id: 2, src: "/images/gallery-2.png", alt: "Interior Details", span: "col-span-1 row-span-1" },
  { id: 3, src: "/images/gallery-3.png", alt: "Signature Suite", span: "col-span-1 row-span-1" },
  { id: 4, src: "/images/gallery-4.png", alt: "Gastronomy", span: "col-span-2 row-span-1" },
  { id: 5, src: "/images/gallery-5.png", alt: "Lounge & Bar", span: "col-span-1 row-span-1" },
  { id: 6, src: "/images/gallery-6.png", alt: "Wellness Center", span: "col-span-1 row-span-1" },
];

export default function Gallery() {
  const [selectedImg, setSelectedImg] = useState(null);
  const [showAll, setShowAll] = useState(false);

  // If showAll is false, we only show the first 4 images
  const displayedImages = showAll ? galleryImages : galleryImages.slice(0, 4);

  return (
    <section id="gallery-section" className="py-24 bg-zinc-50 relative border-t border-zinc-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Gallery Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
              The Portfolio
            </p>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-serif text-zinc-900 tracking-tight"
            >
              A Curated <span className="text-zinc-400 italic font-light">Perspective.</span>
            </motion.h2>
          </div>
          
          <button 
            onClick={() => setShowAll(!showAll)}
            className="hidden md:block text-xs font-bold uppercase tracking-[0.2em] text-zinc-900 border-b border-zinc-900 hover:text-zinc-500 hover:border-zinc-500 transition-colors pb-1 cursor-pointer"
          >
            {showAll ? 'Collapse Portfolio' : 'View Full Portfolio'}
          </button>
        </div>

        {/* Dynamic Image Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 auto-rows-[200px]">
          <AnimatePresence>
            {displayedImages.map((img, index) => (
              <motion.div 
                key={img.id}
                // Each card handles its own entry animation now
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                // We use a modulo for the delay so new rows also stagger nicely
                transition={{ type: "spring", stiffness: 100, damping: 20, delay: (index % 4) * 0.1 }}
                onClick={() => setSelectedImg(img.src)}
                className={`${img.span} overflow-hidden relative group cursor-pointer bg-zinc-200`}
              >
                <img 
                  src={img.src} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1500ms] ease-out" 
                  alt={img.alt} 
                  // Helpful fallback so it doesn't stay blank if the image file is missing locally
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center bg-zinc-200 text-zinc-400 text-xs"><span>Missing Image:</span><span class="font-bold">${img.src}</span></div>`;
                  }}
                />
                
                {/* Refined Hover Overlay */}
                <div className="absolute inset-0 bg-zinc-900/0 group-hover:bg-zinc-900/20 transition-colors duration-500 flex items-center justify-center backdrop-blur-[0px] group-hover:backdrop-blur-[2px]">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 flex items-center gap-2 bg-white/95 text-zinc-900 px-5 py-2 text-[10px] uppercase tracking-widest font-bold shadow-lg">
                    <Maximize2 size={12} /> Expand
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mobile View More Button */}
        <div className="mt-12 text-center md:hidden">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-900 border-b border-zinc-900 hover:text-zinc-500 transition-colors pb-1 cursor-pointer"
            >
              {showAll ? 'Collapse Portfolio' : 'View Full Portfolio'}
            </button>
        </div>
      </div>

      {/* Cinematic Full-Screen Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)} 
            className="fixed inset-0 z-[100] bg-zinc-950/95 backdrop-blur-xl flex items-center justify-center p-4 sm:p-12 cursor-zoom-out"
          >
            <button 
              onClick={() => setSelectedImg(null)}
              className="absolute top-6 right-6 md:top-8 md:right-8 text-zinc-400 hover:text-white transition-colors z-50 cursor-pointer bg-zinc-900/50 p-3 rounded-full hover:bg-zinc-800"
            >
              <X size={24} strokeWidth={2} />
            </button>
            <motion.img 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedImg} 
              alt="Expanded view" 
              className="max-w-full max-h-full object-contain shadow-2xl border border-zinc-800"
              onClick={(e) => e.stopPropagation()} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}