import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Activity, Users, Lock, Unlock, Sparkles, DollarSign,
  Sliders, Wrench, Loader2, Plus, Trash2, X, ChevronDown, ChevronUp, Edit,
  TrendingUp, AlertTriangle, Clock, BedDouble, Zap, ArrowUpRight, ArrowDownRight,
  UserCheck, UserX, ShieldAlert, Hammer, Eye, CircleDot, RefreshCw, CheckCircle,
  LogIn, DoorOpen, Maximize2
} from 'lucide-react';

// =============================================
// SVG DONUT CHART COMPONENT (Pure SVG, no deps)
// =============================================
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

// =============================================
// MINI BAR CHART COMPONENT
// =============================================
function MiniBarChart({ arrivals = 0, departures = 0 }) {
  const [hovered, setHovered] = useState(null); // 'arrivals' | 'departures' | null
  const max = Math.max(arrivals, departures, 1);

  const bars = [
    {
      key: 'arrivals',
      label: 'Arrivals',
      value: arrivals,
      icon: <LogIn size={13} />,
      from: '#34d399',
      to: '#059669',
      glow: 'rgba(16,185,129,0.45)',
    },
    {
      key: 'departures',
      label: 'Departures',
      value: departures,
      icon: <DoorOpen size={13} />,
      from: '#fbbf24',
      to: '#d97706',
      glow: 'rgba(245,158,11,0.45)',
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
              className={`text-lg font-black transition-colors duration-200 ${
                isHovered ? 'text-zinc-900' : 'text-zinc-700'
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

// =============================================
// 7-DAY OCCUPANCY TREND LINE (SVG)
// =============================================
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
            className={`text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all duration-200 ${
              hoverIdx === i 
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

// =============================================
// SLA COUNTDOWN TIMER
// =============================================
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
    <div className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider flex items-center gap-1.5 border transition-all ${
      isBreached 
        ? 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse' 
        : 'bg-zinc-50 text-zinc-600 border-zinc-200'
    }`}>
      <Clock size={11} className={isBreached ? 'text-rose-500' : 'text-zinc-400'} /> {timeLeft}
    </div>
  );
}

// =============================================
// MAIN MANAGER DASHBOARD
export default function ManagerDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate(); 
  const [expandedQueueCol, setExpandedQueueCol] = useState(null);  // Live Operations state
  const [expandedCard, setExpandedCard] = useState(null); // 'frontdesk' | 'housekeeping' | 'engineering' | null
  const [liveData, setLiveData] = useState(null);
  const [activityPage, setActivityPage] = useState(1);
  const activityItemsPerPage = 10;
  
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
  const [staffPermissions, setStaffPermissions] = useState([]);
  const [staffShifts, setStaffShifts] = useState([]);
  const [crmGuests, setCrmGuests] = useState([]);
  const [crmSearch, setCrmSearch] = useState('');
  const [analyticsData, setAnalyticsData] = useState(null);
  
  // Forms & Actions state
  const [broadcastForm, setBroadcastForm] = useState({ targetDept: 'ALL', message: '' });
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);
  const [onboardForm, setOnboardForm] = useState({ email: '', password: '', name: '', role: 'FRONT_DESK' });
  const [onboardSuccess, setOnboardSuccess] = useState(null);
  const [onboardError, setOnboardError] = useState(null);
  const [staffFilter, setStaffFilter] = useState('ALL');
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showOnboardModal, setShowOnboardModal] = useState(false);

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('hms_token');
    if (!token) { navigate('/login'); return null; }
    try {
      const res = await fetch(url, {
        ...options,
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json', ...options.headers }
      });
      if (res.status === 401 || res.status === 403) { navigate('/login'); return null; }
      return res;
    } catch (err) { return null; }
  };

  const loadManagerData = async () => {
    setIsLoading(true);
    try {
      if (['overview', 'activity_monitor', 'operations_log', 'broadcasting', 'security_audit', 'analytics'].includes(activeTab)) {
        const liveRes = await fetchWithAuth('http://localhost:3000/api/manager/live-operations');
        if (liveRes?.ok) {
          const json = await liveRes.json();
          setLiveData(json.data);
        }
        
        const auditRes = await fetchWithAuth('http://localhost:3000/api/manager/audit-logs');
        if (auditRes?.ok) setAuditLogs((await auditRes.json()).data.logs || []);

        const analyticsRes = await fetchWithAuth('http://localhost:3000/api/manager/analytics');
        if (analyticsRes?.ok) setAnalyticsData((await analyticsRes.json()).data || null);
      }
      
      if (activeTab === 'properties') {
        const roomsRes = await fetchWithAuth('http://localhost:3000/api/manager/rooms');
        if (roomsRes?.ok) setRoomsList((await roomsRes.json()).data.rooms || []);
        
        const typesRes = await fetchWithAuth('http://localhost:3000/api/manager/room-types');
        if (typesRes?.ok) {
          const fetchedTypes = (await typesRes.json()).data.roomTypes || [];
          setRoomTypes(fetchedTypes);
          const initialExpanded = {};
          fetchedTypes.forEach(rt => initialExpanded[rt.id] = true);
          setExpandedClasses(initialExpanded);
        }

        const yieldRes = await fetchWithAuth('http://localhost:3000/api/manager/yield-rules');
        if (yieldRes?.ok) setYieldRules((await yieldRes.json()).data.rules || null);

        const crmRes = await fetchWithAuth('http://localhost:3000/api/manager/crm/guests');
        if (crmRes?.ok) setCrmGuests((await crmRes.json()).data.guests || []);
      }

      if (activeTab === 'maintenance') {
        const roomsRes = await fetchWithAuth('http://localhost:3000/api/manager/rooms');
        if (roomsRes?.ok) setRoomsList((await roomsRes.json()).data.rooms || []);
        
        const ticketsRes = await fetchWithAuth('http://localhost:3000/api/manager/maintenance');
        if (ticketsRes?.ok) {
          const ticketsData = await ticketsRes.json();
          setMaintenanceTickets(ticketsData.data.tickets || []);
        }

        const yieldRes = await fetchWithAuth('http://localhost:3000/api/manager/yield-rules');
        if (yieldRes?.ok) setYieldRules((await yieldRes.json()).data.rules || null);
      }

      if (activeTab === 'hr') {
        const permRes = await fetchWithAuth('http://localhost:3000/api/manager/permissions');
        if (permRes?.ok) setStaffPermissions((await permRes.json()).data.permissions || []);

        const shiftsRes = await fetchWithAuth('http://localhost:3000/api/manager/shifts');
        if (shiftsRes?.ok) setStaffShifts((await shiftsRes.json()).data.shifts || []);

        const analyticsRes = await fetchWithAuth('http://localhost:3000/api/manager/analytics');
        if (analyticsRes?.ok) setAnalyticsData((await analyticsRes.json()).data || null);
      }
    } catch (e) {
      console.error("Dashboard Load Error", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadManagerData(); }, [activeTab]);

  // --- ACTIONS ---

  const toggleAccordion = (id) => {
    setExpandedClasses(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddTicket = async (e) => {
    e.preventDefault();
    if (!newTicketForm.room_id) return alert("❌ Please select a room.");
    const res = await fetchWithAuth('http://localhost:3000/api/manager/maintenance', {
      method: 'POST', body: JSON.stringify(newTicketForm)
    });
    if (res?.ok) {
      setIsAddTicketModalOpen(false);
      setNewTicketForm({ room_id: '', issue: '', priority: 'Medium', assigned_to: 'Unassigned' });
      loadManagerData();
    } else {
      alert("❌ Failed to create ticket.");
    }
  };

  const handleChangeTicketStatus = async (id, status) => {
    const res = await fetchWithAuth(`http://localhost:3000/api/manager/maintenance/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status })
    });
    if (res?.ok) loadManagerData();
  };

  const handleAssignTicket = async (id, assigned_to) => {
    const res = await fetchWithAuth(`http://localhost:3000/api/manager/maintenance/${id}/assign`, {
      method: 'PATCH', body: JSON.stringify({ assigned_to })
    });
    if (res?.ok) loadManagerData();
  };

  const handleToggleBlock = async (roomId) => {
    const res = await fetchWithAuth(`http://localhost:3000/api/manager/rooms/${roomId}/toggle-block`, { method: 'POST' });
    if (res?.ok) loadManagerData();
    else alert("❌ Failed to modify room block state.");
  };

  const handleChangeStatus = async (roomId, newStatus) => {
    const res = await fetchWithAuth(`http://localhost:3000/api/manager/rooms/${roomId}/status`, { 
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    if (res?.ok) loadManagerData();
    else alert("❌ Failed to manually override room status.");
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    const cleanRoomNumber = newRoomForm.room_number.trim().toUpperCase();

    if (!cleanRoomNumber) return alert("❌ Room number cannot be empty.");
    if (roomsList.some(r => r.room_number.toUpperCase() === cleanRoomNumber)) {
      return alert(`❌ Duplicate Error: Room ${cleanRoomNumber} already exists.`);
    }

    const res = await fetchWithAuth('http://localhost:3000/api/manager/rooms', {
      method: 'POST', body: JSON.stringify({ ...newRoomForm, room_number: cleanRoomNumber })
    });
    
    if (res?.ok) {
      setIsAddRoomModalOpen(false);
      setNewRoomForm({ room_number: '', room_type_id: '' });
      loadManagerData();
    } else {
      const err = await res.json();
      alert(`❌ ${err.error || "Failed to add room."}`);
    }
  };

  const handleDeleteRoom = async (roomId, roomNumber) => {
    if (!window.confirm(`⚠️ CRITICAL: Are you sure you want to permanently delete Room ${roomNumber}? This cannot be undone.`)) return;
    const res = await fetchWithAuth(`http://localhost:3000/api/manager/rooms/${roomId}`, { method: 'DELETE' });
    if (res?.ok) loadManagerData();
    else alert("❌ Failed to delete room. It may have connected database records.");
  };

  // --- ADVANCED CONTROLS ACTIONS ---

  const handleSaveYieldRule = async (key, value) => {
    const res = await fetchWithAuth('http://localhost:3000/api/manager/yield-rules', {
      method: 'POST', body: JSON.stringify({ key, value })
    });
    if (res?.ok) {
      const yieldRes = await fetchWithAuth('http://localhost:3000/api/manager/yield-rules');
      if (yieldRes?.ok) setYieldRules((await yieldRes.json()).data.rules || null);
    } else {
      alert("❌ Failed to update yield engine rule configuration.");
    }
  };

  const handleSavePermissions = async (userId, payload) => {
    const res = await fetchWithAuth(`http://localhost:3000/api/manager/permissions/${userId}`, {
      method: 'POST', body: JSON.stringify(payload)
    });
    if (res?.ok) {
      const permRes = await fetchWithAuth('http://localhost:3000/api/manager/permissions');
      if (permRes?.ok) setStaffPermissions((await permRes.json()).data.permissions || []);
    } else {
      alert("❌ Failed to update user permission configurations.");
    }
  };

  const handleSaveGuestFlags = async (guestId, payload) => {
    const res = await fetchWithAuth(`http://localhost:3000/api/manager/crm/guests/${guestId}`, {
      method: 'POST', body: JSON.stringify(payload)
    });
    if (res?.ok) {
      const crmRes = await fetchWithAuth('http://localhost:3000/api/manager/crm/guests');
      if (crmRes?.ok) setCrmGuests((await crmRes.json()).data.guests || []);
    } else {
      alert("❌ Failed to update guest relations registry.");
    }
  };

  const handleTriggerBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.message.trim()) return;
    const res = await fetchWithAuth('http://localhost:3000/api/manager/broadcast', {
      method: 'POST', body: JSON.stringify(broadcastForm)
    });
    if (res?.ok) {
      setBroadcastSuccess(true);
      setBroadcastForm({ targetDept: 'ALL', message: '' });
      setTimeout(() => setBroadcastSuccess(false), 3000);
      const auditRes = await fetchWithAuth('http://localhost:3000/api/manager/audit-logs');
      if (auditRes?.ok) setAuditLogs((await auditRes.json()).data.logs || []);
    } else {
      alert("❌ Failed to send operational broadcast alert.");
    }
  };

  const handleHROnboard = async (e) => {
    e.preventDefault();
    setOnboardSuccess(null);
    setOnboardError(null);
    const res = await fetchWithAuth('http://localhost:3000/api/manager/staff/onboard', {
      method: 'POST', body: JSON.stringify(onboardForm)
    });
    const json = await res.json();
    if (res?.ok) {
      setOnboardSuccess('Employee onboarded and provisioned successfully!');
      setOnboardForm({ email: '', password: '', name: '', role: 'FRONT_DESK' });
      const permRes = await fetchWithAuth('http://localhost:3000/api/manager/permissions');
      if (permRes?.ok) setStaffPermissions((await permRes.json()).data.permissions || []);
      setTimeout(() => { setShowOnboardModal(false); setOnboardSuccess(null); }, 1800);
    } else {
      setOnboardError(json.error || 'Failed to complete employee onboarding.');
    }
  };

  const handleHROffboard = async (userId) => {
    if (!window.confirm('⚠️ WARNING: Are you sure you want to permanently revoke credential tokens and delete this staff member? This cannot be undone.')) return;
    const res = await fetchWithAuth(`http://localhost:3000/api/manager/staff/offboard/${userId}`, {
      method: 'POST'
    });
    if (res?.ok) {
      const permRes = await fetchWithAuth('http://localhost:3000/api/manager/permissions');
      if (permRes?.ok) setStaffPermissions((await permRes.json()).data.permissions || []);
    } else {
      const err = await res.json();
      alert(`❌ ${err.error || "Failed to offboard employee."}`);
    }
  };

  const handleSearchAudits = async (e) => {
    e.preventDefault();
    const res = await fetchWithAuth(`http://localhost:3000/api/manager/audit-logs?q=${encodeURIComponent(auditSearch)}`);
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
      { label: 'Available', value: dist.AVAILABLE || 0, color: '#10b981' },
      { label: 'Occupied', value: dist.OCCUPIED || 0, color: '#4f46e5' },
      { label: 'Dirty', value: dist.DIRTY || 0, color: '#f59e0b' },
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
          background:
            radial-gradient(1000px 520px at 8% -10%, rgba(45,212,191,0.16) 0%, transparent 55%),
            radial-gradient(900px 500px at 105% 8%, rgba(56,189,248,0.16) 0%, transparent 55%),
            radial-gradient(760px 500px at 45% 115%, rgba(251,191,36,0.14) 0%, transparent 60%),
            linear-gradient(180deg, #f0fdfa 0%, #f0f9ff 45%, #fffbeb 100%) !important;
          background-attachment: fixed;
          background-size: 140% 140%, 140% 140%, 140% 140%, auto;
          animation: fd-mesh-shift 24s ease-in-out infinite;
        }
        @keyframes fd-mesh-shift {
          0%, 100% { background-position: 0% 0%, 100% 0%, 50% 100%, 0 0; }
          50% { background-position: 10% 8%, 90% 10%, 44% 92%, 0 0; }
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
            <Sliders className="text-indigo-600" size={20} />
          </div>
          <div>
            <h1 className="font-serif font-black text-[25px] text-zinc-500 text-base leading-none">Admin</h1>
            <span className="text-[9px] font-bold text-indigo-600 uppercase tracking-widest mt-1 block">Command Center</span>
          </div>
        </div>
        
        {/* Navigation Categories */}
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto fd-sidebar-scroll pr-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Control Room</p>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Activity size={15} /> Live Operations
              </button>
              <button
                onClick={() => setActiveTab(activeTab === 'properties' || activeTab === 'properties_yield' ? 'overview' : 'properties')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'properties' || activeTab === 'properties_yield'
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 shadow-xs'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Sliders size={15} /> Property Controls
              </button>

              {/* Sub-tabs under Property Controls */}
              {(activeTab === 'properties' || activeTab === 'properties_yield') && (
                <div className="pl-6 flex flex-col gap-1 border-l-2 border-indigo-100 ml-5 py-1">
                  <button
                    onClick={() => setActiveTab('properties')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all text-left ${
                      activeTab === 'properties'
                        ? 'bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-100'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <BedDouble size={12} /> Inventory & Rooms
                  </button>
                  <button
                    onClick={() => setActiveTab('properties_yield')}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all text-left ${
                      activeTab === 'properties_yield'
                        ? 'bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-100'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                    }`}
                  >
                    <TrendingUp size={12} /> Yield & Distribution
                  </button>
                </div>
              )}
              <button
                onClick={() => setActiveTab('activity_monitor')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'activity_monitor'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <CircleDot size={15} /> Activity Monitor
              </button>
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'maintenance'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Wrench size={15} /> Repairs and Automations
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <TrendingUp size={15} /> Predictive Analysis
              </button>
              <button
                onClick={() => setActiveTab('broadcasting')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'broadcasting'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Zap size={15} /> Broadcasting Center
              </button>
              <button
                onClick={() => setActiveTab('hr')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'hr'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <Users size={15} /> Staff Hub
              </button>
              <button
                onClick={() => setActiveTab('security_audit')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'security_audit'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <ShieldAlert size={15} /> Security Audit
              </button>

              <button
                onClick={() => setActiveTab('crm')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'crm'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                }`}
              >
                <UserCheck size={15} /> Guest Registry
              </button>
              <button
                onClick={() => setActiveTab('operations_log')}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${
                  activeTab === 'operations_log'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
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
        
        {/* HEADER RIBBON */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              onClick={loadManagerData}
              className={`p-2.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-500 transition-all ${isLoading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={15} />
            </button>

            {/* Profile Avatar Widget */}
            <div className="flex items-center gap-2 bg-white pl-2.5 pr-3 py-1.5 rounded-xl border border-zinc-200/60 shadow-xs">
              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                M
              </div>
              <div className="hidden sm:block text-left leading-none">
                <span className="text-xs font-bold text-zinc-900 block">General Manager</span>
                <span className="text-[8px] font-semibold text-zinc-600 uppercase tracking-widest mt-0.5 block">Administrator</span>
              </div>
            </div>
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
              
              {/* ============================================ */}
              {/* TAB 1: LIVE OPERATIONS COMMAND CENTER        */}
              {/* ============================================ */}
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
                          glow: 'rgba(16,185,129,0.35)',
                          iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30',
                          graphic: (
                            <div className="relative flex items-center justify-center shrink-0 ml-4">
                              <svg className="w-14 h-14 rotate-[-90deg] drop-shadow-[0_0_6px_rgba(16,185,129,0.35)]">
                                <circle cx="28" cy="28" r="20" fill="none" stroke="#eefcf5" strokeWidth="4" />
                                <motion.circle
                                  cx="28" cy="28" r="20" fill="none" strokeWidth="4.5"
                                  stroke="url(#occGradient)"
                                  strokeDasharray={2 * Math.PI * 20}
                                  initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                                  animate={{ strokeDashoffset: (2 * Math.PI * 20) - (pct / 100) * (2 * Math.PI * 20) }}
                                  transition={{ duration: 1.3, ease: "easeOut" }}
                                  strokeLinecap="round"
                                />
                                <defs>
                                  <linearGradient id="occGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#34d399" />
                                    <stop offset="100%" stopColor="#059669" />
                                  </linearGradient>
                                </defs>
                              </svg>
                              <span className="absolute text-[10px] font-black text-emerald-700">{pct}%</span>
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
                          glow: 'rgba(99,102,241,0.35)',
                          iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30',
                          graphic: (
                            <div className="shrink-0 ml-4 border border-indigo-100/70 bg-gradient-to-br from-indigo-50/80 to-white p-1.5 rounded-xl">
                              <svg className="w-16 h-9 overflow-visible">
                                <defs>
                                  <linearGradient id="staysFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
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
                                  stroke="#4f46e5"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                                />
                                <motion.circle
                                  cx="60" cy="8" r="3" fill="#4f46e5"
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
                          glow: 'rgba(244,63,94,0.35)',
                          iconBg: 'bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-lg shadow-rose-500/30',
                          graphic: (
                            <div className="flex gap-1.5 h-7 items-end shrink-0 ml-4 border border-rose-100/70 bg-gradient-to-br from-rose-50/80 to-white px-2.5 py-1.5 rounded-xl">
                              {[...Array(5)].map((_, idx) => (
                                <motion.div
                                  key={idx}
                                  className={`w-2.5 rounded-t-md ${
                                    idx < Math.min(liveData.kpis.outOfOrderAssets, 5)
                                      ? 'bg-gradient-to-t from-rose-600 to-rose-400 shadow-[0_2px_8px_rgba(244,63,94,0.45)]'
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
                          glow: 'rgba(245,158,11,0.35)',
                          iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30',
                          graphic: (
                            <div className="shrink-0 ml-4 border border-amber-100/70 bg-gradient-to-br from-amber-50/80 to-white p-1.5 rounded-xl">
                              <svg className="w-16 h-9 overflow-visible">
                                <defs>
                                  <linearGradient id="yieldFill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.35" />
                                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
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
                                  stroke="#f59e0b"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  initial={{ pathLength: 0 }}
                                  animate={{ pathLength: 1 }}
                                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
                                />
                                <motion.circle
                                  cx="60" cy="4" r="3" fill="#f59e0b"
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
                      className="relative overflow-hidden bg-gradient-to-br from-white via-white to-amber-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(245,158,11,0.25)] border border-zinc-200/60 flex flex-col justify-between group cursor-pointer"
                    >
                      <div className="absolute -top-14 -left-14 w-40 h-40 rounded-full bg-amber-300/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center gap-2 mb-4">
                        <motion.div
                          animate={{
                            scale: [1, 1.15, 1],
                            filter: ['drop-shadow(0 0 0px rgba(245, 158, 11, 0))', 'drop-shadow(0 0 6px rgba(245, 158, 11, 0.55))', 'drop-shadow(0 0 0px rgba(245, 158, 11, 0))']
                          }}
                          transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                          className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30"
                        >
                          <Zap size={14} className="text-white" />
                        </motion.div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Today's Traffic Flow</h3>
                      </div>
                      <MiniBarChart arrivals={liveData.arrivalsToday} departures={liveData.departuresToday} />
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="relative overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(99,102,241,0.25)] border border-zinc-200/60"
                    >
                      <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
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

              {/* ============================================ */}
              {/* TAB: ACTIVITY MONITOR                        */}
              {/* ============================================ */}
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
                      className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-blue-50 rounded-[2rem] p-5 shadow-[0_18px_40px_-16px_rgba(99,102,241,0.25)] border-2 border-indigo-100/70 hover:border-indigo-300/70 cursor-pointer transition-colors"
                    >
                      <div className="amc-sheen" />
                      <div className="amc-orb w-36 h-36 bg-indigo-300/25 -top-10 -right-10" style={{ animation: 'amc-float 8s ease-in-out infinite' }} />
                      <div className="relative flex items-center gap-2 mb-4 border-b border-indigo-100 pb-3">
                        <motion.div
                          whileHover={{ rotate: -10, scale: 1.1 }}
                          className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-sm amc-ring-indigo"
                        >
                          <UserCheck size={15} className="text-white" />
                        </motion.div>
                        <h3 className="text-xs font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600 flex-1">Front Desk Dispatch</h3>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      className="group relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-orange-50 rounded-[2rem] p-5 shadow-[0_18px_40px_-16px_rgba(245,158,11,0.25)] border-2 border-amber-100/70 hover:border-amber-300/70 cursor-pointer transition-colors"
                    >
                      <div className="amc-sheen" />
                      <div className="amc-orb w-36 h-36 bg-amber-300/25 -bottom-10 -left-10" style={{ animation: 'amc-float-rev 9s ease-in-out infinite' }} />
                      <div className="relative flex items-center gap-2 mb-4 border-b border-amber-100 pb-3">
                        <motion.div
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-sm amc-ring-amber"
                        >
                          <Sparkles size={15} className="text-white" />
                        </motion.div>
                        <h3 className="text-xs font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600 flex-1">Housekeeping Queue</h3>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      className="group relative overflow-hidden bg-gradient-to-br from-rose-50 via-white to-fuchsia-50 rounded-[2rem] p-5 shadow-[0_18px_40px_-16px_rgba(244,63,94,0.25)] border-2 border-rose-100/70 hover:border-rose-300/70 cursor-pointer transition-colors"
                    >
                      <div className="amc-sheen" />
                      <div className="amc-orb w-36 h-36 bg-rose-300/25 -top-10 -left-10" style={{ animation: 'amc-float 8.5s ease-in-out infinite' }} />
                      <div className="relative flex items-center gap-2 mb-4 border-b border-rose-100 pb-3">
                        <motion.div
                          whileHover={{ rotate: -10, scale: 1.1 }}
                          className="w-8 h-8 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-500 flex items-center justify-center shadow-sm amc-ring-rose"
                        >
                          <Hammer size={15} className="text-white" />
                        </motion.div>
                        <h3 className="text-xs font-black uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-rose-600 to-fuchsia-600 flex-1">Active Workorders</h3>
                        <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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

              {/* ============================================ */}
              {/* TAB: OPERATIONS LOG                          */}
              {/* ============================================ */}
              {activeTab === 'operations_log' && liveData && (
                <motion.div key="operations_log" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* Activity Feed */}
                  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60">
                    <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3">
                      <div className="flex items-center gap-2">
                        <Eye size={16} className="text-zinc-700" />
                        <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider">Historical Operations Log</h3>
                      </div>
                    </div>
                    
                    {liveData.activityFeed.length === 0 ? (
                      <p className="text-sm text-zinc-400 text-center py-6 italic">No activities registered</p>
                    ) : (
                      <div className="space-y-2">
                        {(() => {
                          const startIndex = (activityPage - 1) * activityItemsPerPage;
                          const paginatedActivity = liveData.activityFeed.slice(startIndex, startIndex + activityItemsPerPage);
                          const totalPages = Math.ceil(liveData.activityFeed.length / activityItemsPerPage);

                          return (
                            <>
                              {paginatedActivity.map((item, i) => {
                                const actionClass = getActionColor(item.action);
                                return (
                                  <div key={i} className="flex items-center gap-4 p-2.5 rounded-xl bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200/40 transition-colors">
                                    <span className="text-[10px] font-bold text-zinc-400 w-14 shrink-0 font-mono text-center">{formatActivityTime(item.created_at)}</span>
                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border ${actionClass}`}>
                                      {getActionIcon(item.action)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs text-zinc-800 font-bold truncate">
                                        {item.guest_name}
                                        <span className="text-zinc-400 font-normal mx-1.5">·</span>
                                        <span className="text-zinc-500 font-normal">{formatActivityAction(item.action)}</span>
                                      </p>
                                      <p className="text-[9px] text-zinc-400">Room {item.room_number} ({item.room_type})</p>
                                    </div>
                                    <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border shrink-0 ${actionClass}`}>
                                      {item.action.replace('_', ' ')}
                                    </span>
                                  </div>
                                );
                              })}
                              {totalPages > 1 && (
                                <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                                  <span>Showing {startIndex + 1}-{Math.min(startIndex + activityItemsPerPage, liveData.activityFeed.length)} of {liveData.activityFeed.length} logs</span>
                                  <div className="flex items-center gap-1.5">
                                    <button 
                                      onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                                      disabled={activityPage === 1}
                                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-[10px] font-bold disabled:opacity-50"
                                    >
                                      Prev
                                    </button>
                                    <span className="font-bold bg-zinc-100 px-2.5 py-1 rounded-lg">{activityPage} / {totalPages}</span>
                                    <button 
                                      onClick={() => setActivityPage(p => Math.min(totalPages, p + 1))}
                                      disabled={activityPage === totalPages}
                                      className="px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-[10px] font-bold disabled:opacity-50"
                                    >
                                      Next
                                    </button>
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: PREDICTIVE ANALYTICS                    */}
              {/* ============================================ */}
              {activeTab === 'analytics' && analyticsData && (
                <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* Predictive Analytics Section */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Pace Report Line Graph */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp size={16} className="text-indigo-600" />
                        <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider">Booking Velocity Pace Report</h3>
                      </div>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-4">Month-on-Month pace curve (This Year vs Last Year)</p>
                      
                      <div className="h-48 relative border-l border-b border-zinc-100 flex items-end px-2 pt-2">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                          {/* Target points connecting current pace */}
                          <path 
                            d="M 0 100 L 15 88 L 30 74 L 45 62 L 60 51 L 80 37 L 100 26" 
                            fill="none" 
                            stroke="#4f46e5" 
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          {/* Last year pace */}
                          <path 
                            d="M 0 100 L 15 92 L 30 86 L 45 78 L 60 69 L 80 59 L 100 48" 
                            fill="none" 
                            stroke="#cbd5e1" 
                            strokeWidth="2"
                            strokeDasharray="4"
                            strokeLinecap="round"
                          />
                        </svg>
                        
                        <div className="absolute top-2 right-2 bg-white/80 p-2 rounded-xl border border-zinc-100 text-[9px] font-bold flex flex-col gap-1">
                          <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 bg-indigo-600 inline-block"></span> This Month (Pace: +15%)</div>
                          <div className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 border-b border-dashed border-zinc-400 inline-block"></span> Last Year</div>
                        </div>
                      </div>
                      <div className="flex justify-between text-[9px] text-zinc-400 font-bold uppercase tracking-wider mt-2 px-1">
                        <span>Day 1</span>
                        <span>Day 10</span>
                        <span>Day 20</span>
                        <span>Day 30</span>
                      </div>
                    </div>

                    {/* Cancellation Heatmaps */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60">
                      <div className="flex items-center gap-2 mb-4">
                        <AlertTriangle size={16} className="text-rose-500" />
                        <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider">OTA Channel Cancellation Heatmap</h3>
                      </div>
                      <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-4">Cancellation ratios per source channel and category</p>
                      
                      <div className="space-y-3">
                        {analyticsData.cancellationHeatmap.map((ch, idx) => (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-zinc-800">
                              <span>{ch.category}</span>
                              <span>{ch.rate}%</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  ch.rate > 25 ? 'bg-rose-500' : ch.rate > 15 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${ch.rate}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: BROADCASTING CENTER                     */}
              {/* ============================================ */}
              {activeTab === 'broadcasting' && (
                <motion.div key="broadcasting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* Broadcasting Center */}
                  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60">
                    <div className="flex items-center gap-2 mb-4 border-b border-zinc-100 pb-3">
                      <Zap size={16} className="text-rose-500" />
                      <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider">Departmental Broadcasting Alert</h3>
                    </div>
                    <form onSubmit={handleTriggerBroadcast} className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="sm:w-1/3">
                          <label className="block text-[10px] font-bold uppercase text-zinc-400 tracking-wider mb-2">Target Department</label>
                          <select 
                            value={broadcastForm.targetDept} 
                            onChange={e => setBroadcastForm({ ...broadcastForm, targetDept: e.target.value })}
                            className="fd-input bg-zinc-50 border border-zinc-200/60 rounded-xl"
                          >
                            <option value="ALL">All Departments</option>
                            <option value="FRONT_DESK">Front Desk / Reception</option>
                            <option value="HOUSEKEEPING">Housekeeping Staff</option>
                            <option value="FINANCE">Finance Dept</option>
                          </select>
                        </div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold uppercase text-zinc-400 tracking-wider mb-2">Broadcast Message</label>
                          <input 
                            type="text" 
                            required
                            placeholder="Type flash alert message (e.g. VIP guest arriving)..."
                            value={broadcastForm.message}
                            onChange={e => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                            className="fd-input bg-zinc-50 border border-zinc-200/60 rounded-xl"
                          />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        {broadcastSuccess ? (
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-lg">Broadcast alert dispatched successfully!</span>
                        ) : <span />}
                        <button 
                          type="submit" 
                          className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition-all shadow-md active:scale-95"
                        >
                          Transmit Dispatch
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: SECURITY AUDIT                          */}
              {/* ============================================ */}
              {activeTab === 'security_audit' && (
                <motion.div key="security_audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* System Watchdog logs */}
                  <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 border-b border-zinc-100 pb-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert size={16} className="text-indigo-600" />
                        <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider">Immutable Security Audit Watchdog</h3>
                      </div>
                      <form onSubmit={handleSearchAudits} className="flex items-center gap-2 max-w-sm">
                        <input 
                          type="text" 
                          placeholder="Search actions or staff..."
                          value={auditSearch} 
                          onChange={e => setAuditSearch(e.target.value)} 
                          className="fd-input py-1.5 px-3 rounded-lg text-xs bg-zinc-50 border border-zinc-200/60"
                        />
                        <button type="submit" className="bg-zinc-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Search</button>
                      </form>
                    </div>

                    <div className="overflow-x-auto fd-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400 font-black">
                            <th className="py-2.5">Timestamp</th>
                            <th className="py-2.5">Staff Operator</th>
                            <th className="py-2.5">Role</th>
                            <th className="py-2.5">Action Code</th>
                            <th className="py-2.5">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                          {auditLogs.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="py-8 text-center text-xs text-zinc-400 italic">No audit records found</td>
                            </tr>
                          ) : (
                            auditLogs.map((log, index) => (
                              <tr key={index} className="text-xs text-zinc-700 hover:bg-zinc-50/50">
                                <td className="py-2.5 font-mono text-[10px] text-zinc-400">
                                  {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                </td>
                                <td className="py-2.5 font-bold text-zinc-950">{log.user_name}</td>
                                <td className="py-2.5">
                                  <span className="bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-zinc-600">
                                    {log.user_role}
                                  </span>
                                </td>
                                <td className="py-2.5 font-bold text-indigo-600">{log.action}</td>
                                <td className="py-2.5 text-zinc-500">{log.details}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB 2: PROPERTY CONTROLS                     */}
              {/* ============================================ */}
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
                    className="relative overflow-hidden rounded-[2rem] p-6 shadow-lg border border-white/10"
                    style={{ background: 'linear-gradient(115deg, #4f46e5 0%, #0ea5e9 45%, #14b8a6 100%)', backgroundSize: '200% 200%', animation: 'rhi-shimmer 10s ease-in-out infinite' }}
                  >
                    <motion.div className="rhi-orb w-56 h-56 bg-fuchsia-400/25" style={{ top: '-4rem', right: '-3rem' }} animate={{ x: [0, 20, 0], y: [0, -14, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.div className="rhi-orb w-48 h-48 bg-teal-300/25" style={{ bottom: '-3.5rem', left: '10%' }} animate={{ x: [0, -18, 0], y: [0, 12, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 text-white">
                      <div className="flex items-center gap-4">
                        <motion.div
                          animate={{ rotate: [0, -6, 6, 0], y: [0, -3, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                          className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 items-center justify-center shadow-lg text-2xl"
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
                          className="rhi-glow-wrap"
                          style={{ backgroundImage: `linear-gradient(120deg, ${accent.ring}, transparent, ${accent.ring})` }}
                        >
                        <div className="relative bg-white/95 backdrop-blur-xl rounded-[calc(2rem-2px)] overflow-hidden shadow-[0_18px_40px_-14px_rgba(56,189,248,0.15)]">
                          <div className="absolute inset-0 rhi-dot-grid pointer-events-none opacity-70" />
                          <div className={`rhi-orb -top-10 -right-10 w-40 h-40 ${accent.blob}`} style={{ animation: typeIdx % 2 === 0 ? 'rhi-float 8s ease-in-out infinite' : 'rhi-float-rev 9s ease-in-out infinite' }} />

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
                                <ChevronDown size={16}/>
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
                                          className={`group relative p-4 rounded-2xl border flex items-center justify-between transition-colors overflow-hidden ${
                                            room.room_blocked
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
                                                <Lock size={10}/> Blocked
                                              </span>
                                            ) : (
                                              <select
                                                value={room.status?.toUpperCase()}
                                                onChange={(e) => handleChangeStatus(room.id, e.target.value)}
                                                className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border cursor-pointer outline-none transition-colors shadow-sm ${
                                                  room.status?.toUpperCase() === 'AVAILABLE' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
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
                                              className={`font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg border transition-colors flex items-center justify-center gap-1 ${
                                                room.room_blocked
                                                  ? 'bg-zinc-200 text-zinc-700 border-transparent hover:bg-zinc-300'
                                                  : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                                              }`}
                                            >
                                              {room.room_blocked ? <Unlock size={11}/> : <Lock size={11}/>}
                                              {room.room_blocked ? 'Unblock' : 'Block'}
                                            </motion.button>

                                            <motion.button
                                              whileHover={{ scale: 1.04 }}
                                              whileTap={{ scale: 0.95 }}
                                              onClick={() => handleDeleteRoom(room.id, room.room_number)}
                                              className="font-bold uppercase tracking-wider px-2.5 py-1.5 rounded-lg bg-white border border-rose-100 text-rose-500 hover:bg-rose-50 transition-colors flex items-center justify-center gap-1"
                                            >
                                              <Trash2 size={11}/> Delete
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
              {/* ============================================ */}
              {/* TAB: YIELD & DISTRIBUTION                   */}
              {/* ============================================ */}
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
                    className="relative overflow-hidden rounded-[2rem] p-6 shadow-lg border border-white/10"
                    style={{ background: 'linear-gradient(115deg, #4f46e5 0%, #0ea5e9 45%, #14b8a6 100%)', backgroundSize: '200% 200%', animation: 'yld-shimmer 10s ease-in-out infinite' }}
                  >
                    <motion.div className="yld-orb w-56 h-56 bg-fuchsia-400/25" style={{ top: '-4rem', right: '-3rem' }} animate={{ x: [0, 20, 0], y: [0, -14, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
                    <motion.div className="yld-orb w-48 h-48 bg-teal-300/25" style={{ bottom: '-3.5rem', left: '10%' }} animate={{ x: [0, -18, 0], y: [0, 12, 0] }} transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }} />
                    <div className="relative flex flex-col md:flex-row items-center justify-between gap-4 text-white">
                      <div className="flex items-center gap-4">
                        <motion.div
                          animate={{ rotate: [0, -8, 8, 0], y: [0, -3, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                          className="hidden sm:flex w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 items-center justify-center shadow-lg"
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
                      <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
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
                    <div className="yld-glow-wrap" style={{ backgroundImage: 'linear-gradient(120deg, #2dd4bf, #6366f1, #0ea5e9, #2dd4bf)' }}>
                    <motion.div 
                      whileHover={{ y: -4, scale: 1.005 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-[calc(2rem-2px)] p-6 shadow-[0_20px_50px_-12px_rgba(20,184,166,0.2)] space-y-6"
                    >
                      <div className="absolute inset-0 yld-dot-grid pointer-events-none" />
                      <div className="yld-orb -top-14 -right-14 w-48 h-48 bg-teal-300/25 animate-pulse" />
                      <div className="yld-orb -bottom-14 -left-14 w-40 h-40 bg-indigo-300/20" />
                      
                      <div className="relative flex items-center gap-3 border-b border-zinc-100/80 pb-4">
                        <motion.div
                          whileHover={{ rotate: -10, scale: 1.1 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                          className="bg-gradient-to-br from-teal-100 to-blue-100 p-2.5 rounded-xl border border-teal-200/60 shadow-sm yld-ring-pulse"
                        >
                          <TrendingUp size={20} className="text-teal-600" />
                        </motion.div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-teal-600 via-blue-600 to-indigo-600">Dynamic Pricing &amp; Yield Engine</h3>
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
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-teal-400 peer-checked:to-blue-500 shadow-inner peer-checked:shadow-teal-500/40"></div>
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
                                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-400 peer-checked:to-teal-500 shadow-inner peer-checked:shadow-blue-500/40"></div>
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
                                      <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5"><Clock size={10}/> {sm.start_date} <span className="text-slate-300">to</span> {sm.end_date}</p>
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

                  {/* Channel Manager Configuration */}
                  {yieldRules && (
                    <div className="yld-glow-wrap" style={{ backgroundImage: 'linear-gradient(120deg, #f59e0b, #fb7185, #f59e0b)' }}>
                    <motion.div 
                      whileHover={{ y: -4, scale: 1.005 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="relative overflow-hidden bg-white/95 backdrop-blur-xl rounded-[calc(2rem-2px)] p-6 shadow-[0_20px_50px_-12px_rgba(245,158,11,0.2)] space-y-6"
                    >
                      <div className="absolute inset-0 yld-dot-grid pointer-events-none opacity-60" />
                      <div className="yld-orb -top-20 -left-20 w-56 h-56 bg-amber-400/15 animate-pulse" />
                      <div className="yld-orb bottom-0 right-0 w-40 h-40 bg-rose-400/10" />
                      
                      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100/80 pb-4">
                        <div className="flex items-center gap-3">
                          <motion.div
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                            className="bg-gradient-to-br from-amber-100 to-rose-100 p-2.5 rounded-xl border border-amber-200/60 shadow-sm yld-ring-pulse-amber"
                          >
                            <Sliders size={20} className="text-amber-500" />
                          </motion.div>
                          <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500">Channel Manager &amp; OTA Sync</h3>
                        </div>
                        <div className="flex items-center gap-3 bg-white shadow-sm border-2 border-rose-100 px-4 py-2 rounded-2xl relative overflow-hidden group">
                          <div className="absolute inset-0 bg-gradient-to-r from-rose-50/70 to-orange-50/50 group-hover:from-rose-100/70 group-hover:to-orange-100/50 transition-colors pointer-events-none" />
                          <span className="relative text-[10px] font-black uppercase text-rose-600 tracking-wider flex items-center gap-1.5">
                            <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="inline-flex">
                              <AlertTriangle size={12}/>
                            </motion.span>
                            Master OTA Kill Switch
                          </span>
                          <label className="relative inline-flex items-center cursor-pointer select-none z-10">
                            <input 
                              type="checkbox" 
                              checked={yieldRules.channel_manager.master_ota_toggle}
                              onChange={e => handleSaveYieldRule('channel_manager', { ...yieldRules.channel_manager, master_ota_toggle: e.target.checked })}
                              className="sr-only peer"
                            />
                            <div className="w-10 h-5 bg-rose-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-rose-200 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-rose-500 peer-checked:to-orange-500 shadow-inner peer-checked:shadow-rose-500/40"></div>
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
                                value={yieldRules.channel_manager.allotments[channel] || 0}
                                onChange={e => {
                                  const allotments = { ...yieldRules.channel_manager.allotments, [channel]: parseInt(e.target.value) || 0 };
                                  handleSaveYieldRule('channel_manager', { ...yieldRules.channel_manager, allotments });
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
              {/* ============================================ */}
              {activeTab === 'crm' && (
                <motion.div key="crm" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* CRM & Guest Relations Registry */}
                  <motion.div 
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="relative overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(99,102,241,0.22)] border border-zinc-200/60 space-y-6"
                  >
                    <div className="absolute -top-14 -left-14 w-40 h-40 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none" />
                    <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                          <UserCheck size={14} className="text-white" />
                        </div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">CRM Guest Relations Registry</h3>
                      </div>
                      <input 
                        type="text" 
                        placeholder="Search CRM guests..."
                        value={crmSearch} 
                        onChange={e => setCrmSearch(e.target.value)} 
                        className="fd-input py-1.5 px-3 rounded-lg text-xs max-w-xs bg-zinc-50 border border-zinc-200/60"
                      />
                    </div>

                    {/* Email triggers */}
                    {yieldRules && (
                      <div className="relative bg-zinc-50/50 p-4 rounded-2xl border border-zinc-200/40 flex flex-wrap gap-6 items-center justify-between text-xs">
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
                              <div className="w-8 h-4 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
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
                              <div className="w-8 h-4 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[1px] after:left-[1px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Email Auto-Triggers</span>
                      </div>
                    )}

                    {/* CRM Guest Table */}
                    <div className="relative overflow-x-auto fd-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-400 font-black">
                            <th className="py-2.5">Guest Name</th>
                            <th className="py-2.5">Email</th>
                            <th className="py-2.5">Phone</th>
                            <th className="py-2.5">Status Flags</th>
                            <th className="py-2.5 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                          {crmGuests
                            .filter(g => !crmSearch || g.name.toLowerCase().includes(crmSearch.toLowerCase()) || g.email?.toLowerCase().includes(crmSearch.toLowerCase()))
                            .map((guest, idx) => (
                              <tr key={idx} className="text-xs text-zinc-700 hover:bg-zinc-50/50">
                                <td className="py-3 font-bold text-zinc-900">{guest.name}</td>
                                <td className="py-3 text-zinc-500">{guest.email || 'N/A'}</td>
                                <td className="py-3 text-zinc-500 font-mono">{guest.phone || 'N/A'}</td>
                                <td className="py-3 space-x-1.5">
                                  {guest.is_vip && <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">VIP</span>}
                                  {guest.is_blacklisted && <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">Blacklisted</span>}
                                  {!guest.is_vip && !guest.is_blacklisted && <span className="text-zinc-400 italic">None</span>}
                                </td>
                                <td className="py-3 text-right space-x-2">
                                  <button 
                                    onClick={() => handleSaveGuestFlags(guest.id, { is_vip: !guest.is_vip, is_blacklisted: guest.is_blacklisted })}
                                    className={`font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded ${guest.is_vip ? 'bg-zinc-100 text-zinc-600' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}
                                  >
                                    {guest.is_vip ? 'Remove VIP' : 'Flag VIP'}
                                  </button>
                                  <button 
                                    onClick={() => handleSaveGuestFlags(guest.id, { is_vip: guest.is_vip, is_blacklisted: !guest.is_blacklisted })}
                                    className={`font-bold text-[10px] uppercase tracking-wider px-2 py-1 rounded ${guest.is_blacklisted ? 'bg-zinc-100 text-zinc-600' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
                                  >
                                    {guest.is_blacklisted ? 'Unblacklist' : 'Blacklist'}
                                  </button>
                                </td>
                              </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB 3: MAINTENANCE & REPAIRS                 */}
              {/* ============================================ */}
              {activeTab === 'maintenance' && (
                <motion.div key="maintenance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  {/* Header Banner */}
                  <div className="bg-gradient-to-r from-blue-500 via-teal-500 to-blue-600 text-white rounded-[2rem] p-6 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 border border-indigo-400/20">
                    <div>
                      <h3 className="text-base font-black tracking-tight">Support Ticket Dashboard</h3>
                      <p className="text-xs text-indigo-100 mt-0.5">Dispatch technicians, track active repair timelines, and monitor SLA breach limits.</p>
                    </div>
                    <button 
                      onClick={() => setIsAddTicketModalOpen(true)} 
                      className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all shadow-md shadow-rose-600/30 w-full sm:w-auto flex items-center justify-center gap-1.5 shrink-0"
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
                      const theme = colStatus === 'Pending' ? {
                        bg: 'from-amber-500/10 to-orange-500/5',
                        border: 'border-amber-200/60',
                        accent: 'bg-amber-500',
                        text: 'text-amber-700',
                        glow: 'rgba(245,158,11,0.2)'
                      } : colStatus === 'In Progress' ? {
                        bg: 'from-indigo-500/10 to-blue-500/5',
                        border: 'border-indigo-200/60',
                        accent: 'bg-indigo-500',
                        text: 'text-indigo-700',
                        glow: 'rgba(79,70,229,0.2)'
                      } : {
                        bg: 'from-emerald-500/10 to-teal-500/5',
                        border: 'border-emerald-200/60',
                        accent: 'bg-emerald-500',
                        text: 'text-emerald-700',
                        glow: 'rgba(16,185,129,0.2)'
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
                                  <div className={`absolute top-0 left-0 bottom-0 w-1 ${
                                    ticket.priority === 'High' ? 'bg-rose-500' : ticket.priority === 'Medium' ? 'bg-amber-500' : 'bg-blue-500'
                                  }`}></div>

                                  <div className="pl-1">
                                    <div className="flex justify-between items-start mb-2">
                                      <div>
                                        <p className="text-sm font-bold text-zinc-900">Room {ticket.room_number}</p>
                                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{ticket.issue}</p>
                                      </div>
                                      <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                        ticket.priority === 'High' ? 'text-rose-600 bg-rose-50 border-rose-100' :
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
                                          className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded border cursor-pointer outline-none transition-colors ${
                                            ticket.assigned_to === 'Unassigned' ? 'bg-rose-50 text-rose-600 border-rose-150' : 'bg-zinc-100 text-zinc-700 border-zinc-200'
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
                  {yieldRules && (
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60 space-y-6">
                      <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                        <Sparkles size={16} className="text-rose-500" />
                        <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider">Preventive Maintenance Automation Rules</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Preventive schedules */}
                        <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-200/40 space-y-4">
                          <div>
                            <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800">Preventive HVAC/Generator Servicing Rules</h4>
                            <p className="text-[10px] text-zinc-400">Specify rules to automatically flag assets for servicing after a specific interval of days.</p>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">AC Servicing Interval (Days)</label>
                              <input 
                                type="number" 
                                value={yieldRules.maintenance_automation.ac_servicing_days}
                                onChange={e => handleSaveYieldRule('maintenance_automation', { ...yieldRules.maintenance_automation, ac_servicing_days: parseInt(e.target.value) || 0 })}
                                className="fd-input py-1.5 px-3 rounded-lg text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Generator Check (Days)</label>
                              <input 
                                type="number" 
                                value={yieldRules.maintenance_automation.generator_check_days}
                                onChange={e => handleSaveYieldRule('maintenance_automation', { ...yieldRules.maintenance_automation, generator_check_days: parseInt(e.target.value) || 0 })}
                                className="fd-input py-1.5 px-3 rounded-lg text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Contractor Auto Routing */}
                        <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-200/40 space-y-4">
                          <div>
                            <div className="flex justify-between items-center mb-2">
                              <h4 className="text-xs font-black uppercase tracking-wider text-zinc-800">Contractor Auto-Routing Engine</h4>
                              <label className="relative inline-flex items-center cursor-pointer select-none">
                                <input 
                                  type="checkbox" 
                                  checked={yieldRules.maintenance_automation.auto_route_contractor}
                                  onChange={e => handleSaveYieldRule('maintenance_automation', { ...yieldRules.maintenance_automation, auto_route_contractor: e.target.checked })}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                              </label>
                            </div>
                            <p className="text-[10px] text-zinc-400">Automatically assign specialized third-party contractors if a support ticket is unassigned for over 2 hours.</p>
                          </div>
                          <div>
                            <label className="text-[9px] font-bold text-zinc-400 uppercase block mb-1">Backup Dispatch Contractor</label>
                            <select 
                              value={yieldRules.maintenance_automation.backup_contractor}
                              onChange={e => handleSaveYieldRule('maintenance_automation', { ...yieldRules.maintenance_automation, backup_contractor: e.target.value })}
                              className="fd-input bg-white border border-zinc-200/60 rounded-xl"
                            >
                              <option value="QuickFix Hospitality Group">QuickFix Hospitality Group</option>
                              <option value="Apex Facilities Management">Apex Facilities Management</option>
                              <option value="Prime Power & Grid Systems">Prime Power & Grid Systems</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB 4: STAFF HUB & SECURITY                 */}
              {/* ============================================ */}
              {activeTab === 'hr' && (
                <motion.div key="hr" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  {/* ─── HEADER: Title + Add Employee Button ─── */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-black text-zinc-900 tracking-tight">Staff Command Center</h2>
                      <p className="text-xs text-zinc-400 mt-0.5">Provision accounts, configure permissions, and monitor shift activity.</p>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setShowOnboardModal(true); setOnboardSuccess(null); setOnboardError(null); }}
                      className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-indigo-500/20 flex items-center gap-2 transition-all"
                    >
                      <Plus size={14} /> Add Employee
                    </motion.button>
                  </div>

                  {/* ─── DEPARTMENT FILTER TABS ─── */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { key: 'ALL', label: 'All Staff' },
                      { key: 'FRONT_DESK', label: 'Front Desk' },
                      { key: 'HOUSEKEEPING', label: 'Housekeeping' },
                      { key: 'ADMIN', label: 'Admin' },
                      { key: 'FINANCE', label: 'Finance' }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => setStaffFilter(tab.key)}
                        className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all ${
                          staffFilter === tab.key
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/15'
                            : 'bg-white text-zinc-500 border border-zinc-200/60 hover:bg-zinc-50 hover:text-zinc-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* ─── LIVE STAFF DIRECTORY GRID ─── */}
                  <div className="space-y-2">
                    {staffPermissions
                      .filter(sp => staffFilter === 'ALL' || sp.role === staffFilter)
                      .map((sp, idx) => {
                        const isOnline = staffShifts.some(s => s.email === sp.email && s.is_active);
                        const initials = (sp.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                        const avatarGradient = {
                          FRONT_DESK: 'from-sky-400 to-blue-500',
                          HOUSEKEEPING: 'from-amber-400 to-orange-500',
                          ADMIN: 'from-indigo-400 to-violet-500',
                          FINANCE: 'from-emerald-400 to-teal-500',
                          RESTAURANT: 'from-rose-400 to-pink-500'
                        }[sp.role] || 'from-zinc-400 to-zinc-500';
                        const roleBadgeColor = {
                          FRONT_DESK: 'bg-sky-50 text-sky-700 border-sky-200',
                          HOUSEKEEPING: 'bg-amber-50 text-amber-700 border-amber-200',
                          ADMIN: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                          FINANCE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                          RESTAURANT: 'bg-rose-50 text-rose-700 border-rose-200'
                        }[sp.role] || 'bg-zinc-50 text-zinc-600 border-zinc-200';

                        return (
                          <motion.div
                            key={sp.id || idx}
                            layoutId={sp.id}
                            onClick={() => setSelectedStaff(sp)}
                            whileHover={{ y: -1, boxShadow: '0 8px 25px -5px rgba(0,0,0,0.08)' }}
                            className="bg-white rounded-2xl p-4 border border-zinc-200/60 shadow-sm cursor-pointer flex items-center gap-4 transition-all group"
                          >
                            {/* Avatar */}
                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-sm`}>
                              {initials}
                            </div>

                            {/* Name & Email */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-zinc-900 truncate">{sp.name}</p>
                              <p className="text-[10px] text-zinc-400 truncate">{sp.email}</p>
                            </div>

                            {/* Role Badge */}
                            <span className={`hidden sm:inline-flex text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${roleBadgeColor}`}>
                              {sp.role}
                            </span>

                            {/* Permissions Quick Glance */}
                            <div className="hidden md:flex items-center gap-1.5">
                              {sp.can_process_refunds && <span className="text-[8px] font-bold bg-teal-50 text-teal-600 border border-teal-200 px-1.5 py-0.5 rounded">Refunds</span>}
                              {sp.can_apply_discounts && <span className="text-[8px] font-bold bg-violet-50 text-violet-600 border border-violet-200 px-1.5 py-0.5 rounded">Discounts</span>}
                              {sp.can_overbook && <span className="text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-200 px-1.5 py-0.5 rounded">Overbook</span>}
                            </div>

                            {/* Status Dot */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-300'}`} />
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${isOnline ? 'text-emerald-600' : 'text-zinc-400'}`}>
                                {isOnline ? 'Online' : 'Offline'}
                              </span>
                            </div>

                            {/* Chevron */}
                            <ChevronDown size={14} className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0" />
                          </motion.div>
                        );
                      })}

                    {staffPermissions.filter(sp => staffFilter === 'ALL' || sp.role === staffFilter).length === 0 && (
                      <div className="text-center py-12 text-zinc-400 text-xs">
                        <Users size={28} className="mx-auto mb-2 opacity-40" />
                        No staff members found for this department.
                      </div>
                    )}
                  </div>

                  {/* ─── BOTTOM: SHIFT LOGS + KPIS ─── */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active shift monitor */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60 space-y-4">
                      <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                        <div className="flex items-center gap-2">
                          <Clock size={16} className="text-indigo-600" />
                          <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider">Shift Logs & Sessions</h3>
                        </div>
                        <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Recent</span>
                      </div>
                      
                      <div className="space-y-2 overflow-y-auto max-h-80 fd-sidebar-scroll pr-1">
                        {staffShifts.map((shift, idx) => {
                          const shiftInitials = (shift.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
                          const shiftGradient = {
                            FRONT_DESK: 'from-sky-400 to-blue-500',
                            HOUSEKEEPING: 'from-amber-400 to-orange-500',
                            ADMIN: 'from-indigo-400 to-violet-500',
                            FINANCE: 'from-emerald-400 to-teal-500'
                          }[shift.role] || 'from-zinc-400 to-zinc-500';
                          return (
                            <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/40 hover:bg-zinc-50 transition-colors">
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${shiftGradient} flex items-center justify-center text-white text-[10px] font-black shrink-0`}>
                                {shiftInitials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-zinc-900 truncate">{shift.name}</p>
                                <p className="text-[9px] text-zinc-400 font-mono">
                                  {new Date(shift.login_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                </p>
                              </div>
                              <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                shift.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                              }`}>
                                {shift.is_active ? 'ACTIVE' : 'ENDED'}
                              </span>
                            </div>
                          );
                        })}
                        {staffShifts.length === 0 && (
                          <p className="text-center text-zinc-400 text-xs py-6">No shift data available yet.</p>
                        )}
                      </div>
                    </div>

                    {/* Performance KPIs */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60 space-y-4">
                      <div className="flex items-center gap-2 border-b border-zinc-100 pb-3">
                        <TrendingUp size={16} className="text-indigo-600" />
                        <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider">Department Performance</h3>
                      </div>
                      {analyticsData && analyticsData.staffKPIs ? (
                        <div className="space-y-3">
                          {analyticsData.staffKPIs.map((kpi, idx) => (
                            <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/40">
                              <span className="text-xs font-bold text-zinc-700">{kpi.name}</span>
                              <div className="text-right">
                                <p className="text-sm font-mono font-black text-zinc-900">{kpi.metric}</p>
                                <p className="text-[9px] text-emerald-600 font-bold uppercase">{kpi.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-10 text-zinc-400 text-xs">
                          <Activity size={28} className="mx-auto mb-2 opacity-40" />
                          KPI analytics will populate once shift data is available.
                        </div>
                      )}
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
                          className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-[60]"
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
                          <div className="p-6 border-b border-zinc-100">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Employee Profile</h3>
                              <button onClick={() => setSelectedStaff(null)} className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
                                <X size={14} className="text-zinc-600" />
                              </button>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${
                                { FRONT_DESK: 'from-sky-400 to-blue-500', HOUSEKEEPING: 'from-amber-400 to-orange-500', ADMIN: 'from-indigo-400 to-violet-500', FINANCE: 'from-emerald-400 to-teal-500' }[selectedStaff.role] || 'from-zinc-400 to-zinc-500'
                              } flex items-center justify-center text-white text-lg font-black shadow-md`}>
                                {(selectedStaff.name || '').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                              <div>
                                <p className="text-base font-black text-zinc-900">{selectedStaff.name}</p>
                                <p className="text-xs text-zinc-400">{selectedStaff.email}</p>
                              </div>
                            </div>
                          </div>

                          {/* Drawer Body — Scrollable */}
                          <div className="flex-1 overflow-y-auto fd-sidebar-scroll p-6 space-y-6">
                            
                            {/* Role Selector */}
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-2">Operational Role</label>
                              <select
                                value={selectedStaff.role}
                                onChange={e => {
                                  const newRole = e.target.value;
                                  handleSavePermissions(selectedStaff.id, { role: newRole, can_process_refunds: selectedStaff.can_process_refunds, can_apply_discounts: selectedStaff.can_apply_discounts, can_overbook: selectedStaff.can_overbook });
                                  setSelectedStaff({ ...selectedStaff, role: newRole });
                                  setStaffPermissions(prev => prev.map(s => s.id === selectedStaff.id ? { ...s, role: newRole } : s));
                                }}
                                className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl px-4 py-2.5 text-xs font-bold text-zinc-800 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                              >
                                <option value="FRONT_DESK">FRONT_DESK (Front Desk)</option>
                                <option value="HOUSEKEEPING">HOUSEKEEPING</option>
                                <option value="FINANCE">FINANCE</option>
                                <option value="ADMIN">ADMIN (Manager)</option>
                              </select>
                            </div>

                            {/* Permission Toggles */}
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-3">Granular Permissions</label>
                              <div className="space-y-2">
                                {[
                                  { key: 'can_process_refunds', label: 'Process Refunds', desc: 'Allow this operator to issue financial refunds' },
                                  { key: 'can_apply_discounts', label: 'Apply Discounts', desc: 'Allow rate adjustments and promotional discounts' },
                                  { key: 'can_overbook', label: 'Override Overbooking', desc: 'Allow booking beyond capacity limits' }
                                ].map(perm => (
                                  <div key={perm.key} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50/70 border border-zinc-200/40">
                                    <div>
                                      <p className="text-xs font-bold text-zinc-800">{perm.label}</p>
                                      <p className="text-[9px] text-zinc-400">{perm.desc}</p>
                                    </div>
                                    <button
                                      onClick={() => {
                                        const newVal = !selectedStaff[perm.key];
                                        const updated = { ...selectedStaff, [perm.key]: newVal };
                                        handleSavePermissions(selectedStaff.id, { role: updated.role, can_process_refunds: updated.can_process_refunds, can_apply_discounts: updated.can_apply_discounts, can_overbook: updated.can_overbook });
                                        setSelectedStaff(updated);
                                        setStaffPermissions(prev => prev.map(s => s.id === selectedStaff.id ? { ...s, [perm.key]: newVal } : s));
                                      }}
                                      className={`w-10 h-5 rounded-full relative transition-all duration-300 ${selectedStaff[perm.key] ? 'bg-indigo-600' : 'bg-zinc-300'}`}
                                    >
                                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${selectedStaff[perm.key] ? 'left-[22px]' : 'left-0.5'}`} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Shift History for this employee */}
                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-3">Recent Sessions</label>
                              <div className="space-y-2">
                                {staffShifts.filter(s => s.email === selectedStaff.email).slice(0, 6).map((shift, idx) => (
                                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50/70 border border-zinc-200/40 text-xs">
                                    <div>
                                      <p className="font-mono text-zinc-700 text-[10px]">
                                        {new Date(shift.login_time).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })} · {new Date(shift.login_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                      </p>
                                    </div>
                                    <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                                      shift.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                                    }`}>
                                      {shift.is_active ? 'ACTIVE' : 'ENDED'}
                                    </span>
                                  </div>
                                ))}
                                {staffShifts.filter(s => s.email === selectedStaff.email).length === 0 && (
                                  <p className="text-[10px] text-zinc-400 text-center py-4">No session history for this employee.</p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Drawer Footer — Danger Zone */}
                          <div className="p-6 border-t border-zinc-100">
                            <button
                              onClick={() => { handleHROffboard(selectedStaff.id); setSelectedStaff(null); }}
                              className="w-full bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                              <UserX size={14} /> Offboard & Revoke Access
                            </button>
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
                          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 20 }}
                          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                          className="fixed inset-0 flex items-center justify-center z-[70] p-4"
                        >
                          <div className="bg-white/98 backdrop-blur-xl rounded-[2rem] shadow-2xl border border-zinc-200/60 w-full max-w-lg p-8 relative">
                            {/* Close */}
                            <button onClick={() => setShowOnboardModal(false)} className="absolute top-5 right-5 w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center transition-colors">
                              <X size={14} className="text-zinc-600" />
                            </button>

                            {/* Header */}
                            <div className="mb-6">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20">
                                <UserCheck size={22} />
                              </div>
                              <h3 className="text-lg font-black text-zinc-900 tracking-tight">Provision New Employee</h3>
                              <p className="text-xs text-zinc-400 mt-1">Create login credentials for the new hire. They'll be able to log in immediately.</p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleHROnboard} className="space-y-4">
                              <div>
                                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">Full Name</label>
                                <input
                                  type="text" required placeholder="e.g. Rahul Sharma"
                                  value={onboardForm.name}
                                  onChange={e => setOnboardForm({ ...onboardForm, name: e.target.value })}
                                  className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl px-4 py-2.5 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">Email</label>
                                  <input
                                    type="email" required placeholder="rahul@hotel.com"
                                    value={onboardForm.email}
                                    onChange={e => setOnboardForm({ ...onboardForm, email: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl px-4 py-2.5 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">Temp Password</label>
                                  <input
                                    type="password" required placeholder="••••••••"
                                    value={onboardForm.password}
                                    onChange={e => setOnboardForm({ ...onboardForm, password: e.target.value })}
                                    className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl px-4 py-2.5 text-xs text-zinc-800 placeholder:text-zinc-400 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all"
                                  />
                                </div>
                              </div>
                              <div>
                                <label className="block text-[10px] font-black uppercase text-zinc-400 tracking-wider mb-1.5">Operational Role</label>
                                <select
                                  value={onboardForm.role}
                                  onChange={e => setOnboardForm({ ...onboardForm, role: e.target.value })}
                                  className="w-full bg-zinc-50 border border-zinc-200/60 rounded-xl px-4 py-2.5 text-xs text-zinc-800 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 transition-all appearance-none cursor-pointer"
                                >
                                  <option value="FRONT_DESK">FRONT_DESK (Front Desk)</option>
                                  <option value="HOUSEKEEPING">HOUSEKEEPING (Cleaning)</option>
                                  <option value="FINANCE">FINANCE</option>
                                  <option value="ADMIN">ADMIN (Manager)</option>
                                </select>
                              </div>

                              {/* Feedback */}
                              {onboardSuccess && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-xl text-center flex items-center justify-center gap-2">
                                  <CheckCircle size={14} /> {onboardSuccess}
                                </motion.div>
                              )}
                              {onboardError && (
                                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl text-center">
                                  {onboardError}
                                </motion.div>
                              )}

                              <motion.button
                                type="submit"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm py-3 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                              >
                                <Plus size={14} /> Provision Account
                              </motion.button>
                            </form>
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
                <button onClick={() => setIsAddTicketModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><X size={20}/></button>
              </div>

              <form onSubmit={handleAddTicket} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Target Asset</label>
                  <select 
                    required 
                    value={newTicketForm.room_id} 
                    onChange={e => setNewTicketForm({...newTicketForm, room_id: e.target.value})} 
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
                    onChange={e => setNewTicketForm({...newTicketForm, issue: e.target.value})} 
                    className="fd-input resize-none bg-white" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Priority</label>
                    <select 
                      value={newTicketForm.priority} 
                      onChange={e => setNewTicketForm({...newTicketForm, priority: e.target.value})} 
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
                      onChange={e => setNewTicketForm({...newTicketForm, assigned_to: e.target.value})} 
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
                <button onClick={() => setIsAddRoomModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><X size={20}/></button>
              </div>

              <form onSubmit={handleAddRoom} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2 font-mono">Classification</label>
                  <select 
                    required 
                    value={newRoomForm.room_type_id} 
                    onChange={e => setNewRoomForm({...newRoomForm, room_type_id: e.target.value})} 
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
                    onChange={e => setNewRoomForm({...newRoomForm, room_number: e.target.value})} 
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