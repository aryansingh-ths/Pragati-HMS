import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Success! Pass the token and role back to App.jsx
      onLogin(data.data.user.role.toLowerCase(), data.data.token);
      onClose();
    } catch (err) {
      alert(err.message); // In a real app, use a nice error state instead of an alert!
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          exit={{ opacity: 0, scale: 0.95, y: 10 }} 
          onClick={(e) => e.stopPropagation()}
          className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden relative"
        >
          {/* Header */}
          <div className="p-6 text-center relative border-b border-slate-100 bg-slate-50/50">
            <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer">
              <X size={20} />
            </button>
            <div className="w-12 h-12 bg-slate-950 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">
              <ShieldCheck size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-black text-slate-900">Welcome Back</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Sign in to access your portal</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-6 space-y-4">
            
            {/* Role Selector (UI only for now) */}
            <div className="flex p-1 bg-slate-100 rounded-lg mb-6">
              <button 
                type="button"
                onClick={() => setIsStaff(false)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${!isStaff ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Guest
              </button>
              <button 
                type="button"
                onClick={() => setIsStaff(true)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${isStaff ? 'bg-white text-cyan-600 shadow-sm' : 'text-slate-500'}`}
              >
                Staff
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    type="email" 
                    required 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-300" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-2.5 text-slate-400" />
                  <input 
                    type="password" 
                    required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all placeholder:text-slate-300" 
                  />
                </div>
              </div>
            </div>

            <motion.button 
              whileTap={{ scale: 0.98 }} 
              disabled={isLoading} 
              className={`w-full mt-2 py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 ${isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-slate-950 hover:bg-slate-800 hover:shadow-lg cursor-pointer'}`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight size={16} /></>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}