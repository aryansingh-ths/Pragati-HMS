import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Activity, Users, Lock, Unlock, Sparkles, DollarSign,
  Sliders, Wrench, Loader2, Plus, Trash2, X, ChevronDown, ChevronUp, Edit,
  TrendingUp, AlertTriangle, Clock, BedDouble, Zap, ArrowUpRight, ArrowDownRight,
  UserCheck, UserX, ShieldAlert, Hammer, Eye, CircleDot, RefreshCw, CheckCircle,
  LogIn, DoorOpen, Maximize2, Search, LogOut } from 'lucide-react';

// SVG DONUT CHART COMPONENT (Pure SVG, no deps)
function DonutChart({ data, size = 180 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <div className="flex items-center justify-center text-zinc-400 text-sm" style={{ width: size, height: size }}>No Data</div>;

  const radius = 65;
  const strokeWidth = 22;
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
          const circ = 2 * Math.PI * radius;

          return (
            <motion.path
              key={i}
              d={d}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 }}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              whileHover={{ strokeWidth: strokeWidth + 4, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}
            />
          );
        })}
        {/* Center label */}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-zinc-900 text-2xl font-black" style={{ fontSize: '26px', fontWeight: 900 }}>{total}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>ROOMS</text>
      </svg>
    </div>
  );
}

