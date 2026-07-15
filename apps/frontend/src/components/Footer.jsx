import React from 'react';
import { motion } from 'framer-motion';
import { Globe, MessageSquare, Send, MapPin, Phone, Mail, ArrowRight } from 'lucide-react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 90, damping: 20 } 
  }
};

// Accept scrollToSection as a prop just like the Header does
export default function Footer({ scrollToSection }) {
  
  // Custom click handler to prevent page jump and trigger smooth scroll
  const handleLinkClick = (e, sectionId) => {
    e.preventDefault();
    if (scrollToSection) {
      scrollToSection(sectionId);
    } else {
      // Fallback just in case scrollToSection isn't passed
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Mapped links with their corresponding section IDs
  const quickLinks = [
    { name: 'About Our Platform', id: 'about-section' },
    { name: 'Luxury Suites', id: 'rooms-section' },
    { name: 'Amenities & Spa', id: 'amenities-section' }
  ];

  const supportLinks = [
    { name: 'Help Desk', id: 'contact-section' },
    { name: 'Privacy Charter', id: 'contact-section' }, // Routes to contact for now
    { name: 'Cancellation Policy', id: 'contact-section' } 
  ];

  return (
    <footer className="w-full relative mt-24 overflow-hidden border-t border-orange-200/40 bg-gradient-to-b from-orange-50/40 via-stone-50 to-zinc-100/80">
      
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-100/50 via-peach-50/20 to-transparent pointer-events-none"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 grid grid-cols-1 md:grid-cols-4 gap-6 lg:gap-8"
      >
        
        {/* Brand Column */}
        <motion.div variants={itemVariants} className="space-y-6 flex flex-col justify-between py-2">
          <div className="space-y-4">
            <div 
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <div className="w-10 h-10 bg-white border border-orange-100 rounded-xl flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-105 shadow-[0_4px_12px_rgba(251,146,60,0.08)]">
                <img 
                  src="/images/techhansa-logo.png" 
                  alt="Logo" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<span class="text-orange-500 text-[10px] font-bold">HMS</span>';
                  }}
                />
              </div>
              <span className="text-xl font-serif italic font-bold text-orange-400 tracking-tight">
                Techhansa <span className="font-serif italic font-bold text-orange-400/80 tracking-tight">HMS</span>
              </span>
            </div>
            
            <p className="text-sm leading-relaxed text-zinc-600 font-light pr-2">
              An intelligent framework engineered for modern hospitality. Streamlining luxury operations, pristine spatial design synchronization, and intuitive guest-flow mechanics.
            </p>
          </div>
          
          {/* Social Icons */}
          <div className="flex gap-2.5 pt-2">
            {[Globe, MessageSquare, Send].map((Icon, idx) => (
              <motion.a 
                key={idx}
                href="#" 
                onClick={(e) => e.preventDefault()}
                whileHover={{ y: -3 }}
                className="p-2.5 bg-white/90 backdrop-blur-xs border border-orange-100 text-zinc-400 rounded-xl hover:bg-zinc-900 hover:text-white hover:border-zinc-900 transition-all duration-300 shadow-xs hover:shadow-md cursor-pointer"
              >
                <Icon size={15} />
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Card 1: Quick Links */}
        <motion.div 
          variants={itemVariants} 
          className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-2xl shadow-[0_8px_30px_rgba(251,146,60,0.02)] flex flex-col hover:bg-white/80 transition-all duration-300 hover:shadow-md"
        >
          <h3 className="text-[10px] font-bold text-zinc-900 uppercase tracking-[0.25em] mb-5 border-b border-orange-100/50 pb-2">Quick Links</h3>
          <ul className="space-y-3 text-sm font-medium">
            {quickLinks.map((link, idx) => (
              <li key={idx}>
                <a 
                  href={`#${link.id}`}
                  onClick={(e) => handleLinkClick(e, link.id)} 
                  className="group flex items-center text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  <ArrowRight size={12} className="opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 mr-1.5 text-orange-500" />
                  <span className="transform group-hover:translate-x-0.5 transition-transform duration-300">
                    {link.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Card 2: Support */}
        <motion.div 
          variants={itemVariants} 
          className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-2xl shadow-[0_8px_30px_rgba(251,146,60,0.02)] flex flex-col hover:bg-white/80 transition-all duration-300 hover:shadow-md"
        >
          <h3 className="text-[10px] font-bold text-zinc-900 uppercase tracking-[0.25em] mb-5 border-b border-orange-100/50 pb-2">Support</h3>
          <ul className="space-y-3 text-sm font-medium">
            {supportLinks.map((link, idx) => (
              <li key={idx}>
                <a 
                  href={`#${link.id}`}
                  onClick={(e) => handleLinkClick(e, link.id)} 
                  className="group flex items-center text-zinc-500 hover:text-zinc-900 transition-colors cursor-pointer"
                >
                  <ArrowRight size={12} className="opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 mr-1.5 text-orange-500" />
                  <span className="transform group-hover:translate-x-0.5 transition-transform duration-300">
                    {link.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Card 3: The Estate */}
        <motion.div 
          variants={itemVariants} 
          className="bg-white/60 backdrop-blur-md border border-white p-6 rounded-2xl shadow-[0_8px_30px_rgba(251,146,60,0.02)] flex flex-col hover:bg-white/80 transition-all duration-300 hover:shadow-md"
        >
          <h3 className="text-[10px] font-bold text-zinc-900 uppercase tracking-[0.25em] mb-5 border-b border-orange-100/50 pb-2">The Estate</h3>
          <div className="space-y-4 text-sm font-light text-zinc-600 flex-1 flex flex-col justify-center">
            
            <div className="flex items-start gap-3 group cursor-default">
              <div className="mt-0.5 text-orange-400 group-hover:text-orange-500 transition-colors"><MapPin size={14} /></div>
              <span className="group-hover:text-zinc-900 transition-colors leading-relaxed text-xs font-medium">Level 42, Techhansa Tower<br />Bangalore, India 560001</span>
            </div>
            
            <div className="flex items-center gap-3 group cursor-default">
              <div className="text-orange-400 group-hover:text-orange-500 transition-colors"><Phone size={14} /></div>
              <span className="group-hover:text-zinc-900 transition-colors text-xs font-medium">+91 800 123 4567</span>
            </div>
            
            <div className="flex items-center gap-3 group cursor-pointer" onClick={(e) => handleLinkClick(e, 'contact-section')}>
              <div className="text-orange-400 group-hover:text-orange-500 transition-colors"><Mail size={14} /></div>
              <span className="group-hover:text-zinc-900 transition-colors text-xs font-medium underline decoration-orange-100 group-hover:decoration-orange-400 underline-offset-4">hello@techhansa.com</span>
            </div>

          </div>
        </motion.div>

      </motion.div>
      
      {/* Elegant Warm-Toned Copyright Bar */}
      <div className="border-t border-orange-100/40 py-6 text-center text-[10px] uppercase tracking-widest text-zinc-400 bg-zinc-100/60 font-bold">
        © {new Date().getFullYear()} Techhansa Group. All rights reserved.
      </div>
    </footer>
  );
}