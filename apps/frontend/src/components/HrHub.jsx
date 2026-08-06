import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Clock, Users, DollarSign, X, ShieldAlert, Zap, TrendingUp, CircleDot, ChevronDown } from 'lucide-react';

export default function HrHub({ isManagerView = false, managerDepartment = 'ALL' }) {
  const [staffPermissions, setStaffPermissions] = useState([]);
  const [staffShifts, setStaffShifts] = useState([]);
  const [staffSalaries, setStaffSalaries] = useState([]);
  const [staffFilter, setStaffFilter] = useState(isManagerView && managerDepartment !== 'ALL' ? managerDepartment : 'ALL');
  const [shiftDateFilter, setShiftDateFilter] = useState('');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [salaryForm, setSalaryForm] = useState({ base_salary_monthly: 0, daily_deduction: 0 });
  const [salarySlipData, setSalarySlipData] = useState(null);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [onboardForm, setOnboardForm] = useState({ email: '', password: '', name: '', role: managerDepartment !== 'ALL' ? managerDepartment : 'FRONTDESK' });
  const [onboardSuccess, setOnboardSuccess] = useState(null);
  const [onboardError, setOnboardError] = useState(null);

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = sessionStorage.getItem('hms_token');
    if (!token) {
      window.location.href = '/login';
      return null;
    }
    const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, ...(options.headers || {}) };
    const res = await fetch(url, { ...options, headers });
    return res;
  }, []);

  const loadData = useCallback(async () => {
    try {
      const [permRes, shiftsRes, salariesRes] = await Promise.all([
        fetchWithAuth('http://localhost:3000/api/Admin/permissions').catch(()=>null),
        fetchWithAuth('http://localhost:3000/api/Admin/shifts').catch(()=>null),
        fetchWithAuth('http://localhost:3000/api/Admin/salaries').catch(()=>null),
      ]);
      if (permRes?.ok) {
        let perms = (await permRes.json()).data.permissions || [];
        if (isManagerView && managerDepartment !== 'GLOBAL') {
           perms = perms.filter(p => p.role === managerDepartment);
        }
        setStaffPermissions(perms);
      }
      if (shiftsRes?.ok) {
        let shifts = (await shiftsRes.json()).data.shifts || [];
        if (isManagerView && managerDepartment !== 'GLOBAL') {
           shifts = shifts.filter(s => s.role === managerDepartment);
        }
        setStaffShifts(shifts);
      }
      if (salariesRes?.ok) setStaffSalaries((await salariesRes.json()).data.salaries || []);
    } catch(e) {
      console.error(e);
    }
  }, [fetchWithAuth, isManagerView, managerDepartment]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOnboardEmployee = async (e) => {
    e.preventDefault();
    setOnboardError(null);
    setOnboardSuccess(null);
    try {
      const res = await fetchWithAuth('http://localhost:3000/api/Admin/users', {
        method: 'POST',
        body: JSON.stringify(onboardForm)
      });
      const data = await res.json();
      if (res?.ok) {
        setOnboardSuccess('Employee onboarded and provisioned successfully!');
        setOnboardForm({ email: '', password: '', name: '', role: managerDepartment !== 'ALL' ? managerDepartment : 'FRONTDESK' });
        loadData();
        setTimeout(() => { setShowOnboardModal(false); setOnboardSuccess(null); }, 1800);
      } else {
        setOnboardError(data.message || 'Failed to onboard employee.');
      }
    } catch (err) {
      setOnboardError('System error. Please try again.');
    }
  };

  const handleUpdateStaffProfile = async (field, value) => {
    if (!selectedStaff) return;
    try {
      await fetchWithAuth(`http://localhost:3000/api/Admin/users/${selectedStaff.id || selectedStaff.user_id}`, {
        method: 'PUT',
        body: JSON.stringify({ [field]: value })
      });
      setStaffPermissions(prev => prev.map(p => (p.id || p.user_id) === (selectedStaff.id || selectedStaff.user_id) ? { ...p, [field]: value } : p));
      setSelectedStaff(prev => ({ ...prev, [field]: value }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateHrHubPermission = async (permKey, currentVal) => {
    if (!selectedStaff) return;
    const uid = selectedStaff.id || selectedStaff.user_id;
    const updated = {
      role: selectedStaff.role || 'FRONT_DESK',
      can_process_refunds: selectedStaff.can_process_refunds,
      can_apply_discounts: selectedStaff.can_apply_discounts,
      can_overbook: selectedStaff.can_overbook,
      [permKey]: !currentVal
    };
    try {
      await fetchWithAuth(`http://localhost:3000/api/Admin/permissions/${uid}`, {
        method: 'POST',
        body: JSON.stringify(updated)
      });
      setStaffPermissions(prev => prev.map(p => (p.id || p.user_id) === uid ? { ...p, ...updated } : p));
      setSelectedStaff(prev => ({ ...prev, ...updated }));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSalaryConfig = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    try {
      await fetchWithAuth('http://localhost:3000/api/Admin/salaries', {
        method: 'POST',
        body: JSON.stringify({
          user_id: selectedStaff.id || selectedStaff.user_id,
          base_salary_monthly: Number(salaryForm.base_salary_monthly),
          daily_deduction: Number(salaryForm.daily_deduction)
        })
      });
      loadData();
      alert('Salary config saved successfully');
    } catch (e) {
      console.error(e);
    }
  };

  // When selected staff changes, load their salary config
  useEffect(() => {
    if (selectedStaff) {
       const uid = selectedStaff.id || selectedStaff.user_id;
       const sConf = staffSalaries.find(s => s.user_id === uid) || { base_salary_monthly: 0, daily_deduction: 0 };
       setSalaryForm({ base_salary_monthly: sConf.base_salary_monthly, daily_deduction: sConf.daily_deduction });
    }
  }, [selectedStaff, staffSalaries]);

  return (
    <>
                    
                <motion.div key="hr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* Local styles for this section only — shimmering border, floating orbs, sheen sweep */}
                  <style>{`
                    @keyframes hr-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                    @keyframes hr-float { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-10px) scale(1.06); } }
                    @keyframes hr-float-rev { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12px,10px) scale(1.05); } }
                    @keyframes hr-pulse-ring-indigo { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 70% { box-shadow: 0 0 0 9px rgba(99,102,241,0); } 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); } }
                    @keyframes hr-pulse-ring-emerald { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.4); } 70% { box-shadow: 0 0 0 9px rgba(16,185,129,0); } 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); } }
                    @keyframes hr-pulse-ring-rose { 0% { box-shadow: 0 0 0 0 rgba(244,63,94,0.4); } 70% { box-shadow: 0 0 0 9px rgba(244,63,94,0); } 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); } }
                    .hr-glow-wrap { position: relative; border-radius: 2rem; padding: 2px; background-size: 220% 220%; animation: hr-shimmer 10s ease-in-out infinite; }
                    .hr-orb { position: absolute; border-radius: 9999px; filter: blur(46px); pointer-events: none; }
                    .hr-ring-indigo { animation: hr-pulse-ring-indigo 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .hr-ring-emerald { animation: hr-pulse-ring-emerald 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .hr-ring-rose { animation: hr-pulse-ring-rose 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .hr-sheen { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 45%, transparent 60%); transform: translateX(-130%); transition: transform 0.85s cubic-bezier(0.22,1,0.36,1); pointer-events: none; z-index: 3; border-radius: inherit; }
                    .group:hover .hr-sheen { transform: translateX(130%); }
                    .hr-dot-grid { background-image: radial-gradient(rgba(99,102,241,0.14) 1px, transparent 1px); background-size: 18px 18px; -webkit-mask-image: radial-gradient(circle at 90% 0%, rgba(0,0,0,0.8), transparent 68%); mask-image: radial-gradient(circle at 90% 0%, rgba(0,0,0,0.8), transparent 68%); }
                  `}</style>

                  {/* ─── HEADER: Title + Add Employee Button ─── */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 bg-[#D4A373] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <motion.div className="hr-orb w-52 h-52 bg-white/10" style={{ top: '-3.5rem', right: '-2.5rem' }} animate={{ x: [0, 18, 0], y: [0, -12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.div className="hr-orb w-40 h-40 bg-white/10" style={{ bottom: '-3rem', left: '20%' }} animate={{ x: [0, -16, 0], y: [0, 10, 0] }} transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }} />
                    <div className="relative flex items-center gap-3 text-white">
                      <motion.div
                        animate={{ rotate: [0, -8, 8, 0], y: [0, -3, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        className="hidden sm:flex w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 items-center justify-center shadow-lg text-xl"
                      >
                        🧑‍💼
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">Staff Command Center</h2>
                        <p className="text-xs text-white/85 mt-0.5">Provision accounts, configure permissions, and monitor shift activity.</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => { setShowOnboardModal(true); setOnboardSuccess(null); setOnboardError(null); }}
                      className="relative bg-white text-[#D4A373] hover:bg-zinc-50 font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all overflow-hidden"
                    >
                      <motion.span animate={{ rotate: [0, 90, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex">
                        <Plus size={14} />
                      </motion.span>
                      Add Employee
                    </motion.button>
                  </motion.div>

                  {/* ─── DEPARTMENT FILTER TABS ─── */}
                  <div className="relative flex flex-wrap gap-2 bg-white/60 backdrop-blur-sm border border-zinc-200/60 rounded-2xl p-2 shadow-sm">
                    {[
                      { key: 'ALL', label: 'All Staff' },
                      { key: 'FRONTDESK', label: 'Front Desk' },
                      { key: 'HOUSEKEEPING', label: 'Housekeeping' },
                      { key: 'Admin', label: 'Admin' },
                      { key: 'FINANCE', label: 'Finance' },
                      { key: 'RESTAURANT', label: 'Dining' },
                      { key: 'SALES', label: 'Sales' },
                      { key: 'TRAVEL', label: 'Travel' }
                    ].map(tab => (
                      <motion.button
                        key={tab.key}
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setStaffFilter(tab.key)}
                        className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors overflow-hidden ${staffFilter === tab.key
                          ? 'text-white'
                          : 'bg-white text-zinc-500 border border-zinc-200/60 hover:bg-zinc-50 hover:text-zinc-800'
                          }`}
                      >
                        {staffFilter === tab.key && (
                          <motion.span
                            layoutId="hr-filter-pill"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                            className={`absolute inset-0 bg-[#D4A373] shadow-md rounded-full`}
                          />
                        )}
                        <span className="relative">{tab.label}</span>
                      </motion.button>
                    ))}
                  </div>

                  {/* ─── LIVE STAFF DIRECTORY GRID ─── */}
                  <div className="space-y-2.5">
                    {staffPermissions
                      .filter(sp => {
                        const matchesRole = staffFilter === 'ALL' ? true :
                                            staffFilter === 'FRONT_DESK' ? (sp.role === 'RECEPTION' || sp.role === 'FRONT_DESK') :
                                            staffFilter === 'Admin' || staffFilter === 'ADMIN' ? sp.role === 'ADMIN' :
                                            staffFilter === 'SALES' ? sp.role?.includes('SALES') :
                                            sp.role === staffFilter;
                        return matchesRole;
                      })
                      .map((sp, idx) => {
                        const isOnline = staffShifts.some(s => s.email === sp.email && s.is_active);
                        const initials = (sp.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                        const avatarGradient = 'from-[#D4A373] to-[#B3835B]';
                        const roleBadgeColor = 'bg-[#D4A373]/10 text-[#C08A5D] border-[#D4A373]/30';
                        const rowGlow = 'rgba(212,163,115,0.15)';

                        return (
                          <motion.div
                            key={sp.id || idx}
                            layoutId={sp.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.03 } }}
                            onClick={() => setSelectedStaff(sp)}
                            whileHover={{ y: -3, scale: 1.005, boxShadow: `0px 16px 34px -14px ${rowGlow}` }}
                            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                            className="group relative overflow-hidden bg-white rounded-2xl p-4 border border-zinc-200/60 shadow-sm cursor-pointer flex items-center gap-4"
                          >
                            <div className="hr-sheen" />
                            {/* Avatar */}
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: -6 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                              className={`relative w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm ${isOnline ? 'hr-ring-emerald' : ''}`}
                            >
                              {initials}
                            </motion.div>

                            {/* Name & Email */}
                            <div className="relative flex-1 min-w-0">
                              <p className="text-sm font-bold text-zinc-900 truncate">{sp.name}</p>
                              <p className="text-[10px] text-zinc-400 truncate">{sp.email}</p>
                            </div>

                            {/* Role Badge */}
                            <span className={`relative hidden sm:inline-flex text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border shadow-sm ${roleBadgeColor}`}>
                              {sp.role}
                            </span>

                            {/* Permissions Quick Glance */}
                            <div className="relative hidden md:flex items-center gap-1.5">
                              {sp.can_process_refunds && <span className="text-[8px] font-bold bg-teal-50 text-teal-600 border border-teal-200 px-1.5 py-0.5 rounded shadow-sm">Refunds</span>}
                              {sp.can_apply_discounts && <span className="text-[8px] font-bold bg-violet-50 text-violet-600 border border-violet-200 px-1.5 py-0.5 rounded shadow-sm">Discounts</span>}
                              {sp.can_overbook && <span className="text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded shadow-sm">Overbook</span>}
                            </div>

                            {/* Status Dot */}
                            <div className="relative flex items-center gap-1.5 shrink-0">
                              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-600' : 'text-zinc-400'}`}>
                                {isOnline ? 'Online' : 'Offline'}
                              </span>
                            </div>

                            {/* Chevron */}
                            <motion.span whileHover={{ x: 2 }} className="relative">
                              <ChevronDown size={14} className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0" />
                            </motion.span>
                          </motion.div>
                        );
                      })}

                    {staffPermissions.filter(sp => {
                        const matchesRole = staffFilter === 'ALL' ? true :
                                            staffFilter === 'FRONT_DESK' ? (sp.role === 'RECEPTION' || sp.role === 'FRONT_DESK') :
                                            staffFilter === 'Admin' || staffFilter === 'ADMIN' ? sp.role === 'ADMIN' :
                                            staffFilter === 'SALES' ? sp.role?.includes('SALES') :
                                            sp.role === staffFilter;
                        return matchesRole;
                      }).length === 0 && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-zinc-400 text-xs">
                        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
                          <Users size={28} className="mx-auto mb-2 opacity-40" />
                        </motion.div>
                        No staff members found for this department.
                      </motion.div>
                    )}
                  </div>

                  {/* ─── BOTTOM: SHIFT LOGS + KPIS ─── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active shift monitor */}
                    <div>
                      <motion.div
                        whileHover={{ y: -3 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 space-y-4"
                      >
                        <div className="absolute inset-0 pointer-events-none opacity-60" />
                        <div className="hr-orb -top-12 -right-12 w-40 h-40 bg-[#D4A373]/10" style={{ animation: 'hr-float 8s ease-in-out infinite' }} />

                        <div className="relative flex items-center justify-between border-b border-zinc-100 pb-3">
                          <div className="flex items-center gap-2">
                            <motion.div whileHover={{ rotate: -10, scale: 1.1 }} className="w-8 h-8 rounded-xl bg-[#D4A373] flex items-center justify-center shadow-sm">
                              <Clock size={15} className="text-white" />
                            </motion.div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">Shift Logs & Sessions</h3>
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Date:</label>
                            <input
                              type="date"
                              value={shiftDateFilter}
                              onChange={(e) => setShiftDateFilter(e.target.value)}
                              className="text-[10px] p-1 border border-indigo-200 rounded-lg text-zinc-600 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 bg-white shadow-sm"
                            />
                          </div>
                        </div>

                        <div className="relative space-y-2 overflow-y-auto max-h-80 fd-sidebar-scroll pr-1">
                          {staffShifts
                            .filter(s => {
                              if (!shiftDateFilter) return true;
                              // Format database timestamp to YYYY-MM-DD in local time
                              const localDateStr = new Date(s.login_time).toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD
                              return localDateStr === shiftDateFilter;
                            })
                            .map((shift, idx) => {
                              const shiftInitials = (shift.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                              const shiftGradient = {
                                FRONTDESK: 'from-sky-400 to-blue-500',
                                FRONTDESK: 'from-sky-400 to-blue-500',
                                HOUSEKEEPING: 'from-amber-400 to-orange-500',
                                Admin: 'from-indigo-400 to-violet-500',
                                FINANCE: 'from-emerald-400 to-teal-500',
                                RESTAURANT: 'from-rose-400 to-red-500',
                                SALES: 'from-fuchsia-400 to-purple-500',
                                TRAVEL: 'from-cyan-400 to-sky-500'
                              }[shift.role] || 'from-zinc-400 to-zinc-500';
                              const durationMins = shift.duration_minutes || 0;
                              const durationHrs = Math.floor(durationMins / 60);
                              const durationRemMins = durationMins % 60;
                              const durationStr = durationHrs > 0
                                ? `${durationHrs}h ${durationRemMins}m`
                                : `${durationRemMins}m`;
                              return (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.03 } }}
                                  whileHover={{ x: 2 }}
                                  className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/40 border border-indigo-100/60 hover:bg-indigo-50/70 transition-colors"
                                >
                                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${shiftGradient} flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-sm`}>
                                    {shiftInitials}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-zinc-900 truncate">{shift.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                      <p className="text-[9px] text-zinc-400 font-mono">
                                        In: {new Date(shift.login_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                      </p>
                                      {shift.logout_time && (
                                        <p className="text-[9px] text-zinc-400 font-mono">
                                          Out: {new Date(shift.logout_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                        </p>
                                      )}
                                      <span className="text-[9px] font-bold text-indigo-600 bg-indigo-100/70 border border-indigo-200 px-1.5 py-0.5 rounded-md font-mono">
                                        ⏱ {durationStr}
                                      </span>
                                    </div>
                                  </div>
                                  <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shrink-0 shadow-sm ${shift.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                                    }`}>
                                    {shift.is_active ? (
                                      <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
                                        ACTIVE
                                      </span>
                                    ) : 'ENDED'}
                                  </span>
                                </motion.div>
                              );
                            })}
                          {staffShifts.length === 0 && (
                            <p className="text-center text-zinc-400 text-xs py-6">No shift data available yet.</p>
                          )}
                        </div>
                      </motion.div>
                    </div>

                    {/* Salary & Payroll */}
                    <div>
                      <motion.div
                        whileHover={{ y: -3 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 space-y-4 flex flex-col"
                      >
                        <div className="absolute inset-0 pointer-events-none opacity-60" />
                        <div className="hr-orb -bottom-12 -left-12 w-40 h-40 bg-[#D4A373]/10" style={{ animation: 'hr-float-rev 9s ease-in-out infinite' }} />

                        <div className="relative flex items-center justify-between border-b border-zinc-100 pb-3">
                          <div className="flex items-center gap-2">
                            <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="w-8 h-8 rounded-xl bg-[#D4A373] flex items-center justify-center shadow-sm">
                              <DollarSign size={15} className="text-white" />
                            </motion.div>
                            <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">Salary & Payroll</h3>
                          </div>
                          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Estimated</span>
                        </div>

                        <div className="relative space-y-3 overflow-y-auto max-h-80 fd-sidebar-scroll pr-1 flex-1">
                          {(() => {
                            const filteredShifts = staffShifts.filter(s => {
                              if (!shiftDateFilter) return true;
                              const localDateStr = new Date(s.login_time).toLocaleDateString('en-CA');
                              return localDateStr === shiftDateFilter;
                            });

                            if (filteredShifts.length === 0) {
                              return (
                                <div className="text-center py-10 text-zinc-400 text-xs flex flex-col items-center">
                                  <motion.span
                                    animate={{ scale: [1, 1.12, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="text-2xl mb-2 opacity-40 font-black"
                                  >₹</motion.span>
                                  No attendance data for the selected period.
                                </div>
                              );
                            }

                            // Aggregate days per employee
                            const aggregated = {};
                            filteredShifts.forEach(s => {
                              if (!aggregated[s.email]) {
                                aggregated[s.email] = { name: s.name, role: s.role, totalMins: 0, uniqueDays: new Set(), user_id: s.user_id };
                              }
                              aggregated[s.email].totalMins += (s.duration_minutes || 0);
                              const localDateStr = new Date(s.login_time).toLocaleDateString('en-CA');
                              aggregated[s.email].uniqueDays.add(localDateStr);
                            });

                            return Object.values(aggregated).map((emp, idx) => {
                              const totalHrs = Math.floor(emp.totalMins / 60);
                              const remMins = emp.totalMins % 60;
                              const presentDays = emp.uniqueDays.size;

                              // Find salary config
                              const sConf = staffSalaries.find(s => s.user_id === emp.user_id) || { base_salary_monthly: 0, daily_deduction: 0 };
                              const absentDays = Math.max(0, 30 - presentDays);
                              const deduction = absentDays * sConf.daily_deduction;
                              const finalSalary = Math.max(0, sConf.base_salary_monthly - deduction).toFixed(2);

                              return (
                                <motion.div
                                  key={idx}
                                  initial={{ opacity: 0, y: 8 }}
                                  animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.04 } }}
                                  whileHover={{ x: 2, boxShadow: '0px 12px 28px -14px rgba(16,185,129,0.25)' }}
                                  onClick={() => setSelectedStaff({ id: emp.user_id, name: emp.name, email: emp.email, role: emp.role })}
                                  className="flex justify-between items-center p-3 rounded-xl bg-emerald-50/40 border border-emerald-100/60 cursor-pointer hover:bg-emerald-50/70 transition-colors"
                                >
                                  <div>
                                    <p className="text-xs font-bold text-zinc-900">{emp.name}</p>
                                    <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                                      {presentDays} / 30 Days Present · -₹{deduction.toFixed(2)} deduced
                                    </p>
                                  </div>
                                  <div className="text-right flex flex-col items-end gap-1.5">
                                    <motion.p
                                      key={finalSalary}
                                      initial={{ scale: 1.15 }} animate={{ scale: 1 }}
                                      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                                      className="text-sm font-black text-emerald-600"
                                    >₹{finalSalary}</motion.p>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSalarySlipData({ emp, finalSalary, deduction, presentDays, sConf, month: shiftDateFilter || 'Current Month' });
                                      }}
                                      className="text-[8px] font-bold uppercase tracking-wider bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:shadow-md hover:shadow-indigo-500/30 px-2 py-1 rounded transition-shadow"
                                    >
                                      Generate Slip
                                    </motion.button>
                                  </div>
                                </motion.div>
                              );
                            });
                          })()}
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* ═══════════════════════════════════════════════
                      GLASSMORPHISM SLIDE-OUT DRAWER
                  ═══════════════════════════════════════════════ */}
                  <AnimatePresence>
                    {selectedStaff && (
                      <>
                        {/* Backdrop */}
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSelectedStaff(null)}
                          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
                        />
                        {/* Drawer */}
                        <motion.div
                          initial={{ x: '100%' }}
                          animate={{ x: 0 }}
                          exit={{ x: '100%' }}
                          transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                          className="fixed top-0 right-0 h-full w-full max-w-md bg-white/95 backdrop-blur-xl border-l border-zinc-200/80 shadow-2xl z-[70] flex flex-col"
                        >
                          {/* Drawer Header */}
                          <div className="relative overflow-hidden p-6 border-b border-zinc-100" style={{ background: 'linear-gradient(120deg, rgba(99,102,241,0.08), rgba(139,92,246,0.06))' }}>
                            <div className="hr-orb w-32 h-32 bg-violet-300/20 -top-10 -right-10" />
                            <div className="relative flex items-center justify-between mb-4">
                              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Employee Profile</h3>
                              <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedStaff(null)} className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
                                <X size={14} className="text-zinc-600" />
                              </motion.button>
                            </div>
                            <div className="relative flex items-center gap-4">
                              <motion.div
                                whileHover={{ scale: 1.08, rotate: -6 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${{ FRONTDESK: 'from-sky-400 to-blue-500', HOUSEKEEPING: 'from-amber-400 to-orange-500', Admin: 'from-indigo-400 to-violet-500', FINANCE: 'from-emerald-400 to-teal-500', RESTAURANT: 'from-rose-400 to-red-500', SALES: 'from-fuchsia-400 to-purple-500', TRAVEL: 'from-cyan-400 to-sky-500' }[selectedStaff.role] || 'from-zinc-400 to-zinc-500'
                                  } flex items-center justify-center text-white text-lg font-black shadow-md hr-ring-indigo`}>
                                {(selectedStaff.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                              </motion.div>
                              <div className="flex-1 space-y-1">
                                <input
                                  type="text"
                                  value={selectedStaff.name}
                                  onChange={e => setSelectedStaff({ ...selectedStaff, name: e.target.value })}
                                  onBlur={e => handleUpdateStaffProfile('name', e.target.value)}
                                  className="w-full bg-transparent border-none p-0 text-base font-black text-zinc-900 focus:ring-0 outline-none placeholder:text-zinc-300"
                                  placeholder="Employee Name"
                                />
                                <input
                                  type="email"
                                  value={selectedStaff.email}
                                  onChange={e => setSelectedStaff({ ...selectedStaff, email: e.target.value })}
                                  onBlur={e => handleUpdateStaffProfile('email', e.target.value)}
                                  className="w-full bg-transparent border-none p-0 text-xs text-zinc-400 focus:ring-0 outline-none placeholder:text-zinc-300"
                                  placeholder="employee@email.com"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Drawer Body — Scrollable */}
                          <div className="flex-1 overflow-y-auto fd-sidebar-scroll p-6">

                            <div className="space-y-6">
                              {/* Special Access Toggles */}
                              <div className="bg-white/50 border border-zinc-100 rounded-2xl p-5 shadow-sm space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Special Permissions</h4>
                                {[
                                  { key: 'can_process_refunds', title: 'Refund Approval Access', desc: 'Allow user to approve and process refunds' },
                                  { key: 'can_apply_discounts', title: 'Discount Approval Access', desc: 'Allow user to override rates and grant discounts' },
                                  { key: 'can_overbook', title: 'Overbooking Access', desc: 'Allow user to overbook room capacities manually' }
                                ].map(perm => (
                                  <div key={perm.key} className="flex items-center justify-between pb-3 border-b border-zinc-100/60 last:border-0 last:pb-0">
                                    <div>
                                      <p className="text-sm font-bold text-zinc-800">{perm.title}</p>
                                      <p className="text-[9px] font-medium text-zinc-400">{perm.desc}</p>
                                    </div>
                                    <button 
                                      onClick={() => handleUpdateHrHubPermission(perm.key, selectedStaff[perm.key])}
                                      className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${selectedStaff[perm.key] ? 'bg-indigo-500' : 'bg-zinc-200'}`}
                                    >
                                      <motion.div 
                                        animate={{ x: selectedStaff[perm.key] ? 24 : 2 }}
                                        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white shadow-sm"
                                      />
                                    </button>
                                  </div>
                                ))}
                              </div>

                              <form onSubmit={handleSaveSalaryConfig} className="space-y-5">
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Monthly Base Salary (₹)</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">₹</span>
                                    <input
                                      type="number"
                                      value={salaryForm.base_salary_monthly}
                                      onChange={e => setSalaryForm({ ...salaryForm, base_salary_monthly: e.target.value })}
                                      className="w-full bg-emerald-50/50 border border-emerald-200/60 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-zinc-800 outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 transition-all shadow-sm"
                                    />
                                  </div>
                                  <p className="text-[9px] text-zinc-400 mt-1">Full payout assuming 30 days of attendance.</p>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Per Day Absence Deduction (₹)</label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-rose-500 font-bold">₹</span>
                                    <input
                                      type="number"
                                      value={salaryForm.daily_deduction}
                                      onChange={e => setSalaryForm({ ...salaryForm, daily_deduction: e.target.value })}
                                      className="w-full bg-rose-50/50 border border-rose-200/60 rounded-xl pl-8 pr-4 py-2.5 text-sm font-bold text-zinc-800 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 transition-all shadow-sm"
                                    />
                                  </div>
                                  <p className="text-[9px] text-zinc-400 mt-1">Amount deduced for each day without logged active shifts.</p>
                                </div>

                                <motion.button
                                  whileHover={{ scale: 1.02, y: -1 }}
                                  whileTap={{ scale: 0.98 }}
                                  type="submit"
                                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:shadow-lg hover:shadow-emerald-500/30 text-white font-bold text-xs py-3 rounded-xl transition-shadow shadow-md"
                                >
                                  Save Configuration
                                </motion.button>
                              </form>

                              <div className="relative overflow-hidden p-4 bg-gradient-to-br from-indigo-50/60 to-white border border-indigo-100/70 rounded-2xl">
                                <div className="hr-orb w-24 h-24 bg-indigo-200/20 -bottom-6 -right-6" />
                                <label className="relative block text-[10px] font-black uppercase tracking-wider text-indigo-500 mb-3">Live Simulation (Current Month)</label>
                                {(() => {
                                  // Calculate attendance for this user for the current month
                                  const now = new Date();
                                  const uniqueDays = new Set();
                                  staffShifts
                                    .filter(s => s.user_id === selectedStaff.id)
                                    .forEach(s => {
                                      const d = new Date(s.login_time);
                                      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
                                        uniqueDays.add(d.toLocaleDateString('en-CA'));
                                      }
                                    });
                                  const presentDays = uniqueDays.size;
                                  const absentDays = Math.max(0, 30 - presentDays);
                                  const deduction = absentDays * (salaryForm.daily_deduction || 0);
                                  const finalSalary = Math.max(0, (salaryForm.base_salary_monthly || 0) - deduction);

                                  return (
                                    <div className="relative space-y-2 text-xs">
                                      <div className="flex justify-between">
                                        <span className="text-zinc-500">Days Logged (This Month)</span>
                                        <span className="font-bold text-zinc-800">{presentDays} / 30</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span className="text-zinc-500">Absence Deductions</span>
                                        <span className="font-bold text-rose-500">-₹{deduction.toFixed(2)}</span>
                                      </div>
                                      <div className="flex justify-between pt-2 border-t border-zinc-200/80">
                                        <span className="text-zinc-800 font-bold">Estimated Payout</span>
                                        <motion.span
                                          key={finalSalary}
                                          initial={{ scale: 1.15 }} animate={{ scale: 1 }}
                                          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                                          className="font-black text-emerald-600"
                                        >₹{finalSalary.toFixed(2)}</motion.span>
                                      </div>
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>

                          {/* Drawer Footer — Danger Zone */}
                          <div className="p-6 border-t border-zinc-100">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => { handleHROffboard(selectedStaff.id); setSelectedStaff(null); }}
                              className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs py-3 rounded-xl transition-colors flex items-center justify-center gap-2 hr-ring-rose"
                            >
                              <UserX size={14} /> Offboard & Revoke Access
                            </motion.button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  {/* ═══════════════════════════════════════════════
                      SALARY SLIP MODAL
                  ═══════════════════════════════════════════════ */}
                  <AnimatePresence>
                    {salarySlipData && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setSalarySlipData(null)}
                          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[80]"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                          className="fixed inset-0 flex items-center justify-center z-[90] p-4 pointer-events-none"
                        >
                          <div className="pointer-events-auto">
                            <div className="bg-white rounded-[1rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 w-full max-w-sm overflow-hidden relative flex flex-col max-h-[90vh]">
                              {/* Close */}
                              <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSalarySlipData(null)} className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors print:hidden z-10">
                                <X size={14} className="text-zinc-600" />
                              </motion.button>

                              {/* Slip Content */}
                              <div className="relative p-8 pb-4 overflow-hidden" id="salary-slip">
                                <div className="hr-orb w-40 h-40 bg-[#D4A373]/10 -top-16 -right-16 print:hidden" />
                                <div className="relative text-center mb-6">
                                  <motion.div
                                    whileHover={{ rotate: -8, scale: 1.08 }}
                                    className="w-12 h-12 bg-[#D4A373] text-white flex items-center justify-center rounded-xl mx-auto mb-3 font-black text-xl shadow-sm"
                                  >H</motion.div>
                                  <h2 className="text-sm font-black uppercase tracking-widest text-zinc-900">Hotel Pragati</h2>
                                  <p className="text-[10px] text-zinc-500">Official Salary Receipt</p>
                                </div>

                                <div className="relative space-y-4 text-xs">
                                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                                    <span className="text-zinc-500">Employee</span>
                                    <span className="font-bold text-zinc-900">{salarySlipData.emp.name}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-zinc-100 pb-2">
                                    <span className="text-zinc-500">Role</span>
                                    <span className="font-bold text-zinc-900">{salarySlipData.emp.role}</span>
                                  </div>
                                  <div className="flex justify-between border-b border-zinc-100 pb-2 items-center">
                                    <span className="text-zinc-500">Period</span>
                                    <input
                                      type="text"
                                      value={salarySlipData.month}
                                      onChange={e => setSalarySlipData({ ...salarySlipData, month: e.target.value })}
                                      className="w-24 text-right bg-transparent border-b border-dashed border-zinc-300 focus:border-indigo-500 outline-none font-bold text-zinc-900 print:border-none print:w-auto"
                                    />
                                  </div>
                                  <div className="flex justify-between border-b border-zinc-100 pb-2 items-center">
                                    <span className="text-zinc-500">Base Salary (₹)</span>
                                    <input
                                      type="number"
                                      value={salarySlipData.sConf.base_salary_monthly}
                                      onChange={e => setSalarySlipData({ ...salarySlipData, sConf: { ...salarySlipData.sConf, base_salary_monthly: e.target.value } })}
                                      className="w-20 text-right bg-transparent border-b border-dashed border-zinc-300 focus:border-indigo-500 outline-none font-bold text-zinc-900 print:border-none print:w-auto"
                                    />
                                  </div>
                                  <div className="flex justify-between border-b border-zinc-100 pb-2 items-center">
                                    <span className="text-zinc-500">Days Present</span>
                                    <div className="flex items-center gap-1">
                                      <input
                                        type="number"
                                        value={salarySlipData.presentDays}
                                        onChange={e => setSalarySlipData({ ...salarySlipData, presentDays: e.target.value })}
                                        className="w-12 text-right bg-transparent border-b border-dashed border-zinc-300 focus:border-indigo-500 outline-none font-bold text-zinc-900 print:border-none print:w-auto"
                                      />
                                      <span className="font-bold text-zinc-900">/ 30</span>
                                    </div>
                                  </div>
                                  <div className="flex justify-between border-b border-zinc-200 pb-2 items-center">
                                    <span className="text-rose-500">Deductions (₹)</span>
                                    <div className="flex items-center">
                                      <span className="font-bold text-rose-500">-</span>
                                      <input
                                        type="number"
                                        value={salarySlipData.deduction}
                                        onChange={e => setSalarySlipData({ ...salarySlipData, deduction: e.target.value })}
                                        className="w-16 text-right bg-transparent border-b border-dashed border-rose-300 focus:border-rose-500 outline-none font-bold text-rose-500 print:border-none print:w-auto"
                                      />
                                    </div>
                                  </div>
                                  <div className="flex justify-between pt-2 items-center">
                                    <span className="text-sm font-black uppercase tracking-wider text-zinc-900">Net Payout (₹)</span>
                                    <input
                                      type="number"
                                      value={salarySlipData.finalSalary}
                                      onChange={e => setSalarySlipData({ ...salarySlipData, finalSalary: e.target.value })}
                                      className="w-24 text-right bg-transparent border-b border-dashed border-emerald-300 focus:border-emerald-500 outline-none text-xl font-black text-emerald-600 print:border-none print:w-auto"
                                    />
                                  </div>
                                </div>

                                <div className="relative mt-8 text-center border-t border-dashed border-zinc-300 pt-4">
                                  <p className="text-[9px] text-zinc-400 italic">This is an electronically generated receipt.</p>
                                  <p className="text-[9px] text-zinc-400 font-mono mt-1">{new Date().toLocaleString()}</p>
                                </div>
                              </div>

                              <div className="p-4 bg-zinc-50 border-t border-zinc-100 flex gap-2 print:hidden">
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={() => window.print()}
                                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-lg hover:shadow-indigo-500/30 text-white font-bold text-xs py-3 rounded-xl transition-shadow shadow-md"
                                >
                                  Print Receipt
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                  {/* ═══════════════════════════════════════════════
                      ONBOARDING MODAL
                  ═══════════════════════════════════════════════ */}
                  <AnimatePresence>
                    {showOnboardModal && (
                      <>
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowOnboardModal(false)}
                          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                          className="fixed inset-0 flex items-center justify-center z-[70] p-4"
                        >
                          <div>
                            <div className="relative overflow-hidden bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 w-full max-w-lg p-8">
                              <div className="hr-orb w-40 h-40 bg-[#D4A373]/10 -top-16 -right-16" />
                              {/* Close */}
                              <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowOnboardModal(false)} className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors z-10">
                                <X size={14} className="text-zinc-600" />
                              </motion.button>

                              {/* Header */}
                              <div className="relative mb-6">
                                <motion.div
                                  whileHover={{ rotate: -10, scale: 1.08 }}
                                  animate={{ y: [0, -3, 0] }}
                                  transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut' } }}
                                  className="w-12 h-12 rounded-2xl bg-[#D4A373] flex items-center justify-center text-white mb-4 shadow-sm"
                                >
                                  <UserCheck size={22} />
                                </motion.div>
                                <h3 className="text-lg font-black text-zinc-900 tracking-tight">Provision New Employee</h3>
                                <p className="text-xs text-zinc-400 mt-1">Create login credentials for the new hire. They'll be able to log in immediately.</p>
                              </div>

                              {/* Form */}
                              <form onSubmit={handleHROnboard} className="relative space-y-4">
                                <div>
                                  <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">Full Name</label>
                                  <input
                                    type="text" required placeholder="e.g. Rahul Sharma"
                                    value={onboardForm.name}
                                    onChange={e => setOnboardForm({ ...onboardForm, name: e.target.value })}
                                    className="w-full bg-indigo-50/40 border border-indigo-200/60 rounded-xl px-4 py-2.5 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all shadow-sm"
                                  />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">Email</label>
                                    <input
                                      type="email" required placeholder="rahul@hotel.com"
                                      value={onboardForm.email}
                                      onChange={e => setOnboardForm({ ...onboardForm, email: e.target.value })}
                                      className="w-full bg-indigo-50/40 border border-indigo-200/60 rounded-xl px-4 py-2.5 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all shadow-sm"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">Temp Password</label>
                                    <input
                                      type="password" required placeholder="••••••••"
                                      value={onboardForm.password}
                                      onChange={e => setOnboardForm({ ...onboardForm, password: e.target.value })}
                                      className="w-full bg-indigo-50/40 border border-indigo-200/60 rounded-xl px-4 py-2.5 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all shadow-sm"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">Operational Role</label>
                                  <select
                                    value={onboardForm.role}
                                    onChange={e => setOnboardForm({ ...onboardForm, role: e.target.value })}
                                    className="w-full bg-indigo-50/40 border border-indigo-200/60 rounded-xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 transition-all appearance-none cursor-pointer shadow-sm"
                                  >
                                    <option value="FRONTDESK">RECEPTION (Front Desk)</option>
                                    <option value="HOUSEKEEPING">HOUSEKEEPING (Cleaning)</option>
                                    <option value="FINANCE">FINANCE</option>
                                    <option value="RESTAURANT">RESTAURANT (Dining)</option>
                                    <option value="SALES">SALES</option>
                                    <option value="TRAVEL">TRAVEL</option>
                                    <option value="ADMIN">ADMIN (admin)</option>
                                  </select>
                                </div>

                                {/* Feedback */}
                                {onboardSuccess && (
                                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl text-center flex items-center justify-center gap-2">
                                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }}>
                                      <CheckCircle size={14} />
                                    </motion.span>
                                    {onboardSuccess}
                                  </motion.div>
                                )}
                                {onboardError && (
                                  <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl text-center">
                                    {onboardError}
                                  </motion.div>
                                )}

                                <motion.button
                                  type="submit"
                                  whileHover={{ scale: 1.02, y: -1 }}
                                  whileTap={{ scale: 0.98 }}
                                  className="relative w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:shadow-xl hover:shadow-indigo-500/30 text-white font-bold text-sm py-3 rounded-xl shadow-lg transition-shadow flex items-center justify-center gap-2 overflow-hidden"
                                >
                                  <motion.span animate={{ rotate: [0, 90, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex">
                                    <Plus size={14} />
                                  </motion.span>
                                  Provision Account
                                </motion.button>
                              </form>
                            </div>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>

                </motion.div>
    </>
  );
}
