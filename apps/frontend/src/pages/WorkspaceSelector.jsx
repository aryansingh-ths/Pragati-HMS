import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Building2, Coffee, Sparkles, Receipt, LineChart, Briefcase, Plane, ArrowRight } from 'lucide-react';

const DEPARTMENTS = {
  GLOBAL: { name: 'Admin Dashboard', icon: Building2, path: '/dashboard/Admin', color: 'from-rose-500 to-fuchsia-600' },
  FRONT_DESK: { name: 'Front Desk', icon: Briefcase, path: '/dashboard/front-desk', color: 'from-sky-500 to-blue-600' },
  RESTAURANT: { name: 'Dining', icon: Coffee, path: '/dashboard/dining', color: 'from-pink-500 to-rose-500' },
  HOUSEKEEPING: { name: 'Housekeeping', icon: Sparkles, path: '/dashboard/housekeeping', color: 'from-amber-500 to-orange-500' },
  FINANCE: { name: 'Finance', icon: Receipt, path: '/dashboard/finance', color: 'from-emerald-500 to-teal-600' },
  SALES: { name: 'Sales', icon: LineChart, path: '/dashboard/sales', color: 'from-violet-500 to-purple-600' },
  TRAVEL: { name: 'Travel Desk', icon: Plane, path: '/dashboard/travel', color: 'from-cyan-500 to-teal-500' }
};

export default function WorkspaceSelector() {
  const navigate = useNavigate();
  const rawDept = sessionStorage.getItem('hms_department');
  
  let departments = [];
  try {
    departments = JSON.parse(rawDept);
    if (!Array.isArray(departments)) departments = [rawDept];
  } catch(e) {
    departments = [rawDept];
  }

  const handleSelectWorkspace = (path, dept) => {
    // Optionally update active department in session storage if needed by the app
    sessionStorage.setItem('hms_active_department', dept);
    navigate(path);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl relative z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 bg-white rounded-2xl shadow-xl shadow-indigo-500/20 flex items-center justify-center mx-auto mb-6"
          >
            <Building2 className="text-indigo-600" size={32} />
          </motion.div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">Select Workspace</h1>
          <p className="text-zinc-500">You have access to multiple departments. Where would you like to go?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {departments.map((dept, i) => {
            const config = DEPARTMENTS[dept] || DEPARTMENTS.FRONT_DESK;
            const Icon = config.icon;
            
            return (
              <motion.button
                key={dept}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectWorkspace(config.path, dept)}
                className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-xl shadow-zinc-200/20 flex items-center justify-between group transition-all hover:shadow-2xl hover:border-indigo-200 text-left"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${config.color} text-white flex items-center justify-center shadow-lg shadow-black/10 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 text-lg">{config.name}</h3>
                    <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">{dept.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                  <ArrowRight size={16} />
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </div>
  );
}
