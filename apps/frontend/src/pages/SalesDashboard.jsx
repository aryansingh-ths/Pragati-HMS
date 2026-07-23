import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; // ✨ Added Toast Notifications
import {
  Target, TrendingUp, Briefcase, Handshake, Calendar, Search, Plus, X, Loader2,
  AlertTriangle, CheckCircle2, Clock, XCircle, Send, FileText, DollarSign,
  ArrowUpRight, Star, ChevronRight, PieChart, Trophy, CalendarClock, Eye,
  PhoneCall, Mail, CheckSquare, ListTodo, Flame, Activity, ShieldCheck, Globe,
  User, Building2, MapPin, BarChart3, ArrowRight, Percent, TrendingDown, LogOut,
  RefreshCw, Zap
} from 'lucide-react';

// =============================================
// CENTRALIZED API CONFIG
// =============================================
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}`
});

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
  const maxVal = Math.max(...data.map(d => Math.max(d.target, d.revenue))) * 1.15;

  const width = 600;
  const height = 180;
  const paddingX = 30;
  const paddingY = 20;

  const getX = (index) => paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
  const getY = (value) => height - paddingY - (value / maxVal) * (height - paddingY * 2);

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
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
              <stop offset="80%" stopColor="#7c3aed" stopOpacity="0.02" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
          </defs>

          {[0, 0.5, 1].map(ratio => {
            const y = height - paddingY - (ratio * (height - paddingY * 2));
            return (
              <line key={ratio} x1={paddingX} y1={y} x2={width - paddingX} y2={y} stroke="#f4f4f5" strokeWidth="1" strokeDasharray="4 4" />
            );
          })}

          <motion.path d={revenueArea} fill="url(#revenueGradient)" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} />
          <motion.path d={targetPath} fill="none" stroke="#a1a1aa" strokeWidth="2" strokeDasharray="5 5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: "easeInOut" }} />
          <motion.path d={revenuePath} fill="none" stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, ease: "easeInOut" }} />

          {data.map((d, i) => (
            <g key={i}>
              <motion.circle cx={getX(i)} cy={getY(d.target)} r="3" fill="#fff" stroke="#a1a1aa" strokeWidth="1.5" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.05 }} />
              <motion.circle cx={getX(i)} cy={getY(d.revenue)} r="4" fill="#fff" stroke="#7c3aed" strokeWidth="2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.8 + i * 0.05 }} />
              <text x={getX(i)} y={height - 4} textAnchor="middle" fill="#71717a" fontSize="10" fontWeight="600">{d.label}</text>
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
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [timePeriod, setTimePeriod] = useState('Monthly');
  
  // ─── Pagination States ✨ ──────────────────────────────────────
  const [accountsPage, setAccountsPage] = useState(1);
  const ACCOUNTS_PER_PAGE = 6;
  
  const [tasksPage, setTasksPage] = useState(1);
  const TASKS_PER_PAGE = 5;

  // ─── Broadcast States (Real-Time SSE) ──────────────────────────────────────
  const [broadcasts, setBroadcasts] = React.useState([]);
  const [dismissedBroadcasts, setDismissedBroadcasts] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('hms_dismissed_broadcasts')) || []; } catch { return []; }
  });

  React.useEffect(() => {
    localStorage.setItem('hms_dismissed_broadcasts', JSON.stringify(dismissedBroadcasts));
  }, [dismissedBroadcasts]);

  React.useEffect(() => {
    const token = sessionStorage.getItem('hms_token');
    
    // 1. Fetch initial historical broadcasts
    fetch(`${API_BASE_URL}/api/broadcasts`, { headers: getHeaders() })
      .then(res => res.json())
      .then(data => {
        if(data?.data?.broadcasts) setBroadcasts(data.data.broadcasts);
      })
      .catch(e => console.error('Failed to fetch historical broadcasts:', e));

    // 2. Open persistent Server-Sent Events (SSE) connection
    const eventSource = new EventSource(`${API_BASE_URL}/api/broadcasts/stream?token=${token}`);

    // Listen for real-time pushes from the server
    eventSource.onmessage = (event) => {
      const newBroadcast = JSON.parse(event.data);
      setBroadcasts((prevBroadcasts) => [newBroadcast, ...prevBroadcasts]);
      toast('New Department Broadcast!', { icon: '📣' });
    };

    eventSource.onerror = (error) => {
      console.error('SSE Broadcast Stream disconnected:', error);
      eventSource.close();
    };

    // Cleanup connection when component unmounts
    return () => eventSource.close();
  }, []);

  // Database Connected States
  const [currentUser, setCurrentUser] = useState({
    initials: 'ST', name: 'Loading...', target: 1200000, achieved: 0, baseIncentiveRate: 0.025
  });
  const [myLeads, setMyLeads] = useState([]);
  const [myAccounts, setMyAccounts] = useState([]);
  const [ongoingTasks, setOngoingTasks] = useState([]);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [bookingModes, setBookingModes] = useState([]);
  const [otaData, setOtaData] = useState([]);
  const [leadSearch, setLeadSearch] = useState('');

  // Add Lead Modal State
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [isSubmittingLead, setIsSubmittingLead] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    company: '', deal_name: '', value: '', stage: 'New', source: 'Hotel Website',
    contact_name: '', contact_email: '', contact_phone: ''
  });

  const STAGES = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];

  const fetchData = async (silent = false) => {
    try {
      if (!silent) setIsLoading(true); // ✨ Silent refresh prevents UI flicker during optimistic updates
      const [userRes, leadsRes, accountsRes, tasksRes, otaRes, modesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/sales/me`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/sales/leads`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/sales/accounts`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/sales/tasks`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/sales/ota`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/sales/booking-modes`, { headers: getHeaders() })
      ]);

      if (userRes.ok) {
        const data = await userRes.json();
        setCurrentUser(data.data);
      }

      if (leadsRes.ok) {
        const data = await leadsRes.json();
        setMyLeads(data.data.map(lead => ({
          id: lead.id, company: lead.company, deal: lead.deal_name,
          value: parseFloat(lead.value), stage: lead.stage, source: lead.source,
          contactName: lead.contact_name, contactEmail: lead.contact_email, contactPhone: lead.contact_phone
        })));
      }

      if (accountsRes.ok) {
        const data = await accountsRes.json();
        setMyAccounts(data.data.map(acc => ({
          id: acc.id, name: acc.name, industry: acc.industry,
          rate: parseFloat(acc.rate), ytdRevenue: parseFloat(acc.ytd_revenue), status: acc.status
        })));
      }

      if (tasksRes.ok) {
        const data = await tasksRes.json();
        const tasks = data.data;
        setOngoingTasks(tasks.filter(t => !t.assigner || t.assigner === 'Self').map(t => ({
          id: t.id, title: t.title, type: t.type, status: t.status, 
          client: t.client, time: new Date(t.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})
        })));
        setAssignedTasks(tasks.filter(t => t.assigner && t.assigner !== 'Self').map(t => ({
          id: t.id, title: t.title, assigner: t.assigner, priority: t.priority,
          deadline: new Date(t.deadline).toLocaleDateString(), completed: t.status === 'Completed'
        })));
      }

      if (otaRes.ok) {
        const data = await otaRes.json();
        setOtaData(data.data.map(ota => ({
          name: ota.name, color: ota.color, bookings: ota.bookings, roomNights: ota.room_nights,
          grossRevenue: parseFloat(ota.gross_revenue), commissionRate: parseFloat(ota.commission_rate), 
          cancelRate: parseFloat(ota.cancel_rate), status: ota.status
        })));
      }

      if (modesRes.ok) {
        const data = await modesRes.json();
        const modeMeta = {
          'Hotel Website': { color: '#7c3aed', icon: <Globe size={14} /> },
          'Walk In Enquiry': { color: '#0ea5e9', icon: <User size={14} /> },
          'Call Enquiry': { color: '#f59e0b', icon: <PhoneCall size={14} /> },
          'Different Websites': { color: '#10b981', icon: <Target size={14} /> },
        };
        
        setBookingModes(data.data.map(mode => ({
          label: mode.label, value: parseFloat(mode.value),
          color: modeMeta[mode.label]?.color || '#94a3b8',
          icon: modeMeta[mode.label]?.icon || <Activity size={14} />
        })));
      }
    } catch (error) {
      console.error('Failed to sync dashboard data:', error);
      toast.error('Failed to sync latest data.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refresh = () => {
    fetchData();
  };

  const handleAddLead = async (e) => {
    e.preventDefault();
    setIsSubmittingLead(true);
    
    // ✨ Optimistic UI Update: Create mock lead and update state immediately
    const previousLeads = [...myLeads];
    const optimisticLead = {
      id: 'temp-' + Date.now(), company: newLeadForm.company, deal: newLeadForm.deal_name,
      value: parseFloat(newLeadForm.value) || 0, stage: newLeadForm.stage, source: newLeadForm.source,
      contactName: newLeadForm.contact_name, contactEmail: newLeadForm.contact_email, contactPhone: newLeadForm.contact_phone
    };
    
    setMyLeads(prev => [optimisticLead, ...prev]);
    setShowAddLeadModal(false);

    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...newLeadForm, value: parseFloat(newLeadForm.value) || 0 })
      });

      if (res.ok) {
        toast.success('Lead added successfully!');
        setNewLeadForm({ company: '', deal_name: '', value: '', stage: 'New', source: 'Hotel Website', contact_name: '', contact_email: '', contact_phone: '' });
        fetchData(true); // Silent refresh to grab actual DB ID
      } else {
        throw new Error((await res.json()).error);
      }
    } catch (error) {
      console.error('Failed to add lead:', error);
      setMyLeads(previousLeads); // ✨ Revert optimistic update on failure
      toast.error(`Failed to add lead: ${error.message || 'Network error'}`);
      setShowAddLeadModal(true); // Re-open modal so they don't lose data
    } finally {
      setIsSubmittingLead(false);
    }
  };

  const moveToAccounts = async (lead) => {
    // ✨ Optimistic UI Update
    const previousLeads = [...myLeads];
    const previousAccounts = [...myAccounts];

    setMyLeads(prev => prev.filter(l => l.id !== lead.id));
    setMyAccounts(prev => [{
      id: 'temp-' + Date.now(), name: lead.company, industry: 'General',
      rate: 5000, ytdRevenue: lead.value, status: 'Onboarding'
    }, ...prev]);

    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${lead.id}/convert`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (res.ok) {
        toast.success(`${lead.company} moved to My Accounts!`);
        fetchData(true); // Silent sync
      } else {
        throw new Error((await res.json()).error);
      }
    } catch (error) {
      console.error('Conversion error:', error);
      // ✨ Revert optimistic update
      setMyLeads(previousLeads);
      setMyAccounts(previousAccounts);
      toast.error(`Conversion failed. Reverting changes.`);
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    // ✨ Optimistic UI for Tasks
    const previousTasks = [...ongoingTasks];
    setOngoingTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    
    // Simulating API Call or firing actual API if endpoint exists
    try {
      const res = await fetch(`${API_BASE_URL}/api/sales/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error('API failed');
      toast.success('Task status updated');
    } catch(e) {
      setOngoingTasks(previousTasks); // Revert
      toast.error('Failed to update task status.');
    }
  };

  // Derived Data & Pagination
  const filteredLeads = myLeads.filter(l => (l.company + l.deal + l.contactName).toLowerCase().includes(leadSearch.toLowerCase()));
  
  // ✨ Pagination Setup
  const paginatedAccounts = myAccounts.slice((accountsPage - 1) * ACCOUNTS_PER_PAGE, accountsPage * ACCOUNTS_PER_PAGE);
  const totalAccountPages = Math.max(1, Math.ceil(myAccounts.length / ACCOUNTS_PER_PAGE));

  const paginatedTasks = ongoingTasks.slice((tasksPage - 1) * TASKS_PER_PAGE, tasksPage * TASKS_PER_PAGE);
  const totalTaskPages = Math.max(1, Math.ceil(ongoingTasks.length / TASKS_PER_PAGE));

  const totalOtaGross = otaData.reduce((acc, curr) => acc + curr.grossRevenue, 0);
  const totalOtaCommission = otaData.reduce((acc, curr) => acc + (curr.grossRevenue * (curr.commissionRate / 100)), 0);
  const totalOtaNet = totalOtaGross - totalOtaCommission;
  const avgCancelRate = otaData.length ? (otaData.reduce((acc, curr) => acc + curr.cancelRate, 0) / otaData.length).toFixed(1) : '0.0';

  const otaBookingShare = otaData.map(ota => ({ label: ota.name, value: ota.bookings, color: ota.color }));
  const otaNetRevenueRank = otaData.map(ota => ({ label: ota.name, value: ota.grossRevenue - (ota.grossRevenue * (ota.commissionRate / 100)), color: ota.color }));

  const myPipelineValue = myLeads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').reduce((s, l) => s + l.value, 0);
  const activeDealsCount = myLeads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').length;
  const pendingTasksCount = ongoingTasks.filter(t => t.status !== 'Completed').length + assignedTasks.filter(t => !t.completed).length;

  const stageColors = { 'New': '#94a3b8', 'Contacted': '#0ea5e9', 'Proposal Sent': '#f59e0b', 'Negotiation': '#8b5cf6', 'Won': '#10b981', 'Lost': '#f43f5e' };

  // Enhanced Theme Map
  const enhancedThemeMap = {
    indigo: { gradient: 'from-indigo-50 via-white to-white', ring: 'ring-indigo-500/10', glow: 'rgba(79,70,229,0.35)', iconBg: 'bg-[#4f46e5] text-white shadow-lg shadow-[#4f46e5]/30' },
    emerald: { gradient: 'from-emerald-50 via-white to-white', ring: 'ring-emerald-500/10', glow: 'rgba(16,185,129,0.35)', iconBg: 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30' },
    amber: { gradient: 'from-amber-50 via-white to-white', ring: 'ring-amber-500/10', glow: 'rgba(245,158,11,0.35)', iconBg: 'bg-[#f59e0b] text-white shadow-lg shadow-[#f59e0b]/30' },
    rose: { gradient: 'from-rose-50 via-white to-white', ring: 'ring-rose-500/10', glow: 'rgba(225,29,72,0.35)', iconBg: 'bg-[#e11d48] text-white shadow-lg shadow-[#e11d48]/30' },
    sky: { gradient: 'from-sky-50 via-white to-white', ring: 'ring-sky-500/10', glow: 'rgba(14,165,233,0.35)', iconBg: 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/30' },
    violet: { gradient: 'from-violet-50 via-white to-white', ring: 'ring-violet-500/10', glow: 'rgba(139,92,246,0.35)', iconBg: 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/30' },
    orange: { gradient: 'from-orange-50 via-white to-white', ring: 'ring-orange-500/10', glow: 'rgba(212,163,115,0.35)', iconBg: 'bg-[#D4A373] text-white shadow-lg shadow-[#D4A373]/30' }
  };

  const navGroups = [
    { heading: 'My Workspace', items: [{ key: 'overview', label: 'My Performance', icon: <TrendingUp size={15} /> }, { key: 'tasks', label: 'Task Management', icon: <ListTodo size={15} /> }] },
    { heading: 'Pipeline & Accounts', items: [{ key: 'pipeline', label: 'Lead Pipeline', icon: <Target size={15} /> }, { key: 'accounts', label: 'My Accounts', icon: <Briefcase size={15} /> }] },
    { heading: 'Sources & Channels', items: [{ key: 'modes', label: 'Booking Modes', icon: <Activity size={15} /> }, { key: 'ota', label: 'OTA Performance', icon: <Globe size={15} /> }] },
  ];
  const navItems = navGroups.flatMap(g => g.items);

  return (
    <div className="min-h-[calc(100vh-6rem)] relative sd-app-bg sd-scrollbar p-6 flex flex-col lg:flex-row gap-6">
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-bold shadow-lg rounded-2xl' }} />
      <style>{`
        .sd-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(161,161,170,0.4) transparent; }
        .sd-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .sd-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .sd-scrollbar::-webkit-scrollbar-thumb { background: rgba(161, 161, 170, 0.45); border-radius: 999px; }

        .sd-app-bg { background: #F8F1E3 !important; }
        .sd-dealdeck-sidebar { background: #FFFFFF; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); border: 1px solid rgba(226, 232, 240, 0.8); }
        .sd-dealdeck-card { background: #FFFFFF; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0px 18px 40px 0px rgba(112, 144, 176, 0.08); }
        .sd-input { width: 100%; padding: 0.75rem 1.1rem; background: #F4F7FE; border: 1px solid #E2E8F0; border-radius: 1rem; font-size: 0.875rem; font-weight: 500; }
        
        .sd-glass-backdrop { background: rgba(24, 24, 27, 0.4); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .sd-glass-modal { background: rgba(255, 255, 255, 0.98); border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 30px 70px -12px rgba(112, 144, 176, 0.25); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      {/* LEFT SIDEBAR */}
      <div className="w-full lg:w-72 shrink-0 rounded-[2rem] p-6 flex flex-col gap-6 sd-dealdeck-sidebar lg:fixed lg:top-[7.5rem] lg:left-6 z-30 lg:h-[calc(100vh-7.8rem)]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-xs shrink-0">
            <TrendingUp size={19} className="text-[#D4A373]" />
          </div>
          <div>
            <h1 className="font-serif font-black text-[23px] text-zinc-600 text-base leading-none">Sales</h1>
            <span className="text-[9px] font-bold text-[#D4A373] uppercase tracking-widest mt-1 block">Sales Operations</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-1 justify-start">
          {navGroups.map(group => (
            <div key={group.heading}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">{group.heading}</p>
              <div className="flex flex-col gap-1">
                {group.items.map(item => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === item.key
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
      <div className="flex-1 min-w-0 lg:ml-[21rem]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif font-black text-zinc-900 capitalize">
              {navItems.find(i => i.key === activeTab)?.label || 'Overview'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Manage your active deals, daily tasks, and track your quota.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider">Live System</span>
            </div>

            <button onClick={() => refresh()} className={`p-2.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-500 transition-all ${isLoading ? 'animate-spin' : ''}`}>
              <RefreshCw size={15} />
            </button>

            <button onClick={() => setShowAddLeadModal(true)} className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#D4A373] transition-colors flex items-center gap-2 shadow-sm">
              <Plus size={14} /> Add Lead
            </button>
            {(() => {
              const staffName = currentUser.name || sessionStorage.getItem('hms_name') || 'Staff';
              const initials = currentUser.initials || 'ST';
              const designation = 'Sales Executive';
              return (
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
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
                      { label: 'Target', value: `₹${(currentUser.target / 100000).toFixed(1)}L`, sub: 'Monthly Goal', icon: <Target size={16} />, theme: 'indigo' },
                      { label: 'Revenue Generated', value: `₹${(currentUser.achieved / 100000).toFixed(1)}L`, sub: `${Math.round((currentUser.achieved / currentUser.target) * 100)}% of Target`, icon: <TrendingUp size={16} />, theme: 'emerald' },
                      { label: 'Deals In Pipeline', value: activeDealsCount, sub: `₹${(myPipelineValue / 100000).toFixed(1)}L Total Value`, icon: <Briefcase size={16} />, theme: 'amber' },
                      { label: 'Pending Tasks', value: pendingTasksCount, sub: 'Ongoing & Assigned', icon: <CheckSquare size={16} />, theme: 'rose' },
                    ].map((kpi, i) => {
                      const t = enhancedThemeMap[kpi.theme];
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
                          whileHover={{ y: -8, scale: 1.02 }}
                          style={{ '--kpi-glow': t.glow }}
                          className={`relative rounded-[2rem] p-6 overflow-hidden group select-none flex items-center justify-between border border-zinc-200/70 bg-gradient-to-br ${t.gradient} shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_-16px_rgba(0,0,0,0.15)] transition-shadow duration-500 hover:shadow-[0_20px_45px_-18px_var(--kpi-glow)] ring-1 ${t.ring}`}
                        >
                          <div
                            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                            style={{ background: t.glow }}
                          />
                          <div className="relative flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-4">
                              <motion.div
                                whileHover={{ rotate: -8, scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.iconBg}`}
                              >
                                {kpi.icon}
                              </motion.div>
                            </div>
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.08 + 0.2 }}
                              className="text-3xl font-black text-zinc-900 tracking-tight leading-none mb-1.5"
                            >
                              {kpi.value}
                            </motion.p>
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                            <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                              className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all ${timePeriod === period ? 'bg-white text-[#D4A373] shadow-sm' : 'text-zinc-500 hover:text-zinc-700'
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
                      <p className="text-2xl font-black text-[#D4A373] mb-2">₹{(currentUser.achieved * currentUser.baseIncentiveRate).toLocaleString('en-IN')}</p>
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
                    <div className="bg-white border border-zinc-200/60 rounded-[2rem] overflow-hidden p-6 flex flex-col shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><ShieldCheck size={16} className="text-rose-500" /> Assigned by Admin/Lead</h3>
                      </div>
                      <div className="flex flex-col gap-3 flex-1">
                        {assignedTasks.length === 0 && <div className="text-center text-zinc-400 text-xs py-4">No tasks currently assigned.</div>}
                        {assignedTasks.map((task) => (
                          <div key={task.id} className="bg-rose-50/50 border border-rose-100 rounded-xl p-4">
                            <div className="flex justify-between items-start mb-2">
                              <p className="text-sm font-bold text-zinc-900">{task.title}</p>
                              <span className="bg-rose-100 text-rose-700 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded">{task.priority}</span>
                            </div>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-[10px] font-semibold text-zinc-500 bg-white px-2 py-1 rounded border border-zinc-200">By: {task.assigner}</span>
                              <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Clock size={12} /> Due: {task.deadline}</span>
                            </div>
                            <button onClick={() => toast.success('Sent completion report to Admin')} className="mt-4 w-full bg-white border border-zinc-200 text-zinc-700 hover:bg-rose-600 hover:text-white hover:border-rose-600 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors">
                              Mark as Done
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-zinc-200/60 rounded-[2rem] overflow-hidden p-6 flex flex-col shadow-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Activity size={16} className="text-[#D4A373]" /> Ongoing Tasks Status</h3>
                        <button className="text-[11px] font-bold text-[#D4A373] bg-zinc-50 px-3 py-1.5 rounded-lg hover:bg-[#D4A373]/10 transition flex items-center gap-1"><Plus size={12} /> New Task</button>
                      </div>
                      <div className="flex flex-col gap-3 flex-1">
                        {paginatedTasks.length === 0 && <div className="text-center text-zinc-400 text-xs py-4">No active ongoing tasks.</div>}
                        {paginatedTasks.map((task) => (
                          <div key={task.id} className="bg-white border border-zinc-200 rounded-xl p-4 shadow-sm flex flex-col">
                            <p className="text-sm font-bold text-zinc-900 mb-2">{task.title}</p>
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                              <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-1 rounded">{task.type}</span>
                              <span className="text-[10px] font-semibold text-zinc-600 bg-zinc-100 px-2 py-1 rounded">{task.client}</span>
                              <span className="text-[10px] text-zinc-400 flex items-center gap-1 ml-auto"><Clock size={12} /> {task.time}</span>
                            </div>
                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-100">
                              <span className="text-[10px] font-bold uppercase text-zinc-400">Status</span>
                              <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                className="text-xs font-bold text-[#D4A373] bg-zinc-50 border-none rounded py-1 px-2 cursor-pointer outline-none focus:ring-2 focus:ring-violet-200"
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                          </div>
                        ))}
                        
                        {/* ✨ Tasks Pagination Controls */}
                        {totalTaskPages > 1 && (
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100">
                            <button disabled={tasksPage === 1} onClick={() => setTasksPage(p => p - 1)} className="px-3 py-1 rounded-lg border border-zinc-200 text-[10px] font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-50">Previous</button>
                            <span className="text-[10px] font-bold text-zinc-400">Page {tasksPage} of {totalTaskPages}</span>
                            <button disabled={tasksPage === totalTaskPages} onClick={() => setTasksPage(p => p + 1)} className="px-3 py-1 rounded-lg border border-zinc-200 text-[10px] font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-50">Next</button>
                          </div>
                        )}
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

                          {/* ✨ Virtualized Container for Kanban Columns */}
                          <div className="flex flex-col gap-3 min-h-[100px] max-h-[65vh] overflow-y-auto sd-scrollbar pr-2 pb-6">
                            {stageLeads.map((lead, i) => (
                              <motion.div key={lead.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                                className="bg-white rounded-[1.5rem] p-4 border border-zinc-200/80 shadow-sm relative overflow-hidden flex flex-col shrink-0"
                              >
                                <div className="absolute top-0 left-0 w-1 h-full" style={{ background: stageColors[stage] }} />
                                <div className="pl-2">
                                  <div className="flex items-start justify-between mb-1">
                                    <p className="text-sm font-bold text-zinc-900 leading-snug truncate">{lead.company}</p>
                                  </div>
                                  <p className="text-[11px] text-zinc-500 font-semibold mb-3">{lead.deal} • <span className="text-[#D4A373] font-black">₹{(lead.value / 1000).toFixed(0)}k</span></p>

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
                              <div className="rounded-[1.5rem] border border-dashed border-zinc-200 p-6 text-center text-[10px] text-zinc-400 font-semibold">Empty stage</div>
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
                  <div className="bg-white border border-zinc-200/60 rounded-[2rem] overflow-hidden p-6 shadow-sm flex flex-col">
                    <div>
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-2"><Briefcase size={16} className="text-[#D4A373]" /> Accounts Managed By Me</h3>
                      <p className="text-xs text-zinc-500 mb-6">Leads you start working on heavily can be moved here for long-term management.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 flex-1">
                      {paginatedAccounts.length === 0 && <div className="text-center text-zinc-400 text-xs py-4 col-span-full">No active accounts.</div>}
                      {paginatedAccounts.map(acc => (
                        <div key={acc.id} className="bg-white border border-zinc-200 rounded-[1.5rem] p-5 shadow-sm hover:border-[#D4A373]/30 transition-colors">
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
                              <p className="text-xs font-black text-[#D4A373]">₹{(acc.ytdRevenue / 100000).toFixed(1)}L</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* ✨ Accounts Pagination Controls */}
                    {totalAccountPages > 1 && (
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-100">
                        <button disabled={accountsPage === 1} onClick={() => setAccountsPage(p => p - 1)} className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-50 transition-colors">Previous</button>
                        <span className="text-xs font-bold text-zinc-400">Page {accountsPage} of {totalAccountPages}</span>
                        <button disabled={accountsPage === totalAccountPages} onClick={() => setAccountsPage(p => p + 1)} className="px-4 py-2 rounded-xl border border-zinc-200 text-xs font-bold text-zinc-600 disabled:opacity-50 hover:bg-zinc-50 transition-colors">Next</button>
                      </div>
                    )}
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
                          {bookingModes.length === 0 && <div className="text-zinc-400 text-xs">No booking sources found.</div>}
                          {bookingModes.map((d, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-3">
                              <span className="w-6 h-6 rounded flex items-center justify-center shrink-0 text-white shadow-sm" style={{ backgroundColor: d.color }}>{d.icon}</span>
                              <span className="text-xs text-zinc-600 font-bold truncate">{d.label}</span>
                              <span className="text-xs font-black text-zinc-900 ml-auto pl-4">₹{(d.value / 1000).toFixed(0)}k</span>
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
                      { label: 'Net Revenue', value: `₹${(totalOtaNet / 100000).toFixed(2)}L`, sub: 'After Commissions', icon: <DollarSign size={16} />, theme: 'emerald' },
                      { label: 'Avg Cancel Rate', value: `${avgCancelRate}%`, sub: 'Across platforms', icon: <TrendingDown size={16} />, theme: 'violet' },
                    ].map((kpi, i) => {
                      const t = enhancedThemeMap[kpi.theme];
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
                          whileHover={{ y: -8, scale: 1.02 }}
                          style={{ '--kpi-glow': t.glow }}
                          className={`relative rounded-[2rem] p-6 overflow-hidden group select-none flex items-center justify-between border border-zinc-200/70 bg-gradient-to-br ${t.gradient} shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_-16px_rgba(0,0,0,0.15)] transition-shadow duration-500 hover:shadow-[0_20px_45px_-18px_var(--kpi-glow)] ring-1 ${t.ring}`}
                        >
                          <div
                            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                            style={{ background: t.glow }}
                          />
                          <div className="relative flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-4">
                              <motion.div
                                whileHover={{ rotate: -8, scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.iconBg}`}
                              >
                                {kpi.icon}
                              </motion.div>
                            </div>
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.08 + 0.2 }}
                              className="text-3xl font-black text-zinc-900 tracking-tight leading-none mb-1.5"
                            >
                              {kpi.value}
                            </motion.p>
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                            <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                          </div>
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
                          {otaBookingShare.length === 0 && <div className="text-zinc-400 text-xs">No OTA data.</div>}
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

                  <div className="bg-white border border-zinc-200/60 rounded-[2rem] overflow-hidden shadow-sm">
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
                          {otaData.length === 0 && <tr><td colSpan={7} className="text-center py-4 text-xs text-zinc-400">No OTA ledger data available.</td></tr>}
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

      {/* =============================================
          ADD LEAD MODAL
      ============================================= */}
      <AnimatePresence>
        {showAddLeadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center sd-glass-backdrop p-4"
            onClick={() => setShowAddLeadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg sd-glass-modal rounded-3xl p-7 overflow-hidden relative"
            >
              <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 text-[#D4A373] flex items-center justify-center">
                    <Target size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-black text-zinc-900">Add Hotel Booking Lead</h2>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Corporate Stays, Groups & Events</p>
                  </div>
                </div>
                <button onClick={() => setShowAddLeadModal(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddLead} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Company / Group Name</label>
                    <input
                      type="text" required placeholder="e.g. Reliance Retreat or Verma Wedding"
                      value={newLeadForm.company}
                      onChange={e => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                      className="sd-input bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Booking Requirements</label>
                    <input
                      type="text" required placeholder="e.g. 10 Deluxe Rooms - 3 Nights"
                      value={newLeadForm.deal_name}
                      onChange={e => setNewLeadForm({ ...newLeadForm, deal_name: e.target.value })}
                      className="sd-input bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Estimated Revenue (₹)</label>
                    <input
                      type="number" required min="0" placeholder="e.g. 120000"
                      value={newLeadForm.value}
                      onChange={e => setNewLeadForm({ ...newLeadForm, value: e.target.value })}
                      className="sd-input bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Enquiry Source</label>
                    <select
                      value={newLeadForm.source}
                      onChange={e => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                      className="sd-input bg-white appearance-none cursor-pointer"
                    >
                      <option value="Hotel Website">Hotel Website</option>
                      <option value="Call Enquiry">Call Enquiry</option>
                      <option value="Walk In Enquiry">Walk In Enquiry</option>
                      <option value="Different Websites">OTA / Third Party (B2B)</option>
                      <option value="Corporate Tie-up">Corporate Tie-up</option>
                    </select>
                  </div>
                </div>

                <hr className="border-zinc-100 my-4" />
                <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-3">Guest / Organizer Contact</h3>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Organizer Name</label>
                  <input
                    type="text" required placeholder="e.g. Rahul Sharma"
                    value={newLeadForm.contact_name}
                    onChange={e => setNewLeadForm({ ...newLeadForm, contact_name: e.target.value })}
                    className="sd-input bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Email Address</label>
                    <input
                      type="email" placeholder="rahul@example.com"
                      value={newLeadForm.contact_email}
                      onChange={e => setNewLeadForm({ ...newLeadForm, contact_email: e.target.value })}
                      className="sd-input bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Phone Number</label>
                    <input
                      type="text" required placeholder="+91 98765 43210"
                      value={newLeadForm.contact_phone}
                      onChange={e => setNewLeadForm({ ...newLeadForm, contact_phone: e.target.value })}
                      className="sd-input bg-white"
                    />
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmittingLead}
                  className="w-full mt-6 bg-zinc-900 hover:bg-[#D4A373] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmittingLead ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {isSubmittingLead ? 'Saving...' : 'Add Lead to Pipeline'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}