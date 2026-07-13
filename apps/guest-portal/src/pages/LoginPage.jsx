import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function LoginPage({ setUserRole, setAuthToken }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Integrated Production Backend Authentication Flow
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Dispatch real authentication payload to your local backend server instance
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      // 2. Validate operational success criteria from response status boundaries
      if (response.ok) {
        // Deconstruct authorization payload securely (adjust keys based on your API schema)
        const { token, user } = data;
        
        // 3. Populate client storage vectors to maintain session across hard refresh cycles
        localStorage.setItem('hms_token', token);
        localStorage.setItem('hms_role', user.role);

        // 4. Compute role tracking state and trigger target routing maps
        const role = user.role.toUpperCase();
        let redirectPath = '/';
        
        if (role === 'ADMIN') redirectPath = '/dashboard/manager';
        else if (role === 'FRONT_DESK' || role === 'RECEPTION') redirectPath = '/dashboard/front-desk';
        else if (role === 'HOUSEKEEPING') redirectPath = '/dashboard/housekeeping';
        else if (role === 'FINANCE') redirectPath = '/dashboard/finance';

        completeLogin(role, token, redirectPath);
      } else {
        // Fallback message parsing derived from standard custom error signatures
        setError(data.error || data.message || 'Invalid credentials. Please check your email and password.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login Engine Operational Failure:", err);
      setError('Server connection failed. Unable to cross-verify client token.');
      setIsLoading(false);
    }
  };

  const completeLogin = (role, token, redirectPath) => {
    setUserRole(role);
    setAuthToken(token);
    setIsLoading(false);
    navigate(redirectPath, { replace: true });
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] flex items-center justify-center bg-gradient-to-br from-orange-50/50 via-zinc-50 to-zinc-100 p-4">
      
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-orange-100/40 blur-3xl"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-peach-100/30 blur-3xl"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_20px_60px_-15px_rgba(251,146,60,0.1)] p-8 md:p-10 z-10 relative"
      >
        {/* Branding */}
        <div className="flex flex-col items-center mb-10 text-center cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-12 h-12 bg-white border border-orange-200 rounded-xl flex items-center justify-center overflow-hidden shadow-sm mb-4">
            <img 
              src="/images/techhansa-logo.png" 
              alt="Logo" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<span class="text-orange-500 text-xs font-bold">HMS</span>';
              }}
            />
          </div>
          <h2 className="text-2xl font-serif italic font-bold text-orange-600 tracking-tight">
            Techhansa <span className="font-light text-orange-400/80 uppercase tracking-widest text-lg">HMS</span>
          </h2>
          <p className="text-zinc-400 text-[10px] uppercase tracking-widest font-bold mt-2">Authorized Personnel Only</p>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
            className="mb-6 p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 text-red-600 text-xs font-medium"
          >
            <AlertCircle size={14} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </motion.div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Work Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Mail size={16} />
              </div>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@techhansa.com" 
                className="w-full pl-10 pr-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between ml-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Password</label>
              <span className="text-[10px] font-medium text-orange-500 hover:text-orange-600 cursor-pointer transition-colors">Recover Access</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                <Lock size={16} />
              </div>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full pl-10 pr-4 py-3 bg-zinc-50/50 border border-zinc-200 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full mt-4 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white py-3.5 rounded-xl text-xs font-bold uppercase tracking-[0.15em] transition-all shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed group"
          >
            {isLoading ? 'Authenticating...' : (
              <>Access Workspace <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" /></>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper */}
       

      </motion.div>
    </div>
  );
}