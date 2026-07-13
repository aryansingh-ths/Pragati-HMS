import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Sparkles, Clock } from 'lucide-react';

// Framer Motion Sequence Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2, // This creates the sequential "loading" effect
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 20 } 
  }
};

const modularFeatures = [
  {
    icon: <Sparkles size={18} />,
    title: "Curated Aesthetics",
    desc: "Every space is designed with architectural precision."
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Unmatched Privacy",
    desc: "Exclusive access controls for a serene, secure stay."
  },
  {
    icon: <Clock size={18} />,
    title: "Intuitive Service",
    desc: "Anticipatory hospitality tailored to your rhythm."
  }
];

export default function About() {
  return (
    <section id="about-section" className="pt-32 pb-24 bg-white overflow-hidden relative">
      
      {/* Decorative Scroll Connection Line (Draws down from the hero section) */}
      <motion.div 
        initial={{ height: 0 }}
        whileInView={{ height: "80px" }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] bg-zinc-300"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          
          {/* LEFT: Architectural Image Reveal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative order-2 lg:order-1"
          >
            {/* Modern, clean rectangular crop instead of the heritage arch */}
            <div className="aspect-[4/5] overflow-hidden bg-zinc-100 relative group">
              <img 
                src="/images/about.png" // Update this image in your public folder
                alt="Modern Luxury Interior" 
                className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110" 
              />
              {/* Soft interior shadow for depth */}
              <div className="absolute inset-0 border border-black/5 z-10 pointer-events-none"></div>
            </div>
            
            {/* Minimalist offset accent block */}
            <div className="absolute -bottom-6 -right-6 w-2/3 h-1/2 bg-zinc-50 border border-zinc-200 -z-10 hidden md:block"></div>
          </motion.div>

          {/* RIGHT: Modular Content Sequence */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="flex flex-col justify-center order-1 lg:order-2"
          >
            <motion.p variants={itemVariants} className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
              The Standard
            </motion.p>
            
            <motion.h2 variants={itemVariants} className="text-4xl md:text-5xl font-serif text-zinc-900 mb-6 leading-[1.1] tracking-tight">
              Redefining Modern <br/>
              <span className="text-zinc-500 italic font-light">Hospitality.</span>
            </motion.h2>
            
            <motion.p variants={itemVariants} className="text-zinc-600 font-light leading-relaxed mb-10 text-lg">
              We bridge the gap between timeless elegance and contemporary design. Our properties serve as a canvas for elevated living, engineered to provide a seamless experience from arrival to departure.
            </motion.p>

            {/* Modular Features Grid */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-10 border-t border-zinc-100 pt-10">
              {modularFeatures.map((feature, index) => (
                <div key={index} className="flex flex-col gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-700">
                    {feature.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-900 tracking-wide">{feature.title}</h3>
                  <p className="text-xs text-zinc-500 font-light leading-relaxed pr-4">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <button className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-900 pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors">
                Discover The Portfolio
              </button>
            </motion.div>

          </motion.div>
        </div>
      </div>
    </section>
  );
}