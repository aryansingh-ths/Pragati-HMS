import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Utensils, Coffee, Clock, CheckCircle2, ChefHat, Receipt,
  Calendar, Users, BellRing, Building2, Search, ArrowUpRight,
  TrendingUp, PieChart, LayoutGrid, X, Loader2, Plus, Flame, MapPin, 
  RefreshCw // <-- Added the missing import here
} from 'lucide-react';

// =============================================
// Helper Components
// =============================================

function DonutChart({ data, size = 170, centerLabel = 'Orders' }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <div className="flex items-center justify-center text-zinc-400 text-sm" style={{ width: size, height: size }}>No Data</div>;
  const radius = 62; const strokeWidth = 20; const cx = size / 2; const cy = size / 2; let cumulativePercent = 0;
  const getCoord = (percent) => { const angle = percent * 2 * Math.PI - Math.PI / 2; return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) }; };

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((segment, i) => {
          const percent = segment.value / total;
          if (percent === 0) return null;
          const startAngle = cumulativePercent; cumulativePercent += percent; const endAngle = cumulativePercent;
          const start = getCoord(startAngle); const end = getCoord(endAngle); const largeArc = percent > 0.5 ? 1 : 0;
          const d = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
          return (
            <motion.path key={i} d={d} fill="none" stroke={segment.color} strokeWidth={strokeWidth} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 }}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} whileHover={{ strokeWidth: strokeWidth + 4 }} />
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-zinc-900" style={{ fontSize: '24px', fontWeight: 900 }}>{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{centerLabel}</text>
      </svg>
    </div>
  );
}

function OrderTrendLine({ data = [] }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const width = 600; const height = 160; const padX = 24; const padY = 20;
  const max = Math.max(...data.map(t => t.value), 1); const min = Math.min(...data.map(t => t.value), 0); const range = max - min || 1;
  const points = data.map((t, i) => {
    const x = padX + (i / (data.length - 1 || 1)) * (width - padX * 2);
    const y = padY + (1 - (t.value - min) / range) * (height - padY * 2);
    return { ...t, x, y };
  });
  const linePath = points.map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : ` L${p.x} ${p.y}`)).join('');
  const areaPath = `${linePath} L${points[points.length - 1]?.x || 0} ${height - padY} L${points[0]?.x || 0} ${height - padY} Z`;
  const active = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 overflow-visible" onMouseLeave={() => setHoverIdx(null)}>
        <defs>
          <linearGradient id="orderAreaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#f59e0b" stopOpacity="0.28" /><stop offset="100%" stopColor="#f59e0b" stopOpacity="0" /></linearGradient>
          <linearGradient id="orderLineStroke" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" /></linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f, i) => (<line key={i} x1={padX} x2={width - padX} y1={padY + f * (height - padY * 2)} y2={padY + f * (height - padY * 2)} stroke="#f1f2f6" strokeWidth="1" />))}
        <motion.path d={areaPath} fill="url(#orderAreaFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} />
        <motion.path d={linePath} fill="none" stroke="url(#orderLineStroke)" strokeWidth={active ? 3.5 : 2.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ pathLength: { duration: 1.4, ease: 'easeOut' } }} />
        {points.map((p, i) => (
          <g key={i}>
            <rect x={p.x - (width / data.length) / 2} y={0} width={width / data.length} height={height} fill="transparent" onMouseEnter={() => setHoverIdx(i)} />
            {p.isToday && <motion.circle cx={p.x} cy={p.y} initial={{ r: 8 }} fill="none" stroke="#f43f5e" strokeWidth="2" animate={{ scale: [1, 2.2, 1], opacity: [0.9, 0.1, 0.9] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} style={{ pointerEvents: 'none' }} />}
            <motion.circle cx={p.x} cy={p.y} initial={{ r: p.isToday ? 5 : 3 }} fill={p.isToday ? "#f43f5e" : "#ffffff"} stroke="#d97706" strokeWidth={hoverIdx === i ? 3 : 2} animate={{ r: hoverIdx === i ? 6 : (p.isToday ? 5 : 3) }} style={{ cursor: 'pointer' }} />
          </g>
        ))}
      </svg>
      <AnimatePresence>
        {active && (
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }} className="absolute pointer-events-none px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white text-[10px] font-bold shadow-lg shadow-amber-500/20 whitespace-nowrap" style={{ left: `${(active.x / width) * 100}%`, top: `${(active.y / height) * 100}%`, transform: 'translate(-50%, -140%)' }}>
            {active.label}: <span className="text-amber-300">{active.value} Orders</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between mt-1 px-1">
        {data.map((t, i) => (<span key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} className={`text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all duration-200 ${hoverIdx === i ? 'text-amber-600' : (t.isToday ? 'text-rose-500 animate-pulse font-extrabold' : 'text-zinc-400')}`}>{t.label}</span>))}
      </div>
    </div>
  );
}

