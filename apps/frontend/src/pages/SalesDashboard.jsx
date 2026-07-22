import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Target, TrendingUp, Briefcase, Handshake, Calendar, Search, Plus, X, Loader2,
  AlertTriangle, CheckCircle2, Clock, XCircle, Send, FileText, DollarSign,
  ArrowUpRight, Star, ChevronRight, PieChart, Trophy, CalendarClock, Eye,
  PhoneCall, Mail, CheckSquare, ListTodo, Flame, Activity, ShieldCheck, Globe,
  User, Building2, MapPin, BarChart3, ArrowRight, Percent, TrendingDown, LogOut, Zap } from 'lucide-react';

// =============================================
// SVG DONUT CHART
// =============================================
function DonutChart({ data, size = 180, centerLabel = 'Total' }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <div className="flex items-center justify-center text-zinc-400 text-sm" style={{ width: size, height: size }}>No Data</div>;

  const radius = 70;
  const strokeWidth = 24;
  const cx = size / 2;
  const cy = size / 2;
  let cumulativePercent = 0;

  const getCoord = (percent) => {
    const angle = percent * 2 * Math.PI - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((segment, i) => {
          const percent = segment.value / total;
          if (percent === 0) return null;
          const startAngle = cumulativePercent;
          cumulativePercent += percent;
          const endAngle = cumulativePercent;

          const start = getCoord(startAngle);
          const end = getCoord(endAngle);
          const largeArc = percent > 0.5 ? 1 : 0;
          const d = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;

          return (
            <motion.path
              key={i} d={d} fill="none" stroke={segment.color} strokeWidth={strokeWidth} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 }}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              whileHover={{ strokeWidth: strokeWidth + 4, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}
            />
          );
        })}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-zinc-900" style={{ fontSize: '18px', fontWeight: 900 }}>
          {centerLabel === 'Bookings' ? total : `₹${(total / 100000).toFixed(1)}L`}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{centerLabel}</text>
      </svg>
    </div>
  );
}

