import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Send } from 'lucide-react';

// Animation Sequence Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 100, damping: 20 } 
  }
};

export default function Contact() {
  return (
    // Reduced vertical padding (py-16 instead of py-24) to save space
    <section id="contact-section" className="py-4 bg-zinc-50 border-t border-zinc-200 overflow-hidden relative">
      
      {/* Constrained max-width (max-w-2xl instead of 7xl) to shorten it from both sides */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          {/* Left Column: Contact Details */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            className="flex flex-col"
          >
            <motion.p variants={itemVariants} className="text-zinc-400 text-[10px] font-bold uppercase tracking-[0.3em] mb-3">
              Connect With Us
            </motion.p>
            <motion.h2 variants={itemVariants} className="text-3xl md:text-4xl font-serif text-zinc-900 mb-6 tracking-tight">
              At Your <span className="text-zinc-500 italic font-light">Service.</span>
            </motion.h2>
            <motion.p variants={itemVariants} className="text-zinc-500 font-light leading-relaxed mb-10 text-sm max-w-sm">
              Whether you are planning an exclusive event, a corporate retreat, or inquiring about our portfolio, our concierge team is available around the clock.
            </motion.p>

            <motion.div variants={itemVariants} className="space-y-5">
              {/* Sleek, Modern Contact Blocks */}
              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center text-zinc-400 rounded border border-zinc-200 group-hover:border-zinc-400 group-hover:text-zinc-900 transition-colors">
                  <MapPin size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mb-0.5">Corporate HQ</h4>
                  <p className="text-zinc-500 font-light text-xs">Level 42, Techhansa Tower<br/>Bangalore, India 560001</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center text-zinc-400 rounded border border-zinc-200 group-hover:border-zinc-400 group-hover:text-zinc-900 transition-colors">
                  <Phone size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mb-0.5">Direct Line</h4>
                  <p className="text-zinc-500 font-light text-xs">+91 800 123 4567</p>
                </div>
              </div>

              <div className="flex items-center gap-4 group cursor-pointer">
                <div className="w-10 h-10 bg-white shadow-sm flex items-center justify-center text-zinc-400 rounded border border-zinc-200 group-hover:border-zinc-400 group-hover:text-zinc-900 transition-colors">
                  <Mail size={16} />
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mb-0.5">Digital Inquiries</h4>
                  <p className="text-zinc-500 font-light text-xs">hello@techhansa.com</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Modern SaaS Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: 20, scale: 0.98 }} 
            whileInView={{ opacity: 1, x: 0, scale: 1 }} 
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 80, damping: 20 }}
            className="bg-white p-8 md:p-10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.05)] border border-zinc-200 rounded-lg relative"
          >
            <h3 className="text-xl font-serif text-zinc-900 mb-6 font-semibold">Send a Message</h3>
            
            <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Your Full Name" 
                  className="w-full bg-transparent border-b border-zinc-200 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors" 
                />
              </div>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="Work Email Address" 
                  className="w-full bg-transparent border-b border-zinc-200 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors" 
                />
              </div>
              
              <div className="relative">
                <textarea 
                  placeholder="How can we assist you?" 
                  rows="3" 
                  className="w-full bg-transparent border-b border-zinc-200 py-2 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 transition-colors resize-none"
                ></textarea>
              </div>
              
              {/* Vibrant Button Interaction */}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white transition-colors py-3.5 text-[10px] rounded uppercase tracking-[0.2em] font-bold shadow-md group"
              >
                Submit Inquiry 
                <Send size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </motion.button>
            </form>
          </motion.div>

        </div>
      </div>
    </section>
  );
}