// MINI BAR CHART COMPONENT
function MiniBarChart({ arrivals = 0, departures = 0 }) {
  const [hovered, setHovered] = useState(null); // 'arrivals' | 'departures' | null
  const max = Math.max(arrivals, departures, 1);

  const bars = [
    {
      key: 'arrivals',
      label: 'Arrivals',
      value: arrivals,
      icon: <LogIn size={13} />,
      from: '#1ABC9C',
      to: '#148F77',
      glow: 'rgba(20,143,119,0.45)',
    },
    {
      key: 'departures',
      label: 'Departures',
      value: departures,
      icon: <DoorOpen size={13} />,
      from: '#F39C12',
      to: '#D68910',
      glow: 'rgba(214,137,16,0.45)',
    },
  ];

  return (
    <div className="flex items-end justify-around gap-8 h-40 pt-4">
      {bars.map((bar) => {
        const heightPct = (bar.value / max) * 100;
        const isHovered = hovered === bar.key;
        const isDimmed = hovered && !isHovered;

        return (
          <div
            key={bar.key}
            className="flex flex-col items-center gap-2 flex-1 h-full justify-end relative"
            onMouseEnter={() => setHovered(bar.key)}
            onMouseLeave={() => setHovered(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{
                opacity: 1,
                y: isHovered ? -4 : 0,
                scale: isHovered ? 1.12 : 1,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className={`text-lg font-black transition-colors duration-200 ${isHovered ? 'text-zinc-900' : 'text-zinc-700'
                }`}
            >
              {bar.value}
            </motion.div>

            <motion.div
              className="w-12 sm:w-14 rounded-t-xl relative overflow-hidden cursor-pointer"
              style={{ background: `linear-gradient(180deg, ${bar.from}, ${bar.to})` }}
              initial={{ height: 0 }}
              animate={{
                height: `${Math.max(heightPct, 6)}%`,
                boxShadow: isHovered
                  ? `0 8px 22px -6px ${bar.glow}`
                  : '0 2px 6px -3px rgba(0,0,0,0.15)',
              }}
              whileHover={{ scale: 1.06 }}
              transition={{
                height: { duration: 0.9, ease: 'easeOut' },
                boxShadow: { duration: 0.25 },
                scale: { type: 'spring', stiffness: 350, damping: 18 },
              }}
            >
              {isHovered && (
                <motion.div
                  className="absolute inset-0"
                  style={{
                    background: 'linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%)',
                  }}
                  initial={{ x: '-120%' }}
                  animate={{ x: '120%' }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                />
              )}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-white/30" />
            </motion.div>

            <motion.div
              animate={{
                opacity: isDimmed ? 0.5 : 1,
                y: isHovered ? -2 : 0,
              }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5"
            >
              <span
                className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
                style={{ background: `linear-gradient(135deg, ${bar.from}, ${bar.to})` }}
              >
                {bar.icon}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-zinc-500">{bar.label}</span>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}

// 7-DAY OCCUPANCY TREND LINE (SVG)
function OccupancyTrendLine({ trend = [] }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const width = 600;
  const height = 160;
  const padX = 24;
  const padY = 20;

  // Map backend format (date, occupied, total) to (label, value, isToday) if available
  const formattedTrend = trend.map(t => {
    if (t.occupied !== undefined && t.total !== undefined) {
      const isToday = new Date(t.date).toDateString() === new Date().toDateString();
      return {
        label: isToday ? 'Today' : new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: Math.round((t.occupied / (t.total || 1)) * 100),
        isToday
      };
    }
    return {
      ...t,
      isToday: t.isToday || t.label?.toLowerCase() === 'today'
    };
  });

  const max = Math.max(...formattedTrend.map(t => t.value), 100);
  const min = Math.min(...formattedTrend.map(t => t.value), 0);
  const range = max - min || 1;

  const points = formattedTrend.map((t, i) => {
    const x = padX + (i / (formattedTrend.length - 1 || 1)) * (width - padX * 2);
    const y = padY + (1 - (t.value - min) / range) * (height - padY * 2);
    return { ...t, x, y };
  });

  const linePath = points
    .map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : ` L${p.x} ${p.y}`))
    .join('');

  const areaPath = `${linePath} L${points[points.length - 1]?.x || 0} ${height - padY} L${points[0]?.x || 0} ${height - padY} Z`;

  const active = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-40 overflow-visible"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="trendAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="trendLineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#4338ca" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f, i) => (
          <line
            key={i}
            x1={padX}
            x2={width - padX}
            y1={padY + f * (height - padY * 2)}
            y2={padY + f * (height - padY * 2)}
            stroke="#f1f2f6"
            strokeWidth="1"
          />
        ))}

        <motion.path
          d={areaPath}
          fill="url(#trendAreaFill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        />

        <motion.path
          d={linePath}
          fill="none"
          stroke="url(#trendLineStroke)"
          strokeWidth={active ? 3.5 : 2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{
            pathLength: 1,
            filter: active
              ? 'drop-shadow(0 0 6px rgba(79,70,229,0.55))'
              : 'drop-shadow(0 0 0px rgba(79,70,229,0))',
          }}
          transition={{ pathLength: { duration: 1.4, ease: 'easeOut' }, filter: { duration: 0.25 } }}
        />

        <AnimatePresence>
          {active && (
            <motion.line
              x1={active.x} x2={active.x}
              y1={padY} y2={height - padY}
              stroke="#c7d2fe"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
        </AnimatePresence>

        {points.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x - (width / formattedTrend.length) / 2}
              y={0}
              width={width / formattedTrend.length}
              height={height}
              fill="transparent"
              onMouseEnter={() => setHoverIdx(i)}
            />
            {p.isToday && (
              <motion.circle
                cx={p.x} cy={p.y}
                initial={{ r: 8 }}
                fill="none"
                stroke="#f97316"
                strokeWidth="2"
                animate={{
                  scale: [1, 2.2, 1],
                  opacity: [0.9, 0.1, 0.9]
                }}
                transition={{
                  duration: 1.8,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                style={{ pointerEvents: 'none' }}
              />
            )}
            <motion.circle
              cx={p.x} cy={p.y}
              initial={{ r: p.isToday ? 5 : 3 }}
              fill={p.isToday ? "#f97316" : "#ffffff"}
              stroke="#4f46e5"
              strokeWidth={hoverIdx === i ? 3 : 2}
              animate={{ r: hoverIdx === i ? 6 : (p.isToday ? 5 : 3) }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              style={{ cursor: 'pointer' }}
            />
            {hoverIdx === i && (
              <motion.circle
                cx={p.x} cy={p.y}
                fill="none"
                stroke="#818cf8"
                strokeWidth="1.5"
                initial={{ opacity: 0.8, r: 4 }}
                animate={{ opacity: 0, r: 14 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
          </g>
        ))}
      </svg>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute pointer-events-none px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white text-[10px] font-bold shadow-lg shadow-indigo-500/20 whitespace-nowrap"
            style={{
              left: `${(active.x / width) * 100}%`,
              top: `${(active.y / height) * 100}%`,
              transform: 'translate(-50%, -140%)',
            }}
          >
            {active.label}: <span className="text-indigo-300">{active.value}%</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-1 px-1">
        {formattedTrend.map((t, i) => (
          <span
            key={i}
            onMouseEnter={() => setHoverIdx(i)}
            onMouseLeave={() => setHoverIdx(null)}
            className={`text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all duration-200 ${hoverIdx === i
              ? 'text-indigo-600'
              : (t.isToday ? 'text-orange-500 animate-pulse font-extrabold' : 'text-zinc-400')
              }`}
          >
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// SLA COUNTDOWN TIMER
function SlaCountdownTimer({ createdAt, priority, status }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isBreached, setIsBreached] = useState(false);

  useEffect(() => {
    if (status === 'Resolved') {
      setTimeLeft('Resolved');
      return;
    }

    const calculateTimeLeft = () => {
      const start = new Date(createdAt).getTime();
      let slaHours = 24; // Default Low
      if (priority === 'High') slaHours = 1;
      else if (priority === 'Medium') slaHours = 4;

      const deadline = start + (slaHours * 60 * 60 * 1000);
      const now = new Date().getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        setIsBreached(true);
        setTimeLeft('SLA Breached');
      } else {
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${h}h ${m}m ${s}s`);
        setIsBreached(false);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [createdAt, priority, status]);

  if (status === 'Resolved') return <span className="text-zinc-400 font-bold text-[10px] uppercase tracking-wider bg-zinc-100 px-2 py-1 rounded">Resolved</span>;

  return (
    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider flex items-center gap-1.5 border transition-all ${isBreached
      ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse'
      : 'bg-zinc-50 text-zinc-600 border-zinc-200'
      }`}>
      <Clock size={11} className={isBreached ? 'text-rose-500' : 'text-zinc-400'} /> {timeLeft}
    </div>
  );
}

// MAIN Admin DASHBOARD
export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();
  const [expandedQueueCol, setExpandedQueueCol] = useState(null);  // Live Operations state
  const [expandedCard, setExpandedCard] = useState(null); // 'frontdesk' | 'housekeeping' | 'engineering' | null
  const [liveData, setLiveData] = useState(null);
  const [activityPage, setActivityPage] = useState(1);
  const activityItemsPerPage = 10;

  // Staff / HR state
  const [shiftDateFilter, setShiftDateFilter] = useState('');

  // Properties state  
  const [roomsList, setRoomsList] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [maintenanceTickets, setMaintenanceTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [expandedClasses, setExpandedClasses] = useState({});
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [newRoomForm, setNewRoomForm] = useState({ room_number: '', room_type_id: '' });

  // Maintenance state
  const [isAddTicketModalOpen, setIsAddTicketModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({ room_id: '', issue: '', priority: 'Medium', assigned_to: 'Unassigned' });

  // Advanced features state
  const [yieldRules, setYieldRules] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditSearch, setAuditSearch] = useState('');
  const [auditLive, setAuditLive] = useState(true);
  const [auditRoleFilter, setAuditRoleFilter] = useState('ALL');
  const [auditTimeFilter, setAuditTimeFilter] = useState('ALL');
  const [auditPage, setAuditPage] = useState(1);
  const [staffPermissions, setStaffPermissions] = useState([]);
  const [staffShifts, setStaffShifts] = useState([]);
  const [crmGuests, setCrmGuests] = useState([]);
  const [crmSearch, setCrmSearch] = useState('');
  const [crmPage, setCrmPage] = useState(1);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Forms & Actions state
  const [broadcastForm, setBroadcastForm] = useState({ targetDept: 'ALL', message: '' });
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // ─── Broadcast States ──────────────────────────────────────
  const [broadcasts, setBroadcasts] = useState([]);
  const [broadcastDateFilter, setBroadcastDateFilter] = useState('');
  const [dismissedBroadcasts, setDismissedBroadcasts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hms_dismissed_broadcasts')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('hms_dismissed_broadcasts', JSON.stringify(dismissedBroadcasts));
  }, [dismissedBroadcasts]);
  const [onboardForm, setOnboardForm] = useState({ email: '', password: '', name: '', role: 'FRONT_DESK' });
  const [onboardSuccess, setOnboardSuccess] = useState(null);
  const [onboardError, setOnboardError] = useState(null);
  const [staffFilter, setStaffFilter] = useState('ALL');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [salarySlipData, setSalarySlipData] = useState(null);

  // Salary Drawer state
  const [staffSalaries, setStaffSalaries] = useState([]);
  const [salaryForm, setSalaryForm] = useState({ base_salary_monthly: 0, daily_deduction: 0 });

  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = sessionStorage.getItem('hms_token');
    if (!token) { navigate('/login'); return null; }
    try {
      const res = await fetch(url, {
        ...options,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers }
      });
      if (res.status === 401 || res.status === 403) { navigate('/login'); return null; }
      return res;
    } catch (err) { return null; }
  }, [navigate]);

  const loadAdminData = async () => {
    setIsLoading(true);
    try {
      if (['overview', 'activity_monitor', 'operations_log', 'broadcasting', 'security_audit', 'analytics'].includes(activeTab)) {
        const liveRes = await fetchWithAuth('http://localhost:3000/api/Admin/live-operations');
        if (liveRes?.ok) {
          const json = await liveRes.json();
          setLiveData(json.data);
        }

        const auditRes = await fetchWithAuth('http://localhost:3000/api/Admin/audit-logs');
        if (auditRes?.ok) setAuditLogs((await auditRes.json()).data.logs || []);

        const analyticsRes = await fetchWithAuth('http://localhost:3000/api/Admin/analytics');
        if (analyticsRes?.ok) setAnalyticsData((await analyticsRes.json()).data || null);
      }

      if (activeTab === 'properties') {
        const roomsRes = await fetchWithAuth('http://localhost:3000/api/Admin/rooms');
        if (roomsRes?.ok) setRoomsList((await roomsRes.json()).data.rooms || []);

        const typesRes = await fetchWithAuth('http://localhost:3000/api/Admin/room-types');
        if (typesRes?.ok) {
          const fetchedTypes = (await typesRes.json()).data.roomTypes || [];
          setRoomTypes(fetchedTypes);
          const initialExpanded = {};
          fetchedTypes.forEach(rt => initialExpanded[rt.id] = true);
          setExpandedClasses(initialExpanded);
        }

        const yieldRes = await fetchWithAuth('http://localhost:3000/api/Admin/yield-rules');
        if (yieldRes?.ok) setYieldRules((await yieldRes.json()).data.rules || null);
      }

      if (activeTab === 'crm') {
        const crmRes = await fetchWithAuth('http://localhost:3000/api/Admin/crm/guests');
        if (crmRes?.ok) setCrmGuests((await crmRes.json()).data.guests || []);
      }

      if (activeTab === 'maintenance') {
        const roomsRes = await fetchWithAuth('http://localhost:3000/api/Admin/rooms');
        if (roomsRes?.ok) setRoomsList((await roomsRes.json()).data.rooms || []);

        const ticketsRes = await fetchWithAuth('http://localhost:3000/api/Admin/maintenance');
        if (ticketsRes?.ok) {
          const ticketsData = await ticketsRes.json();
          setMaintenanceTickets(ticketsData.data.tickets || []);
        }

        const yieldRes = await fetchWithAuth('http://localhost:3000/api/Admin/yield-rules');
        if (yieldRes?.ok) setYieldRules((await yieldRes.json()).data.rules || null);
      }

      if (activeTab === 'hr') {
        const permRes = await fetchWithAuth('http://localhost:3000/api/Admin/permissions');
        if (permRes?.ok) setStaffPermissions((await permRes.json()).data.permissions || []);

        const shiftsRes = await fetchWithAuth('http://localhost:3000/api/Admin/shifts');
        if (shiftsRes?.ok) setStaffShifts((await shiftsRes.json()).data.shifts || []);

        const salariesRes = await fetchWithAuth('http://localhost:3000/api/Admin/salaries');
        if (salariesRes?.ok) setStaffSalaries((await salariesRes.json()).data.salaries || []);

        const analyticsRes = await fetchWithAuth('http://localhost:3000/api/Admin/analytics');
        if (analyticsRes?.ok) setAnalyticsData((await analyticsRes.json()).data || null);
      }
    } catch (e) {
      console.error("Dashboard Load Error", e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBroadcasts = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`http://localhost:3000/api/broadcasts`);
      if (res?.ok) {
        const data = await res.json();
        setBroadcasts(data.data.broadcasts || []);
      }
    } catch (e) {
      console.error('Failed to fetch broadcasts:', e);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    fetchBroadcasts();
    const interval = setInterval(fetchBroadcasts, 30000);
    return () => clearInterval(interval);
  }, [fetchBroadcasts]);

  useEffect(() => { loadAdminData(); }, [activeTab]);

  useEffect(() => {
    setAuditPage(1);
  }, [auditSearch, auditRoleFilter, auditTimeFilter]);

  useEffect(() => {
    setCrmPage(1);
  }, [crmSearch]);

  useEffect(() => {
    let interval;
    if (activeTab === 'security_audit' && auditLive) {
      interval = setInterval(async () => {
        try {
          const res = await fetchWithAuth(`http://localhost:3000/api/Admin/audit-logs?q=${encodeURIComponent(auditSearch)}`);
          if (res?.ok) {
            const data = await res.json();
            setAuditLogs(data.data?.logs || []);
          }
        } catch (e) {
          console.error("Live audit log fetch failed", e);
        }
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activeTab, auditLive, auditSearch, fetchWithAuth]);

  useEffect(() => {
    if (selectedStaff) {
      const salaryData = staffSalaries.find(s => s.user_id === selectedStaff.id);
      if (salaryData) {
        setSalaryForm({ base_salary_monthly: salaryData.base_salary_monthly, daily_deduction: salaryData.daily_deduction });
      } else {
        setSalaryForm({ base_salary_monthly: 0, daily_deduction: 0 });
      }
    }
  }, [selectedStaff, staffSalaries]);

  // --- ACTIONS ---

  const toggleAccordion = (id) => {
    setExpandedClasses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddTicket = async (e) => {
    e.preventDefault();
    if (!newTicketForm.room_id) return alert("❌ Please select a room.");
    const res = await fetchWithAuth('http://localhost:3000/api/Admin/maintenance', {
      method: 'POST', body: JSON.stringify(newTicketForm)
    });
    if (res?.ok) {
      setIsAddTicketModalOpen(false);
      setNewTicketForm({ room_id: '', issue: '', priority: 'Medium', assigned_to: 'Unassigned' });
      loadAdminData();
    } else {
      alert("❌ Failed to create ticket.");
    }
  };

  const handleChangeTicketStatus = async (id, status) => {
    const res = await fetchWithAuth(`http://localhost:3000/api/Admin/maintenance/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status })
    });
    if (res?.ok) loadAdminData();
  };

  const handleAssignTicket = async (id, assigned_to) => {
    const res = await fetchWithAuth(`http://localhost:3000/api/Admin/maintenance/${id}/assign`, {
      method: 'PATCH', body: JSON.stringify({ assigned_to })
    });
    if (res?.ok) loadAdminData();
  };

  const handleToggleBlock = async (roomId) => {
    const res = await fetchWithAuth(`http://localhost:3000/api/Admin/rooms/${roomId}/toggle-block`, { method: 'POST' });
    if (res?.ok) loadAdminData();
    else alert("❌ Failed to modify room block state.");
  };

  const handleChangeStatus = async (roomId, newStatus) => {
    const res = await fetchWithAuth(`http://localhost:3000/api/Admin/rooms/${roomId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    if (res?.ok) loadAdminData();
    else alert("❌ Failed to manually override room status.");
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    const cleanRoomNumber = newRoomForm.room_number.trim().toUpperCase();

    if (!cleanRoomNumber) return alert("❌ Room number cannot be empty.");
    if (roomsList.some(r => r.room_number.toUpperCase() === cleanRoomNumber)) {
      return alert(`❌ Duplicate Error: Room ${cleanRoomNumber} already exists.`);
    }

    const res = await fetchWithAuth('http://localhost:3000/api/Admin/rooms', {
      method: 'POST', body: JSON.stringify({ ...newRoomForm, room_number: cleanRoomNumber })
    });

    if (res?.ok) {
      setIsAddRoomModalOpen(false);
      setNewRoomForm({ room_number: '', room_type_id: '' });
      loadAdminData();
    } else {
      const err = await res.json();
      alert(`❌ ${err.error || "Failed to add room."}`);
    }
  };

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`⚠️ CRITICAL: Are you sure you want to permanently delete Room ${roomNumber}? This cannot be undone.`)) return;
    const res = await fetchWithAuth(`http://localhost:3000/api/Admin/rooms/${roomId}`, { method: 'DELETE' });
    if (res?.ok) loadAdminData();
    else alert("❌ Failed to delete room. It may have connected database records.");
  };

  // --- ADVANCED CONTROLS ACTIONS ---

  const handleSaveYieldRule = async (key, value) => {
    const res = await fetchWithAuth('http://localhost:3000/api/Admin/yield-rules', {
      method: 'POST', body: JSON.stringify({ key, value })
    });
    if (res?.ok) {
      const yieldRes = await fetchWithAuth('http://localhost:3000/api/Admin/yield-rules');
      if (yieldRes?.ok) setYieldRules((await yieldRes.json()).data.rules || null);
    } else {
      alert("❌ Failed to update yield engine rule configuration.");
    }
  };

  const handleSavePermissions = async (userId, data) => {
    const res = await fetchWithAuth(`http://localhost:3000/api/Admin/permissions/${userId}`, {
      method: 'POST', body: JSON.stringify(data)
    });
    if (res?.ok) loadAdminData();
  };

  const handleSaveSalaryConfig = async (e) => {
    e.preventDefault();
    if (!selectedStaff) return;
    const res = await fetchWithAuth(`http://localhost:3000/api/Admin/salary/${selectedStaff.id}`, {
      method: 'POST', body: JSON.stringify(salaryForm)
    });
    if (res?.ok) {
      alert("✅ Salary configuration saved successfully.");
      loadAdminData();
    } else {
      alert("❌ Failed to save salary configuration.");
    }
  };

  const handleUpdateStaffProfile = async (field, value) => {
    if (!selectedStaff || !selectedStaff.id) return;
    const payload = {
      name: field === 'name' ? value : selectedStaff.name,
      email: field === 'email' ? value : selectedStaff.email
    };
    const res = await fetchWithAuth(`http://localhost:3000/api/Admin/staff/${selectedStaff.id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
    if (res?.ok) {
      loadAdminData();
    }
  };

  const handleSaveGuestFlags = async (guestId, payload) => {
    const res = await fetchWithAuth(`http://localhost:3000/api/Admin/crm/guests/${guestId}`, {
      method: 'POST', body: JSON.stringify(payload)
    });
    if (res?.ok) {
      const crmRes = await fetchWithAuth('http://localhost:3000/api/Admin/crm/guests');
      if (crmRes?.ok) setCrmGuests((await crmRes.json()).data.guests || []);
    } else {
      alert("❌ Failed to update guest relations registry.");
    }
  };

  const handleTriggerBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.message.trim()) return;
    const res = await fetchWithAuth('http://localhost:3000/api/Admin/broadcast', {
      method: 'POST', body: JSON.stringify(broadcastForm)
    });
    if (res?.ok) {
      setBroadcastSuccess(true);
      setBroadcastForm({ targetDept: 'ALL', message: '' });
      setTimeout(() => setBroadcastSuccess(false), 3000);
      const auditRes = await fetchWithAuth('http://localhost:3000/api/Admin/audit-logs');
      if (auditRes?.ok) setAuditLogs((await auditRes.json()).data.logs || []);
    } else {
      alert("❌ Failed to send operational broadcast alert.");
    }
  };

  const handleHROnboard = async (e) => {
    e.preventDefault();
    setOnboardSuccess(null);
    setOnboardError(null);
    const res = await fetchWithAuth('http://localhost:3000/api/Admin/staff/onboard', {
      method: 'POST', body: JSON.stringify(onboardForm)
    });
    const json = await res.json();
    if (res?.ok) {
      setOnboardSuccess('Employee onboarded and provisioned successfully!');
      setOnboardForm({ email: '', password: '', name: '', role: 'FRONT_DESK' });
      const permRes = await fetchWithAuth('http://localhost:3000/api/Admin/permissions');
      if (permRes?.ok) setStaffPermissions((await permRes.json()).data.permissions || []);
      setTimeout(() => { setShowOnboardModal(false); setOnboardSuccess(null); }, 1800);
    } else {
      setOnboardError(json.error || 'Failed to complete employee onboarding.');
    }
  };

  const handleHROffboard = async (userId) => {
    if (!window.confirm('⚠️ WARNING: Are you sure you want to permanently revoke credential tokens and delete this staff member? This cannot be undone.')) return;
    const res = await fetchWithAuth(`http://localhost:3000/api/Admin/staff/offboard/${userId}`, {
      method: 'POST'
    });
    if (res?.ok) {
      const permRes = await fetchWithAuth('http://localhost:3000/api/Admin/permissions');
      if (permRes?.ok) setStaffPermissions((await permRes.json()).data.permissions || []);
    } else {
      const err = await res.json();
      alert(`❌ ${err.error || "Failed to offboard employee."}`);
    }
  };

  const handleSearchAudits = async (e) => {
    e.preventDefault();
    const res = await fetchWithAuth(`http://localhost:3000/api/Admin/audit-logs?q=${encodeURIComponent(auditSearch)}`);
    if (res?.ok) setAuditLogs((await res.json()).data.logs || []);
  };

  // --- HELPERS ---
  const formatActivityAction = (action) => {
    const map = { 'CONFIRMED': 'Booking confirmed', 'CHECKED_IN': 'Checked in', 'CHECKED_OUT': 'Checked out', 'CANCELLED': 'Booking cancelled', 'PENDING': 'Booking pending' };
    return map[action] || action;
  };

  const formatActivityTime = (timestamp) => {
    if (!timestamp) return '';
    return new Date(timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const getActionColor = (action) => {
    const map = { 'CONFIRMED': 'text-emerald-600 bg-emerald-50 border-emerald-200', 'CHECKED_IN': 'text-indigo-600 bg-indigo-50 border-indigo-200', 'CHECKED_OUT': 'text-orange-600 bg-orange-50 border-orange-200', 'CANCELLED': 'text-red-600 bg-red-50 border-red-200', 'PENDING': 'text-amber-600 bg-amber-50 border-amber-200' };
    return map[action] || 'text-zinc-600 bg-zinc-50 border-zinc-200';
  };

  const getActionIcon = (action) => {
    const map = { 'CONFIRMED': <UserCheck size={12} />, 'CHECKED_IN': <ArrowDownRight size={12} />, 'CHECKED_OUT': <ArrowUpRight size={12} />, 'CANCELLED': <X size={12} />, 'PENDING': <Clock size={12} /> };
    return map[action] || <CircleDot size={12} />;
  };

  const getDonutData = () => {
    if (!liveData?.roomStatusDistribution) return [];
    const dist = liveData.roomStatusDistribution;
    return [
      { label: 'Available', value: dist.AVAILABLE || 0, color: '#1ABC9C' },
      { label: 'Occupied', value: dist.OCCUPIED || 0, color: '#3498DB' },
      { label: 'Dirty', value: dist.DIRTY || 0, color: '#F39C12' },
      { label: 'Cleaning', value: dist.CLEANING || 0, color: '#8b5cf6' },
      { label: 'Inspecting', value: dist.INSPECTING || 0, color: '#6366f1' },
      { label: 'Maintenance', value: dist.MAINTENANCE || 0, color: '#ef4444' },
    ].filter(d => d.value > 0);
  };

  return (
    <div className="min-h-[calc(100vh-6rem)] relative fd-app-bg fd-scrollbar p-6 flex flex-col lg:flex-row gap-6">
      <style>{`
        .fd-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(161,161,170,0.4) transparent; }
        .fd-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .fd-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .fd-scrollbar::-webkit-scrollbar-thumb { background: rgba(161, 161, 170, 0.45); border-radius: 999px; }
        .fd-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(113, 113, 122, 0.65); }

        .fd-sidebar-scroll { scrollbar-width: none; }
        .fd-sidebar-scroll:hover { scrollbar-width: thin; scrollbar-color: rgba(161,161,170,0.4) transparent; }
        .fd-sidebar-scroll::-webkit-scrollbar { width: 6px; height: 6px; }
        .fd-sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .fd-sidebar-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 999px; transition: background 0.3s; }
        .fd-sidebar-scroll:hover::-webkit-scrollbar-thumb { background: rgba(161, 161, 170, 0.45); }
        .fd-sidebar-scroll:hover::-webkit-scrollbar-thumb:hover { background: rgba(113, 113, 122, 0.65); }

        .fd-app-bg {
          background: #F8F1E3 !important;
        }

        .fd-dealdeck-sidebar {
          background: #FFFFFF;
          box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08);
          border: 1px solid rgba(226, 232, 240, 0.8);
        }

        .fd-dealdeck-card {
          background: #FFFFFF;
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0px 18px 40px 0px rgba(112, 144, 176, 0.08);
          transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .fd-dealdeck-card:hover {
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0px 24px 48px 0px rgba(112, 144, 176, 0.16);
        }

        .fd-icon-btn { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); display: inline-flex; }
        .group:hover .fd-icon-btn { transform: translateY(-1px) scale(1.12) rotate(-6deg); }

        .fd-glass-backdrop { background: rgba(24, 24, 27, 0.4); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .fd-glass-modal {
          background: rgba(255, 255, 255, 0.98);
          border: 1px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 30px 70px -12px rgba(112, 144, 176, 0.25);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
        }

        .fd-input {
          width: 100%;
          padding: 0.75rem 1.1rem;
          background: #F4F7FE;
          border: 1px solid #E2E8F0;
          border-radius: 1rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════
          LEFT FLOATING SIDEBAR
          ═══════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-72 shrink-0 rounded-[2rem] p-6 flex flex-col gap-6 fd-dealdeck-sidebar sticky top-[7.5rem] self-start z-30 lg:h-[calc(100vh-7.8rem)]">
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-xs">
            <Sliders className="text-[#D4A373]" size={20} />
          </div>
          <div>
            <h1 className="font-serif font-black text-[25px] text-zinc-500 text-base leading-none">Admin</h1>
            <span className="text-[9px] font-bold text-[#D4A373] uppercase tracking-widest mt-1 block">Command Center</span>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto fd-sidebar-scroll pr-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Control Room</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'overview'
                  ? 'bg-[#D4A373] text-zinc-900 shadow-md shadow-[#D4A373]/20'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
              >
                <Activity size={15} /> Live Operations
              </button>
              <button
                onClick={() => setActiveTab(activeTab === 'properties' || activeTab === 'properties_yield' ? 'overview' : 'properties')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'properties' || activeTab === 'properties_yield'
                  ? 'bg-[#D4A373]/40 text-zinc-900 border border-[#D4A373] shadow-xs'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
              >
                <Sliders size={15} /> Property Controls
              </button>

              {/* Sub-tabs under Property Controls */}
              {(activeTab === 'properties' || activeTab === 'properties_yield') && (
                <div className="pl-6 flex flex-col gap-1 border-l-2 border-[#D4A373] ml-5 py-1">
                  <button
                    onClick={() => setActiveTab('properties')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all text-left ${activeTab === 'properties'
                      ? 'bg-[#D4A373]/40 text-zinc-900 font-extrabold border border-[#D4A373]'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                  >
                    <BedDouble size={12} /> Inventory & Rooms
                  </button>
                  <button
                    onClick={() => setActiveTab('properties_yield')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all text-left ${activeTab === 'properties_yield'
                      ? 'bg-[#D4A373]/40 text-zinc-900 font-extrabold border border-[#D4A373]'
                      : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                  >
                    <TrendingUp size={12} /> Yield & Distribution
                  </button>
                </div>
              )}
              <button
                onClick={() => setActiveTab('activity_monitor')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'activity_monitor'
                  ? 'bg-[#D4A373] text-zinc-900 shadow-md shadow-[#D4A373]/20'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
              >
                <CircleDot size={15} /> Activity Monitor
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'maintenance'
                  ? 'bg-[#D4A373] text-zinc-900 shadow-md shadow-[#D4A373]/20'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
              >
                <Wrench size={15} /> Repairs and Automations
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'analytics'
                  ? 'bg-[#D4A373] text-zinc-900 shadow-md shadow-[#D4A373]/20'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
              >
                <TrendingUp size={15} /> Predictive Analysis
              </button>
              <button
                onClick={() => setActiveTab('broadcasting')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'broadcasting'
                  ? 'bg-[#D4A373] text-zinc-900 shadow-md shadow-[#D4A373]/20'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
              >
                <Zap size={15} /> Broadcasting Center
              </button>
              <button
                onClick={() => setActiveTab('hr')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'hr'
                  ? 'bg-[#D4A373] text-zinc-900 shadow-md shadow-[#D4A373]/20'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
              >
                <Users size={15} /> Staff Hub
              </button>
              <button
                onClick={() => setActiveTab('security_audit')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'security_audit'
                  ? 'bg-[#D4A373] text-zinc-900 shadow-md shadow-[#D4A373]/20'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
              >
                <ShieldAlert size={15} /> Security Audit
              </button>

              <button
                onClick={() => setActiveTab('crm')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'crm'
                  ? 'bg-[#D4A373] text-zinc-900 shadow-md shadow-[#D4A373]/20'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
              >
                <UserCheck size={15} /> Guest Registry
              </button>
              <button
                onClick={() => setActiveTab('operations_log')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === 'operations_log'
                  ? 'bg-[#D4A373] text-zinc-900 shadow-md shadow-[#D4A373]/20'
                  : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                  }`}
              >
                <Clock size={15} /> Operations Log
              </button>
            </div>
          </div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Ledger Logs</p>
            <button
              onClick={() => navigate('/dashboard/finance')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 hover:text-indigo-600 transition-all text-left"
            >
              <span className="flex items-center gap-3"><DollarSign size={15} /> Finance & Ledgers</span>
              <ArrowUpRight size={14} className="opacity-50" />
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN WORKSPACE CANVAS
          ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden min-w-0">

        {/* BROADCAST BANNER */}
        <AnimatePresence>
          {broadcasts.filter(b => !dismissedBroadcasts.includes(b.id) && (!b.expires_at || new Date(b.expires_at) > new Date())).map((broadcast) => (
            <motion.div
              key={broadcast.id}
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 p-[2px] shadow-lg shadow-rose-500/20 mb-4 min-h-[72px] shrink-0"
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

        {/* HEADER RIBBON */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-zinc-500 tracking-tight mt-0.5">Admin Operations Portal</h2>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider">Live System</span>
            </div>

            {/* Refresh */}
            <button
              onClick={loadAdminData}
              className={`p-2.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-500 transition-all ${isLoading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={15} />
            </button>

            {/* Profile Avatar Widget */}
            {(() => {
              const staffName = localStorage.getItem('hms_name') || 'Staff';
              const initials = staffName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ST';
              const designation = 'Administrator';
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-indigo-700 group-hover:from-rose-500 group-hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-xs transition-colors">
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

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-96 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-xs font-medium uppercase tracking-wider">Syncing database assets...</p>
            </motion.div>
          ) : (
            <div className="space-y-6">

              {/* TAB 1: LIVE OPERATIONS COMMAND CENTER        */}
              {activeTab === 'overview' && liveData && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* KPI Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {(() => {
                      const circ = 2 * Math.PI * 18;
                      const pct = liveData.kpis.occupancyRate;
                      const kpisList = [
                        {
                          label: 'Occupancy Rate',
                          value: `${liveData.kpis.occupancyRate}%`,
                          sub: `${liveData.kpis.salableRooms} salable rooms`,
                          icon: <TrendingUp size={16} />,
                          theme: 'emerald',
                          gradient: 'from-emerald-50 via-white to-white',
                          ring: 'ring-emerald-500/10',
                          glow: 'rgba(20,143,119,0.35)',
                          iconBg: 'bg-[#148F77] text-white shadow-lg shadow-[#148F77]/30',
                          graphic: (
                            <div className="relative flex items-center justify-center shrink-0 ml-4">
                              <svg className="w-14 h-14 rotate-[-90deg] drop-shadow-[0_0_6px_rgba(20,143,119,0.35)]">
                                <circle cx="28" cy="28" r="20" fill="none" stroke="#D1EAE0" strokeWidth="4" />
                                <motion.circle
                                  cx="28" cy="28" r="20" fill="none" strokeWidth="4.5"
                                  stroke="#148F77"
                                  strokeDasharray={2 * Math.PI * 20}
                                  initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                                  animate={{ strokeDashoffset: (2 * Math.PI * 20) - (pct / 100) * (2 * Math.PI * 20) }}
                                  transition={{ duration: 1.3, ease: "easeOut" }}
                                  strokeLinecap="round"
                                />
                              </svg>
                              <span className="absolute text-[10px] font-black text-[#148F77]">{pct}%</span>
                            </div>
                          )
                        },
                        {
                          label: 'Active Stays',
                          value: liveData.kpis.activeStays,
                          sub: `of ${liveData.kpis.totalRooms} total rooms`,
                          icon: <Users size={16} />,
                          theme: 'indigo',
                          gradient: 'from-indigo-50 via-white to-white',
                          ring: 'ring-indigo-500/10',
                          glow: 'rgba(40,53,147,0.35)',
                          iconBg: 'bg-[#283593] text-white shadow-lg shadow-[#283593]/30',
                          graphic: (
                            <div className="shrink-0 ml-4 border border-[#283593]/20 bg-white p-1.5 rounded-xl shadow-sm">
                              <svg className="w-16 h-9 overflow-visible">
                                <defs>
                                  <linearGradient id="staysFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#283593" stopOpacity="0.35" />
                                    <stop offset="100%" stopColor="#283593" stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                                <motion.path
                                  d="M0 22 Q8 6, 16 16 T32 3 T48 12 T60 8 V32 H0 Z"
                                  fill="url(#staysFill)"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 1, delay: 0.5 }}
                                />
                                <motion.path
                                  d="M0 22 Q8 6, 16 16 T32 3 T48 12 T60 8"
                                  fill="none"
                                  stroke="#283593"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                />
                                <motion.circle
                                  cx="60" cy="8" r="3" fill="#283593"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: [0, 1.4, 1] }}
                                  transition={{ duration: 0.5, delay: 1.7 }}
                                />
                              </svg>
                            </div>
                          )
                        },
                        {
                          label: 'Maintenance Outages',
                          value: liveData.kpis.outOfOrderAssets,
                          sub: 'rooms blocked or down',
                          icon: <AlertTriangle size={16} />,
                          theme: 'rose',
                          gradient: 'from-rose-50 via-white to-white',
                          ring: 'ring-rose-500/10',
                          glow: 'rgba(146,43,33,0.35)',
                          iconBg: 'bg-[#922B21] text-white shadow-lg shadow-[#922B21]/30',
                          graphic: (
                            <div className="flex gap-1.5 h-7 items-end shrink-0 ml-4 border border-[#922B21]/20 bg-white px-2.5 py-1.5 rounded-xl shadow-sm">
                              {[...Array(5)].map((_, idx) => (
                                <motion.div
                                  key={idx}
                                  className={`w-2.5 rounded-t-md ${idx < Math.min(liveData.kpis.outOfOrderAssets, 5)
                                    ? 'bg-[#922B21] shadow-[0_2px_8px_rgba(146,43,33,0.45)]'
                                    : 'bg-zinc-200'
                                    }`}
                                  initial={{ height: 0 }}
                                  animate={{ height: idx < Math.min(liveData.kpis.outOfOrderAssets, 5) ? '20px' : '4px' }}
                                  transition={{ duration: 0.6, delay: idx * 0.08, type: 'spring', stiffness: 200 }}
                                />
                              ))}
                            </div>
                          )
                        },
                        {
                          label: "Today's Yield",
                          value: `₹${liveData.kpis.todaysRevenue.toLocaleString('en-IN')}`,
                          sub: 'direct billing transactions',
                          icon: <DollarSign size={16} />,
                          theme: 'amber',
                          gradient: 'from-amber-50 via-white to-white',
                          ring: 'ring-amber-500/10',
                          glow: 'rgba(212,172,13,0.35)',
                          iconBg: 'bg-[#D4AC0D] text-white shadow-lg shadow-[#D4AC0D]/30',
                          graphic: (
                            <div className="shrink-0 ml-4 border border-[#D4AC0D]/20 bg-white p-1.5 rounded-xl shadow-sm">
                              <svg className="w-16 h-9 overflow-visible">
                                <defs>
                                  <linearGradient id="yieldFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#D4AC0D" stopOpacity="0.35" />
                                    <stop offset="100%" stopColor="#D4AC0D" stopOpacity="0" />
                                  </linearGradient>
                                </defs>
                                <motion.path
                                  d="M0 25 L12 18 L24 22 L36 10 L48 14 L60 4 V32 H0 Z"
                                  fill="url(#yieldFill)"
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 1, delay: 0.7 }}
                                />
                                <motion.path
                                  d="M0 25 L12 18 L24 22 L36 10 L48 14 L60 4"
                                  fill="none"
                                  stroke="#D4AC0D"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                                />
                                <motion.circle
                                  cx="60" cy="4" r="3" fill="#D4AC0D"
                                  initial={{ scale: 0 }}
                                  animate={{ scale: [0, 1.4, 1] }}
                                  transition={{ duration: 0.5, delay: 1.9 }}
                                />
                              </svg>
                            </div>
                          )
                        }
                      ];

                      return kpisList.map((kpi, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
                          whileHover={{ y: -8, scale: 1.02 }}
                          style={{ '--kpi-glow': kpi.glow }}
                          className={`relative rounded-[2rem] p-6 overflow-hidden group select-none flex items-center justify-between border border-zinc-200/70 bg-gradient-to-br ${kpi.gradient} shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_-16px_rgba(0,0,0,0.15)] transition-shadow duration-500 hover:shadow-[0_20px_45px_-18px_var(--kpi-glow)] ring-1 ${kpi.ring}`}
                        >
                          {/* decorative glow blob */}
                          <div
                            className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none"
                            style={{ background: kpi.glow }}
                          />
                          <div className="relative flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-4">
                              <motion.div
                                whileHover={{ rotate: -8, scale: 1.1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpi.iconBg}`}
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
                          <div className="relative">{kpi.graphic}</div>
                        </motion.div>
                      ));
                    })()}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Flow distribution chart */}
                    <motion.div
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-[#F39C12] flex items-center justify-center shadow-md shadow-[#F39C12]/30">
                          <Zap size={14} className="text-white" />
                        </div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Today's Traffic Flow</h3>
                      </div>
                      <MiniBarChart arrivals={liveData.arrivalsToday} departures={liveData.departuresToday} />
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-[#3498DB] flex items-center justify-center shadow-md shadow-[#3498DB]/30">
                          <BedDouble size={14} className="text-white" />
                        </div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Operational Room Status</h3>
                      </div>
                      <div className="relative flex flex-col sm:flex-row items-center justify-around gap-6">
                        <DonutChart data={getDonutData()} />
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
                          {getDonutData().map((d, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.08 }}
                              className="flex items-center gap-2 group/legend"
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-sm transition-transform duration-200 group-hover/legend:scale-125"
                                style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}66` }}
                              />
                              <span className="text-[11px] text-zinc-500 font-semibold truncate max-w-[80px]">{d.label}</span>
                              <span className="text-xs font-black text-zinc-900 ml-auto">{d.value}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Trend chart */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="relative overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(79,70,229,0.22)] border border-zinc-200/60"
                  >
                    <div className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none" />
                    <div className="relative flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                          <TrendingUp size={14} className="text-white" />
                        </div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Occupancy Performance Line</h3>
                      </div>
                      <span className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">7-Day Trend</span>
                    </div>
                    <div className="relative">
                      <OccupancyTrendLine trend={liveData.occupancyTrend} />
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* TAB: ACTIVITY MONITOR                        */}
              {activeTab === 'activity_monitor' && liveData && (
                <motion.div key="activity_monitor" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* Local styles for this section only — glow rings, floating orbs, sheen sweep, glass modal */}
                  <style>{`
                    @keyframes amc-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                    @keyframes amc-float { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(12px,-10px) scale(1.06); } }
                    @keyframes amc-float-rev { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-10px,10px) scale(1.05); } }
                    @keyframes amc-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 70% { box-shadow: 0 0 0 9px rgba(99,102,241,0); } 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); } }
                    @keyframes amc-pulse-ring-amber { 0% { box-shadow: 0 0 0 0 rgba(245,158,11,0.4); } 70% { box-shadow: 0 0 0 9px rgba(245,158,11,0); } 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); } }
                    @keyframes amc-pulse-ring-rose { 0% { box-shadow: 0 0 0 0 rgba(244,63,94,0.4); } 70% { box-shadow: 0 0 0 9px rgba(244,63,94,0); } 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); } }
                    .amc-orb { position: absolute; border-radius: 9999px; filter: blur(42px); pointer-events: none; }
                    .amc-ring-indigo { animation: amc-pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .amc-ring-amber { animation: amc-pulse-ring-amber 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .amc-ring-rose { animation: amc-pulse-ring-rose 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .amc-sheen { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 45%, transparent 60%); transform: translateX(-130%); transition: transform 0.85s cubic-bezier(0.22,1,0.36,1); pointer-events: none; z-index: 3; border-radius: inherit; }
                    .group:hover .amc-sheen { transform: translateX(130%); }
                    .amc-glass-backdrop { background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
                    .amc-glass-modal { background: rgba(255,255,255,0.98); border: 1px solid rgba(226,232,240,0.8); box-shadow: 0 30px 70px -12px rgba(56,189,248,0.28); backdrop-filter: blur(24px); }
                    .amc-scrollbar::-webkit-scrollbar { width: 6px; }
                    .amc-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .amc-scrollbar::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.4); border-radius: 999px; }
                  `}</style>

                  {/*
                    NOTE: this section now needs one small piece of local UI state to power the
                    click-to-expand popups. Add this once, alongside your other useState calls
                    at the top of this component (not inside this JSX block):

                      const [expandedCard, setExpandedCard] = useState(null); // 'frontdesk' | 'housekeeping' | 'engineering' | null

                    Nothing about liveData, its shape, or how it's fetched/computed changes below —
                    expandedCard purely controls which popup is shown.
                  */}

                  {/* Department Snapshots grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Front desk card */}
                    <motion.div
                      layout
                      whileHover={{ y: -5, scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      onClick={() => setExpandedCard('frontdesk')}
                      className="group relative overflow-hidden bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 hover:border-[#D4A373]/50 cursor-pointer transition-colors"
                    >
                      <div className="amc-sheen" />
                      <div className="amc-orb w-36 h-36 bg-[#D4A373]/10 -top-10 -right-10" style={{ animation: 'amc-float 8s ease-in-out infinite' }} />
                      <div className="relative flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
                        <motion.div
                          whileHover={{ rotate: -10, scale: 1.1 }}
                          className="w-8 h-8 rounded-xl bg-[#D4A373] flex items-center justify-center shadow-sm amc-ring-amber"
                        >
                          <UserCheck size={15} className="text-white" />
                        </motion.div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex-1">Front Desk Dispatch</h3>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 size={11} /> Expand
                        </span>
                      </div>

                      <div className="relative flex items-center justify-between mb-2">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Pending check-ins</p>
                        <motion.span
                          key={liveData.departmental.pendingCheckins.length}
                          initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                          className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-indigo-100 text-indigo-700"
                        >
                          {liveData.departmental.pendingCheckins.length}
                        </motion.span>
                      </div>
                      {liveData.departmental.pendingCheckins.length === 0 ? (
                        <p className="text-xs text-zinc-400 italic mb-4">No pending arrivals today</p>
                      ) : (
                        <div className="relative space-y-2 mb-4">
                          {liveData.departmental.pendingCheckins.slice(0, 3).map((p, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                              className="flex items-center justify-between p-2 rounded-xl bg-white/70 border border-indigo-100 shadow-sm"
                            >
                              <div>
                                <p className="text-xs font-bold text-zinc-800">{p.guest_name}</p>
                                <p className="text-[9px] text-zinc-400">{p.room_type} · Rm {p.room_number}</p>
                              </div>
                              <Clock size={12} className="text-indigo-400" />
                            </motion.div>
                          ))}
                        </div>
                      )}

                      <p className="relative text-[9px] font-bold uppercase tracking-wider text-rose-500 mb-2 flex items-center gap-1">
                        <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="inline-flex">
                          <ShieldAlert size={11} />
                        </motion.span>
                        Overstay Alerts
                      </p>
                      {liveData.departmental.overstays.length === 0 ? (
                        <p className="relative text-xs text-zinc-400 italic">No overstays detected</p>
                      ) : (
                        <div className="relative space-y-2">
                          {liveData.departmental.overstays.slice(0, 2).map((o, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                              className="flex items-center justify-between p-2 rounded-xl bg-rose-50 border border-rose-100"
                            >
                              <div>
                                <p className="text-xs font-bold text-rose-700">{o.guest_name}</p>
                                <p className="text-[9px] text-rose-500">Rm {o.room_number} · Expired: {new Date(o.check_out_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                              </div>
                              <AlertTriangle size={12} className="text-rose-500" />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>

                    {/* Housekeeping card */}
                    <motion.div
                      layout
                      whileHover={{ y: -5, scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      onClick={() => setExpandedCard('housekeeping')}
                      className="group relative overflow-hidden bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 hover:border-[#D4A373]/50 cursor-pointer transition-colors"
                    >
                      <div className="amc-sheen" />
                      <div className="amc-orb w-36 h-36 bg-[#D4A373]/10 -bottom-10 -left-10" style={{ animation: 'amc-float-rev 9s ease-in-out infinite' }} />
                      <div className="relative flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
                        <motion.div
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          className="w-8 h-8 rounded-xl bg-[#D4A373] flex items-center justify-center shadow-sm amc-ring-amber"
                        >
                          <Sparkles size={15} className="text-white" />
                        </motion.div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex-1">Housekeeping Queue</h3>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 size={11} /> Expand
                        </span>
                      </div>

                      <div className="relative flex items-center justify-between mb-2">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">Priority Cleaning Rooms</p>
                        <motion.span
                          key={liveData.departmental.dirtyRooms.length}
                          initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                          className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700"
                        >
                          {liveData.departmental.dirtyRooms.length}
                        </motion.span>
                      </div>
                      {liveData.departmental.dirtyRooms.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative text-center py-8">
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
                            <CheckCircle size={24} className="text-emerald-500 mx-auto mb-1.5" />
                          </motion.div>
                          <p className="text-xs font-bold text-zinc-800">All Clean</p>
                          <p className="text-[9px] text-zinc-400">Rooms in order</p>
                        </motion.div>
                      ) : (
                        <div className="relative space-y-2">
                          {liveData.departmental.dirtyRooms.slice(0, 4).map((r, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                              className="flex items-center justify-between p-2 rounded-xl bg-white/70 border border-amber-100 shadow-sm"
                            >
                              <div>
                                <p className="text-xs font-bold text-zinc-800">Room {r.room_number}</p>
                                <p className="text-[9px] text-zinc-400">{r.room_type}</p>
                              </div>
                              <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">Dirty</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>

                    {/* Engineering card */}
                    <motion.div
                      layout
                      whileHover={{ y: -5, scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      onClick={() => setExpandedCard('engineering')}
                      className="group relative overflow-hidden bg-white rounded-[2rem] p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 hover:border-[#D4A373]/50 cursor-pointer transition-colors"
                    >
                      <div className="amc-sheen" />
                      <div className="amc-orb w-36 h-36 bg-[#D4A373]/10 -top-10 -left-10" style={{ animation: 'amc-float 8.5s ease-in-out infinite' }} />
                      <div className="relative flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
                        <motion.div
                          whileHover={{ rotate: -10, scale: 1.1 }}
                          className="w-8 h-8 rounded-xl bg-[#D4A373] flex items-center justify-center shadow-sm amc-ring-amber"
                        >
                          <Hammer size={15} className="text-white" />
                        </motion.div>
                        <h3 className="text-xs font-black uppercase tracking-wider text-zinc-900 flex-1">Active Workorders</h3>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Maximize2 size={11} /> Expand
                        </span>
                      </div>

                      <div className="relative flex items-center justify-between mb-2">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400">High Priority Repairs</p>
                        <motion.span
                          key={liveData.departmental.highPriorityTickets.length}
                          initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                          className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-700"
                        >
                          {liveData.departmental.highPriorityTickets.length}
                        </motion.span>
                      </div>
                      {liveData.departmental.highPriorityTickets.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative text-center py-8">
                          <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
                            <CheckCircle size={24} className="text-emerald-500 mx-auto mb-1.5" />
                          </motion.div>
                          <p className="text-xs font-bold text-zinc-800">All Operations Clear</p>
                          <p className="text-[9px] text-zinc-400">No breakdowns reported</p>
                        </motion.div>
                      ) : (
                        <div className="relative space-y-2">
                          {liveData.departmental.highPriorityTickets.slice(0, 3).map((t, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.05 } }}
                              className="p-2 rounded-xl bg-rose-50/60 border border-rose-100"
                            >
                              <div className="flex justify-between items-center mb-1">
                                <p className="text-xs font-bold text-zinc-800">Room {t.room_number}</p>
                                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">High</span>
                              </div>
                              <p className="text-[9px] text-zinc-500 truncate">{t.issue}</p>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  </div>

                  {/* ═══════════════════════════════════════════════
                      CLICK-TO-EXPAND POPUP — full department detail
                      ═══════════════════════════════════════════════ */}
                  <AnimatePresence>
                    {expandedCard && (
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-50 flex items-center justify-center amc-glass-backdrop p-4"
                        onClick={() => setExpandedCard(null)}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.92, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.92, y: 20 }}
                          transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                          onClick={(e) => e.stopPropagation()}
                          className="w-full max-w-2xl amc-glass-modal rounded-3xl p-7 overflow-y-auto amc-scrollbar max-h-[85vh]"
                        >
                          {/* ── FRONT DESK POPUP ── */}
                          {expandedCard === 'frontdesk' && (
                            <div className="space-y-5">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-md">
                                    <UserCheck size={20} className="text-white" />
                                  </div>
                                  <div>
                                    <h2 className="text-lg font-serif font-bold text-zinc-900">Front Desk Dispatch</h2>
                                    <p className="text-xs text-zinc-500">Full department snapshot</p>
                                  </div>
                                </div>
                                <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setExpandedCard(null)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                                  <X size={20} />
                                </motion.button>
                              </div>

                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-2">Pending Check-ins ({liveData.departmental.pendingCheckins.length})</p>
                                {liveData.departmental.pendingCheckins.length === 0 ? (
                                  <p className="text-xs text-zinc-400 italic">No pending arrivals today</p>
                                ) : (
                                  <div className="space-y-2">
                                    {liveData.departmental.pendingCheckins.map((p, i) => (
                                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03 } }} className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
                                        <div>
                                          <p className="text-xs font-bold text-zinc-800">{p.guest_name}</p>
                                          <p className="text-[10px] text-zinc-400">{p.room_type} · Rm {p.room_number}</p>
                                        </div>
                                        <Clock size={13} className="text-indigo-400" />
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mb-2 flex items-center gap-1">
                                  <ShieldAlert size={12} /> Overstay Alerts ({liveData.departmental.overstays.length})
                                </p>
                                {liveData.departmental.overstays.length === 0 ? (
                                  <p className="text-xs text-zinc-400 italic">No overstays detected</p>
                                ) : (
                                  <div className="space-y-2">
                                    {liveData.departmental.overstays.map((o, i) => (
                                      <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0, transition: { delay: i * 0.03 } }} className="flex items-center justify-between p-3 rounded-xl bg-rose-50 border border-rose-100">
                                        <div>
                                          <p className="text-xs font-bold text-rose-700">{o.guest_name}</p>
                                          <p className="text-[10px] text-rose-500">Rm {o.room_number} · Expired: {new Date(o.check_out_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                        </div>
                                        <AlertTriangle size={13} className="text-rose-500" />
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ── HOUSEKEEPING POPUP ── */}
                          {expandedCard === 'housekeeping' && (
                            <div className="space-y-5">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-md">
                                    <Sparkles size={20} className="text-white" />
                                  </div>
                                  <div>
                                    <h2 className="text-lg font-serif font-bold text-zinc-900">Housekeeping Queue</h2>
                                    <p className="text-xs text-zinc-500">Full department snapshot</p>
                                  </div>
                                </div>
                                <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setExpandedCard(null)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                                  <X size={20} />
                                </motion.button>
                              </div>

                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600 mb-2">Priority Cleaning Rooms ({liveData.departmental.dirtyRooms.length})</p>
                                {liveData.departmental.dirtyRooms.length === 0 ? (
                                  <div className="text-center py-10">
                                    <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-zinc-800">All Clean</p>
                                    <p className="text-[10px] text-zinc-400">Rooms in order</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {liveData.departmental.dirtyRooms.map((r, i) => (
                                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                                        <div>
                                          <p className="text-xs font-bold text-zinc-800">Room {r.room_number}</p>
                                          <p className="text-[10px] text-zinc-400">{r.room_type}</p>
                                        </div>
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-md">Dirty</span>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {/* ── ENGINEERING POPUP ── */}
                          {expandedCard === 'engineering' && (
                            <div className="space-y-5">
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center shadow-md">
                                    <Hammer size={20} className="text-white" />
                                  </div>
                                  <div>
                                    <h2 className="text-lg font-serif font-bold text-zinc-900">Active Workorders</h2>
                                    <p className="text-xs text-zinc-500">Full department snapshot</p>
                                  </div>
                                </div>
                                <motion.button whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setExpandedCard(null)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                                  <X size={20} />
                                </motion.button>
                              </div>

                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500 mb-2">High Priority Repairs ({liveData.departmental.highPriorityTickets.length})</p>
                                {liveData.departmental.highPriorityTickets.length === 0 ? (
                                  <div className="text-center py-10">
                                    <CheckCircle size={28} className="text-emerald-500 mx-auto mb-2" />
                                    <p className="text-sm font-bold text-zinc-800">All Operations Clear</p>
                                    <p className="text-[10px] text-zinc-400">No breakdowns reported</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2">
                                    {liveData.departmental.highPriorityTickets.map((t, i) => (
                                      <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.03 } }} className="p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                                        <div className="flex justify-between items-center mb-1">
                                          <p className="text-xs font-bold text-zinc-800">Room {t.room_number}</p>
                                          <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">High</span>
                                        </div>
                                        <p className="text-[10px] text-zinc-500">{t.issue}</p>
                                      </motion.div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* TAB: OPERATIONS LOG                          */}
              {activeTab === 'operations_log' && liveData && (
                <motion.div key="operations_log" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* Local styles for this section only — shimmering border, floating orbs, timeline connector */}
                  <style>{`
                    @keyframes ol-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                    @keyframes ol-float { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-10px) scale(1.06); } }
                    @keyframes ol-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(212,163,115,0.35); } 70% { box-shadow: 0 0 0 8px rgba(212,163,115,0); } 100% { box-shadow: 0 0 0 0 rgba(212,163,115,0); } }
                    .ol-glow-wrap { position: relative; border-radius: 2rem; padding: 2px; background-size: 220% 220%; animation: ol-shimmer 10s ease-in-out infinite; }
                    .ol-orb { position: absolute; border-radius: 9999px; filter: blur(46px); pointer-events: none; }
                    .ol-ring-pulse { animation: ol-pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .ol-dot-grid { background-image: radial-gradient(rgba(212,163,115,0.12) 1px, transparent 1px); background-size: 18px 18px; -webkit-mask-image: radial-gradient(circle at 95% 0%, rgba(0,0,0,0.8), transparent 65%); mask-image: radial-gradient(circle at 95% 0%, rgba(0,0,0,0.8), transparent 65%); }
                  `}</style>

                  {/* Activity Feed */}
                  <div>
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200"
                    >
                      <div className="absolute inset-0 pointer-events-none opacity-60" />
                      <div className="ol-orb -top-14 -right-14 w-48 h-48 bg-[#D4A373]/10" style={{ animation: 'ol-float 9s ease-in-out infinite' }} />

                      <div className="relative flex items-center justify-between mb-5 border-b border-zinc-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <motion.div
                            whileHover={{ rotate: -10, scale: 1.1 }}
                            className="w-8 h-8 rounded-xl bg-[#D4A373] flex items-center justify-center shadow-sm"
                          >
                            <Eye size={15} className="text-white" />
                          </motion.div>
                          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">Historical Operations Log</h3>
                        </div>
                      </div>

                      {liveData.activityFeed.length === 0 ? (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative text-center py-10 text-zinc-400">
                          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
                            <Eye size={26} className="mx-auto mb-2 text-zinc-300" />
                          </motion.div>
                          <p className="text-sm italic">No activities registered</p>
                        </motion.div>
                      ) : (
                        <div className="relative space-y-2">
                          {(() => {
                            const startIndex = (activityPage - 1) * activityItemsPerPage;
                            const paginatedActivity = liveData.activityFeed.slice(startIndex, startIndex + activityItemsPerPage);
                            const totalPages = Math.ceil(liveData.activityFeed.length / activityItemsPerPage);

                            return (
                              <>
                                <div className="relative">
                                  {paginatedActivity.map((item, i) => {
                                    const actionClass = getActionColor(item.action);
                                    return (
                                      <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0, transition: { delay: i * 0.04 } }}
                                        whileHover={{ x: 3, boxShadow: '0px 10px 24px -14px rgba(212,163,115,0.25)' }}
                                        className="relative flex items-center gap-4 p-2.5 rounded-xl bg-zinc-50/50 hover:bg-[#D4A373]/10 border border-zinc-200/40 transition-colors mb-2"
                                      >
                                        <span className="text-[10px] font-bold text-zinc-400 w-14 shrink-0 font-mono text-center">{formatActivityTime(item.created_at)}</span>
                                        <motion.div
                                          whileHover={{ scale: 1.15, rotate: -6 }}
                                          transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                          className={`relative z-10 w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border shadow-sm ${actionClass}`}
                                        >
                                          {getActionIcon(item.action)}
                                        </motion.div>
                                        <div className="flex-1 min-w-0">
                                          <p className="text-xs text-zinc-800 font-bold truncate">
                                            {item.guest_name}
                                            <span className="text-zinc-400 font-normal mx-1.5">·</span>
                                            <span className="text-zinc-500 font-normal">{formatActivityAction(item.action)}</span>
                                          </p>
                                          <p className="text-[9px] text-zinc-400">Room {item.room_number} ({item.room_type})</p>
                                        </div>
                                        <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 shadow-sm ${actionClass}`}>
                                          {item.action.replace('_', ' ')}
                                        </span>
                                      </motion.div>
                                    );
                                  })}
                                </div>
                                {totalPages > 1 && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500"
                                  >
                                    <span>Showing {startIndex + 1}-{Math.min(startIndex + activityItemsPerPage, liveData.activityFeed.length)} of {liveData.activityFeed.length} logs</span>
                                    <div className="flex items-center gap-1.5">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                                        disabled={activityPage === 1}
                                        className="px-2.5 py-1.5 rounded-lg border border-[#D4A373]/30 bg-white hover:bg-[#D4A373]/10 text-[10px] font-bold text-[#D4A373] disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-sm"
                                      >
                                        Prev
                                      </motion.button>
                                      <motion.span
                                        key={activityPage}
                                        initial={{ scale: 1.15 }} animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                                        className="font-bold bg-gradient-to-r from-[#D4A373]/10 to-[#B3835B]/10 text-[#C08A5D] px-2.5 py-1 rounded-lg shadow-sm border border-[#D4A373]/20"
                                      >{activityPage} / {totalPages}</motion.span>
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActivityPage(p => Math.min(totalPages, p + 1))}
                                        disabled={activityPage === totalPages}
                                        className="px-2.5 py-1.5 rounded-lg border border-[#D4A373]/30 bg-white hover:bg-[#D4A373]/10 text-[10px] font-bold text-[#D4A373] disabled:opacity-40 disabled:hover:bg-white transition-colors shadow-sm"
                                      >
                                        Next
                                      </motion.button>
                                    </div>
                                  </motion.div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* TAB: PREDICTIVE ANALYTICS                    */}
              {activeTab === 'analytics' && analyticsData && (
                <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* Local styles for this section only — shimmering border, floating orbs, sheen sweep */}
                  <style>{`
                    @keyframes an-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                    @keyframes an-float { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-10px) scale(1.06); } }
                    @keyframes an-float-rev { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12px,10px) scale(1.05); } }
                    @keyframes an-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(79,70,229,0.4); } 70% { box-shadow: 0 0 0 9px rgba(79,70,229,0); } 100% { box-shadow: 0 0 0 0 rgba(79,70,229,0); } }
                    @keyframes an-pulse-ring-rose { 0% { box-shadow: 0 0 0 0 rgba(244,63,94,0.4); } 70% { box-shadow: 0 0 0 9px rgba(244,63,94,0); } 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); } }
                    @keyframes an-dash { to { stroke-dashoffset: 0; } }
                    .an-glow-wrap { position: relative; border-radius: 2rem; padding: 2px; background-size: 220% 220%; animation: an-shimmer 10s ease-in-out infinite; }
                    .an-orb { position: absolute; border-radius: 9999px; filter: blur(46px); pointer-events: none; }
                    .an-ring-indigo { animation: an-pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .an-ring-rose { animation: an-pulse-ring-rose 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .an-sheen { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 45%, transparent 60%); transform: translateX(-130%); transition: transform 0.9s cubic-bezier(0.22,1,0.36,1); pointer-events: none; z-index: 3; border-radius: inherit; }
                    .group:hover .an-sheen { transform: translateX(130%); }
                    .an-dot-grid { background-image: radial-gradient(rgba(99,102,241,0.14) 1px, transparent 1px); background-size: 18px 18px; -webkit-mask-image: radial-gradient(circle at 90% 0%, rgba(0,0,0,0.8), transparent 68%); mask-image: radial-gradient(circle at 90% 0%, rgba(0,0,0,0.8), transparent 68%); }
                  `}</style>

                  {/* Predictive Analytics Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Pace Report Line Graph */}
                    <div>
                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ y: -4, scale: 1.005 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200"
                      >
                        <div className="absolute inset-0 pointer-events-none opacity-70" />
                        <div className="an-orb -top-14 -right-14 w-44 h-44 bg-[#D4A373]/10" style={{ animation: 'an-float 8s ease-in-out infinite' }} />
                        <div className="an-sheen" />

                        <div className="relative flex items-center gap-2 mb-4">
                          <motion.div
                            whileHover={{ rotate: -10, scale: 1.1 }}
                            className="w-8 h-8 rounded-xl bg-[#D4A373] flex items-center justify-center shadow-sm"
                          >
                            <TrendingUp size={15} className="text-white" />
                          </motion.div>
                          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">Booking Velocity Pace Report</h3>
                        </div>
                        <p className="relative text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-4">Month-on-Month pace curve (This Year vs Last Year)</p>

                        <div className="relative h-48 border-l border-b border-zinc-100 flex items-end px-2 pt-2">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="an-area-fill" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
                                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
                              </linearGradient>
                              <linearGradient id="an-line-stroke" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#6366f1" />
                                <stop offset="100%" stopColor="#0ea5e9" />
                              </linearGradient>
                            </defs>

                            {/* Filled area beneath the current-year pace line */}
                            <motion.path
                              d="M 0 100 L 15 88 L 30 74 L 45 62 L 60 51 L 80 37 L 100 26 L 100 100 Z"
                              fill="url(#an-area-fill)"
                              stroke="none"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                            />

                            {/* Last year pace */}
                            <motion.path
                              d="M 0 100 L 15 92 L 30 86 L 45 78 L 60 69 L 80 59 L 100 48"
                              fill="none"
                              stroke="#cbd5e1"
                              strokeWidth="2"
                              strokeDasharray="4"
                              strokeLinecap="round"
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 1.2, ease: 'easeInOut' }}
                            />

                            {/* Target points connecting current pace */}
                            <motion.path
                              d="M 0 100 L 15 88 L 30 74 L 45 62 L 60 51 L 80 37 L 100 26"
                              fill="none"
                              stroke="url(#an-line-stroke)"
                              strokeWidth="2.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              initial={{ pathLength: 0 }}
                              animate={{ pathLength: 1 }}
                              transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                            />

                            {/* Animated vertex markers on the current-year line */}
                            {[[0, 100], [15, 88], [30, 74], [45, 62], [60, 51], [80, 37], [100, 26]].map(([cx, cy], i) => (
                              <motion.circle
                                key={i}
                                cx={cx} cy={cy} r="1.8"
                                fill="#ffffff"
                                stroke="#4f46e5"
                                strokeWidth="1.4"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.3 + i * 0.1, type: 'spring', stiffness: 400, damping: 14 }}
                              />
                            ))}
                          </svg>

                          <motion.div
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.6 }}
                            className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-xl border border-indigo-100 shadow-sm text-[9px] font-bold flex flex-col gap-1"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="w-2.5 h-0.5 rounded-full bg-gradient-to-r from-indigo-600 to-sky-500 inline-block"></span>
                              <span className="text-indigo-700">This Month</span>
                              <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100">+15%</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-zinc-500"><span className="w-2.5 h-0.5 border-b border-dashed border-zinc-400 inline-block"></span> Last Year</div>
                          </motion.div>
                        </div>
                        <div className="relative flex justify-between text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-2 px-1">
                          <span>Day 1</span>
                          <span>Day 10</span>
                          <span>Day 20</span>
                          <span>Day 30</span>
                        </div>
                      </motion.div>
                    </div>

                    {/* Cancellation Heatmaps */}
                    <div>
                      <motion.div
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0, transition: { delay: 0.08 } }}
                        whileHover={{ y: -4, scale: 1.005 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200"
                      >
                        <div className="absolute inset-0 pointer-events-none opacity-60" />
                        <div className="an-orb -bottom-14 -left-14 w-44 h-44 bg-[#D4A373]/10" style={{ animation: 'an-float-rev 9s ease-in-out infinite' }} />
                        <div className="an-sheen" />

                        <div className="relative flex items-center gap-2 mb-4">
                          <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            className="w-8 h-8 rounded-xl bg-[#D4A373] flex items-center justify-center shadow-sm"
                          >
                            <AlertTriangle size={15} className="text-white" />
                          </motion.div>
                          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">OTA Channel Cancellation Heatmap</h3>
                        </div>
                        <p className="relative text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-4">Cancellation ratios per source channel and category</p>

                        <div className="relative space-y-4">
                          {analyticsData.cancellationHeatmap.map((ch, idx) => {
                            const rowTheme = ch.rate > 25
                              ? { grad: 'from-rose-500 to-rose-400', chip: 'bg-rose-50 text-rose-700 border-rose-100', glow: 'rgba(244,63,94,0.35)' }
                              : ch.rate > 15
                                ? { grad: 'from-amber-500 to-amber-400', chip: 'bg-amber-50 text-amber-700 border-amber-100', glow: 'rgba(245,158,11,0.35)' }
                                : { grad: 'from-emerald-500 to-emerald-400', chip: 'bg-emerald-50 text-emerald-700 border-emerald-100', glow: 'rgba(16,185,129,0.35)' };

                            return (
                              <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0, transition: { delay: idx * 0.07 } }}
                                whileHover={{ x: 2 }}
                                className="space-y-1.5"
                              >
                                <div className="flex justify-between items-center text-xs font-bold text-zinc-800">
                                  <span>{ch.category}</span>
                                  <motion.span
                                    key={ch.rate}
                                    initial={{ scale: 1.3 }} animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                                    className={`px-2 py-0.5 rounded-md text-[10px] border ${rowTheme.chip}`}
                                  >
                                    {ch.rate}%
                                  </motion.span>
                                </div>
                                <div className="w-full h-2.5 bg-zinc-100 rounded-full overflow-hidden shadow-inner">
                                  <motion.div
                                    className={`h-full rounded-full bg-gradient-to-r ${rowTheme.grad}`}
                                    style={{ boxShadow: `0 0 10px -2px ${rowTheme.glow}` }}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${ch.rate}%` }}
                                    transition={{ duration: 0.8, delay: 0.15 + idx * 0.07, ease: [0.22, 1, 0.36, 1] }}
                                  />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* TAB: BROADCASTING CENTER                     */}
              {activeTab === 'broadcasting' && (
                <motion.div key="broadcasting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* Local styles for this section only — shimmering border, floating orbs, sheen sweep */}
                  <style>{`
                    @keyframes bc-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                    @keyframes bc-float { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-10px) scale(1.06); } }
                    @keyframes bc-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(244,63,94,0.45); } 70% { box-shadow: 0 0 0 10px rgba(244,63,94,0); } 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); } }
                    @keyframes bc-broadcast-wave { 0% { transform: scale(0.9); opacity: 0.8; } 100% { transform: scale(1.9); opacity: 0; } }
                    .bc-glow-wrap { position: relative; border-radius: 2rem; padding: 2px; background-size: 220% 220%; animation: bc-shimmer 9s ease-in-out infinite; }
                    .bc-orb { position: absolute; border-radius: 9999px; filter: blur(46px); pointer-events: none; }
                    .bc-ring-pulse { animation: bc-pulse-ring 2.2s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .bc-sheen { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 45%, transparent 60%); transform: translateX(-130%); transition: transform 0.9s cubic-bezier(0.22,1,0.36,1); pointer-events: none; z-index: 3; border-radius: inherit; }
                    .group:hover .bc-sheen { transform: translateX(130%); }
                    .bc-dot-grid { background-image: radial-gradient(rgba(244,63,94,0.14) 1px, transparent 1px); background-size: 18px 18px; -webkit-mask-image: radial-gradient(circle at 15% 0%, rgba(0,0,0,0.8), transparent 68%); mask-image: radial-gradient(circle at 15% 0%, rgba(0,0,0,0.8), transparent 68%); }
                    .bc-wave { position: absolute; inset: 0; border-radius: 9999px; border: 1.5px solid rgba(244,63,94,0.5); animation: bc-broadcast-wave 2s ease-out infinite; }
                  `}</style>

                  {/* Broadcasting Center */}
                  <div>
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200"
                    >
                      <div className="absolute inset-0 pointer-events-none opacity-70" />
                      <div className="bc-orb -top-14 -right-14 w-48 h-48 bg-[#D4A373]/10" style={{ animation: 'bc-float 8s ease-in-out infinite' }} />
                      <div className="bc-sheen" />

                      <div className="relative flex items-center gap-3 mb-4 border-b border-zinc-100 pb-3">
                        <div className="relative w-9 h-9">
                          <span className="bc-wave" />
                          <motion.div
                            whileHover={{ rotate: -10, scale: 1.1 }}
                            animate={{ scale: [1, 1.08, 1] }}
                            transition={{ scale: { duration: 1.8, repeat: Infinity }, rotate: { type: 'spring', stiffness: 400, damping: 14 } }}
                            className="relative w-9 h-9 rounded-xl bg-[#D4A373] flex items-center justify-center shadow-sm"
                          >
                            <Zap size={16} className="text-white" />
                          </motion.div>
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">Departmental Broadcasting Alert</h3>
                      </div>

                      <form onSubmit={handleTriggerBroadcast} className="relative space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="sm:w-1/3">
                            <label className="block text-[10px] font-bold uppercase text-rose-500 tracking-wider mb-2">Target Department</label>
                            <select
                              value={broadcastForm.targetDept}
                              onChange={e => setBroadcastForm({ ...broadcastForm, targetDept: e.target.value })}
                              className="w-full bg-rose-50/50 border border-rose-200/60 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 rounded-xl py-2.5 px-3 text-xs font-bold text-zinc-700 outline-none transition-shadow shadow-sm appearance-none cursor-pointer"
                            >
                              <option value="ALL">All Departments</option>
                              <option value="FRONT_DESK">Front Desk / Reception</option>
                              <option value="HOUSEKEEPING">Housekeeping Staff</option>
                              <option value="FINANCE">Finance Dept</option>
                              <option value="RESTAURANT">Dining / Restaurant</option>
                              <option value="SALES">Sales Dept</option>
                              <option value="TRAVEL">Travel Desk</option>
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="block text-[10px] font-bold uppercase text-amber-600 tracking-wider mb-2">Broadcast Message</label>
                            <input
                              type="text"
                              required
                              placeholder="Type flash alert message (e.g. VIP guest arriving)..."
                              value={broadcastForm.message}
                              onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                              className="w-full bg-amber-50/50 border border-amber-200/60 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 rounded-xl py-2.5 px-3 text-xs font-bold text-zinc-700 outline-none transition-shadow shadow-sm placeholder:text-zinc-400 placeholder:font-medium"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <AnimatePresence mode="wait">
                            {broadcastSuccess ? (
                              <motion.span
                                key="success"
                                initial={{ opacity: 0, scale: 0.9, x: -6 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 18 }}
                                className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5"
                              >
                                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12, delay: 0.1 }}>
                                  <CheckCircle size={12} />
                                </motion.span>
                                Broadcast alert dispatched successfully!
                              </motion.span>
                            ) : <span key="empty" />}
                          </AnimatePresence>
                          <motion.button
                            whileHover={{ scale: 1.04, y: -1 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="relative bg-gradient-to-r from-rose-600 to-amber-500 hover:shadow-lg hover:shadow-rose-500/30 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-shadow shadow-md flex items-center gap-2 overflow-hidden"
                          >
                            <motion.span
                              animate={{ rotate: [0, -15, 15, 0] }}
                              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                              className="inline-flex"
                            >
                              <Zap size={13} />
                            </motion.span>
                            Transmit Dispatch
                          </motion.button>
                        </div>
                      </form>
                    </motion.div>
                  </div>

                  {/* Broadcast History */}
                  <div className="mt-6">
                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ y: -3 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.1 }}
                      className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200"
                    >
                      <div className="absolute inset-0 pointer-events-none opacity-70" />
                      <div className="bc-orb -bottom-14 -left-14 w-48 h-48 bg-[#D4A373]/10" style={{ animation: 'bc-float 8s ease-in-out infinite reverse' }} />
                      <div className="bc-sheen" />

                      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-zinc-100 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="relative w-9 h-9">
                            <span className="bc-wave" />
                            <motion.div
                              whileHover={{ rotate: -10, scale: 1.1 }}
                              animate={{ scale: [1, 1.08, 1] }}
                              transition={{ scale: { duration: 1.8, repeat: Infinity }, rotate: { type: 'spring', stiffness: 400, damping: 14 } }}
                              className="relative w-9 h-9 rounded-xl bg-[#D4A373] flex items-center justify-center shadow-sm"
                            >
                              <Clock size={16} className="text-white" />
                            </motion.div>
                          </div>
                          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">Broadcast History Log</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Date:</label>
                          <input
                            type="date"
                            value={broadcastDateFilter}
                            onChange={(e) => setBroadcastDateFilter(e.target.value)}
                            className="text-[10px] p-1.5 px-2 border border-zinc-200/80 rounded-lg text-zinc-600 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 bg-white/50 backdrop-blur-sm shadow-sm transition-all"
                          />
                        </div>
                      </div>

                      <div className="relative space-y-3 overflow-y-auto max-h-96 pr-2 fd-scrollbar">
                        {broadcasts
                          .filter(b => {
                            if (!broadcastDateFilter) return true;
                            const d = b.created_at ? new Date(b.created_at) : null;
                            if (!d) return true;
                            const localDateStr = d.toLocaleDateString('en-CA');
                            return localDateStr === broadcastDateFilter;
                          })
                          .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                          .map((broadcast) => (
                            <motion.div
                              key={broadcast.id}
                              whileHover={{ x: 2, backgroundColor: 'rgba(255, 251, 235, 0.6)' }}
                              className="p-4 rounded-2xl bg-zinc-50/60 backdrop-blur-sm border border-zinc-100 transition-colors flex flex-col sm:flex-row sm:items-center gap-4"
                            >
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shadow-sm ${broadcast.target_dept === 'ALL' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-rose-50 text-rose-600 border-rose-100'
                                    }`}>
                                    {broadcast.target_dept === 'ALL' ? 'Global' : broadcast.target_dept}
                                  </span>
                                  <span className="text-[10px] text-zinc-400 font-mono bg-white/60 px-1.5 rounded">
                                    {broadcast.created_at ? new Date(broadcast.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'Unknown Date'}
                                  </span>
                                </div>
                                <p className="text-sm font-bold text-zinc-800">{broadcast.message}</p>
                                <p className="text-[10px] text-zinc-500 mt-1">Sent by: <span className="font-semibold text-zinc-700">{broadcast.sender_name}</span></p>
                              </div>
                            </motion.div>
                          ))}

                        {broadcasts.filter(b => !broadcastDateFilter || (b.created_at && new Date(b.created_at).toLocaleDateString('en-CA') === broadcastDateFilter)).length === 0 && (
                          <div className="text-center py-8">
                            <Clock size={24} className="mx-auto text-zinc-300 mb-2 opacity-50" />
                            <p className="text-xs text-zinc-400 font-medium">No broadcast history found for the selected date.</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}


              {/* TAB: SECURITY AUDIT                          */}
              {activeTab === 'security_audit' && (
                <motion.div key="security_audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* Local styles for this section only — shimmering border, floating orbs, sheen sweep */}
                  <style>{`
                    @keyframes sa-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                    @keyframes sa-float { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-10px) scale(1.06); } }
                    @keyframes sa-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 70% { box-shadow: 0 0 0 9px rgba(99,102,241,0); } 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); } }
                    @keyframes sa-pulse-ring-rose { 0% { box-shadow: 0 0 0 0 rgba(244,63,94,0.45); } 70% { box-shadow: 0 0 0 9px rgba(244,63,94,0); } 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); } }
                    .sa-glow-wrap { position: relative; border-radius: 2rem; padding: 2px; background-size: 220% 220%; animation: sa-shimmer 10s ease-in-out infinite; }
                    .sa-orb { position: absolute; border-radius: 9999px; filter: blur(46px); pointer-events: none; }
                    .sa-ring-indigo { animation: sa-pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .sa-ring-rose { animation: sa-pulse-ring-rose 2s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .sa-dot-grid { background-image: radial-gradient(rgba(99,102,241,0.13) 1px, transparent 1px); background-size: 18px 18px; -webkit-mask-image: radial-gradient(circle at 90% 0%, rgba(0,0,0,0.8), transparent 65%); mask-image: radial-gradient(circle at 90% 0%, rgba(0,0,0,0.8), transparent 65%); }
                    .sa-row-critical { border-left: 3px solid #f43f5e; }
                    .sa-row-warning { border-left: 3px solid #f59e0b; }
                    .sa-row-normal { border-left: 3px solid #10b981; }
                  `}</style>

                  <div>
                    <motion.div
                      whileHover={{ y: -2 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200"
                    >
                      <div className="absolute inset-0 pointer-events-none opacity-60" />
                      <div className="sa-orb -top-14 -right-14 w-48 h-48 bg-[#D4A373]/10" style={{ animation: 'sa-float 9s ease-in-out infinite' }} />

                      {/* Header */}
                      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-zinc-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <motion.div
                            whileHover={{ rotate: -10, scale: 1.1 }}
                            className="w-8 h-8 rounded-xl bg-[#D4A373] flex items-center justify-center shadow-sm"
                          >
                            <ShieldAlert size={15} className="text-white" />
                          </motion.div>
                          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">Immutable Security Audit Watchdog</h3>
                        </div>
                      </div>

                      {/* Summary stats removed per user request */}

                      {/* ─── Toolbar: live toggle + filters + search ─── */}
                      <div className="relative flex flex-wrap items-center gap-3 mb-4 bg-zinc-50/70 border border-zinc-200/60 rounded-2xl p-3">
                        {/* Live Toggle */}
                        <div className="flex items-center gap-2 bg-white border border-zinc-200/60 rounded-xl px-3 py-1.5 shadow-sm">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-600">Live Logs</span>
                          <label className="relative inline-flex items-center cursor-pointer select-none z-10">
                            <input
                              type="checkbox"
                              checked={auditLive}
                              onChange={e => setAuditLive(e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#D4A373] peer-checked:to-[#B3835B] shadow-inner peer-checked:shadow-[#D4A373]/40"></div>
                          </label>
                          {auditLive && <span className="relative flex h-2 w-2 ml-1"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>}
                        </div>

                        {/* Filters */}
                        <select
                          value={auditRoleFilter}
                          onChange={e => setAuditRoleFilter(e.target.value)}
                          className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50/60 border border-indigo-200/60 rounded-xl px-3 py-1.5 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 shadow-sm cursor-pointer"
                        >
                          <option value="ALL">All Roles</option>
                          <option value="Admin">Admin</option>
                          <option value="ADMIN">Admin</option>
                          <option value="FRONT_DESK">Front Desk</option>
                          <option value="HOUSEKEEPING">Housekeeping</option>
                        </select>
                        <select
                          value={auditTimeFilter}
                          onChange={e => setAuditTimeFilter(e.target.value)}
                          className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50/60 border border-blue-200/60 rounded-xl px-3 py-1.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 shadow-sm cursor-pointer"
                        >
                          <option value="ALL">All Time</option>
                          <option value="24H">Last 24 Hours</option>
                          <option value="7D">Last 7 Days</option>
                          <option value="30D">Last 30 Days</option>
                        </select>

                        <form onSubmit={handleSearchAudits} className="flex items-center gap-2 ml-auto">
                          <input
                            type="text"
                            placeholder="Search actions or staff..."
                            value={auditSearch}
                            onChange={e => setAuditSearch(e.target.value)}
                            className="py-1.5 px-3 rounded-xl text-xs bg-white border border-zinc-200/60 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 outline-none shadow-sm w-48 transition-shadow"
                          />
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:shadow-md hover:shadow-indigo-500/30 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-shadow"
                          >
                            Search
                          </motion.button>
                        </form>
                      </div>

                      {/* ─── Table & Pagination ─── */}
                      {(() => {
                        const filteredLogs = auditLogs.filter(log => {
                          if (auditRoleFilter !== 'ALL' && log.user_role?.toUpperCase() !== auditRoleFilter) return false;
                          if (auditTimeFilter !== 'ALL') {
                            const logTime = new Date(log.created_at).getTime();
                            const now = new Date().getTime();
                            const diffHours = (now - logTime) / (1000 * 60 * 60);
                            if (auditTimeFilter === '24H' && diffHours > 24) return false;
                            if (auditTimeFilter === '7D' && diffHours > 24 * 7) return false;
                            if (auditTimeFilter === '30D' && diffHours > 24 * 30) return false;
                          }
                          return true;
                        });

                        const ITEMS_PER_PAGE = 15;
                        const totalPages = Math.max(1, Math.ceil(filteredLogs.length / ITEMS_PER_PAGE));
                        const paginatedLogs = filteredLogs.slice((auditPage - 1) * ITEMS_PER_PAGE, auditPage * ITEMS_PER_PAGE);

                        return (
                          <div className="space-y-4">
                            <div className="relative overflow-x-auto fd-scrollbar rounded-2xl border border-zinc-100">
                              <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                  <tr className="border-b border-zinc-100 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-500 font-black">
                                    <th className="py-2.5 px-3">Timestamp</th>
                                    <th className="py-2.5 px-3">Staff Operator</th>
                                    <th className="py-2.5 px-3">Role</th>
                                    <th className="py-2.5 px-3">Action Code</th>
                                    <th className="py-2.5 px-3">Details</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                  {paginatedLogs.length === 0 ? (
                                    <tr>
                                      <td colSpan={5} className="py-10 text-center text-xs text-zinc-400 italic">
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
                                          <ShieldAlert size={22} className="mx-auto mb-2 text-zinc-300" />
                                        </motion.div>
                                        No audit records found matching criteria
                                      </td>
                                    </tr>
                                  ) : (
                                    paginatedLogs.map((log, index) => {
                                      const actionCode = (log.action || '').toUpperCase();
                                      const isCritical = ['OVERRIDE_BILL', 'FAILED_LOGIN_3X', 'OFFBOARD_STAFF', 'DELETE_ROOM', 'FORCE_CHECKOUT'].includes(actionCode);
                                      const isWarning = ['CANCEL_BOOKING', 'BLOCK_ROOM', 'UPDATE_ROLE'].includes(actionCode);

                                      let actionBadge = "bg-zinc-100 text-zinc-600 border-zinc-200";
                                      if (isCritical) actionBadge = "bg-rose-50 text-rose-700 border-rose-200 shadow-sm animate-pulse";
                                      else if (isWarning) actionBadge = "bg-amber-50 text-amber-700 border-amber-200";
                                      else actionBadge = "bg-emerald-50 text-emerald-700 border-emerald-200";

                                      const rowAccent = isCritical ? 'sa-row-critical' : isWarning ? 'sa-row-warning' : 'sa-row-normal';

                                      return (
                                        <motion.tr
                                          key={index}
                                          initial={{ opacity: 0, x: -6 }}
                                          animate={{ opacity: 1, x: 0, transition: { delay: Math.min(index, 12) * 0.025 } }}
                                          whileHover={{ backgroundColor: 'rgba(244,244,245,0.6)' }}
                                          className={`text-xs text-zinc-700 transition-colors ${rowAccent} ${isCritical ? 'bg-rose-50/20' : ''}`}
                                        >
                                          <td className="py-2.5 px-3 font-mono text-[10px] text-zinc-400">
                                            {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                          </td>
                                          <td className="py-2.5 px-3 font-bold text-zinc-950">{log.user_name}</td>
                                          <td className="py-2.5 px-3">
                                            <span className="bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-zinc-600">
                                              {log.user_role}
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3">
                                            <span className={`px-2 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${actionBadge}`}>
                                              {isCritical && <ShieldAlert size={9} />}
                                              {log.action}
                                            </span>
                                          </td>
                                          <td className="py-2.5 px-3 text-zinc-600 font-medium">
                                            <span className="flex items-center">
                                              {isCritical && (
                                                <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="inline-flex">
                                                  <AlertTriangle size={12} className="inline mr-1.5 text-rose-500" />
                                                </motion.span>
                                              )}
                                              {log.details}
                                            </span>
                                          </td>
                                        </motion.tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {/* Pagination Controls */}
                            {filteredLogs.length > ITEMS_PER_PAGE && (
                              <div className="flex items-center justify-between px-2">
                                <span className="text-xs font-bold tracking-wider text-zinc-400">
                                  Showing {((auditPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(auditPage * ITEMS_PER_PAGE, filteredLogs.length)} of {filteredLogs.length} events
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setAuditPage(p => Math.max(1, p - 1))}
                                    disabled={auditPage === 1}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-zinc-700 border border-zinc-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
                                  >
                                    Previous
                                  </button>
                                  <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-sm">
                                    Page {auditPage} of {totalPages}
                                  </div>
                                  <button
                                    onClick={() => setAuditPage(p => Math.min(totalPages, p + 1))}
                                    disabled={auditPage === totalPages}
                                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-shadow"
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: PROPERTY CONTROLS                     */}
              {activeTab === 'properties' && (
                <motion.div key="properties" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* Local styles for this section only — shimmering border, floating orbs, dot-grid texture */}
                  <style>{`
                    @keyframes rhi-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                    @keyframes rhi-float { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-10px) scale(1.05); } }
                    @keyframes rhi-float-rev { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12px,12px) scale(1.06); } }
                    @keyframes rhi-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.35); } 70% { box-shadow: 0 0 0 9px rgba(99,102,241,0); } 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); } }
                    .rhi-glow-wrap { position: relative; border-radius: 2rem; padding: 2px; background-size: 220% 220%; animation: rhi-shimmer 10s ease-in-out infinite; }
                    .rhi-dot-grid { background-image: radial-gradient(rgba(99,102,241,0.14) 1px, transparent 1px); background-size: 18px 18px; -webkit-mask-image: radial-gradient(circle at 80% 0%, rgba(0,0,0,0.8), transparent 68%); mask-image: radial-gradient(circle at 80% 0%, rgba(0,0,0,0.8), transparent 68%); }
                    .rhi-orb { position: absolute; border-radius: 9999px; filter: blur(46px); pointer-events: none; }
                    .rhi-ring-pulse { animation: rhi-pulse-ring 2.6s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .rhi-sheen { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 45%, transparent 60%); transform: translateX(-130%); transition: transform 0.85s cubic-bezier(0.22,1,0.36,1); pointer-events: none; z-index: 3; border-radius: inherit; }
                    .group:hover .rhi-sheen { transform: translateX(130%); }
                  `}</style>

                  {/* Banner — aurora gradient, animated blobs, floating hotel glyph */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 bg-[#D4A373]"
                  >
                    <motion.div className="rhi-orb w-56 h-56 bg-white/20" style={{ top: '-4rem', right: '-3rem' }} animate={{ x: [0, 20, 0], y: [0, -14, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.div className="rhi-orb w-48 h-48 bg-white/10" style={{ bottom: '-3.5rem', left: '10%' }} animate={{ x: [0, -18, 0], y: [0, 12, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 text-white">
                      <div className="flex items-center gap-4">
                        <motion.div
                          animate={{ rotate: [0, -6, 6, 0], y: [0, -3, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                          className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/20 border border-white/20 items-center justify-center shadow-sm text-2xl"
                        >
                          🏨
                        </motion.div>
                        <div>
                          <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                            Property Hierarchy &amp; Inventory
                            <span className="text-amber-200">✦</span>
                          </h3>
                          <p className="text-xs text-indigo-100 mt-0.5">Configure individual units, override statuses, and block rooms from booking cycles.</p>
                        </div>
                      </div>
                      <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm text-white">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-300" />
                        </span>
                        Inventory Synced
                      </span>
                    </div>
                  </motion.div>

                  {/* Room Classes Accordion */}
                  <div className="space-y-5">
                    {roomTypes.map((type, typeIdx) => {
                      const classRooms = roomsList.filter(r => r.room_type_id === type.id);
                      const isExpanded = expandedClasses[type.id];
                      const accentSets = [
                        { grad: 'from-indigo-500 to-blue-500', ring: 'rgba(99,102,241,0.25)', chip: 'bg-indigo-50 text-indigo-600 border-indigo-100', blob: 'bg-indigo-300/20' },
                        { grad: 'from-teal-500 to-emerald-500', ring: 'rgba(20,184,166,0.25)', chip: 'bg-teal-50 text-teal-600 border-teal-100', blob: 'bg-teal-300/20' },
                        { grad: 'from-amber-500 to-orange-500', ring: 'rgba(245,158,11,0.25)', chip: 'bg-amber-50 text-amber-600 border-amber-100', blob: 'bg-amber-300/20' },
                        { grad: 'from-rose-500 to-fuchsia-500', ring: 'rgba(244,63,94,0.25)', chip: 'bg-rose-50 text-rose-600 border-rose-100', blob: 'bg-rose-300/20' },
                      ];
                      const accent = accentSets[typeIdx % accentSets.length];

                      return (
                        <motion.div
                          key={type.id}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0, transition: { delay: typeIdx * 0.06 } }}
                          className="mt-4"
                        >
                          <div className="relative bg-white rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                            <div className="absolute inset-0 pointer-events-none opacity-70" />
                            <div className={`rhi-orb -top-10 -right-10 w-40 h-40 bg-[#D4A373]/10`} style={{ animation: typeIdx % 2 === 0 ? 'rhi-float 8s ease-in-out infinite' : 'rhi-float-rev 9s ease-in-out infinite' }} />

                            {/* Accordion header */}
                            <div
                              className="relative bg-gradient-to-r from-zinc-50/70 to-white/40 p-5 flex items-center justify-between cursor-pointer hover:bg-zinc-50/90 transition-colors border-b border-zinc-100"
                              onClick={() => toggleAccordion(type.id)}
                            >
                              <div className="flex items-center gap-4">
                                <motion.button
                                  whileHover={{ scale: 1.15 }}
                                  whileTap={{ scale: 0.9 }}
                                  animate={{ rotate: isExpanded ? 180 : 0 }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                  className={`flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br ${accent.grad} text-white shadow-sm rhi-ring-pulse`}
                                >
                                  <ChevronDown size={16} />
                                </motion.button>
                                <div>
                                  <h3 className="text-base font-bold text-zinc-900">{type.name} Rooms Class</h3>
                                  <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mt-0.5">
                                    Inventory Size: <motion.span key={classRooms.length} initial={{ scale: 1.3 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }} className={`px-1.5 py-0.5 rounded-md border ${accent.chip} font-black`}>{classRooms.length}</motion.span> Units
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-3">
                                <motion.button
                                  whileHover={{ scale: 1.05, y: -1 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={(e) => { e.stopPropagation(); setNewRoomForm({ room_number: '', room_type_id: type.id }); setIsAddRoomModalOpen(true); }}
                                  className="relative flex items-center gap-1 bg-gradient-to-r from-teal-400 to-emerald-500 hover:shadow-lg hover:shadow-teal-500/30 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-shadow shadow-sm overflow-hidden"
                                >
                                  <motion.span animate={{ rotate: [0, 90, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex">
                                    <Plus size={14} />
                                  </motion.span>
                                  Add Room
                                </motion.button>
                              </div>
                            </div>

                            {/* Accordion content */}
                            <AnimatePresence>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                                  className="relative overflow-hidden"
                                >
                                  <div className="p-5">
                                    {classRooms.length === 0 ? (
                                      <motion.p
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="text-sm text-zinc-400 italic text-center py-6"
                                      >
                                        No units configured in this class.
                                      </motion.p>
                                    ) : (
                                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {classRooms.map((room, roomIdx) => {
                                          const statusStyles = {
                                            AVAILABLE: { text: 'text-emerald-700', accent: '16, 185, 129' },
                                            OCCUPIED: { text: 'text-rose-700', accent: '244, 63, 94' },
                                            DIRTY: { text: 'text-amber-700', accent: '245, 158, 11' },
                                            CLEANING: { text: 'text-violet-700', accent: '139, 92, 246' },
                                            INSPECTING: { text: 'text-blue-700', accent: '59, 130, 246' },
                                          };
                                          const rs = statusStyles[room.status?.toUpperCase()] || { text: 'text-zinc-700', accent: '148, 163, 184' };

                                          return (
                                            <motion.div
                                              key={room.id}
                                              initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                              animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: roomIdx * 0.03 } }}
                                              whileHover={!room.room_blocked ? { y: -4, scale: 1.015, boxShadow: `0px 18px 36px -14px rgba(${rs.accent}, 0.35)` } : {}}
                                              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                                              className={`group relative p-4 rounded-2xl border flex items-center justify-between transition-colors overflow-hidden ${room.room_blocked
                                                ? 'bg-zinc-50 border-zinc-200/80 opacity-75'
                                                : 'bg-white border-zinc-200/60 shadow-xs'
                                                }`}
                                            >
                                              {!room.room_blocked && <div className="rhi-sheen" />}
                                              <span
                                                className="absolute left-0 top-0 bottom-0 w-1"
                                                style={{ background: `rgba(${rs.accent}, ${room.room_blocked ? 0.25 : 0.8})` }}
                                              />
                                              <div className="relative flex flex-col items-start gap-2 pl-2">
                                                <p className="font-bold text-zinc-900 text-sm flex items-center gap-1.5">
                                                  <span className="text-xs">🛏️</span> Room {room.room_number}
                                                </p>

                                                {room.room_blocked ? (
                                                  <span className="px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider bg-zinc-200 text-zinc-600 flex items-center gap-1">
                                                    <Lock size={10} /> Blocked
                                                  </span>
                                                ) : (
                                                  <select
                                                    value={room.status?.toUpperCase()}
                                                    onChange={(e) => handleChangeStatus(room.id, e.target.value)}
                                                    className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border cursor-pointer outline-none transition-colors shadow-sm ${room.status?.toUpperCase() === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                      room.status?.toUpperCase() === 'OCCUPIED' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                                        room.status?.toUpperCase() === 'DIRTY' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                          room.status?.toUpperCase() === 'CLEANING' ? 'bg-violet-50 text-violet-700 border-violet-200' :
                                                            room.status?.toUpperCase() === 'INSPECTING' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                              'bg-zinc-100 text-zinc-700 border-zinc-200'
                                                      }`}
                                                  >
                                                    <option value="AVAILABLE">🟢 Available</option>
                                                    <option value="OCCUPIED">🔴 Occupied</option>
                                                    <option value="DIRTY">🟠 Dirty</option>
                                                    <option value="CLEANING">🟣 Cleaning</option>
                                                    <option value="INSPECTING">🔵 Inspecting</option>
                                                    <option value="MAINTENANCE">🟡 Maintenance</option>
                                                  </select>
                                                )}
                                              </div>

                                              <div className="relative flex flex-col gap-1.5 text-[10px]">
                                                <motion.button
                                                  whileHover={{ scale: 1.04 }}
                                                  whileTap={{ scale: 0.95 }}
                                                  onClick={() => handleToggleBlock(room.id)}
                                                  className={`font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-colors flex items-center justify-center gap-1 ${room.room_blocked
                                                    ? 'bg-zinc-200 text-zinc-700 border-transparent hover:bg-zinc-300'
                                                    : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                                                    }`}
                                                >
                                                  {room.room_blocked ? <Unlock size={11} /> : <Lock size={11} />}
                                                  {room.room_blocked ? 'Unblock' : 'Block'}
                                                </motion.button>

                                                <motion.button
                                                  whileHover={{ scale: 1.04 }}
                                                  whileTap={{ scale: 0.95 }}
                                                  onClick={() => handleDeleteRoom(room.id, room.room_number)}
                                                  className="font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1"
                                                >
                                                  <Trash2 size={11} /> Delete
                                                </motion.button>
                                              </div>
                                            </motion.div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              {/* TAB: YIELD & DISTRIBUTION                   */}
              {activeTab === 'properties_yield' && (
                <motion.div key="properties_yield" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* Local styles for this section only — shimmering border, floating orbs, dot-grid texture */}
                  <style>{`
                    @keyframes yld-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                    @keyframes yld-float { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-10px) scale(1.05); } }
                    @keyframes yld-float-rev { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12px,12px) scale(1.06); } }
                    @keyframes yld-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(45,212,191,0.45); } 70% { box-shadow: 0 0 0 10px rgba(45,212,191,0); } 100% { box-shadow: 0 0 0 0 rgba(45,212,191,0); } }
                    @keyframes yld-pulse-ring-amber { 0% { box-shadow: 0 0 0 0 rgba(245,158,11,0.45); } 70% { box-shadow: 0 0 0 10px rgba(245,158,11,0); } 100% { box-shadow: 0 0 0 0 rgba(245,158,11,0); } }
                    .yld-glow-wrap { position: relative; border-radius: 2rem; padding: 2px; background-size: 220% 220%; animation: yld-shimmer 9s ease-in-out infinite; }
                    .yld-dot-grid { background-image: radial-gradient(rgba(99,102,241,0.16) 1px, transparent 1px); background-size: 18px 18px; -webkit-mask-image: radial-gradient(circle at 30% 20%, rgba(0,0,0,0.9), transparent 70%); mask-image: radial-gradient(circle at 30% 20%, rgba(0,0,0,0.9), transparent 70%); }
                    .yld-orb { position: absolute; border-radius: 9999px; filter: blur(48px); pointer-events: none; }
                    .yld-ring-pulse { animation: yld-pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .yld-ring-pulse-amber { animation: yld-pulse-ring-amber 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .yld-card-hover { transition: box-shadow 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.3s ease, transform 0.3s ease; }
                    .yld-sheen { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.5) 45%, transparent 60%); transform: translateX(-130%); transition: transform 0.9s cubic-bezier(0.22,1,0.36,1); pointer-events: none; z-index: 3; border-radius: inherit; }
                    .group:hover .yld-sheen { transform: translateX(130%); }
                  `}</style>

                  {/* Banner — deeper gradient, animated aurora blobs, floating icon */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 bg-[#D4A373]"
                  >
                    <motion.div className="yld-orb w-56 h-56 bg-white/20" style={{ top: '-4rem', right: '-3rem' }} animate={{ x: [0, 20, 0], y: [0, -14, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.div className="yld-orb w-48 h-48 bg-white/10" style={{ bottom: '-3.5rem', left: '10%' }} animate={{ x: [0, -18, 0], y: [0, 12, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 text-white">
                      <div className="flex items-center gap-4">
                        <motion.div
                          animate={{ rotate: [0, -8, 8, 0], y: [0, -3, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                          className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/20 border border-white/20 items-center justify-center shadow-sm"
                        >
                          <TrendingUp size={22} className="text-white" />
                        </motion.div>
                        <div>
                          <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                            Yield &amp; Distribution Controls
                            <Sparkles size={14} className="text-amber-200" />
                          </h3>
                          <p className="text-xs text-white/85 mt-0.5">Automate dynamic pricing rules and adjust allocations across distribution sync channels.</p>
                        </div>
                      </div>
                      <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm text-white">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75" />
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-300" />
                        </span>
                        Engine Live
                      </span>
                    </div>
                  </motion.div>

                  {/* Dynamic Pricing & Yield Management Engine */}
                  {yieldRules && (
                    <div>
                      <motion.div
                        whileHover={{ y: -4, scale: 1.005 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative overflow-hidden bg-white rounded-[calc(2rem-2px)] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 space-y-6"
                      >
                        <div className="absolute inset-0 pointer-events-none" />
                        <div className="yld-orb -top-14 -right-14 w-48 h-48 bg-[#D4A373]/10" />
                        <div className="yld-orb -bottom-14 -left-14 w-40 h-40 bg-[#D4A373]/5" />

                        <div className="relative flex items-center gap-3 border-b border-zinc-100/80 pb-4">
                          <motion.div
                            whileHover={{ rotate: -10, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                            className="bg-[#D4A373] p-2.5 rounded-xl shadow-sm"
                          >
                            <TrendingUp size={20} className="text-white" />
                          </motion.div>
                          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Dynamic Pricing &amp; Yield Engine</h3>
                        </div>

                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Occupancy surge */}
                          <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="group relative bg-gradient-to-br from-teal-50/70 via-white to-white p-5 rounded-2xl border-2 border-teal-100/70 hover:border-teal-300/70 hover:shadow-xl hover:shadow-teal-500/15 flex flex-col justify-between transition-all duration-300 overflow-hidden yld-card-hover"
                          >
                            <div className="yld-sheen" />
                            <div className="absolute top-0 right-0 w-28 h-28 bg-teal-400/10 rounded-full blur-2xl group-hover:bg-teal-400/20 transition-colors" style={{ animation: 'yld-float 7s ease-in-out infinite' }} />
                            <div className="relative">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-teal-100 text-teal-600 shadow-sm">
                                    <Activity size={13} />
                                  </span>
                                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Occupancy Surges</h4>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer select-none z-10">
                                  <input
                                    type="checkbox"
                                    checked={yieldRules.pricing_surges.enabled}
                                    onChange={e => handleSaveYieldRule('pricing_surges', { ...yieldRules.pricing_surges, enabled: e.target.checked })}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#D4A373] peer-checked:to-[#B3835B] shadow-inner peer-checked:shadow-[#D4A373]/40"></div>
                                </label>
                              </div>
                              <p className="text-[10px] text-slate-400 mb-5">Automatically increase room prices by X% when hotel occupancy exceeds the threshold.</p>
                            </div>
                            <div className="relative flex items-center gap-4">
                              <div className="flex-1">
                                <label className="text-[9px] font-bold text-teal-600/80 uppercase block mb-1.5 tracking-wider">Occupancy Trigger (%)</label>
                                <input
                                  type="number"
                                  value={yieldRules.pricing_surges.occupancy_threshold}
                                  onChange={e => handleSaveYieldRule('pricing_surges', { ...yieldRules.pricing_surges, occupancy_threshold: parseInt(e.target.value) || 0 })}
                                  className="w-full bg-white border border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 outline-none transition-shadow shadow-sm"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-[9px] font-bold text-blue-600/80 uppercase block mb-1.5 tracking-wider">Surge Rate Multiplier (%)</label>
                                <input
                                  type="number"
                                  value={yieldRules.pricing_surges.surge_percentage}
                                  onChange={e => handleSaveYieldRule('pricing_surges', { ...yieldRules.pricing_surges, surge_percentage: parseInt(e.target.value) || 0 })}
                                  className="w-full bg-white border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 outline-none transition-shadow shadow-sm"
                                />
                              </div>
                            </div>
                          </motion.div>

                          {/* Length of Stay Discounts */}
                          <motion.div
                            whileHover={{ y: -4, scale: 1.01 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            className="group relative bg-gradient-to-br from-blue-50/70 via-white to-white p-5 rounded-2xl border-2 border-blue-100/70 hover:border-blue-300/70 hover:shadow-xl hover:shadow-blue-500/15 flex flex-col justify-between transition-all duration-300 overflow-hidden yld-card-hover"
                          >
                            <div className="yld-sheen" />
                            <div className="absolute top-0 right-0 w-28 h-28 bg-blue-400/10 rounded-full blur-2xl group-hover:bg-blue-400/20 transition-colors" style={{ animation: 'yld-float-rev 8s ease-in-out infinite' }} />
                            <div className="relative">
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 text-blue-600 shadow-sm">
                                    <Clock size={13} />
                                  </span>
                                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">LOS Discounts</h4>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer select-none z-10">
                                  <input
                                    type="checkbox"
                                    checked={yieldRules.los_discount.enabled}
                                    onChange={e => handleSaveYieldRule('los_discount', { ...yieldRules.los_discount, enabled: e.target.checked })}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#D4A373] peer-checked:to-[#B3835B] shadow-inner peer-checked:shadow-[#D4A373]/40"></div>
                                </label>
                              </div>
                              <p className="text-[10px] text-slate-400 mb-5">Automatically apply discounts for bookings exceeding the threshold to encourage longer stays.</p>
                            </div>
                            <div className="relative flex items-center gap-4">
                              <div className="flex-1">
                                <label className="text-[9px] font-bold text-blue-600/80 uppercase block mb-1.5 tracking-wider">Min Nights</label>
                                <input
                                  type="number"
                                  value={yieldRules.los_discount.min_nights}
                                  onChange={e => handleSaveYieldRule('los_discount', { ...yieldRules.los_discount, min_nights: parseInt(e.target.value) || 0 })}
                                  className="w-full bg-white border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 outline-none transition-shadow shadow-sm"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-[9px] font-bold text-teal-600/80 uppercase block mb-1.5 tracking-wider">Discount Amount (%)</label>
                                <input
                                  type="number"
                                  value={yieldRules.los_discount.discount_percentage}
                                  onChange={e => handleSaveYieldRule('los_discount', { ...yieldRules.los_discount, discount_percentage: parseInt(e.target.value) || 0 })}
                                  className="w-full bg-white border border-teal-200 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 outline-none transition-shadow shadow-sm"
                                />
                              </div>
                            </div>
                          </motion.div>
                        </div>

                        {/* Seasonal Multipliers */}
                        <div className="relative bg-gradient-to-br from-indigo-50/60 via-slate-50/60 to-white p-5 rounded-2xl border-2 border-indigo-100/60 mt-4 shadow-inner overflow-hidden">
                          <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-300/15 rounded-full blur-2xl pointer-events-none" />
                          <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
                            <div className="flex items-center gap-2.5">
                              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 shadow-sm">
                                <Clock size={15} />
                              </span>
                              <div>
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Seasonal Rate Calendars</h4>
                                <p className="text-[10px] text-slate-400">Define rate multipliers for holidays, local festivals, and busy seasonal periods.</p>
                              </div>
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05, y: -1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const name = prompt('Enter holiday / season name:');
                                const multiplier = parseFloat(prompt('Enter multiplier (e.g. 1.5):') || '1.0');
                                const start = prompt('Enter start date (YYYY-MM-DD):');
                                const end = prompt('Enter end date (YYYY-MM-DD):');
                                if (name && multiplier && start && end) {
                                  const newMultipliers = [...yieldRules.seasonal_multiplier, { event_name: name, multiplier, start_date: start, end_date: end }];
                                  handleSaveYieldRule('seasonal_multiplier', newMultipliers);
                                }
                              }}
                              className="relative bg-gradient-to-r from-indigo-500 via-teal-500 to-blue-500 hover:shadow-lg hover:shadow-indigo-500/30 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-shadow shadow-md whitespace-nowrap flex items-center gap-1.5 overflow-hidden"
                            >
                              <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex">
                                <Sparkles size={12} />
                              </motion.span>
                              Add Period
                            </motion.button>
                          </div>

                          <div className="relative space-y-3">
                            {yieldRules.seasonal_multiplier.length === 0 ? (
                              <motion.div
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                className="flex flex-col items-center justify-center py-8 text-slate-300"
                              >
                                <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
                                  <AlertTriangle size={26} className="mb-2 opacity-50" />
                                </motion.div>
                                <p className="text-xs italic">No seasonal multipliers defined</p>
                              </motion.div>
                            ) : (
                              <AnimatePresence>
                                {yieldRules.seasonal_multiplier.map((sm, idx) => (
                                  <motion.div
                                    initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: idx * 0.05 } }}
                                    exit={{ opacity: 0, x: -12 }}
                                    whileHover={{ x: 2 }}
                                    key={idx}
                                    className="group flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-3.5 rounded-xl bg-white border border-indigo-100 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 hover:border-indigo-200 transition-all"
                                  >
                                    <div className="flex items-center gap-3">
                                      <span className="hidden sm:flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-teal-100 text-indigo-600 shrink-0">
                                        <Clock size={14} />
                                      </span>
                                      <div>
                                        <p className="font-black text-slate-800 text-sm">{sm.event_name}</p>
                                        <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5"><Clock size={10} /> {sm.start_date} <span className="text-slate-300">to</span> {sm.end_date}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                                      <span className="font-bold text-teal-700 bg-gradient-to-r from-teal-50 to-blue-50 px-2.5 py-1 rounded-lg border border-teal-100 text-[10px] uppercase tracking-wider shadow-sm">{sm.multiplier}x Multiplier</span>
                                      <motion.button
                                        whileHover={{ scale: 1.15, rotate: -6 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => {
                                          const updated = yieldRules.seasonal_multiplier.filter((_, i) => i !== idx);
                                          handleSaveYieldRule('seasonal_multiplier', updated);
                                        }}
                                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-1.5 rounded-lg transition-colors"
                                        title="Remove"
                                      >
                                        <Trash2 size={14} />
                                      </motion.button>
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {/* Channel Admin Configuration */}
                  {yieldRules && (
                    <div>
                      <motion.div
                        whileHover={{ y: -4, scale: 1.005 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative overflow-hidden bg-white rounded-[calc(2rem-2px)] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 space-y-6"
                      >
                        <div className="absolute inset-0 pointer-events-none opacity-60" />
                        <div className="yld-orb -top-20 -left-20 w-56 h-56 bg-[#D4A373]/10" />
                        <div className="yld-orb bottom-0 right-0 w-40 h-40 bg-[#D4A373]/5" />

                        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100/80 pb-4">
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ rotate: 10, scale: 1.1 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                              className="bg-[#D4A373] p-2.5 rounded-xl shadow-sm"
                            >
                              <Sliders size={20} className="text-white" />
                            </motion.div>
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Channel Admin &amp; OTA Sync</h3>
                          </div>
                          <div className="flex items-center gap-3 bg-white shadow-sm border-2 border-rose-100 px-4 py-2 rounded-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-50/70 to-orange-50/50 group-hover:from-rose-100/70 group-hover:to-orange-100/50 transition-colors pointer-events-none" />
                            <span className="relative text-[10px] font-black uppercase text-rose-600 tracking-wider flex items-center gap-1.5">
                              <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="inline-flex">
                                <AlertTriangle size={12} />
                              </motion.span>
                              Master OTA Kill Switch
                            </span>
                            <label className="relative inline-flex items-center cursor-pointer select-none z-10">
                              <input
                                type="checkbox"
                                checked={yieldRules.channel_Admin.master_ota_toggle}
                                onChange={e => handleSaveYieldRule('channel_Admin', { ...yieldRules.channel_Admin, master_ota_toggle: e.target.checked })}
                                className="sr-only peer"
                              />
                              <div className="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#D4A373] peer-checked:to-[#B3835B] shadow-inner peer-checked:shadow-[#D4A373]/40"></div>
                            </label>
                          </div>
                        </div>

                        <p className="relative text-xs text-slate-400 max-w-2xl">Limit specific room allocations to third-party travel platforms to manage distribution commission fees effectively.</p>

                        <div className="relative grid grid-cols-2 md:grid-cols-4 gap-5">
                          {['booking_com', 'expedia', 'agoda', 'direct'].map((channel, idx) => (
                            <motion.div
                              key={channel}
                              initial={{ opacity: 0, y: 14 }}
                              animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.06 } }}
                              whileHover={{ scale: 1.04, y: -3 }}
                              transition={{ type: 'spring', stiffness: 320, damping: 20 }}
                              className="group relative bg-gradient-to-b from-white to-zinc-50/50 p-5 rounded-2xl border-2 border-zinc-200/50 hover:border-amber-300/70 hover:shadow-xl hover:shadow-amber-500/15 transition-all duration-300 overflow-hidden"
                            >
                              <div className="yld-sheen" />
                              <div className="flex items-center gap-2 mb-3">
                                <span className={`w-2 h-2 rounded-full ${channel === 'direct' ? 'bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'}`} />
                                <p className="text-[11px] font-black uppercase tracking-wider text-slate-700">{channel.replace('_', '.')}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  value={yieldRules.channel_Admin.allotments[channel] || 0}
                                  onChange={e => {
                                    const allotments = { ...yieldRules.channel_Admin.allotments, [channel]: parseInt(e.target.value) || 0 };
                                    handleSaveYieldRule('channel_Admin', { ...yieldRules.channel_Admin, allotments });
                                  }}
                                  className="w-full bg-white border border-amber-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 py-2 px-3 rounded-xl text-sm font-bold text-slate-800 outline-none transition-shadow shadow-sm"
                                />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Units</span>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}
              {/* TAB: GUEST REGISTRY                          */}
              {activeTab === 'crm' && (
                <motion.div key="crm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* Local styles for this section only — shimmering border, floating orbs, sheen sweep */}
                  <style>{`
                    @keyframes crm-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                    @keyframes crm-float { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-10px) scale(1.06); } }
                    @keyframes crm-float-rev { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12px,10px) scale(1.05); } }
                    @keyframes crm-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.4); } 70% { box-shadow: 0 0 0 9px rgba(99,102,241,0); } 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); } }
                    .crm-glow-wrap { position: relative; border-radius: 2rem; padding: 2px; background-size: 220% 220%; animation: crm-shimmer 10s ease-in-out infinite; }
                    .crm-orb { position: absolute; border-radius: 9999px; filter: blur(46px); pointer-events: none; }
                    .crm-ring-indigo { animation: crm-pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .crm-sheen { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 45%, transparent 60%); transform: translateX(-130%); transition: transform 0.85s cubic-bezier(0.22,1,0.36,1); pointer-events: none; z-index: 3; border-radius: inherit; }
                    .group:hover .crm-sheen { transform: translateX(130%); }
                    .crm-dot-grid { background-image: radial-gradient(rgba(99,102,241,0.13) 1px, transparent 1px); background-size: 18px 18px; -webkit-mask-image: radial-gradient(circle at 10% 0%, rgba(0,0,0,0.8), transparent 65%); mask-image: radial-gradient(circle at 10% 0%, rgba(0,0,0,0.8), transparent 65%); }
                  `}</style>

                  {/* CRM & Guest Relations Registry */}
                  <div>
                    <motion.div
                      whileHover={{ y: -3 }}
                      transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 space-y-6"
                    >
                      <div className="absolute inset-0 pointer-events-none opacity-60" />
                      <div className="crm-orb -top-14 -left-14 w-48 h-48 bg-[#D4A373]/10" style={{ animation: 'crm-float 8s ease-in-out infinite' }} />
                      <div className="crm-orb -bottom-14 -right-14 w-40 h-40 bg-[#D4A373]/5" style={{ animation: 'crm-float-rev 9s ease-in-out infinite' }} />
                      <div className="crm-sheen" />

                      {/* Header */}
                      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-3">
                        <div className="flex items-center gap-2.5">
                          <motion.div
                            whileHover={{ rotate: -10, scale: 1.1 }}
                            className="w-8 h-8 rounded-xl bg-[#D4A373] flex items-center justify-center shadow-sm"
                          >
                            <UserCheck size={15} className="text-white" />
                          </motion.div>
                          <h3 className="text-sm font-black uppercase tracking-wider text-zinc-900">Guest Relations Registry</h3>
                        </div>
                        <div className="relative max-w-xs w-full">
                          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Search CRM guests..."
                            value={crmSearch}
                            onChange={e => setCrmSearch(e.target.value)}
                            className="w-full py-1.5 pl-8 pr-3 rounded-lg text-xs bg-[#D4A373]/5 border border-[#D4A373]/30 focus:border-[#D4A373] focus:ring-2 focus:ring-[#D4A373]/20 outline-none transition-shadow shadow-sm"
                          />
                        </div>
                      </div>

                      {/* ─── Summary stat strip (derived from the same crmGuests data below, read-only) ─── */}
                      {(() => {
                        const vipCount = crmGuests.filter(g => g.is_vip).length;
                        const blacklistedCount = crmGuests.filter(g => g.is_blacklisted).length;
                        const totalCount = crmGuests.length;

                        return (
                          <div className="relative grid grid-cols-3 gap-3">
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-gradient-to-br from-[#D4A373]/10 to-white border border-[#D4A373]/30 p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-[#C08A5D] flex items-center gap-1"><Users size={10} /> Total Guests</p>
                              <motion.p key={totalCount} initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }} className="text-lg font-black text-zinc-900">{totalCount}</motion.p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.05 } }} className="rounded-xl bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">⭐ VIP Guests</p>
                              <motion.p key={vipCount} initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }} className="text-lg font-black text-amber-600">{vipCount}</motion.p>
                            </motion.div>
                            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }} className="rounded-xl bg-gradient-to-br from-rose-50 to-white border border-rose-100 p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-rose-500">🚫 Blacklisted</p>
                              <motion.p key={blacklistedCount} initial={{ scale: 1.2 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 12 }} className="text-lg font-black text-rose-600">{blacklistedCount}</motion.p>
                            </motion.div>
                          </div>
                        );
                      })()}

                      {/* Email triggers */}
                      {yieldRules && (
                        <motion.div
                          whileHover={{ y: -2 }}
                          className="relative overflow-hidden bg-gradient-to-br from-[#D4A373]/10 to-white p-4 rounded-2xl border border-[#D4A373]/30 flex flex-wrap gap-6 items-center justify-between text-xs shadow-sm"
                        >
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-700">Pre-Arrival Upsells</span>
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={yieldRules.crm_triggers.pre_arrival_upsell}
                                  onChange={e => handleSaveYieldRule('crm_triggers', { ...yieldRules.crm_triggers, pre_arrival_upsell: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-8 h-4 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#D4A373] peer-checked:to-[#B3835B] shadow-inner peer-checked:shadow-[#D4A373]/40"></div>
                              </label>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-700">Post-Checkout Feedbacks</span>
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={yieldRules.crm_triggers.post_checkout_feedback}
                                  onChange={e => handleSaveYieldRule('crm_triggers', { ...yieldRules.crm_triggers, post_checkout_feedback: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-8 h-4 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#D4A373] peer-checked:to-[#B3835B] shadow-inner peer-checked:shadow-[#D4A373]/40"></div>
                              </label>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-[#C08A5D] uppercase tracking-widest flex items-center gap-1">
                            <motion.span animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex">
                              <Sparkles size={11} />
                            </motion.span>
                            Email Auto-Triggers
                          </span>
                        </motion.div>
                      )}

                      {/* CRM Guest Table & Pagination */}
                      {(() => {
                        const seen = new Set();
                        const uniqueGuests = crmGuests.filter(g => {
                          const key = g.email || g.phone || g.name;
                          if (!key || seen.has(key)) return false;
                          seen.add(key);
                          return true;
                        });

                        const filteredGuests = uniqueGuests.filter(g =>
                          !crmSearch || g?.name?.toLowerCase().includes(crmSearch.toLowerCase()) || g?.email?.toLowerCase().includes(crmSearch.toLowerCase())
                        );

                        const ITEMS_PER_PAGE = 10;
                        const totalPages = Math.max(1, Math.ceil(filteredGuests.length / ITEMS_PER_PAGE));
                        const paginatedGuests = filteredGuests.slice((crmPage - 1) * ITEMS_PER_PAGE, crmPage * ITEMS_PER_PAGE);

                        return (
                          <div className="space-y-4">
                            <div className="relative overflow-x-auto fd-scrollbar rounded-2xl border border-zinc-100">
                              <table className="w-full text-left border-collapse min-w-[600px]">
                                <thead>
                                  <tr className="border-b border-zinc-100 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-500 font-black">
                                    <th className="py-2.5 px-3">Guest Name</th>
                                    <th className="py-2.5 px-3">Email</th>
                                    <th className="py-2.5 px-3">Phone</th>
                                    <th className="py-2.5 px-3">Status Flags</th>
                                    <th className="py-2.5 px-3 text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-50">
                                  {paginatedGuests.length === 0 ? (
                                    <tr>
                                      <td colSpan={5} className="py-10 text-center text-xs text-zinc-400 italic">
                                        <motion.div animate={{ y: [0, -5, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}>
                                          <Users size={22} className="mx-auto mb-2 text-zinc-300" />
                                        </motion.div>
                                        No guests found matching criteria
                                      </td>
                                    </tr>
                                  ) : (
                                    paginatedGuests.map((guest, idx) => {
                                      const initials = (guest?.name || '').split(' ').map(w => w ? w[0] : '').join('').toUpperCase().slice(0, 2);
                                      const rowAccent = guest.is_blacklisted ? 'border-l-2 border-l-rose-400' : guest.is_vip ? 'border-l-2 border-l-amber-400' : 'border-l-2 border-l-transparent';

                                      return (
                                        <motion.tr
                                          key={idx}
                                          initial={{ opacity: 0, x: -6 }}
                                          animate={{ opacity: 1, x: 0, transition: { delay: Math.min(idx, 10) * 0.03 } }}
                                          whileHover={{ backgroundColor: 'rgba(244,244,245,0.6)' }}
                                          className={`text-xs text-zinc-700 transition-colors ${rowAccent}`}
                                        >
                                          <td className="py-3 px-3">
                                            <div className="flex items-center gap-2.5">
                                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-[9px] font-black shrink-0 shadow-sm ${guest.is_blacklisted ? 'bg-gradient-to-br from-rose-400 to-rose-500' : guest.is_vip ? 'bg-gradient-to-br from-amber-400 to-orange-500' : 'bg-gradient-to-br from-[#D4A373] to-[#B3835B]'
                                                }`}>
                                                {initials}
                                              </div>
                                              <span className="font-bold text-zinc-900">{guest.name}</span>
                                            </div>
                                          </td>
                                          <td className="py-3 px-3 text-zinc-500">{guest.email || 'N/A'}</td>
                                          <td className="py-3 px-3 text-zinc-500 font-mono">{guest.phone || 'N/A'}</td>
                                          <td className="py-3 px-3 space-x-1.5">
                                            {guest.is_vip && <span className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">⭐ VIP</span>}
                                            {guest.is_blacklisted && <span className="bg-gradient-to-r from-rose-100 to-red-100 text-rose-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shadow-sm">🚫 Blacklisted</span>}
                                            {!guest.is_vip && !guest.is_blacklisted && <span className="text-zinc-400 italic">None</span>}
                                          </td>
                                          <td className="py-3 px-3 text-right space-x-2">
                                            <motion.button
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={() => handleSaveGuestFlags(guest.id, { is_vip: !guest.is_vip, is_blacklisted: guest.is_blacklisted })}
                                              className={`font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded shadow-sm transition-colors ${guest.is_vip ? 'bg-zinc-100 text-zinc-600' : 'bg-amber-50 text-amber-600 border border-amber-100 hover:bg-amber-100'}`}
                                            >
                                              {guest.is_vip ? 'Remove VIP' : 'Flag VIP'}
                                            </motion.button>
                                            <motion.button
                                              whileHover={{ scale: 1.05 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={() => handleSaveGuestFlags(guest.id, { is_vip: guest.is_vip, is_blacklisted: !guest.is_blacklisted })}
                                              className={`font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded shadow-sm transition-colors ${guest.is_blacklisted ? 'bg-zinc-100 text-zinc-600' : 'bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100'}`}
                                            >
                                              {guest.is_blacklisted ? 'Unblacklist' : 'Blacklist'}
                                            </motion.button>
                                          </td>
                                        </motion.tr>
                                      );
                                    })
                                  )}
                                </tbody>
                              </table>
                            </div>

                            {/* Pagination Controls */}
                            {filteredGuests.length > ITEMS_PER_PAGE && (
                              <div className="flex items-center justify-between px-2">
                                <span className="text-xs font-bold tracking-wider text-zinc-400">
                                  Showing {((crmPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(crmPage * ITEMS_PER_PAGE, filteredGuests.length)} of {filteredGuests.length} unique guests
                                </span>
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => setCrmPage(p => Math.max(1, p - 1))}
                                    disabled={crmPage === 1}
                                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-zinc-700 border border-zinc-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 transition-colors"
                                  >
                                    Previous
                                  </button>
                                  <div className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#D4A373]/10 text-[#C08A5D] border border-[#D4A373]/30 shadow-sm">
                                    Page {crmPage} of {totalPages}
                                  </div>
                                  <button
                                    onClick={() => setCrmPage(p => Math.min(totalPages, p + 1))}
                                    disabled={crmPage === totalPages}
                                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-[#D4A373] text-white shadow-sm disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md transition-shadow"
                                  >
                                    Next
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: MAINTENANCE & REPAIRS                 */}
              {activeTab === 'maintenance' && (
                <motion.div key="maintenance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* Header Banner */}
                  <div className="bg-[#D4A373] text-white rounded-[2rem] p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-zinc-200">
                    <div>
                      <h3 className="text-base font-black tracking-tight">Support Ticket Dashboard</h3>
                      <p className="text-xs text-white/85 mt-0.5">Dispatch technicians, track active repair timelines, and monitor SLA breach limits.</p>
                    </div>
                    <button
                      onClick={() => setIsAddTicketModalOpen(true)}
                      className="bg-white hover:bg-zinc-50 text-[#D4A373] font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-sm w-full sm:w-auto flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <Plus size={14} /> Create Support Workorder
                    </button>
                  </div>

                  {/* Vibrant summary cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {['Pending', 'In Progress', 'Resolved'].map((colStatus, i) => {
                      const colTickets = maintenanceTickets.filter(t => t.status === colStatus);
                      const highPriorityCount = colTickets.filter(t => t.priority === 'High').length;
                      const medPriorityCount = colTickets.filter(t => t.priority === 'Medium').length;
                      const lowPriorityCount = colTickets.filter(t => t.priority === 'Low').length;
                      const isExpanded = expandedQueueCol === colStatus;

                      // Theme parameters
                      const theme = {
                        bg: 'from-[#D4A373]/10 to-[#D4A373]/5',
                        border: 'border-[#D4A373]/40',
                        accent: 'bg-[#D4A373]',
                        text: 'text-[#C08A5D]',
                        glow: 'rgba(212,163,115,0.2)'
                      };

                      return (
                        <motion.div
                          key={colStatus}
                          whileHover={{ y: -6, scale: 1.02 }}
                          transition={{ type: "spring", stiffness: 350, damping: 20 }}
                          onClick={() => setExpandedQueueCol(isExpanded ? null : colStatus)}
                          className={`relative overflow-hidden cursor-pointer rounded-[2rem] p-6 border ${theme.border} bg-gradient-to-br ${theme.bg} shadow-md transition-shadow duration-300 hover:shadow-lg`}
                          style={{ boxShadow: `0 10px 30px -15px ${theme.glow}` }}
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-2">
                              <span className={`w-2.5 h-2.5 rounded-full ${theme.accent} animate-ping`} />
                              <h4 className="font-black text-sm uppercase tracking-wider text-zinc-800">{colStatus}</h4>
                            </div>
                            <span className="bg-white border border-zinc-200/80 text-zinc-800 text-[10px] font-black px-2.5 py-1 rounded-full shadow-xs">
                              {colTickets.length} Tickets
                            </span>
                          </div>

                          {/* Mini Priority Distribution Grid */}
                          <div className="flex gap-2.5 mb-4 items-end">
                            <div className="flex-1 flex flex-col gap-1">
                              <span className="text-[8px] font-black uppercase text-zinc-400">High</span>
                              <div className="h-2 bg-zinc-200/60 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: colTickets.length ? `${(highPriorityCount / colTickets.length) * 100}%` : '0%' }}
                                  className="h-full bg-rose-500 rounded-full"
                                />
                              </div>
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                              <span className="text-[8px] font-black uppercase text-zinc-400">Med</span>
                              <div className="h-2 bg-zinc-200/60 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: colTickets.length ? `${(medPriorityCount / colTickets.length) * 100}%` : '0%' }}
                                  className="h-full bg-amber-500 rounded-full"
                                />
                              </div>
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                              <span className="text-[8px] font-black uppercase text-zinc-400">Low</span>
                              <div className="h-2 bg-zinc-200/60 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: colTickets.length ? `${(lowPriorityCount / colTickets.length) * 100}%` : '0%' }}
                                  className="h-full bg-blue-500 rounded-full"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Preview rooms list */}
                          <p className="text-[10px] font-bold text-zinc-500 truncate">
                            {colTickets.length > 0
                              ? `Rooms: ${colTickets.map(t => t.room_number).join(', ')}`
                              : 'Queue empty'}
                          </p>

                          <div className="mt-4 pt-3 border-t border-zinc-200/60 flex items-center justify-between">
                            <span className={`text-[10px] font-black uppercase tracking-wider ${theme.text}`}>
                              {isExpanded ? 'Click to Close Queue' : 'Click to View Queue'}
                            </span>
                            <ChevronDown size={14} className={`text-zinc-500 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Expanded Queue List Panel */}
                  <AnimatePresence mode="wait">
                    {expandedQueueCol && (() => {
                      const activeTickets = maintenanceTickets.filter(t => t.status === expandedQueueCol);

                      return (
                        <motion.div
                          key={expandedQueueCol}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 24 }}
                          className="overflow-hidden space-y-4 pt-4"
                        >
                          <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                              Active Workorders: <span className="text-indigo-600 font-extrabold">{expandedQueueCol}</span>
                            </h4>
                            <button
                              onClick={() => setExpandedQueueCol(null)}
                              className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-700"
                            >
                              Close Queue
                            </button>
                          </div>

                          {activeTickets.length === 0 ? (
                            <div className="text-center py-12 text-zinc-400 border border-dashed border-zinc-200 rounded-xl bg-white/40">
                              <p className="text-xs font-medium">No tickets in this queue</p>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                              {activeTickets.map(ticket => (
                                <div
                                  key={ticket.id}
                                  className="fd-dealdeck-card rounded-2xl p-4 border-l-4 border-l-indigo-500 relative overflow-hidden bg-white"
                                >
                                  {/* Side Indicator Bar for priority */}
                                  <div className={`absolute top-0 left-0 bottom-0 w-1 ${ticket.priority === 'High' ? 'bg-rose-500' : ticket.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                                    }`}></div>

                                  <div className="pl-1">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="text-sm font-bold text-zinc-900">Room {ticket.room_number}</p>
                                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{ticket.issue}</p>
                                      </div>
                                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${ticket.priority === 'High' ? 'text-rose-600 bg-rose-50 border-rose-100' :
                                        ticket.priority === 'Medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                                          'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>{ticket.priority}</span>
                                    </div>

                                    <div className="flex items-center justify-between mt-4">
                                      <SlaCountdownTimer createdAt={ticket.created_at} priority={ticket.priority} status={ticket.status} />

                                      {/* Assignment Dropdown */}
                                      {ticket.status !== 'Resolved' ? (
                                        <select
                                          value={ticket.assigned_to}
                                          onChange={e => handleAssignTicket(ticket.id, e.target.value)}
                                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border cursor-pointer outline-none transition-colors ${ticket.assigned_to === 'Unassigned' ? 'bg-rose-50 text-rose-600 border-rose-150' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
                                            }`}
                                        >
                                          <option value="Unassigned">Unassigned</option>
                                          <option value="Plumbing">Plumbing</option>
                                          <option value="HVAC">HVAC</option>
                                          <option value="Electrical">Electrical</option>
                                          <option value="IT Support">IT Support</option>
                                          <option value="General">General</option>
                                        </select>
                                      ) : (
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
                                          Done by {ticket.assigned_to}
                                        </span>
                                      )}
                                    </div>

                                    {/* Action Buttons */}
                                    {ticket.status !== 'Resolved' && (
                                      <div className="mt-3 pt-2.5 border-t border-zinc-100 flex items-center justify-between">
                                        {ticket.status === 'Pending' && (
                                          <button
                                            onClick={() => handleChangeTicketStatus(ticket.id, 'In Progress')}
                                            className="w-full text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 py-1.5 rounded-lg transition-all text-center"
                                          >
                                            Start Work
                                          </button>
                                        )}
                                        {ticket.status === 'In Progress' && (
                                          <button
                                            onClick={() => handleChangeTicketStatus(ticket.id, 'Resolved')}
                                            className="w-full text-[10px] font-bold uppercase tracking-wider text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 py-1.5 rounded-lg transition-all text-center"
                                          >
                                            Mark Resolved
                                          </button>
                                        )}
                                      </div>
                                    )}

                                    {/* Inventory Lock Tag */}
                                    {ticket.status !== 'Resolved' && ticket.room_blocked && (
                                      <div className="absolute top-2 right-2 text-rose-500" title="Inventory Blocked">
                                        <Lock size={12} />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      );
                    })()}
                  </AnimatePresence>

                  {/* Preventive Maintenance & Contractor Auto-Routing */}
                  {/* Preventive Maintenance & Contractor Auto-Routing */}
                  <style>{`
                    @keyframes mtn-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                    @keyframes mtn-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(244,63,94,0.4); } 70% { box-shadow: 0 0 0 9px rgba(244,63,94,0); } 100% { box-shadow: 0 0 0 0 rgba(244,63,94,0); } }
                    .mtn-orb { position: absolute; border-radius: 9999px; filter: blur(46px); pointer-events: none; }
                    .mtn-glow-wrap { position: relative; border-radius: 2rem; padding: 2px; background-size: 220% 220%; animation: mtn-shimmer 10s ease-in-out infinite; }
                    .mtn-ring-pulse { animation: mtn-pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .mtn-sheen { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 45%, transparent 60%); transform: translateX(-130%); transition: transform 0.85s cubic-bezier(0.22,1,0.36,1); pointer-events: none; z-index: 3; border-radius: inherit; }
                    .group:hover .mtn-sheen { transform: translateX(130%); }
                    .mtn-dot-grid { background-image: radial-gradient(rgba(99,102,241,0.14) 1px, transparent 1px); background-size: 18px 18px; -webkit-mask-image: radial-gradient(circle at 85% 10%, rgba(0,0,0,0.8), transparent 68%); mask-image: radial-gradient(circle at 85% 10%, rgba(0,0,0,0.8), transparent 68%); }
                  `}</style>

                  {yieldRules && (
                    <div>
                      <motion.div
                        whileHover={{ y: -4, scale: 1.005 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="relative overflow-hidden bg-white rounded-[calc(2rem-2px)] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 space-y-6"
                      >
                        <div className="absolute inset-0 pointer-events-none opacity-70" />
                        <div className="mtn-orb -top-16 -right-16 w-52 h-52 bg-[#D4A373]/10" />
                        <div className="mtn-orb -bottom-14 -left-14 w-40 h-40 bg-[#D4A373]/5" />

                        <div className="relative flex items-center gap-3 border-b border-zinc-100/80 pb-3">
                          <motion.div
                            whileHover={{ rotate: -10, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                            className="bg-[#D4A373] p-2.5 rounded-xl shadow-sm"
                          >
                            <Sparkles size={18} className="text-white" />
                          </motion.div>
                          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Preventive Maintenance Automation Rules</h3>
                        </div>

                        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Preventive schedules */}
                          <motion.div whileHover={{ y: -2 }} className="group relative bg-gradient-to-br from-indigo-50/60 via-white to-white p-5 rounded-2xl border-2 border-indigo-100/70 hover:border-indigo-300/70 hover:shadow-xl hover:shadow-indigo-500/10 space-y-4 transition-all duration-300 overflow-hidden">
                            <div className="mtn-sheen" />
                            <div className="relative">
                              <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Preventive HVAC/Generator Servicing Rules</h4>
                              <p className="text-[10px] text-slate-400">Specify rules to automatically flag assets for servicing after a specific interval of days.</p>
                            </div>
                            <div className="relative grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-[9px] font-bold text-indigo-500 uppercase block mb-1.5 tracking-wider">AC Servicing Interval (Days)</label>
                                <input
                                  type="number"
                                  value={yieldRules.maintenance_automation.ac_servicing_days}
                                  onChange={e => handleSaveYieldRule('maintenance_automation', { ...yieldRules.maintenance_automation, ac_servicing_days: parseInt(e.target.value) || 0 })}
                                  className="w-full bg-white border border-indigo-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/30 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 outline-none transition-shadow shadow-sm"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-bold text-blue-500 uppercase block mb-1.5 tracking-wider">Generator Check (Days)</label>
                                <input
                                  type="number"
                                  value={yieldRules.maintenance_automation.generator_check_days}
                                  onChange={e => handleSaveYieldRule('maintenance_automation', { ...yieldRules.maintenance_automation, generator_check_days: parseInt(e.target.value) || 0 })}
                                  className="w-full bg-white border border-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 outline-none transition-shadow shadow-sm"
                                />
                              </div>
                            </div>
                          </motion.div>

                          {/* Contractor Auto Routing */}
                          <motion.div whileHover={{ y: -2 }} className="group relative bg-gradient-to-br from-rose-50/60 via-white to-white p-5 rounded-2xl border-2 border-rose-100/70 hover:border-rose-300/70 hover:shadow-xl hover:shadow-rose-500/10 space-y-4 transition-all duration-300 overflow-hidden">
                            <div className="mtn-sheen" />
                            <div className="relative">
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">Contractor Auto-Routing Engine</h4>
                                <label className="relative inline-flex items-center cursor-pointer select-none z-10">
                                  <input
                                    type="checkbox"
                                    checked={yieldRules.maintenance_automation.auto_route_contractor}
                                    onChange={e => handleSaveYieldRule('maintenance_automation', { ...yieldRules.maintenance_automation, auto_route_contractor: e.target.checked })}
                                    className="sr-only peer"
                                  />
                                  <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-[#D4A373] peer-checked:to-[#B3835B] shadow-inner peer-checked:shadow-[#D4A373]/40"></div>
                                </label>
                              </div>
                              <p className="text-[10px] text-slate-400">Automatically assign specialized third-party contractors if a support ticket is unassigned for over 2 hours.</p>
                            </div>
                            <div className="relative">
                              <label className="text-[9px] font-bold text-rose-500 uppercase block mb-1.5 tracking-wider">Backup Dispatch Contractor</label>
                              <select
                                value={yieldRules.maintenance_automation.backup_contractor}
                                onChange={e => handleSaveYieldRule('maintenance_automation', { ...yieldRules.maintenance_automation, backup_contractor: e.target.value })}
                                className="w-full bg-white border border-rose-200 focus:border-rose-400 focus:ring-2 focus:ring-rose-400/30 py-2 px-3 rounded-xl text-xs font-bold text-slate-700 outline-none transition-shadow shadow-sm"
                              >
                                <option value="QuickFix Hospitality Group">QuickFix Hospitality Group</option>
                                <option value="Apex Facilities Management">Apex Facilities Management</option>
                                <option value="Prime Power & Grid Systems">Prime Power & Grid Systems</option>
                              </select>
                            </div>
                          </motion.div>
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* TAB 4: STAFF HUB & SECURITY                 */}
              {activeTab === 'hr' && (
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
                      { key: 'FRONT_DESK', label: 'Front Desk' },
                      { key: 'HOUSEKEEPING', label: 'Housekeeping' },
                      { key: 'ADMIN', label: 'Admin' },
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
                      .filter(sp => staffFilter === 'ALL' || sp.role === staffFilter)
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

                    {staffPermissions.filter(sp => staffFilter === 'ALL' || sp.role === staffFilter).length === 0 && (
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
                                FRONT_DESK: 'from-sky-400 to-blue-500',
                                RECEPTION: 'from-sky-400 to-blue-500',
                                HOUSEKEEPING: 'from-amber-400 to-orange-500',
                                ADMIN: 'from-indigo-400 to-violet-500',
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
                                className={`w-14 h-14 shrink-0 rounded-2xl bg-gradient-to-br ${{ FRONT_DESK: 'from-sky-400 to-blue-500', HOUSEKEEPING: 'from-amber-400 to-orange-500', ADMIN: 'from-indigo-400 to-violet-500', FINANCE: 'from-emerald-400 to-teal-500', RESTAURANT: 'from-rose-400 to-red-500', SALES: 'from-fuchsia-400 to-purple-500', TRAVEL: 'from-cyan-400 to-sky-500' }[selectedStaff.role] || 'from-zinc-400 to-zinc-500'
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
                                    <option value="FRONT_DESK">FRONT_DESK (Front Desk)</option>
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
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
      {/* ═══════════════════════════════════════════════════════
          GLASSMORPHISM MODAL SYSTEM
          ═══════════════════════════════════════════════════════ */}

      {/* Support Ticket Modal */}
      <AnimatePresence>
        {isAddTicketModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-55 flex items-center justify-center fd-glass-backdrop p-4"
            onClick={() => setIsAddTicketModalOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md fd-glass-modal rounded-3xl p-7 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-zinc-900">New Support Ticket</h2>
                    <p className="text-xs text-zinc-500">Dispatch repair request</p>
                  </div>
                </div>
                <button onClick={() => setIsAddTicketModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Target Asset</label>
                  <select
                    required
                    value={newTicketForm.room_id}
                    onChange={e => setNewTicketForm({ ...newTicketForm, room_id: e.target.value })}
                    className="fd-input bg-white appearance-none cursor-pointer"
                  >
                    <option value="">-- Select Room --</option>
                    {roomsList.map(r => <option key={r.id} value={r.id}>Room {r.room_number} {r.status === 'MAINTENANCE' ? '(Down for repairs)' : ''}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Issue Description</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe the breakdown details..."
                    value={newTicketForm.issue}
                    onChange={e => setNewTicketForm({ ...newTicketForm, issue: e.target.value })}
                    className="fd-input resize-none bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Priority</label>
                    <select
                      value={newTicketForm.priority}
                      onChange={e => setNewTicketForm({ ...newTicketForm, priority: e.target.value })}
                      className="fd-input bg-white appearance-none cursor-pointer"
                    >
                      <option value="Low">Low (24h SLA)</option>
                      <option value="Medium">Medium (4h SLA)</option>
                      <option value="High">High (1h SLA)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Assign Team</label>
                    <select
                      value={newTicketForm.assigned_to}
                      onChange={e => setNewTicketForm({ ...newTicketForm, assigned_to: e.target.value })}
                      className="fd-input bg-white appearance-none cursor-pointer"
                    >
                      <option value="Unassigned">Unassigned</option>
                      <option value="Plumbing">Plumbing</option>
                      <option value="HVAC">HVAC</option>
                      <option value="Electrical">Electrical</option>
                      <option value="IT Support">IT Support</option>
                      <option value="General">General</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  <Wrench size={16} /> Deploy Ticket & Lock Room
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Room Modal */}
      <AnimatePresence>
        {isAddRoomModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.25 } }}
            exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-55 flex items-center justify-center fd-glass-backdrop p-4"
            onClick={() => setIsAddRoomModalOpen(false)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md fd-glass-modal rounded-3xl p-7 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-zinc-900">Configure New Unit</h2>
                    <p className="text-xs text-zinc-500">Add physical inventory room</p>
                  </div>
                </div>
                <button onClick={() => setIsAddRoomModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2 font-mono">Classification</label>
                  <select
                    required
                    value={newRoomForm.room_type_id}
                    onChange={e => setNewRoomForm({ ...newRoomForm, room_type_id: e.target.value })}
                    className="fd-input bg-white appearance-none cursor-pointer"
                  >
                    <option value="">-- Select Destination Class --</option>
                    {roomTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2 font-mono">Unit Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 101A, Suite-5"
                    value={newRoomForm.room_number}
                    onChange={e => setNewRoomForm({ ...newRoomForm, room_number: e.target.value })}
                    className="fd-input uppercase"
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Must be a unique identifier.</p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 mt-4"
                >
                  Confirm & Add to Inventory
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 28, stiffness: 350 } },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.2 } }
};