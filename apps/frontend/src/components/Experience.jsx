import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

// Modern, universally appealing luxury hospitality content
const modernExperiences = [
  {
    title: "Signature Wellness",
    subtitle: "Holistic Spa & Recovery",
    desc: "A sanctuary of tranquility offering personalized hydrotherapy, mindfulness sessions, and bespoke massage treatments.",
    image: "/images/exp-wellness.png",
    span: "md:col-span-2 md:row-span-2", // Makes this the large feature block
  },
  {
    title: "Curated Gastronomy",
    subtitle: "The Chef's Table",
    desc: "An intimate, multi-course tasting menu exploring seasonal, locally-sourced ingredients.",
    image: "/images/exp-dining.png",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    title: "Guided Excursions",
    subtitle: "Local Immersion",
    desc: "Private, expert-led tours designed to connect you authentically with the local culture and landscape.",
    image: "/images/exp-tour.png",
    span: "md:col-span-1 md:row-span-1",
  }
];

// Vibrant, smooth animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { type: "spring", stiffness: 80, damping: 20 } 
  }
};

export default function Experience() {
  return (
    <section id="experience-section" className="py-24 bg-zinc-50 overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-4">
              Curated Programming
            </p>
            <motion.h2 
              initial={{ opacity: 0, x: -20 }} 
              whileInView={{ opacity: 1, x: 0 }} 
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-4xl md:text-5xl font-serif text-zinc-900 tracking-tight leading-tight"
            >
              Immersive <br className="hidden md:block" />
              <span className="text-zinc-400 italic font-light">Experiences.</span>
            </motion.h2>
          </div>
          
          <motion.button 
            initial={{ opacity: 0, x: 20 }} 
            whileInView={{ opacity: 1, x: 0 }} 
            viewport={{ once: true }}
            className="text-xs font-semibold uppercase tracking-widest text-zinc-900 border-b border-zinc-900 pb-1 hover:text-zinc-500 hover:border-zinc-500 transition-colors"
          >
            View All Activities
          </motion.button>
        </div>

        {/* Editorial Bento Box Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px]"
        >
          {modernExperiences.map((item, index) => (
            <motion.div 
              key={index}
              variants={cardVariants}
              className={`${item.span} relative overflow-hidden group rounded-sm bg-zinc-200 cursor-pointer`}
            >
              {/* Background Image Engine */}
              <img 
                src={item.image} 
                alt={item.title} 
                className="w-full h-full object-cover transition-transform duration-[1500ms] group-hover:scale-105"
              />
              
              {/* Dark Gradient Overlay for Text Readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-900/20 to-transparent transition-opacity duration-500 group-hover:from-zinc-950"></div>
              
              {/* Card Content Overlay */}
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <p className="text-zinc-300 text-[10px] font-semibold uppercase tracking-[0.2em] mb-2">
                    {item.subtitle}
                  </p>
                  <h3 className="text-2xl md:text-3xl font-serif text-white mb-3 tracking-wide">
                    {item.title}
                  </h3>
                  
                  {/* Hidden description that reveals on hover */}
                  <div className="overflow-hidden">
                    <p className="text-sm text-zinc-400 font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 max-w-md">
                      {item.desc}
                    </p>
                  </div>
                </div>

                {/* Top Right Action Icon */}
                <div className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                  <ArrowUpRight size={18} />
                </div>
              </div>

            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}