// =============================================
// MAIN DASHBOARD COMPONENT
// =============================================
export default function DiningDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.state?.fromAdmin === true || sessionStorage.getItem('hms_role')?.toUpperCase() === 'ADMIN';

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // Filters & State
  const [orderSearch, setOrderSearch] = useState('');
  const [isKOTModalOpen, setIsKOTModalOpen] = useState(false);
  const [kotForm, setKotForm] = useState({ table: '', items: '', notes: '' });

  const refresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 700);
  };

  // --- MOCK DATA FOR F&B OPERATIONS ---
  const themeMap = {
    amber: { iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30', glow: 'rgba(245,158,11,0.35)', ring: '#d97706' },
    rose: { iconBg: 'bg-gradient-to-br from-rose-400 to-pink-600 text-white shadow-lg shadow-rose-500/30', glow: 'rgba(244,63,94,0.35)', ring: '#e11d48' },
    emerald: { iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30', glow: 'rgba(16,185,129,0.35)', ring: '#059669' },
    indigo: { iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30', glow: 'rgba(99,102,241,0.35)', ring: '#4f46e5' },
  };

  const metrics = [
    { label: "Today's Revenue", value: "₹42,500", sub: "Rooms & Walk-ins", icon: <Receipt size={16} />, theme: 'emerald' },
    { label: "Active KOTs", value: "14", sub: "Orders preparing in kitchen", icon: <Flame size={16} />, theme: 'rose' },
    { label: "Avg Prep Time", value: "18m", sub: "-2m compared to yesterday", icon: <Clock size={16} />, theme: 'amber' },
    { label: "Tables Occupied", value: "8/15", sub: "54% current seating capacity", icon: <Users size={16} />, theme: 'indigo' },
  ];

  const orderTrend = [
    { label: 'Mon', value: 84 }, { label: 'Tue', value: 92 }, { label: 'Wed', value: 110 },
    { label: 'Thu', value: 105 }, { label: 'Fri', value: 135 }, { label: 'Sat', value: 156 },
    { label: 'Today', value: 88, isToday: true },
  ];

  const salesSplit = [
    { label: 'In-Room Dining', value: 45, color: '#0ea5e9' },
    { label: 'Restaurant Dine-in', value: 30, color: '#f59e0b' },
    { label: 'Bar & Lounge', value: 13, color: '#ec4899' },
  ];

  const [activeKOTs, setActiveKOTs] = useState([
    { id: 'KOT-801', table: 'Table 4', items: '2x Butter Chicken, 4x Garlic Naan, 1x Mojito', time: '12 mins ago', status: 'Preparing', type: 'Dine-in' },
    { id: 'KOT-802', table: 'Room 205', items: '1x Club Sandwich, 1x Cold Coffee', time: '4 mins ago', status: 'New', type: 'Room Service' },
    { id: 'KOT-803', table: 'Table 12', items: '1x Paneer Tikka, 2x Fresh Lime Soda', time: '18 mins ago', status: 'Ready', type: 'Dine-in' },
    { id: 'KOT-804', table: 'Table 2', items: '1x Margarita Pizza, 1x Caesar Salad', time: '22 mins ago', status: 'Served', type: 'Dine-in' },
    { id: 'KOT-805', table: 'Room 312', items: '2x Continental Breakfast, 2x Espresso', time: '8 mins ago', status: 'Preparing', type: 'Room Service' },
  ]);

  const tables = [
    { id: 'T1', capacity: 2, status: 'Available' }, { id: 'T2', capacity: 4, status: 'Occupied', time: '45m' },
    { id: 'T3', capacity: 4, status: 'Dirty' }, { id: 'T4', capacity: 6, status: 'Occupied', time: '15m' },
    { id: 'T5', capacity: 2, status: 'Available' }, { id: 'T6', capacity: 8, status: 'Reserved', time: '8:00 PM' },
    { id: 'T7', capacity: 4, status: 'Available' }, { id: 'T8', capacity: 4, status: 'Occupied', time: '55m' },
  ];

  const menuPerformance = [
    { item: 'Butter Chicken', category: 'Main Course', orders: 145, revenue: 65250, status: 'In Stock' },
    { item: 'Club Sandwich', category: 'Snacks', orders: 98, revenue: 24500, status: 'In Stock' },
    { item: 'Paneer Tikka', category: 'Starters', orders: 84, revenue: 26880, status: 'Low Stock' },
    { item: 'Fresh Lime Soda', category: 'Beverages', orders: 112, revenue: 16800, status: 'In Stock' },
  ];

  const handleAddKOT = (e) => {
    e.preventDefault();
    if (!kotForm.table || !kotForm.items) return;
    setActiveKOTs([{
      id: `KOT-${800 + activeKOTs.length + 1}`, table: kotForm.table, items: kotForm.items, time: 'Just now', status: 'New', type: kotForm.table.includes('Room') ? 'Room Service' : 'Dine-in'
    }, ...activeKOTs]);
    setIsKOTModalOpen(false);
    setKotForm({ table: '', items: '', notes: '' });
  };

  const navGroups = [
    { heading: 'F&B Operations', items: [{ key: 'overview', label: 'Dashboard', icon: <PieChart size={15} /> }, { key: 'kots', label: 'Kitchen Orders (KOT)', icon: <ChefHat size={15} /> }, { key: 'tables', label: 'Table Management', icon: <LayoutGrid size={15} /> }] },
    { heading: 'Management', items: [{ key: 'menu', label: 'Menu & Inventory', icon: <Utensils size={15} /> }, { key: 'billing', label: 'Billing & Settlements', icon: <Receipt size={15} /> }] }
  ];

  return (
    <div className="min-h-[calc(100vh-6rem)] relative dd-app-bg dd-scrollbar p-6 flex flex-col lg:flex-row gap-6">
      <style>{`
        .dd-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(161,161,170,0.4) transparent; }
        .dd-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .dd-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .dd-scrollbar::-webkit-scrollbar-thumb { background: rgba(161, 161, 170, 0.45); border-radius: 999px; }
        
        .dd-app-bg {
          background:
            radial-gradient(1000px 520px at 8% -10%, rgba(245,158,11,0.12) 0%, transparent 55%),
            radial-gradient(900px 500px at 105% 8%, rgba(244,63,94,0.12) 0%, transparent 55%),
            radial-gradient(760px 500px at 45% 115%, rgba(16,185,129,0.08) 0%, transparent 60%),
            linear-gradient(180deg, #fffbeb 0%, #ffedd5 45%, #fef2f2 100%) !important;
          background-attachment: fixed;
          background-size: 140% 140%, 140% 140%, 140% 140%, auto;
          animation: dd-mesh-shift 24s ease-in-out infinite;
        }
        @keyframes dd-mesh-shift { 0%, 100% { background-position: 0% 0%, 100% 0%, 50% 100%, 0 0; } 50% { background-position: 10% 8%, 90% 10%, 44% 92%, 0 0; } }

        .dd-sidebar { background: #FFFFFF; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); border: 1px solid rgba(226, 232, 240, 0.8); }
        .dd-card { background: #FFFFFF; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0px 18px 40px 0px rgba(112, 144, 176, 0.08); transition: all 0.3s ease; }
        .dd-glass-backdrop { background: rgba(24, 24, 27, 0.4); backdrop-filter: blur(10px); }
        .dd-glass-modal { background: rgba(255, 255, 255, 0.98); border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 30px 70px -12px rgba(245,158,11, 0.25); backdrop-filter: blur(24px); }
        .dd-input { width: 100%; padding: 0.75rem 1.1rem; background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 1rem; font-size: 0.875rem; font-weight: 500; outline: none; transition: border 0.3s; }
        .dd-input:focus { border-color: #F59E0B; }
      `}</style>

      {/* SIDEBAR */}
      <div className="w-full lg:w-72 shrink-0 rounded-[2rem] p-6 flex flex-col gap-6 dd-sidebar sticky top-[7.5rem] self-start z-30 lg:h-[calc(100vh-7.8rem)]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/30 shrink-0">
            <Coffee size={19} />
          </div>
          <div>
            <h1 className="font-serif font-black text-[23px] text-zinc-600 text-base leading-none">Restaurant</h1>
            <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest mt-1 block">F&B Operations</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1">
          {navGroups.map(group => (
            <div key={group.heading}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">{group.heading}</p>
              <div className="flex flex-col gap-1">
                {group.items.map(item => (
                  <button key={item.key} onClick={() => setActiveTab(item.key)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === item.key ? 'bg-amber-500 text-white shadow-md shadow-amber-500/10' : 'text-zinc-500 hover:bg-orange-50 hover:text-zinc-900'}`}>
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {isAdmin && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Command Center</p>
              <button onClick={() => navigate('/dashboard/Admin')} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:bg-orange-50 hover:text-amber-600 transition-all text-left">
                <span className="flex items-center gap-3"><Building2 size={15} /> Back to Admin</span><ArrowUpRight size={14} className="opacity-50" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-zinc-600 tracking-tight mt-0.5">
              {{ overview: 'Dining Overview', kots: 'Kitchen Order Tickets', tables: 'Table Management', menu: 'Menu & Inventory', billing: 'Billing & Settlements' }[activeTab]}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Manage kitchen workflows, restaurant seating, and F&B revenue.</p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            <button onClick={refresh} className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 transition-all"><RefreshCw size={15} className={isLoading ? 'animate-spin' : ''}/></button>
            <div className="hidden md:flex items-center gap-2 bg-white pl-2.5 pr-3 py-1.5 rounded-xl border border-zinc-200 shadow-xs">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">D</div>
              <div className="text-left leading-none">
                <span className="text-xs font-bold text-zinc-900 block">F&B Admin</span>
                <span className="text-[8px] font-semibold text-zinc-500 uppercase tracking-widest mt-0.5 block">Restaurant</span>
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          <div className="space-y-6">

            {/* TAB: OVERVIEW */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {metrics.map((kpi, i) => {
                    const t = themeMap[kpi.theme];
                    return (
                      <div key={i} className="bg-white rounded-[1.75rem] p-5 border border-zinc-200/60 flex flex-col justify-between" style={{ boxShadow: `0 14px 30px -18px ${t.glow}` }}>
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${t.iconBg}`}>{kpi.icon}</div>
                        <div>
                          <p className="text-3xl font-black text-zinc-900 leading-none mb-1.5">{kpi.value}</p>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">{kpi.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-[2rem] p-6 border border-zinc-200/60 shadow-sm relative overflow-hidden">
                    <div className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />
                    <h3 className="font-black text-sm uppercase mb-4 flex items-center gap-2 text-zinc-800"><TrendingUp size={16} className="text-amber-500"/> Order Volume Trend</h3>
                    <OrderTrendLine data={orderTrend} />
                  </div>
                  <div className="bg-white rounded-[2rem] p-6 border border-zinc-200/60 shadow-sm relative overflow-hidden">
                    <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-rose-200/20 blur-3xl pointer-events-none" />
                    <h3 className="font-black text-sm uppercase mb-4 flex items-center gap-2 text-zinc-800"><PieChart size={16} className="text-rose-500"/> Sales by Outlet</h3>
                    <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                      <DonutChart data={salesSplit} centerLabel="Orders" />
                      <div className="grid grid-cols-1 gap-y-2.5">
                        {salesSplit.map((d, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                            <span className="text-[11px] text-zinc-500 font-semibold">{d.label}</span>
                            <span className="text-xs font-black text-zinc-900 ml-auto">{d.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* TAB: KITCHEN ORDER TICKETS (KOT) */}
            {activeTab === 'kots' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 h-[calc(100vh-14rem)] flex flex-col">
                <div className="flex justify-between items-center bg-white p-4 rounded-[1.5rem] border border-zinc-200/60 shrink-0">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase text-zinc-800"><ChefHat size={16} className="text-amber-500"/> Live Kitchen Display</div>
                  <button onClick={() => setIsKOTModalOpen(true)} className="bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase hover:bg-amber-600 transition-colors flex items-center gap-1"><Plus size={14}/> Punch Order</button>
                </div>
                
                <div className="flex-1 flex gap-4 overflow-x-auto dd-scrollbar pb-2">
                  {['New', 'Preparing', 'Ready', 'Served'].map(status => {
                    const columnKOTs = activeKOTs.filter(k => k.status === status);
                    const colColor = status === 'New' ? '#0ea5e9' : status === 'Preparing' ? '#f59e0b' : status === 'Ready' ? '#10b981' : '#6b7280';
                    return (
                      <div key={status} className="w-72 shrink-0 flex flex-col gap-3 bg-zinc-50/50 rounded-3xl p-3 border border-zinc-100">
                        <div className="flex items-center justify-between px-2 pt-1">
                          <h4 className="text-xs font-black uppercase tracking-wider text-zinc-700 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: colColor }}/> {status}</h4>
                          <span className="text-[10px] font-bold text-zinc-500 bg-white px-2 py-0.5 rounded-full border border-zinc-200">{columnKOTs.length}</span>
                        </div>
                        <div className="flex flex-col gap-3 overflow-y-auto dd-scrollbar h-full">
                          {columnKOTs.map(kot => (
                            <div key={kot.id} className="bg-white p-4 rounded-2xl border border-zinc-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-all cursor-pointer">
                              <div className="absolute top-0 left-0 w-1 h-full" style={{ background: colColor }} />
                              <div className="flex justify-between items-start mb-2 pl-2">
                                <span className="font-bold text-sm text-zinc-900">{kot.table}</span>
                                <span className="text-[9px] font-bold bg-zinc-100 px-1.5 py-0.5 rounded text-zinc-500 uppercase tracking-widest">{kot.type}</span>
                              </div>
                              <p className="text-xs text-zinc-600 font-medium pl-2 leading-relaxed mb-3">{kot.items}</p>
                              <div className="flex justify-between items-center pl-2 border-t border-zinc-100 pt-2 mt-auto">
                                <span className="text-[10px] text-zinc-400 font-semibold flex items-center gap-1"><Clock size={11}/> {kot.time}</span>
                                <span className="text-[10px] font-mono font-bold text-zinc-300">{kot.id}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB: TABLE MANAGEMENT */}
            {activeTab === 'tables' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="bg-white p-5 rounded-[1.5rem] border border-zinc-200/60 flex flex-wrap gap-4 justify-between items-center">
                  <div className="flex items-center gap-2 text-sm font-bold uppercase text-zinc-800"><MapPin size={16} className="text-indigo-500"/> Floor Plan Status</div>
                  <div className="flex gap-4 text-xs font-bold text-zinc-500">
                    <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-emerald-100 border border-emerald-400"/> Available</span>
                    <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-rose-100 border border-rose-400"/> Occupied</span>
                    <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-100 border border-amber-400"/> Dirty</span>
                    <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-sky-100 border border-sky-400"/> Reserved</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {tables.map(t => {
                    const styles = {
                      Available: 'bg-emerald-50 border-emerald-200 text-emerald-700',
                      Occupied: 'bg-rose-50 border-rose-200 text-rose-700',
                      Dirty: 'bg-amber-50 border-amber-200 text-amber-700',
                      Reserved: 'bg-sky-50 border-sky-200 text-sky-700'
                    }[t.status];
                    return (
                      <div key={t.id} className={`p-4 rounded-[1.5rem] border-2 flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 cursor-pointer shadow-sm ${styles}`}>
                        <div className="flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-widest opacity-60"><span>{t.capacity} Pax</span><span>{t.time || ''}</span></div>
                        <h3 className="text-2xl font-black">{t.id}</h3>
                        <span className="text-[10px] font-black uppercase tracking-widest bg-white/50 px-2 py-0.5 rounded-md">{t.status}</span>
                      </div>
                    )
                  })}
                </div>
              </motion.div>
            )}

            {/* TAB: MENU & INVENTORY */}
            {activeTab === 'menu' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="dd-card rounded-[2rem] overflow-hidden">
                  <div className="p-5 border-b border-zinc-150 flex justify-between items-center bg-white/40">
                    <h3 className="font-bold flex gap-2 text-sm uppercase"><Utensils size={16} className="text-amber-600" /> Top Performing Items</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead><tr className="border-b border-zinc-150 text-[10px] uppercase text-zinc-400 bg-zinc-50/50"><th className="p-4">Item Name</th><th className="p-4">Category</th><th className="p-4 text-center">Orders (Month)</th><th className="p-4 text-right">Revenue Generated</th><th className="p-4 text-right">Inventory Status</th></tr></thead>
                      <tbody className="divide-y divide-zinc-100">
                        {menuPerformance.map((m, idx) => (
                          <tr key={idx} className="hover:bg-zinc-50/60">
                            <td className="p-4 text-sm font-bold text-zinc-900">{m.item}</td>
                            <td className="p-4"><span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">{m.category}</span></td>
                            <td className="p-4 text-sm font-bold text-zinc-600 text-center">{m.orders}</td>
                            <td className="p-4 text-sm font-bold text-emerald-600 text-right">₹{m.revenue.toLocaleString('en-IN')}</td>
                            <td className="p-4 text-right"><span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase border ${m.status === 'Low Stock' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}>{m.status}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* FALLBACK FOR UNIMPLEMENTED TABS */}
            {activeTab === 'billing' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="dd-card rounded-[2rem] p-8 text-center text-zinc-500">
                <Receipt size={32} className="mx-auto mb-3 text-amber-500 opacity-50" />
                <h3 className="font-bold text-lg text-zinc-900 mb-2">Billing Module</h3>
                <p className="text-sm">Connects directly to the main Finance ledger. (See Finance Dashboard)</p>
              </motion.div>
            )}

          </div>
        </AnimatePresence>
      </div>

      {/* KOT MODAL */}
      <AnimatePresence>
        {isKOTModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-55 flex items-center justify-center dd-glass-backdrop p-4" onClick={() => setIsKOTModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="w-full max-w-md dd-glass-modal rounded-3xl p-7">
              <div className="flex justify-between items-center mb-6"><div><h2 className="text-lg font-serif font-bold text-zinc-900">Punch KOT</h2></div><button onClick={() => setIsKOTModalOpen(false)}><X size={20} className="text-zinc-500"/></button></div>
              <form onSubmit={handleAddKOT} className="space-y-4">
                <div><label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Table / Room</label><input required placeholder="e.g. Table 5 or Room 102" value={kotForm.table} onChange={e => setKotForm({ ...kotForm, table: e.target.value })} className="dd-input" /></div>
                <div><label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Order Items</label><textarea required rows={4} placeholder="e.g. 2x Butter Chicken, 1x Naan" value={kotForm.items} onChange={e => setKotForm({ ...kotForm, items: e.target.value })} className="dd-input resize-none" /></div>
                <button type="submit" className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition-colors">Send to Kitchen</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}