// =============================================
// HORIZONTAL BAR RANK CHART
// =============================================
function BarRankChart({ data = [], currency = true }) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const max = Math.max(...sorted.map(d => d.value), 1);

  return (
    <div className="flex flex-col gap-3.5">
      {sorted.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ background: d.color }}>
            {d.icon || <Globe size={14} />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-zinc-600 truncate">{d.label}</span>
              <span className="text-[11px] font-black text-zinc-900 shrink-0 ml-2">{currency ? `₹${d.value.toLocaleString('en-IN')}` : d.value}</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(d.value / max) * 100}%` }}
                transition={{ duration: 0.9, delay: i * 0.06, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: d.color }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================
// SVG AREA GRAPH: TARGET VS REVENUE
// =============================================
function TargetVsRevenueChart({ period }) {
  // Mock trend data for different periods
  const trendData = {
    Daily: [
      { label: 'Mon', target: 20, revenue: 15 },
      { label: 'Tue', target: 25, revenue: 30 },
      { label: 'Wed', target: 30, revenue: 25 },
      { label: 'Thu', target: 35, revenue: 45 },
      { label: 'Fri', target: 40, revenue: 38 },
      { label: 'Sat', target: 45, revenue: 55 },
      { label: 'Sun', target: 50, revenue: 60 },
    ],
    Weekly: [
      { label: 'Week 1', target: 150, revenue: 120 },
      { label: 'Week 2', target: 180, revenue: 190 },
      { label: 'Week 3', target: 200, revenue: 170 },
      { label: 'Week 4', target: 250, revenue: 290 },
    ],
    Monthly: [
      { label: 'Jan', target: 500, revenue: 450 },
      { label: 'Feb', target: 550, revenue: 600 },
      { label: 'Mar', target: 600, revenue: 580 },
      { label: 'Apr', target: 700, revenue: 750 },
      { label: 'May', target: 800, revenue: 720 },
      { label: 'Jun', target: 900, revenue: 980 },
    ],
    Yearly: [
      { label: '2023', target: 4000, revenue: 3800 },
      { label: '2024', target: 5500, revenue: 5900 },
      { label: '2025', target: 7000, revenue: 6800 },
      { label: '2026', target: 8500, revenue: 9200 },
    ],
  };

  const data = trendData[period];
  const maxVal = Math.max(...data.map(d => Math.max(d.target, d.revenue))) * 1.15; // 15% padding top
  
  const width = 600;
  const height = 180;
  const paddingX = 30;
  const paddingY = 20;
  
  const getX = (index) => paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
  const getY = (value) => height - paddingY - (value / maxVal) * (height - paddingY * 2);

  // Generate SVG Paths
  const targetPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(d.target)}`).join(' ');
  const revenuePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(d.revenue)}`).join(' ');
  const revenueArea = `${revenuePath} L ${getX(data.length - 1)},${height - paddingY} L ${getX(0)},${height - paddingY} Z`;

  return (
    <div className="flex flex-col mt-2 w-full overflow-hidden">
      <div className="flex items-center justify-end gap-4 mb-2 pr-4">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase">
          <div className="w-3 border-t-2 border-dashed border-zinc-400"></div> Target
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-[#D4A373] uppercase">
          <div className="w-3 border-t-2 border-[#D4A373]"></div> Revenue
        </div>
      </div>
      
      <div className="w-full overflow-x-auto sd-scrollbar">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[400px] h-auto drop-shadow-sm">
          <defs>
            {/* Gradient for Revenue Area */}
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
              <stop offset="80%" stopColor="#7c3aed" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines (Y-axis) */}
          {[0, 0.5, 1].map(ratio => {
            const y = height - paddingY - (ratio * (height - paddingY * 2));
            return (
              <line key={ratio} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4 4" />
            );
          })}

          {/* Revenue Area (Filled) */}
          <motion.path
            d={revenueArea}
            fill="url(#revenueGradient)"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />

          {/* Target Line (Dashed) */}
          <motion.path
            d={targetPath}
            fill="none"
            stroke="#a1a1aa"
            strokeWidth="2"
            strokeDasharray="5 5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {/* Revenue Line (Solid) */}
          <motion.path
            d={revenuePath}
            fill="none"
            stroke="#7c3aed"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          />

          {/* Data Points & X-Axis Labels */}
          {data.map((d, i) => (
            <g key={i}>
              {/* Target Dots */}
              <motion.circle 
                cx={getX(i)} cy={getY(d.target)} r="3" fill="#fff" stroke="#a1a1aa" strokeWidth="1.5"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.05 }}
              />
              {/* Revenue Dots */}
              <motion.circle 
                cx={getX(i)} cy={getY(d.revenue)} r="4" fill="#fff" stroke="#7c3aed" strokeWidth="2"
                initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.05 }}
              />
              {/* X-Axis Labels */}
              <text x={getX(i)} y={height - 4} textAnchor="middle" fill="#71717a" fontSize="10" fontWeight="600">
                {d.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

// =============================================
// MAIN COMPONENT - SALES EXECUTIVE VIEW
// =============================================
export default function SalesExecutiveDashboard() {
  // ─── Broadcast States ──────────────────────────────────────
  const [broadcasts, setBroadcasts] = React.useState([]);
  const [dismissedBroadcasts, setDismissedBroadcasts] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('hms_dismissed_broadcasts')) || []; } catch { return []; }
  });

  React.useEffect(() => {
    localStorage.setItem('hms_dismissed_broadcasts', JSON.stringify(dismissedBroadcasts));
  }, [dismissedBroadcasts]);

  const fetchBroadcasts = React.useCallback(async () => {
    try {
      const token = sessionStorage.getItem('hms_token');
      const res = await fetch(`http://localhost:3000/api/broadcasts`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res?.ok) {
        const data = await res.json();
        setBroadcasts(data.data.broadcasts || []);
      }
    } catch (e) {
      console.error('Failed to fetch broadcasts:', e);
    }
  }, []);

  React.useEffect(() => {
    fetchBroadcasts();
    const interval = setInterval(fetchBroadcasts, 30000);
    return () => clearInterval(interval);
  }, [fetchBroadcasts]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [timePeriod, setTimePeriod] = useState('Monthly'); 

  const CURRENT_USER = { initials: 'AS', name: 'Aditi Sharma', target: 1200000, achieved: 980000, baseIncentiveRate: 0.025 };

  const refresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 700);
  };

  // --- MY Pipeline ---
  const STAGES = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
  const [myLeads, setMyLeads] = useState([
    { id: 'LD-401', company: 'Meridian Corporate Travel', deal: 'Retainer Renewal', value: 380000, stage: 'New', source: 'Call Enquiry', contactName: 'Kavita Rao', contactEmail: 'kavita@meridian.com', contactPhone: '+91 98765 43210' },
    { id: 'LD-406', company: 'Zenith Events Pvt Ltd', deal: 'Annual Partner Conference', value: 650000, stage: 'Proposal Sent', source: 'Hotel Website', contactName: 'Rahul Mehta', contactEmail: 'rahul@zenithevents.in', contactPhone: '+91 91234 56789' },
    { id: 'LD-408', company: 'Sundar Wedding Planners', deal: 'Destination Wedding', value: 1200000, stage: 'Negotiation', source: 'Walk In Enquiry', contactName: 'Sundar Kannan', contactEmail: 'sundar@weddings.com', contactPhone: '+91 99887 76655' },
    { id: 'LD-415', company: 'Tech Mahindra', deal: 'Q3 Leadership Offsite', value: 450000, stage: 'Contacted', source: 'Different Websites', contactName: 'Ramesh Patel', contactEmail: 'r.patel@techm.com', contactPhone: '+91 98711 22334' },
  ]);
  const [leadSearch, setLeadSearch] = useState('');
  const filteredLeads = myLeads.filter(l => (l.company + l.deal + l.contactName).toLowerCase().includes(leadSearch.toLowerCase()));

  // --- MY Accounts ---
  const [myAccounts, setMyAccounts] = useState([
    { id: 'ACC-101', name: 'Infosys BPM Ltd', industry: 'IT / BPM', rate: 6200, ytdRevenue: 2850000, status: 'Active' },
    { id: 'ACC-110', name: 'TechNova', industry: 'IT Services', rate: 6000, ytdRevenue: 1200000, status: 'Active' },
  ]);

  const moveToAccounts = (lead) => {
    setMyAccounts([{ id: `ACC-${Math.floor(Math.random() * 1000)}`, name: lead.company, industry: 'General', rate: 5000, ytdRevenue: 0, status: 'Onboarding' }, ...myAccounts]);
    setMyLeads(myLeads.map(l => l.id === lead.id ? { ...l, stage: 'Contacted' } : l));
    alert(`${lead.company} moved to My Accounts!`);
  };

  // --- MY Tasks ---
  const [ongoingTasks, setOngoingTasks] = useState([
    { id: 'T-1', title: 'Follow up on Meridian Renewal', type: 'Call', time: '10:30 AM', status: 'In Progress', client: 'Meridian Travel' },
    { id: 'T-2', title: 'Send Proposal to Tech Mahindra', type: 'Email', time: '12:00 PM', status: 'Pending', client: 'Tech Mahindra' },
  ]);
  
  const [assignedTasks, setAssignedTasks] = useState([
    { id: 'AT-1', title: 'Call 10 lost leads from Q1', assigner: 'Team Lead (Karan)', deadline: 'Today, 5:00 PM', priority: 'High', completed: false },
    { id: 'AT-2', title: 'Update CRM fields for all Won deals', assigner: 'Admin', deadline: 'Tomorrow', priority: 'Medium', completed: false },
  ]);

  // --- Booking Modes ---
  const bookingModes = [
    { label: 'Hotel Website', value: 380000, color: '#7c3aed', icon: <Globe size={14}/> },
    { label: 'Walk In Enquiry', value: 210000, color: '#0ea5e9', icon: <User size={14}/> },
    { label: 'Call Enquiry', value: 420000, color: '#f59e0b', icon: <PhoneCall size={14}/> },
    { label: 'Different Websites', value: 150000, color: '#10b981', icon: <Target size={14}/> },
  ];

  // --- Detailed OTA Data ---
  const otaData = [
    { name: 'MakeMyTrip', color: '#f59e0b', bookings: 45, roomNights: 120, grossRevenue: 350000, commissionRate: 18, cancelRate: 12, status: 'Active' },
    { name: 'Booking.com', color: '#0ea5e9', bookings: 32, roomNights: 85, grossRevenue: 280000, commissionRate: 15, cancelRate: 8, status: 'Active' },
    { name: 'Agoda', color: '#ec4899', bookings: 20, roomNights: 50, grossRevenue: 150000, commissionRate: 12, cancelRate: 15, status: 'Active' },
    { name: 'Expedia', color: '#7c3aed', bookings: 12, roomNights: 30, grossRevenue: 95000, commissionRate: 20, cancelRate: 5, status: 'Reviewing' },
  ];

  const totalOtaGross = otaData.reduce((acc, curr) => acc + curr.grossRevenue, 0);
  const totalOtaCommission = otaData.reduce((acc, curr) => acc + (curr.grossRevenue * (curr.commissionRate / 100)), 0);
  const totalOtaNet = totalOtaGross - totalOtaCommission;
  const avgCancelRate = (otaData.reduce((acc, curr) => acc + curr.cancelRate, 0) / otaData.length).toFixed(1);

  const otaBookingShare = otaData.map(ota => ({ label: ota.name, value: ota.bookings, color: ota.color }));
  const otaNetRevenueRank = otaData.map(ota => ({ label: ota.name, value: ota.grossRevenue - (ota.grossRevenue * (ota.commissionRate / 100)), color: ota.color }));

  // --- Metrics ---
  const myPipelineValue = myLeads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').reduce((s, l) => s + l.value, 0);
  const activeDealsCount = myLeads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').length;
  const pendingTasksCount = ongoingTasks.filter(t => t.status !== 'Completed').length + assignedTasks.filter(t => !t.completed).length;

  const stageColors = { 'New': '#94a3b8', 'Contacted': '#0ea5e9', 'Proposal Sent': '#f59e0b', 'Negotiation': '#8b5cf6', 'Won': '#10b981', 'Lost': '#f43f5e' };
  
  const themeMap = {
    '#D4A373': { iconBg: 'bg-[#D4A373] text-zinc-900', glow: 'rgba(212,163,115,0.35)' },
    violet: { iconBg: 'bg-gradient-to-br from-[#D4A373] to-[#D4A373] text-white', glow: 'rgba(124,58,237,0.35)' },
    amber: { iconBg: 'bg-gradient-to-br from-[#D4A373] to-[#D4A373] text-white', glow: 'rgba(245,158,11,0.35)' },
    emerald: { iconBg: 'bg-gradient-to-br from-[#D4A373] to-[#D4A373] text-white', glow: 'rgba(16,185,129,0.35)' },
    sky: { iconBg: 'bg-gradient-to-br from-sky-500 to-blue-500 text-white', glow: 'rgba(14,165,233,0.35)' },
    rose: { iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white', glow: 'rgba(225,29,72,0.3)' },
  };

  const navGroups = [
    {
      heading: 'My Workspace',
      items: [
        { key: 'overview', label: 'My Performance', icon: <TrendingUp size={15} /> },
        { key: 'tasks', label: 'Task Management', icon: <ListTodo size={15} /> },
      ],
    },
    {
      heading: 'Pipeline & Accounts',
      items: [
        { key: 'pipeline', label: 'Lead Pipeline', icon: <Target size={15} /> },
        { key: 'accounts', label: 'My Accounts', icon: <Briefcase size={15} /> },
      ],
    },
    {
      heading: 'Sources & Channels',
      items: [
        { key: 'modes', label: 'Booking Modes', icon: <Activity size={15} /> },
        { key: 'ota', label: 'OTA Performance', icon: <Globe size={15} /> },
      ],
    },
  ];
  const navItems = navGroups.flatMap(g => g.items);

  return (
    <div className="min-h-[calc(100vh-6rem)] relative sd-app-bg sd-scrollbar p-6 flex flex-col lg:flex-row gap-6">
      <style>{`
        .sd-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(161,161,170,0.4) transparent; }
        .sd-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .sd-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .sd-scrollbar::-webkit-scrollbar-thumb { background: rgba(161, 161, 170, 0.45); border-radius: 999px; }

        .sd-app-bg {
          background: #F8F1E3 !important;
        }
        .sd-dealdeck-sidebar { background: #FFFFFF; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); border: 1px solid rgba(226, 232, 240, 0.8); }
        .sd-dealdeck-card { background: #FFFFFF; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0px 18px 40px 0px rgba(112, 144, 176, 0.08); }
        .sd-input { width: 100%; padding: 0.75rem 1.1rem; background: #F4F7FE; border: 1px solid #E2E8F0; border-radius: 1rem; font-size: 0.875rem; font-weight: 500; }
      `}</style>

      {/* LEFT SIDEBAR */}
      <div className="w-full lg:w-72 shrink-0 rounded-[2rem] p-6 flex flex-col gap-6 sd-dealdeck-sidebar sticky top-[7.5rem] self-start z-30 lg:h-[calc(100vh-7.8rem)]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-xs shrink-0">
            <TrendingUp size={19} className="text-[#D4A373]" />
          </div>
          <div>
            <h1 className="font-serif font-black text-[23px] text-zinc-600 text-base leading-none">Sales</h1>
            <span className="text-[9px] font-bold text-[#D4A373] uppercase tracking-widest mt-1 block">Sales Operations</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1">
          {navGroups.map(group => (
            <div key={group.heading}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">{group.heading}</p>
              <div className="flex flex-col gap-1">
                {group.items.map(item => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                      activeTab === item.key
                        ? 'bg-[#D4A373] text-zinc-900 shadow-md shadow-[#D4A373]/20'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif font-black text-zinc-900 capitalize">
              {navItems.find(i => i.key === activeTab)?.label || 'Overview'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Manage your active deals, daily tasks, and track your quota.</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={refresh} className="p-2.5 rounded-xl bg-white border border-zinc-200/60 text-zinc-500 hover:text-[#D4A373] transition-all shadow-xs">
              <Loader2 size={16} className={isLoading ? 'animate-spin' : ''} />
            </button>
            <button className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#D4A373] transition-colors flex items-center gap-2 shadow-sm">
              <Plus size={14} /> Add Lead
            </button>
            {/* Profile Avatar Widget */}
            {(() => {
              const staffName = sessionStorage.getItem('hms_name') || 'Staff';
              const initials = staffName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ST';
              const designation = 'Sales Admin';
              return (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    localStorage.clear();
                    window.location.href = '/login';
                  }}
                  className="group flex items-center gap-3 bg-white pl-3 pr-4 py-1.5 rounded-2xl border border-zinc-200/60 shadow-xs hover:shadow-md hover:border-rose-200 hover:bg-rose-50 transition-all duration-300 cursor-pointer"
                  title="Sign Out"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 group-hover:from-rose-500 group-hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-xs transition-colors">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left leading-none pr-1">
                    <span className="text-xs font-bold text-zinc-900 group-hover:text-rose-600 transition-colors block">{staffName}</span>
                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mt-0.5 block group-hover:text-rose-400 transition-colors">{designation}</span>
                  </div>
                  <LogOut size={16} className="text-zinc-400 group-hover:text-rose-500 transition-colors ml-1" />
                </motion.button>
              );
            })()}
          </div>
        </div>

        {/* BROADCAST BANNER */}
        <AnimatePresence>
          {broadcasts.filter(b => !dismissedBroadcasts.includes(b.id) && (!b.expires_at || new Date(b.expires_at) > new Date())).map((broadcast) => (
            <motion.div
              key={broadcast.id}
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 p-[2px] shadow-lg shadow-rose-500/20 mb-4 min-h-[72px]"
            >
              <div className="w-full h-full relative bg-white/10 backdrop-blur-md rounded-[calc(1.5rem-2px)] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0">
                    <div className="absolute inset-0 bg-white/40 rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/40 shadow-sm backdrop-blur-lg">
                      <Zap size={18} className="drop-shadow-md" />
                    </div>
                  </div>
                  <div className="flex-1 text-white flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">
                        {broadcast.target_dept === 'ALL' ? 'GLOBAL BROADCAST' : 'DEPARTMENT ALERT'}
                      </span>
                      <span className="text-[10px] font-semibold text-white/80 border-l border-white/20 pl-2">From: {broadcast.sender_name}</span>
                    </div>
                    <p className="text-sm font-bold tracking-wide drop-shadow-sm leading-snug">{broadcast.message}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDismissedBroadcasts(prev => [...prev, broadcast.id])}
                  className="shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors border border-white/10 self-end sm:self-center"
                >
                  <X size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-96 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-xs font-medium uppercase tracking-wider">Loading your workspace...</p>
            </motion.div>
          ) : (
            <div className="space-y-6">

              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: 'Target', value: `₹${(CURRENT_USER.target / 100000).toFixed(1)}L`, sub: 'Monthly Goal', icon: <Target size={16} />, theme: '#D4A373' },
                      { label: 'Revenue Generated', value: `₹${(CURRENT_USER.achieved / 100000).toFixed(1)}L`, sub: `${Math.round((CURRENT_USER.achieved/CURRENT_USER.target)*100)}% of Target`, icon: <TrendingUp size={16} />, theme: '#D4A373' },
                      { label: 'Deals In Pipeline', value: activeDealsCount, sub: `₹${(myPipelineValue/100000).toFixed(1)}L Total Value`, icon: <Briefcase size={16} />, theme: '#D4A373' },
                      { label: 'Pending Tasks', value: pendingTasksCount, sub: 'Ongoing & Assigned', icon: <CheckSquare size={16} />, theme: 'rose' },
                    ].map((kpi, i) => {
                      const t = themeMap[kpi.theme];
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, type: 'spring' }} whileHover={{ y: -5 }}
                          className="relative overflow-hidden bg-white rounded-[1.75rem] p-5 border border-zinc-200/60 flex flex-col shadow-sm"
                          style={{ boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px ${t.glow}` }}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${t.iconBg}`}>{kpi.icon}</div>
                          <p className="text-3xl font-black text-zinc-900 tracking-tight leading-none mb-1.5">{kpi.value}</p>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* AREA GRAPH CONTAINER */}
                    <motion.div whileHover={{ y: -6 }} className="lg:col-span-2 relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4A373] to-[#D4A373] flex items-center justify-center shadow-md"><BarChart3 size={14} className="text-white" /></div>
                          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Target vs Revenue Trend</h3>
                        </div>
                        <div className="flex bg-zinc-100 p-1 rounded-xl">
                          {['Daily', 'Weekly', 'Monthly', 'Yearly'].map(period => (
                            <button
                              key={period}
                              onClick={() => setTimePeriod(period)}
                              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${
                                timePeriod === period ? 'bg-white text-[#D4A373] shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
                              }`}
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <TargetVsRevenueChart period={timePeriod} />
                    </motion.div>

                    <motion.div whileHover={{ y: -6 }} className="relative overflow-hidden bg-gradient-to-br from-zinc-50 to-zinc-50 rounded-[2rem] p-6 shadow-sm border border-[#D4A373]/30 flex flex-col justify-center text-center">
                      <Trophy size={40} className="mx-auto text-[#D4A373] mb-4" />
                      <h3 className="text-sm font-black text-[#D4A373] uppercase tracking-wider mb-2">Incentive Status</h3>
                      <p className="text-2xl font-black text-[#D4A373] mb-2">₹{(CURRENT_USER.achieved * CURRENT_USER.baseIncentiveRate).toLocaleString('en-IN')}</p>
                      <p className="text-xs text-[#D4A373] font-medium">Earned so far this month.</p>
                      <div className="mt-6">
                        <button onClick={() => setActiveTab('pipeline')} className="w-full bg-[#D4A373] hover:bg-[#D4A373] text-white py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors shadow-sm">
                          View Deals to Close
                        </button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* TAB: TASKS */}
              {activeTab === 'tasks' && (
                <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="sd-dealdeck-card rounded-[2rem] overflow-hidden p-6 flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><ShieldCheck size={16} className="text-rose-500" /> Assigned by Admin/Lead</h3>
                      </div>
                      <div className="flex flex-col gap-3 flex-1">
                        {assignedTasks.map((task) => (
                          <div key={task.id} className="bg-rose-50/50 border border-rose-100 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-bold text-zinc-900">{task.title}</p>
                              <span className="bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">{task.priority}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-[10px] font-semibold text-zinc-500 bg-white px-2 py-1 rounded border border-zinc-200">By: {task.assigner}</span>
                              <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Clock size={12}/> Due: {task.deadline}</span>
                            </div>
                            <button className="mt-4 w-full bg-white border border-zinc-200 text-zinc-700 hover:bg-rose-600 hover:text-white hover:border-rose-600 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors">
                              Mark as Done
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="sd-dealdeck-card rounded-[2rem] overflow-hidden p-6 flex flex-col">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Activity size={16} className="text-[#D4A373]" /> Ongoing Tasks Status</h3>
                        <button className="text-[11px] font-bold text-[#D4A373] bg-zinc-50 px-3 py-1.5 rounded-lg hover:bg-[#D4A373]/10 transition flex items-center gap-1"><Plus size={12}/> New Task</button>
                      </div>
                      <div className="flex flex-col gap-3 flex-1">
                        {ongoingTasks.map((task) => (
                          <div key={task.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col">
                            <p className="text-sm font-bold text-zinc-900 mb-2">{task.title}</p>
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-1 rounded">{task.type}</span>
                              <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-1 rounded">{task.client}</span>
                              <span className="text-[10px] text-zinc-400 flex items-center gap-1 ml-auto"><Clock size={12}/> {task.time}</span>
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-100">
                              <span className="text-[10px] font-bold uppercase text-zinc-400">Status</span>
                              <select 
                                value={task.status} 
                                onChange={(e) => {
                                  setOngoingTasks(ongoingTasks.map(t => t.id === task.id ? {...t, status: e.target.value} : t));
                                }}
                                className="text-xs font-bold text-[#D4A373] bg-zinc-50 border-none rounded py-1 px-2 cursor-pointer outline-none focus:ring-2 focus:ring-violet-200"
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB: MY PIPELINE */}
              {activeTab === 'pipeline' && (
                <motion.div key="pipeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="relative w-full sm:w-72 mb-4">
                    <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input value={leadSearch} onChange={e => setLeadSearch(e.target.value)} placeholder="Search companies, names..." className="sd-input pl-9 py-2.5 text-xs bg-white shadow-sm" />
                  </div>

                  <div className="flex gap-4 overflow-x-auto pb-4 sd-scrollbar items-start">
                    {STAGES.map(stage => {
                      const stageLeads = filteredLeads.filter(l => l.stage === stage);
                      return (
                        <div key={stage} className="w-80 shrink-0 flex flex-col gap-3">
                          <div className="flex items-center justify-between px-1">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full" style={{ background: stageColors[stage] }} />
                              <span className="text-xs font-black text-zinc-700 uppercase tracking-wider">{stage}</span>
                              <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded-full">{stageLeads.length}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-col gap-3 min-h-[100px]">
                            {stageLeads.map((lead, i) => (
                              <motion.div key={lead.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="bg-white rounded-2xl p-4 border border-zinc-200/80 shadow-sm relative overflow-hidden flex flex-col"
                              >
                                <div className="absolute top-0 left-0 w-1 h-full" style={{ background: stageColors[stage] }} />
                                <div className="pl-2">
                                  <div className="flex items-start justify-between mb-1">
                                    <p className="text-sm font-bold text-zinc-900 leading-snug truncate">{lead.company}</p>
                                  </div>
                                  <p className="text-[11px] text-zinc-500 font-semibold mb-3">{lead.deal} • <span className="text-[#D4A373] font-black">₹{(lead.value/1000).toFixed(0)}k</span></p>
                                  
                                  <div className="bg-zinc-50 p-2.5 rounded-lg mb-4 space-y-2">
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-medium">
                                      <User size={12} className="text-zinc-400" /> {lead.contactName}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-medium">
                                      <Mail size={12} className="text-zinc-400" /> {lead.contactEmail}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] text-zinc-600 font-medium">
                                      <PhoneCall size={12} className="text-zinc-400" /> {lead.contactPhone}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 mt-auto border-t border-zinc-100 pt-3">
                                    <span className="text-[9px] font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded uppercase truncate">{lead.source}</span>
                                    {stage !== 'Won' && stage !== 'Lost' && (
                                      <button 
                                        onClick={() => moveToAccounts(lead)}
                                        className="ml-auto flex items-center gap-1 text-[10px] font-bold text-white bg-zinc-900 hover:bg-[#D4A373] px-3 py-1.5 rounded-md transition-colors"
                                      >
                                        Move to Accounts <ArrowRight size={10} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                            {stageLeads.length === 0 && (
                              <div className="rounded-2xl border border-dashed border-zinc-200 p-6 text-center text-[10px] text-zinc-400 font-semibold">Empty stage</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* TAB: MY ACCOUNTS */}
              {activeTab === 'accounts' && (
                <motion.div key="accounts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="sd-dealdeck-card rounded-[2rem] overflow-hidden p-6">
                    <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-6"><Briefcase size={16} className="text-[#D4A373]" /> Accounts Managed By Me</h3>
                    <p className="text-xs text-zinc-500 mb-6">Leads you start working on heavily can be moved here for long-term management.</p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myAccounts.map(acc => (
                        <div key={acc.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:border-[#D4A373]/30 transition-colors">
                          <div className="flex justify-between items-start mb-3">
                            <div className="w-10 h-10 rounded-xl bg-zinc-50 text-[#D4A373] flex items-center justify-center"><Building2 size={20} /></div>
                            <span className={`px-2 py-1 text-[9px] font-black uppercase tracking-wider rounded ${acc.status === 'Active' ? 'bg-[#D4A373]/10 text-[#D4A373]' : 'bg-[#D4A373]/10 text-[#D4A373]'}`}>{acc.status}</span>
                          </div>
                          <h4 className="text-base font-bold text-zinc-900 truncate">{acc.name}</h4>
                          <p className="text-xs text-zinc-500 mb-4">{acc.industry}</p>
                          <div className="flex justify-between items-center border-t border-zinc-100 pt-3">
                            <div>
                              <p className="text-[9px] uppercase font-bold text-zinc-400">Rate</p>
                              <p className="text-xs font-black text-zinc-700">₹{acc.rate}/night</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] uppercase font-bold text-zinc-400">YTD Rev</p>
                              <p className="text-xs font-black text-[#D4A373]">₹{(acc.ytdRevenue/100000).toFixed(1)}L</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB: BOOKING MODES */}
              {activeTab === 'modes' && (
                <motion.div key="modes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div whileHover={{ y: -6 }} className="relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/40 rounded-[2rem] p-6 shadow-sm border border-zinc-200/60">
                      <div className="relative flex items-center gap-2 mb-6">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4A373] to-[#D4A373] flex items-center justify-center shadow-md"><Activity size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Lead Generation Sources</h3>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                        <DonutChart data={bookingModes} centerLabel="Revenue" />
                        <div className="grid grid-cols-1 gap-y-3 w-full sm:w-auto">
                          {bookingModes.map((d, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded flex items-center justify-center shrink-0 text-white shadow-sm" style={{ backgroundColor: d.color }}>{d.icon}</span>
                              <span className="text-xs text-zinc-600 font-bold truncate">{d.label}</span>
                              <span className="text-xs font-black text-zinc-900 ml-auto pl-4">₹{(d.value/1000).toFixed(0)}k</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -6 }} className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60 flex flex-col justify-center">
                       <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider mb-4 border-b border-zinc-100 pb-2">Insights</h3>
                       <ul className="space-y-4 text-xs text-zinc-600 leading-relaxed">
                         <li><span className="font-bold text-[#D4A373]">Call Enquiry</span> is your highest grossing source, contributing to majority of direct conversions.</li>
                         <li><span className="font-bold text-[#D4A373]">Hotel Website</span> leads show a 30% higher closing probability compared to third-party.</li>
                         <li><span className="font-bold text-[#D4A373]">Walk In Enquiry</span> numbers have doubled since last week. Ensure front-desk handoffs are seamless.</li>
                       </ul>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* TAB: OTA PERFORMANCE */}
              {activeTab === 'ota' && (
                <motion.div key="ota" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: 'Total Gross Revenue', value: `₹${(totalOtaGross / 100000).toFixed(2)}L`, sub: 'All OTA Channels', icon: <Globe size={16} />, theme: 'sky' },
                      { label: 'Commission Paid', value: `₹${(totalOtaCommission / 100000).toFixed(2)}L`, sub: 'Direct Expense', icon: <Percent size={16} />, theme: 'rose' },
                      { label: 'Net Revenue', value: `₹${(totalOtaNet / 100000).toFixed(2)}L`, sub: 'After Commissions', icon: <DollarSign size={16} />, theme: '#D4A373' },
                      { label: 'Avg Cancel Rate', value: `${avgCancelRate}%`, sub: 'Across platforms', icon: <TrendingDown size={16} />, theme: '#D4A373' },
                    ].map((kpi, i) => {
                      const t = themeMap[kpi.theme];
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, type: 'spring' }} whileHover={{ y: -5 }}
                          className="relative overflow-hidden bg-white rounded-[1.75rem] p-5 border border-zinc-200/60 flex flex-col shadow-sm"
                          style={{ boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px ${t.glow}` }}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${t.iconBg}`}>{kpi.icon}</div>
                          <p className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1.5">{kpi.value}</p>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div whileHover={{ y: -6 }} className="relative overflow-hidden bg-gradient-to-br from-white via-white to-sky-50/40 rounded-[2rem] p-6 shadow-sm border border-zinc-200/60">
                      <div className="relative flex items-center gap-2 mb-6">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md"><PieChart size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">OTA Booking Share</h3>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                        <DonutChart data={otaBookingShare} centerLabel="Bookings" />
                        <div className="grid grid-cols-1 gap-y-3 w-full sm:w-auto">
                          {otaBookingShare.map((d, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                              <span className="w-3 h-3 rounded-full flex items-center justify-center shrink-0 shadow-sm" style={{ backgroundColor: d.color }} />
                              <span className="text-xs text-zinc-600 font-bold truncate">{d.label}</span>
                              <span className="text-xs font-black text-zinc-900 ml-auto pl-4">{d.value} bookings</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -6 }} className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60">
                      <div className="relative flex items-center gap-2 mb-6">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4A373] to-[#D4A373] flex items-center justify-center shadow-md"><TrendingUp size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Net Revenue by Platform</h3>
                      </div>
                      <BarRankChart data={otaNetRevenueRank} />
                      <p className="text-[10px] text-zinc-400 mt-6 pt-4 border-t border-zinc-100 italic">This chart accounts for Gross Revenue minus the respective commission payout for each platform.</p>
                    </motion.div>
                  </div>

                  <div className="sd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Globe size={16} className="text-sky-500" /> Detailed OTA Ledger</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                            <th className="p-4 font-bold">Platform</th>
                            <th className="p-4 font-bold text-center">Room Nights</th>
                            <th className="p-4 font-bold text-right">Avg Daily Rate</th>
                            <th className="p-4 font-bold text-right">Gross Revenue</th>
                            <th className="p-4 font-bold text-center">Commission %</th>
                            <th className="p-4 font-bold text-right">Net Revenue</th>
                            <th className="p-4 font-bold text-center">Cancel Rate</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {otaData.map((ota, index) => {
                            const adr = ota.roomNights > 0 ? Math.round(ota.grossRevenue / ota.roomNights) : 0;
                            const netRev = ota.grossRevenue - (ota.grossRevenue * (ota.commissionRate / 100));
                            return (
                              <tr key={index} className="hover:bg-zinc-50/60 transition-colors">
                                <td className="p-4">
                                  <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ota.color }}></span>
                                    <span className="text-sm font-bold text-zinc-900">{ota.name}</span>
                                  </div>
                                </td>
                                <td className="p-4 text-sm text-zinc-600 text-center font-semibold">{ota.roomNights}</td>
                                <td className="p-4 text-sm text-zinc-600 text-right">₹{adr.toLocaleString('en-IN')}</td>
                                <td className="p-4 text-sm font-black text-zinc-900 text-right">₹{ota.grossRevenue.toLocaleString('en-IN')}</td>
                                <td className="p-4 text-center">
                                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${ota.commissionRate >= 18 ? 'bg-rose-100 text-rose-700' : 'bg-[#D4A373]/10 text-[#D4A373]'}`}>
                                    {ota.commissionRate}%
                                  </span>
                                </td>
                                <td className="p-4 text-sm font-black text-[#D4A373] text-right">₹{netRev.toLocaleString('en-IN')}</td>
                                <td className="p-4 text-center">
                                  <span className={`text-[11px] font-bold ${ota.cancelRate > 10 ? 'text-rose-500' : 'text-zinc-500'}`}>
                                    {ota.cancelRate}%
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
