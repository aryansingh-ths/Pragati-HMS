import React, { useState, useEffect, useId, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Plane, MapPin, Users, Wallet, Clock, CheckCircle2, AlertTriangle, RefreshCw,
  Download, Plus, X, Loader2, Search, Filter, TrendingUp, Building2, ArrowUpRight,
  ShieldCheck, PieChart, Compass, CalendarClock, Phone, Mail, Star, Ban, CreditCard, LogOut, Zap, Car
} from 'lucide-react';

const API_BASE = 'http://localhost:3000';
const getToken = () => sessionStorage.getItem('hms_token');
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` });

// Standard Currency Formatter
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// Compact Currency Formatter (for KPIs and tight spaces)
const shortInr = (n) => {
  const num = Number(n || 0);
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString('en-IN')}`;
};

// =============================================
// SVG DONUT CHART (package popularity)
// =============================================
function DonutChart({ data, size = 170, centerLabel = 'Booked' }) {
  const total = data.reduce((sum, d) => sum + Number(d.value), 0);
  if (total === 0) return <div className="flex items-center justify-center text-zinc-400 text-sm" style={{ width: size, height: size }}>No Data</div>;

  const radius = 62;
  const strokeWidth = 20;
  const cx = size / 2;
  const cy = size / 2;

  const getCoord = (percent) => {
    const angle = percent * 2 * Math.PI - Math.PI / 2;
    return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.reduce((acc, segment, i) => {
          const percent = Number(segment.value) / total;
          if (percent === 0) return acc;
          const startAngle = acc.cumulativePercent;
          acc.cumulativePercent += percent;
          const endAngle = acc.cumulativePercent;
          const start = getCoord(startAngle);
          const end = getCoord(endAngle);
          const largeArc = percent > 0.5 ? 1 : 0;
          const d = `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
          acc.elements.push(
            <motion.path
              key={i} d={d} fill="none" stroke={segment.color} strokeWidth={strokeWidth} strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: i * 0.1 }}
              style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
              whileHover={{ strokeWidth: strokeWidth + 4 }}
            />
          );
          return acc;
        }, { cumulativePercent: 0, elements: [] }).elements}
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-zinc-900" style={{ fontSize: '20px', fontWeight: 900 }}>{shortInr(total).replace('₹', '₹')}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{centerLabel}</text>
      </svg>
    </div>
  );
}

// =============================================
// GENERIC TREND LINE (booking revenue, 7-day)
// =============================================
function TrendLine({ data = [], from = '#fb923c', to = '#c2410c', areaColor = '#f97316', dotStroke = '#c2410c' }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const width = 600, height = 160, padX = 24, padY = 20;
  const max = Math.max(...data.map(t => Number(t.value)), 1);
  const min = Math.min(...data.map(t => Number(t.value)), 0);
  const range = max - min || 1;

  const points = data.map((t, i) => {
    const x = padX + (i / (data.length - 1 || 1)) * (width - padX * 2);
    const y = padY + (1 - (Number(t.value) - min) / range) * (height - padY * 2);
    return { ...t, x, y };
  });
  const linePath = points.map((p, i) => (i === 0 ? `M${p.x} ${p.y}` : ` L${p.x} ${p.y}`)).join('');
  const areaPath = `${linePath} L${points[points.length - 1]?.x || 0} ${height - padY} L${points[0]?.x || 0} ${height - padY} Z`;
  const active = hoverIdx !== null ? points[hoverIdx] : null;

  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 overflow-visible" onMouseLeave={() => setHoverIdx(null)}>
        <defs>
          <linearGradient id={`trvA-${uid}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={areaColor} stopOpacity="0.26" />
            <stop offset="100%" stopColor={areaColor} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`trvL-${uid}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={i} x1={padX} x2={width - padX} y1={padY + f * (height - padY * 2)} y2={padY + f * (height - padY * 2)} stroke="#f1f2f6" strokeWidth="1" />
        ))}
        <motion.path d={areaPath} fill={`url(#trvA-${uid})`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} />
        <motion.path d={linePath} fill="none" stroke={`url(#trvL-${uid})`} strokeWidth={active ? 3.5 : 2.5} strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: 'easeOut' }} />
        {points.map((p, i) => (
          <g key={i}>
            <rect x={p.x - (width / data.length) / 2} y={0} width={width / data.length} height={height} fill="transparent" onMouseEnter={() => setHoverIdx(i)} />
            <motion.circle cx={p.x} cy={p.y} initial={{ r: 3 }} fill="#ffffff" stroke={dotStroke}
              strokeWidth={hoverIdx === i ? 3 : 2} animate={{ r: hoverIdx === i ? 6 : 3 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }} style={{ cursor: 'pointer' }} />
          </g>
        ))}
      </svg>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute pointer-events-none px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white text-[10px] font-bold shadow-lg whitespace-nowrap"
            style={{ left: `${(active.x / width) * 100}%`, top: `${(active.y / height) * 100}%`, transform: 'translate(-50%, -140%)' }}
          >
            {active.label}: <span className="text-orange-300">{shortInr(active.value)}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between mt-1 px-1">
        {data.map((t, i) => (
          <span key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
            className={`text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all duration-200 ${hoverIdx === i ? 'text-[#D4A373]' : 'text-zinc-400'}`}>
            {t.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// =============================================
// HORIZONTAL BAR RANK CHART (package popularity by revenue)
// =============================================
function BarRankChart({ data = [] }) {
  const sorted = [...data].sort((a, b) => Number(b.value) - Number(a.value));
  const max = Math.max(...sorted.map(d => Number(d.value)), 1);
  return (
    <div className="flex flex-col gap-3.5">
      {sorted.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ background: d.color }}>
            <Compass size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-zinc-600 truncate">{d.label}</span>
              <span className="text-[11px] font-black text-zinc-900 shrink-0 ml-2">{shortInr(d.value)}</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(Number(d.value) / max) * 100}%` }}
                transition={{ duration: 0.9, delay: i * 0.06, ease: 'easeOut' }} className="h-full rounded-full" style={{ background: d.color }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =============================================
// KPI GRAPHIC RENDERER
// =============================================
const kpiGraphic = (i, color, pct = null) => {
  const kind = i % 4;

  if (kind === 0) {
    return (
      <div className="relative flex items-center justify-center shrink-0 ml-2 sm:ml-4">
        <svg className="w-12 h-12 sm:w-14 sm:h-14 rotate-[-90deg]">
          <circle cx="50%" cy="50%" r="20" fill="none" stroke={`${color}22`} strokeWidth="4" />
          <motion.circle cx="50%" cy="50%" r="20" fill="none" strokeWidth="4.5" stroke={color}
            strokeDasharray={2 * Math.PI * 20}
            initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
            animate={{ strokeDashoffset: pct !== null ? (2 * Math.PI * 20) * (1 - pct) : (2 * Math.PI * 20) * 0.28 }}
            transition={{ duration: 1.3, ease: 'easeOut' }}
            strokeLinecap="round" />
        </svg>
        {pct !== null && <span className="absolute text-[9px] font-black" style={{ color }}>{Math.round(pct * 100)}%</span>}
      </div>
    );
  }
  if (kind === 1) {
    return (
      <div className="shrink-0 ml-2 sm:ml-4 border rounded-xl bg-white p-1.5 shadow-sm" style={{ borderColor: `${color}33` }}>
        <svg className="w-12 h-8 sm:w-16 sm:h-9 overflow-visible" viewBox="0 0 60 32">
          <motion.path d="M0 22 Q8 6, 16 16 T32 3 T48 12 T60 8" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeOut' }} />
          <motion.circle cx="60" cy="8" r="3" fill={color} initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} transition={{ duration: 0.5, delay: 1.3 }} />
        </svg>
      </div>
    );
  }
  if (kind === 2) {
    return (
      <div className="flex gap-1 sm:gap-1.5 h-6 sm:h-7 items-end shrink-0 ml-2 sm:ml-4 border rounded-xl bg-white px-2 py-1.5 shadow-sm" style={{ borderColor: `${color}33` }}>
        {[...Array(5)].map((_, idx) => (
          <motion.div key={idx} className="w-2 sm:w-2.5 rounded-t-md" style={{ background: idx < 3 ? color : '#e4e4e7' }}
            initial={{ height: 0 }} animate={{ height: idx < 3 ? '16px' : '6px' }}
            transition={{ duration: 0.6, delay: idx * 0.08, type: 'spring', stiffness: 200 }} />
        ))}
      </div>
    );
  }
  return (
    <div className="shrink-0 ml-2 sm:ml-4 border rounded-xl bg-white p-1.5 shadow-sm" style={{ borderColor: `${color}33` }}>
      <svg className="w-12 h-8 sm:w-16 sm:h-9 overflow-visible" viewBox="0 0 60 32">
        <defs>
          <linearGradient id={`kpiYieldFill-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path d="M0 25 L12 18 L24 22 L36 10 L48 14 L60 4 V32 H0 Z" fill={`url(#kpiYieldFill-${color.replace('#', '')})`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} />
        <motion.path d="M0 25 L12 18 L24 22 L36 10 L48 14 L60 4" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }} />
        <motion.circle cx="60" cy="4" r="3" fill={color} initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} transition={{ duration: 0.5, delay: 1.5 }} />
      </svg>
    </div>
  );
};

const PACKAGE_PALETTE = ['#f97316', '#0ea5e9', '#ec4899', '#10b981', '#6366f1', '#eab308'];
const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 28, stiffness: 350 } },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.2 } }
};

// =============================================
// MAIN COMPONENT
// =============================================
export default function TravelDashboard() {
  const getAccessLevel = () => {
    let raw = sessionStorage.getItem('hms_access_level');
    if (raw && raw !== 'undefined' && raw !== 'null') return raw;
    let role = (sessionStorage.getItem('hms_role') || '').toUpperCase();
    if (role === 'SUPER_ADMIN') return 'SUPER_ADMIN';
    if (role === 'ADMIN') return 'ADMIN';
    if (role === 'MANAGER') return 'MANAGER';
    return 'EXECUTIVE';
  };
  const accessLevel = getAccessLevel();

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
  const [activeTab, setActiveTab] = useState(accessLevel === 'EXECUTIVE' ? 'bookings' : 'overview');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Overview state
  const [kpis, setKpis] = useState(null);
  const [trend, setTrend] = useState([]);
  const [popularity, setPopularity] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);

  // Packages state
  const [packages, setPackages] = useState([]);
  const [packagesLoaded, setPackagesLoaded] = useState(false);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState(false);
  const [packageForm, setPackageForm] = useState({ name: '', destination: '', description: '', category: 'Leisure', price: '', duration_days: '', max_travelers: '' });

  // Bookings state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoaded, setBookingsLoaded] = useState(false);
  const [bookingSearch, setBookingSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingForm, setBookingForm] = useState({ package_id: '', guest_name: '', guest_email: '', guest_phone: '', travelers_count: 1, travel_date: '', payment_status: 'Pending' });

  // Customers state
  const [customers, setCustomers] = useState([]);
  const [customersLoaded, setCustomersLoaded] = useState(false);

  // Vehicles state
  const [vehicles, setVehicles] = useState([]);
  const [vehiclesLoaded, setVehiclesLoaded] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [vehicleForm, setVehicleForm] = useState({ model: '', type: 'Sedan', registration_number: '', capacity: 4, price_per_day: '' });

  // Vehicle Bookings state
  const [vehicleBookings, setVehicleBookings] = useState([]);
  const [vehicleBookingsLoaded, setVehicleBookingsLoaded] = useState(false);
  const [isVehicleBookingModalOpen, setIsVehicleBookingModalOpen] = useState(false);
  const [vehicleBookingForm, setVehicleBookingForm] = useState({ vehicle_id: '', guest_name: '', guest_phone: '', travel_date: '', amount: '', payment_status: 'Pending' });

  // --- Data fetchers ---
  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/travel/overview`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load overview');
      setKpis(json.data.kpis);
      setTrend(json.data.trend.map(t => ({ label: t.label, value: Number(t.value) })));
      setPopularity(json.data.popularity.map((p, i) => ({ label: p.label, value: Number(p.value), color: PACKAGE_PALETTE[i % PACKAGE_PALETTE.length] })));
      setRecentBookings(json.data.recentBookings);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  }, []);

  const fetchPackages = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/travel/packages`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load packages');
      setPackages(json.data.packages);
      setPackagesLoaded(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  }, []);

  const fetchBookings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (bookingStatusFilter !== 'All') params.set('status', bookingStatusFilter);
      if (bookingSearch) params.set('search', bookingSearch);
      const res = await fetch(`${API_BASE}/api/travel/bookings?${params.toString()}`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load bookings');
      setBookings(json.data.bookings);
      setBookingsLoaded(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  }, [bookingStatusFilter, bookingSearch]);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/travel/customers`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load customers');
      setCustomers(json.data.customers);
      setCustomersLoaded(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  }, []);

  const fetchVehicles = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/travel/vehicles`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load vehicles');
      setVehicles(json.data.vehicles);
      setVehiclesLoaded(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  }, []);

  const fetchVehicleBookings = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/travel/vehicle-bookings`, { headers: authHeaders() });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to load vehicle bookings');
      setVehicleBookings(json.data.bookings);
      setVehicleBookingsLoaded(true);
      setErrorMsg('');
    } catch (err) {
      setErrorMsg(err.message);
    }
  }, []);

  useEffect(() => { fetchOverview(); }, [fetchOverview]);
  useEffect(() => {
    if (activeTab === 'packages' && !packagesLoaded) fetchPackages();
    if (activeTab === 'bookings' && !bookingsLoaded) fetchBookings();
    if (activeTab === 'customers' && !customersLoaded) fetchCustomers();
    if (activeTab === 'vehicles' && !vehiclesLoaded) fetchVehicles();
    if (activeTab === 'vehicleBookings' && !vehicleBookingsLoaded) fetchVehicleBookings();
  }, [activeTab, packagesLoaded, bookingsLoaded, customersLoaded, vehiclesLoaded, vehicleBookingsLoaded, fetchPackages, fetchBookings, fetchCustomers, fetchVehicles, fetchVehicleBookings]);

  // Re-fetch bookings whenever search/filter changes (only once loaded once)
  useEffect(() => {
    if (activeTab === 'bookings' && bookingsLoaded) {
      const t = setTimeout(() => fetchBookings(), 300);
      return () => clearTimeout(t);
    }
  }, [bookingSearch, bookingStatusFilter]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = async () => {
    setIsLoading(true);
    if (activeTab === 'overview') await fetchOverview();
    else if (activeTab === 'packages') await fetchPackages();
    else if (activeTab === 'bookings') await fetchBookings();
    else if (activeTab === 'customers') await fetchCustomers();
    else if (activeTab === 'vehicles') await fetchVehicles();
    else if (activeTab === 'vehicleBookings') await fetchVehicleBookings();
    setTimeout(() => setIsLoading(false), 400);
  };

  // --- Form handlers ---
  const handleAddPackage = async (e) => {
    e.preventDefault();
    if (!packageForm.name || !packageForm.destination || !packageForm.price) return;
    try {
      const res = await fetch(`${API_BASE}/api/travel/packages`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          ...packageForm,
          price: Number(packageForm.price),
          duration_days: Number(packageForm.duration_days) || 3,
          max_travelers: Number(packageForm.max_travelers) || 4,
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create package');
      setIsPackageModalOpen(false);
      setPackageForm({ name: '', destination: '', description: '', category: 'Leisure', price: '', duration_days: '', max_travelers: '' });
      fetchPackages();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleTogglePackage = async (id) => {
    try {
      await fetch(`${API_BASE}/api/travel/packages/${id}/toggle-active`, { method: 'PATCH', headers: authHeaders() });
      fetchPackages();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleAddBooking = async (e) => {
    e.preventDefault();
    if (!bookingForm.package_id || !bookingForm.guest_name || !bookingForm.travel_date) return;
    try {
      const res = await fetch(`${API_BASE}/api/travel/bookings`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ ...bookingForm, travelers_count: Number(bookingForm.travelers_count) || 1 })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create booking');
      setIsBookingModalOpen(false);
      setBookingForm({ package_id: '', guest_name: '', guest_email: '', guest_phone: '', travelers_count: 1, travel_date: '', payment_status: 'Pending' });
      fetchBookings();
      fetchOverview();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleUpdateBookingStatus = async (id, patch) => {
    try {
      await fetch(`${API_BASE}/api/travel/bookings/${id}/status`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(patch) });
      fetchBookings();
      fetchOverview();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();
    if (!vehicleForm.model || !vehicleForm.price_per_day) return;
    try {
      const res = await fetch(`${API_BASE}/api/travel/vehicles`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          ...vehicleForm,
          price_per_day: Number(vehicleForm.price_per_day),
          capacity: Number(vehicleForm.capacity) || 4,
        })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create vehicle');
      setIsVehicleModalOpen(false);
      setVehicleForm({ model: '', type: 'Sedan', registration_number: '', capacity: 4, price_per_day: '' });
      fetchVehicles();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleToggleVehicle = async (id) => {
    try {
      await fetch(`${API_BASE}/api/travel/vehicles/${id}/toggle-active`, { method: 'PATCH', headers: authHeaders() });
      fetchVehicles();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleAddVehicleBooking = async (e) => {
    e.preventDefault();
    if (!vehicleBookingForm.vehicle_id || !vehicleBookingForm.guest_name || !vehicleBookingForm.travel_date || !vehicleBookingForm.amount) return;
    try {
      const res = await fetch(`${API_BASE}/api/travel/vehicle-bookings`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ ...vehicleBookingForm, amount: Number(vehicleBookingForm.amount) })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to create vehicle booking');
      setIsVehicleBookingModalOpen(false);
      setVehicleBookingForm({ vehicle_id: '', guest_name: '', guest_phone: '', travel_date: '', amount: '', payment_status: 'Pending' });
      fetchVehicleBookings();
      fetchOverview();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleUpdateVehicleBookingStatus = async (id, patch) => {
    try {
      await fetch(`${API_BASE}/api/travel/vehicle-bookings/${id}/status`, { method: 'PATCH', headers: authHeaders(), body: JSON.stringify(patch) });
      fetchVehicleBookings();
      fetchOverview();
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const navGroups = [
    {
      heading: 'Packages & Sales',
      items: [
        ...(accessLevel !== 'EXECUTIVE' ? [{ key: 'overview', label: 'Travel Overview', icon: <Compass size={15} /> }] : []),
        { key: 'packages', label: 'Package Catalog', icon: <Plane size={15} /> },
        { key: 'bookings', label: 'Bookings & Purchases', icon: <CalendarClock size={15} /> },
        ...(accessLevel !== 'EXECUTIVE' ? [{ key: 'customers', label: 'Customers', icon: <Users size={15} /> }] : []),
      ],
    },
    {
      heading: 'Vehicle Fleet',
      items: [
        { key: 'vehicles', label: 'Private Vehicles', icon: <Car size={15} /> },
        { key: 'vehicleBookings', label: 'Vehicle Bookings', icon: <CalendarClock size={15} /> },
      ],
    },
  ];

  // Enhanced Theme Map aligning with Sales/Admin
  const enhancedThemeMap = {
    indigo: { gradient: 'from-indigo-50 via-white to-white', ring: 'ring-indigo-500/10', glow: 'rgba(79,70,229,0.35)', iconBg: 'bg-[#4f46e5] text-white shadow-lg shadow-[#4f46e5]/30' },
    emerald: { gradient: 'from-emerald-50 via-white to-white', ring: 'ring-emerald-500/10', glow: 'rgba(16,185,129,0.35)', iconBg: 'bg-[#10b981] text-white shadow-lg shadow-[#10b981]/30' },
    amber: { gradient: 'from-amber-50 via-white to-white', ring: 'ring-amber-500/10', glow: 'rgba(245,158,11,0.35)', iconBg: 'bg-[#f59e0b] text-white shadow-lg shadow-[#f59e0b]/30' },
    rose: { gradient: 'from-rose-50 via-white to-white', ring: 'ring-rose-500/10', glow: 'rgba(225,29,72,0.35)', iconBg: 'bg-[#e11d48] text-white shadow-lg shadow-[#e11d48]/30' },
    sky: { gradient: 'from-sky-50 via-white to-white', ring: 'ring-sky-500/10', glow: 'rgba(14,165,233,0.35)', iconBg: 'bg-[#0ea5e9] text-white shadow-lg shadow-[#0ea5e9]/30' },
    violet: { gradient: 'from-violet-50 via-white to-white', ring: 'ring-violet-500/10', glow: 'rgba(139,92,246,0.35)', iconBg: 'bg-[#8b5cf6] text-white shadow-lg shadow-[#8b5cf6]/30' },
    orange: { gradient: 'from-orange-50 via-white to-white', ring: 'ring-orange-500/10', glow: 'rgba(212,163,115,0.35)', iconBg: 'bg-[#D4A373] text-white shadow-lg shadow-[#D4A373]/30' }
  };

  const overviewKpis = kpis ? [
    { label: 'Total Bookings', value: kpis.total_bookings, sub: 'Active + completed', icon: <CalendarClock size={16} />, theme: 'orange', graphicIndex: 0, pct: null },
    { label: 'Revenue This Month', value: shortInr(kpis.revenue_this_month), sub: 'From confirmed packages', icon: <Wallet size={16} />, theme: 'emerald', graphicIndex: 1, pct: null },
    { label: 'Upcoming Departures', value: kpis.upcoming_departures, sub: 'Confirmed & scheduled', icon: <Plane size={16} />, theme: 'sky', graphicIndex: 2, pct: null },
    { label: 'Pending Payments', value: shortInr(kpis.pending_payments_value), sub: `${kpis.pending_payments_count} booking${kpis.pending_payments_count === '1' ? '' : 's'} awaiting balance`, icon: <Clock size={16} />, theme: 'rose', graphicIndex: 3, pct: null },
  ] : [];

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

        .fd-dealdeck-sidebar { background: #FFFFFF; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); border: 1px solid rgba(226, 232, 240, 0.8); }
        .fd-dealdeck-card { background: #FFFFFF; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0px 18px 40px 0px rgba(112, 144, 176, 0.08); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .fd-icon-btn { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); display: inline-flex; }
        .group:hover .fd-icon-btn { transform: translateY(-1px) scale(1.12) rotate(-6deg); }
        .fd-glass-backdrop { background: rgba(24, 24, 27, 0.4); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .fd-glass-modal { background: rgba(255, 255, 255, 0.98); border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 30px 70px -12px rgba(112, 144, 176, 0.25); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
        .fd-input { width: 100%; padding: 0.75rem 1.1rem; background: #F4F7FE; border: 1px solid #E2E8F0; border-radius: 1rem; font-size: 0.875rem; font-weight: 500; outline: none; transition: border 0.3s; }
        .fd-input:focus { border-color: #D4A373; }
      `}</style>

      {/* ═══════════════════════════════════════════════════════
          LEFT FLOATING SIDEBAR
          ═══════════════════════════════════════════════════════ */}
      <div className="w-full lg:w-72 shrink-0 rounded-[2rem] p-6 flex flex-col gap-6 fd-dealdeck-sidebar lg:fixed lg:top-[7.5rem] lg:left-6 z-30 lg:h-[calc(100vh-7.8rem)]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-xs shrink-0">
            <Plane size={19} className="text-[#D4A373]" />
          </div>
          <div>
            <h1 className="font-serif font-black text-[25px] text-zinc-500 text-base leading-none">Travel Desk</h1>
            <span className="text-[9px] font-bold text-[#D4A373] uppercase tracking-widest mt-1 block">Packages &amp; Purchases</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto fd-sidebar-scroll pr-1 justify-start">
          {navGroups.map(group => (
            <div key={group.heading}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">{group.heading}</p>
              <div className="flex flex-col gap-1">
                {group.items.map(item => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === item.key ? 'bg-[#D4A373] text-zinc-900 shadow-md shadow-[#D4A373]/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                      }`}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Command Center</p>
            <button
              onClick={() => navigate('/dashboard/admin')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 hover:text-[#D4A373] transition-all text-left"
            >
              <span className="flex items-center gap-3"><Building2 size={15} /> Back to Admin</span>
              <ArrowUpRight size={14} className="opacity-50" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-zinc-50 to-white border border-zinc-100 p-4 flex items-start gap-3 mt-auto">
          <ShieldCheck size={18} className="text-[#D4A373] shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-zinc-900 leading-tight">Season pacing on track</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">No overdue payment escalations today.</p>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          MAIN WORKSPACE CANVAS
          ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden min-w-0 lg:ml-[21rem]">

        {/* HEADER RIBBON */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-zinc-500 tracking-tight mt-0.5">
              {{ overview: 'Travel Overview', packages: 'Package Catalog', bookings: 'Bookings & Purchases', customers: 'Customers' }[activeTab]}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {{
                overview: 'Live booking pace, revenue and package popularity.',
                packages: 'Manage the travel packages available for sale.',
                bookings: 'Every package purchase made by guests and corporate accounts.',
                customers: 'Purchase history rolled up by traveler.',
              }[activeTab]}
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-50 border border-[#D4A373]/30 text-[#D4A373]">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D4A373]" />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider">Desk Live</span>
            </div>

            <button onClick={refresh} className={`p-2.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-500 transition-all ${isLoading ? 'animate-spin' : ''}`}>
              <RefreshCw size={15} />
            </button>

            <button className="bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#D4A373] transition-colors flex items-center gap-2 shadow-sm">
              <Download size={14} /> Export
            </button>

            {/* Profile Avatar Widget */}
            {(() => {
              const staffName = sessionStorage.getItem('hms_name') || 'Staff';
              const initials = staffName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ST';
              let designation = 'Travel Desk admin';
              try {
                const user = JSON.parse(sessionStorage.getItem('hms_user'));
                if (user && user.designation) designation = user.designation;
              } catch (e) { console.error(e); }
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-sky-600 group-hover:from-rose-500 group-hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-xs transition-colors">
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

        {errorMsg && (
          <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-semibold">
            <AlertTriangle size={14} /> {errorMsg}
          </div>
        )}

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
              <p className="text-xs font-medium uppercase tracking-wider">Syncing travel desk...</p>
            </motion.div>
          ) : (
            <div className="space-y-6">

              {/* ============================================ */}
              {/* TAB: TRAVEL OVERVIEW                          */}
              {/* ============================================ */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {!kpis ? (
                    <div className="h-40 flex items-center justify-center text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      <Loader2 className="animate-spin mr-2" size={16} /> Loading overview…
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {overviewKpis.map((kpi, i) => {
                          const t = enhancedThemeMap[kpi.theme] || enhancedThemeMap['orange'];
                          const dotColor = { sky: '#0ea5e9', rose: '#e11d48', emerald: '#10b981', violet: '#8b5cf6', orange: '#D4A373' }[kpi.theme] || '#D4A373';

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
                              <div className="relative flex-1 min-w-0 pr-1">
                                <div className="flex items-start justify-between mb-3">
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
                                  className="text-2xl lg:text-xl xl:text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1.5"
                                >
                                  {kpi.value}
                                </motion.p>
                                <p className="text-[11px] lg:text-[9px] xl:text-[10px] font-bold uppercase tracking-wider text-zinc-500 leading-tight mb-1 break-words">{kpi.label}</p>
                                <p className="text-[9px] text-zinc-400 leading-tight break-words">{kpi.sub}</p>
                              </div>
                              <div className="relative shrink-0">{kpiGraphic(kpi.graphicIndex ?? i, dotColor, kpi.pct ?? null)}</div>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                          className="relative overflow-hidden bg-gradient-to-br from-white via-white to-zinc-50/40 rounded-[2rem] p-6 shadow-sm border border-zinc-200/60">
                          <div className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full bg-orange-200/20 blur-3xl pointer-events-none" />
                          <div className="relative flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4A373] to-[#D4A373] flex items-center justify-center shadow-md shadow-[#D4A373]/20"><TrendingUp size={14} className="text-white" /></div>
                              <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">7-Day Booking Revenue</h3>
                            </div>
                            <span className="text-[9px] font-bold text-[#D4A373] uppercase tracking-widest bg-zinc-50 px-2.5 py-1 rounded-full border border-[#D4A373]/30">Live</span>
                          </div>
                          <TrendLine data={trend} />
                        </motion.div>

                        <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                          className="relative overflow-hidden bg-gradient-to-br from-white via-white to-sky-50/40 rounded-[2rem] p-6 shadow-sm border border-zinc-200/60">
                          <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-sky-300/20 blur-3xl pointer-events-none" />
                          <div className="relative flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-sky-500 to-blue-500 flex items-center justify-center shadow-md shadow-sky-500/30"><PieChart size={14} className="text-white" /></div>
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Package Popularity</h3>
                          </div>
                          <div className="relative flex flex-col sm:flex-row items-center justify-around gap-6">
                            <DonutChart data={popularity} centerLabel="Revenue" />
                            <div className="grid grid-cols-1 gap-y-2.5 min-w-0">
                              {popularity.map((d, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-sm" style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}66` }} />
                                  <span className="text-[11px] text-zinc-500 font-semibold truncate max-w-[130px]">{d.label}</span>
                                  <span className="text-xs font-black text-zinc-900 ml-auto">{shortInr(d.value)}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </div>

                      <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                        <div className="p-5 border-b border-zinc-150 flex justify-between items-center bg-white/40">
                          <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><CalendarClock size={16} className="text-[#D4A373]" /> Recent Bookings</h3>
                          <button onClick={() => setActiveTab('bookings')} className="text-xs font-semibold text-[#D4A373] hover:text-[#D4A373] flex items-center gap-1">
                            View All <ArrowUpRight size={12} />
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                                <th className="p-4 font-bold">Guest / Entity</th>
                                <th className="p-4 font-bold">Package</th>
                                <th className="p-4 font-bold">Travel Date</th>
                                <th className="p-4 font-bold text-right">Amount</th>
                                <th className="p-4 font-bold text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100">
                              {recentBookings.length === 0 && (<tr><td colSpan={5} className="p-8 text-center text-xs text-zinc-400">No bookings yet.</td></tr>)}
                              {recentBookings.map((b, idx) => (
                                <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                                  <td className="p-4 text-sm font-bold text-zinc-900">{b.guest_name}</td>
                                  <td className="p-4 text-sm text-zinc-600">{b.package_name || '—'}</td>
                                  <td className="p-4 text-sm text-zinc-600">{new Date(b.travel_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                  <td className="p-4 text-sm font-bold text-zinc-900 text-right">{inr(b.amount)}</td>
                                  <td className="p-4 text-right">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${b.booking_status === 'Completed' ? 'bg-zinc-50 text-[#D4A373] border-[#D4A373]/30'
                                        : b.booking_status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-200'
                                          : 'bg-sky-50 text-sky-600 border-sky-200'
                                      }`}>
                                      {b.booking_status === 'Completed' ? <CheckCircle2 size={12} /> : b.booking_status === 'Cancelled' ? <Ban size={12} /> : <Clock size={12} />}
                                      {b.booking_status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: PACKAGE CATALOG                          */}
              {/* ============================================ */}
              {activeTab === 'packages' && (
                <motion.div key="packages" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="flex justify-end">
                    <button onClick={() => setIsPackageModalOpen(true)} className="bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#D4A373] transition-colors flex items-center gap-2">
                      <Plus size={14} /> Add Package
                    </button>
                  </div>

                  {!packagesLoaded ? (
                    <div className="h-40 flex items-center justify-center text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      <Loader2 className="animate-spin mr-2" size={16} /> Loading catalog…
                    </div>
                  ) : (
                    <>
                      <div className="fd-dealdeck-card rounded-[2rem] p-6">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-5"><Compass size={16} className="text-[#D4A373]" /> Revenue by Package</h3>
                        <BarRankChart data={packages.map((p, i) => ({ label: p.name, value: Number(p.revenue), color: PACKAGE_PALETTE[i % PACKAGE_PALETTE.length] }))} />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {packages.length === 0 && (
                          <div className="col-span-full text-center text-xs text-zinc-400 py-10">No travel packages yet. Add your first one above.</div>
                        )}
                        {packages.map((p, i) => (
                          <motion.div key={p.id} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                            whileHover={{ y: -4 }} className="fd-dealdeck-card rounded-[1.75rem] p-6 flex flex-col gap-3">
                            <div className="flex items-start justify-between">
                              <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md" style={{ background: PACKAGE_PALETTE[i % PACKAGE_PALETTE.length], boxShadow: `0 10px 20px -8px ${PACKAGE_PALETTE[i % PACKAGE_PALETTE.length]}88` }}>
                                <Plane size={19} />
                              </div>
                              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${p.is_active ? 'bg-zinc-50 text-[#D4A373] border-[#D4A373]/30' : 'bg-zinc-100 text-zinc-500 border-zinc-200'}`}>
                                {p.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-zinc-900">{p.name}</h3>
                              <p className="text-xs text-zinc-500 mt-0.5 flex items-center gap-1"><MapPin size={11} /> {p.destination}</p>
                              <p className="text-xs text-zinc-500 mt-2 leading-relaxed line-clamp-2">{p.description}</p>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">
                              <span>{p.duration_days} Days</span>
                              <span>·</span>
                              <span>Up to {p.max_travelers} travelers</span>
                              <span>·</span>
                              <span className="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 normal-case">{p.category}</span>
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 mt-1">
                              <div>
                                <p className="text-lg font-black text-zinc-900">{inr(p.price)}</p>
                                <p className="text-[10px] text-zinc-400">{p.bookings_count} bookings · {shortInr(p.revenue)} revenue</p>
                              </div>
                              <button onClick={() => handleTogglePackage(p.id)} className="text-[11px] font-bold text-zinc-500 hover:text-[#D4A373] px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50 transition-colors">
                                {p.is_active ? 'Deactivate' : 'Activate'}
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: BOOKINGS & PURCHASES                     */}
              {/* ============================================ */}
              {activeTab === 'bookings' && (
                <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><CalendarClock size={16} className="text-[#D4A373]" /> Purchases</h3>
                      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                        <div className="relative w-full sm:w-56">
                          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input value={bookingSearch} onChange={e => setBookingSearch(e.target.value)} placeholder="Search guest or package..." className="fd-input pl-9 py-2 text-xs" />
                        </div>
                        <select value={bookingStatusFilter} onChange={e => setBookingStatusFilter(e.target.value)} className="fd-input py-2 text-xs bg-white appearance-none cursor-pointer w-full sm:w-40">
                          <option value="All">All Statuses</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <button onClick={() => setIsBookingModalOpen(true)} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#D4A373] transition-colors flex items-center justify-center gap-2 shrink-0">
                          <Plus size={13} /> New Booking
                        </button>
                      </div>
                    </div>

                    {!bookingsLoaded ? (
                      <div className="h-40 flex items-center justify-center text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                        <Loader2 className="animate-spin mr-2" size={16} /> Loading bookings…
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                              <th className="p-4 font-bold">Guest / Entity</th>
                              <th className="p-4 font-bold">Package</th>
                              <th className="p-4 font-bold">Travelers</th>
                              <th className="p-4 font-bold">Travel Date</th>
                              <th className="p-4 font-bold text-right">Amount</th>
                              <th className="p-4 font-bold text-right">Payment</th>
                              <th className="p-4 font-bold text-right">Status</th>
                              <th className="p-4 font-bold text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {bookings.length === 0 && (<tr><td colSpan={8} className="p-8 text-center text-xs text-zinc-400">No bookings match your filters.</td></tr>)}
                            {bookings.map((b) => (
                              <tr key={b.id} className="hover:bg-zinc-50/60 transition-colors">
                                <td className="p-4 text-sm font-bold text-zinc-900">
                                  {b.guest_name}
                                  <span className="block text-[10px] font-normal text-zinc-400">{b.guest_email}</span>
                                </td>
                                <td className="p-4 text-sm text-zinc-600">{b.package_name || '—'}<span className="block text-[10px] text-zinc-400">{b.destination}</span></td>
                                <td className="p-4 text-sm text-zinc-600">{b.travelers_count}</td>
                                <td className="p-4 text-sm text-zinc-600">{new Date(b.travel_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                <td className="p-4 text-sm font-bold text-zinc-900 text-right">{inr(b.amount)}</td>
                                <td className="p-4 text-right">
                                  <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${b.payment_status === 'Paid' ? 'bg-zinc-50 text-[#D4A373] border-[#D4A373]/30'
                                      : b.payment_status === 'Partial' ? 'bg-zinc-50 text-[#D4A373] border-[#D4A373]/30'
                                        : b.payment_status === 'Refunded' ? 'bg-zinc-100 text-zinc-500 border-zinc-200'
                                          : 'bg-rose-50 text-rose-600 border-rose-200'
                                    }`}>{b.payment_status}</span>
                                </td>
                                <td className="p-4 text-right">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${b.booking_status === 'Completed' ? 'bg-zinc-50 text-[#D4A373] border-[#D4A373]/30'
                                      : b.booking_status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-200'
                                        : 'bg-sky-50 text-sky-600 border-sky-200'
                                    }`}>
                                    {b.booking_status === 'Completed' ? <CheckCircle2 size={12} /> : b.booking_status === 'Cancelled' ? <Ban size={12} /> : <Clock size={12} />}
                                    {b.booking_status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {b.payment_status !== 'Paid' && b.booking_status !== 'Cancelled' && (
                                      <button onClick={() => handleUpdateBookingStatus(b.id, { payment_status: 'Paid' })} className="text-[10px] font-bold text-[#D4A373] hover:text-[#D4A373]">Mark Paid</button>
                                    )}
                                    {b.booking_status === 'Confirmed' && (
                                      <button onClick={() => handleUpdateBookingStatus(b.id, { booking_status: 'Cancelled' })} className="text-[10px] font-bold text-rose-500 hover:text-rose-600">Cancel</button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: CUSTOMERS                                */}
              {/* ============================================ */}
              {activeTab === 'customers' && (
                <motion.div key="customers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Users size={16} className="text-[#D4A373]" /> Customer Purchase History</h3>
                    </div>

                    {!customersLoaded ? (
                      <div className="h-40 flex items-center justify-center text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                        <Loader2 className="animate-spin mr-2" size={16} /> Loading customers…
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                              <th className="p-4 font-bold">Guest / Entity</th>
                              <th className="p-4 font-bold">Contact</th>
                              <th className="p-4 font-bold text-right">Bookings</th>
                              <th className="p-4 font-bold text-right">Total Spent</th>
                              <th className="p-4 font-bold text-right">Last Trip</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {customers.length === 0 && (<tr><td colSpan={5} className="p-8 text-center text-xs text-zinc-400">No customers yet.</td></tr>)}
                            {customers.map((c, idx) => (
                              <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                                <td className="p-4 text-sm font-bold text-zinc-900 flex items-center gap-2">
                                  {c.guest_name}
                                  {Number(c.total_spent) > 100000 && <Star size={12} className="text-[#D4A373] fill-[#D4A373]" />}
                                </td>
                                <td className="p-4 text-xs text-zinc-500">
                                  <span className="flex items-center gap-1"><Mail size={11} /> {c.guest_email || '—'}</span>
                                  <span className="flex items-center gap-1 mt-0.5"><Phone size={11} /> {c.guest_phone || '—'}</span>
                                </td>
                                <td className="p-4 text-sm text-zinc-600 text-right">{c.total_bookings}</td>
                                <td className="p-4 text-sm font-black text-zinc-900 text-right">{inr(c.total_spent)}</td>
                                <td className="p-4 text-sm text-zinc-600 text-right">{c.last_travel_date ? new Date(c.last_travel_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: PRIVATE VEHICLES                           */}
              {/* ============================================ */}
              {activeTab === 'vehicles' && (
                <motion.div key="vehicles" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                      <Car size={16} className="text-[#D4A373]" /> Vehicle Fleet
                    </h3>
                    <button onClick={() => setIsVehicleModalOpen(true)} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#D4A373] transition-colors flex items-center gap-2 shadow-sm">
                      <Plus size={13} /> Add Vehicle
                    </button>
                  </div>

                  {!vehiclesLoaded ? (
                    <div className="h-40 flex items-center justify-center text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                      <Loader2 className="animate-spin mr-2" size={16} /> Loading vehicles…
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {vehicles.map((v) => (
                        <div key={v.id} className="fd-dealdeck-card rounded-[1.5rem] p-5 flex flex-col group hover:shadow-lg transition-all relative">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A373] to-[#D4A373] text-white shadow-md shadow-[#D4A373]/20 flex items-center justify-center shrink-0">
                                <Car size={18} />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-zinc-900">{v.model}</h4>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D4A373]">{v.type}</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-zinc-400">Cap: {v.capacity}</span>
                          </div>

                          <div className="mb-4">
                            <p className="text-xs text-zinc-500 font-semibold mb-1">Reg No: {v.registration_number || 'N/A'}</p>
                            <div className="flex items-baseline gap-1 mt-3">
                              <span className="text-xl font-black text-zinc-900">{inr(v.price_per_day)}</span>
                              <span className="text-xs text-zinc-400 font-medium">/ day</span>
                            </div>
                          </div>

                          <div className="mt-auto flex items-center justify-between pt-4 border-t border-zinc-100">
                            <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${v.is_active ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                              }`}>
                              {v.is_active ? 'Active' : 'Disabled'}
                            </span>
                            <button onClick={() => handleToggleVehicle(v.id)} className="text-[10px] font-bold text-[#D4A373] hover:text-[#D4A373]">
                              {v.is_active ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </div>
                      ))}
                      {vehicles.length === 0 && (
                        <div className="col-span-full h-32 flex items-center justify-center text-zinc-400 text-xs font-medium border-2 border-dashed border-zinc-200 rounded-[2rem]">
                          No vehicles found. Add one to get started.
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: VEHICLE BOOKINGS                           */}
              {/* ============================================ */}
              {activeTab === 'vehicleBookings' && (
                <motion.div key="vehicleBookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><CalendarClock size={16} className="text-[#D4A373]" /> Vehicle Bookings</h3>
                      <button onClick={() => setIsVehicleBookingModalOpen(true)} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-[#D4A373] transition-colors flex items-center justify-center gap-2 shrink-0">
                        <Plus size={13} /> New Booking
                      </button>
                    </div>

                    {!vehicleBookingsLoaded ? (
                      <div className="h-40 flex items-center justify-center text-zinc-400 text-xs font-semibold uppercase tracking-wider">
                        <Loader2 className="animate-spin mr-2" size={16} /> Loading vehicle bookings…
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                              <th className="p-4 font-bold">Guest / Entity</th>
                              <th className="p-4 font-bold">Vehicle</th>
                              <th className="p-4 font-bold">Travel Date</th>
                              <th className="p-4 font-bold text-right">Amount</th>
                              <th className="p-4 font-bold text-right">Payment</th>
                              <th className="p-4 font-bold text-right">Status</th>
                              <th className="p-4 font-bold text-right">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-100">
                            {vehicleBookings.length === 0 && (<tr><td colSpan={7} className="p-8 text-center text-xs text-zinc-400">No vehicle bookings found.</td></tr>)}
                            {vehicleBookings.map((b) => (
                              <tr key={b.id} className="hover:bg-zinc-50/60 transition-colors">
                                <td className="p-4 text-sm font-bold text-zinc-900">
                                  {b.guest_name}
                                  <span className="block text-[10px] font-normal text-zinc-400">{b.guest_phone || '—'}</span>
                                </td>
                                <td className="p-4 text-sm text-zinc-600">{b.vehicle_model || '—'}</td>
                                <td className="p-4 text-sm text-zinc-600">{new Date(b.travel_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                <td className="p-4 text-sm font-bold text-zinc-900 text-right">{inr(b.amount)}</td>
                                <td className="p-4 text-right">
                                  <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${b.payment_status === 'Paid' ? 'bg-zinc-50 text-[#D4A373] border-[#D4A373]/30'
                                      : b.payment_status === 'Partial' ? 'bg-zinc-50 text-[#D4A373] border-[#D4A373]/30'
                                        : 'bg-rose-50 text-rose-600 border-rose-200'
                                    }`}>{b.payment_status}</span>
                                </td>
                                <td className="p-4 text-right">
                                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${b.booking_status === 'Completed' ? 'bg-zinc-50 text-[#D4A373] border-[#D4A373]/30'
                                      : b.booking_status === 'Cancelled' ? 'bg-rose-50 text-rose-600 border-rose-200'
                                        : 'bg-sky-50 text-sky-600 border-sky-200'
                                    }`}>
                                    {b.booking_status === 'Completed' ? <CheckCircle2 size={12} /> : b.booking_status === 'Cancelled' ? <Ban size={12} /> : <Clock size={12} />}
                                    {b.booking_status}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    {b.payment_status !== 'Paid' && b.booking_status !== 'Cancelled' && (
                                      <button onClick={() => handleUpdateVehicleBookingStatus(b.id, { payment_status: 'Paid' })} className="text-[10px] font-bold text-[#D4A373] hover:text-[#D4A373]">Mark Paid</button>
                                    )}
                                    {b.booking_status === 'Confirmed' && (
                                      <button onClick={() => handleUpdateVehicleBookingStatus(b.id, { booking_status: 'Cancelled' })} className="text-[10px] font-bold text-rose-500 hover:text-rose-600">Cancel</button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Add Package Modal */}
      <AnimatePresence>
        {isPackageModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-55 flex items-center justify-center fd-glass-backdrop p-4" onClick={() => setIsPackageModalOpen(false)}>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" onClick={e => e.stopPropagation()}
              className="w-full max-w-md fd-glass-modal rounded-3xl p-7 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 text-[#D4A373] flex items-center justify-center"><Plane size={20} /></div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-zinc-900">Add Travel Package</h2>
                    <p className="text-xs text-zinc-500">List a new package for sale</p>
                  </div>
                </div>
                <button onClick={() => setIsPackageModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddPackage} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Package Name</label>
                  <input required placeholder="e.g. Goa Beach Escape" value={packageForm.name} onChange={e => setPackageForm({ ...packageForm, name: e.target.value })} className="fd-input bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Destination</label>
                  <input required placeholder="e.g. Goa, India" value={packageForm.destination} onChange={e => setPackageForm({ ...packageForm, destination: e.target.value })} className="fd-input bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Description</label>
                  <textarea rows={3} placeholder="What's included in this package..." value={packageForm.description} onChange={e => setPackageForm({ ...packageForm, description: e.target.value })} className="fd-input resize-none bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Category</label>
                    <select value={packageForm.category} onChange={e => setPackageForm({ ...packageForm, category: e.target.value })} className="fd-input bg-white appearance-none cursor-pointer">
                      <option>Leisure</option><option>Beach & Leisure</option><option>Wellness</option><option>Heritage</option>
                      <option>Adventure</option><option>International</option><option>Honeymoon</option><option>Business</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Price per Traveler (₹)</label>
                    <input required type="number" placeholder="0.00" value={packageForm.price} onChange={e => setPackageForm({ ...packageForm, price: e.target.value })} className="fd-input bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Duration (Days)</label>
                    <input type="number" placeholder="4" value={packageForm.duration_days} onChange={e => setPackageForm({ ...packageForm, duration_days: e.target.value })} className="fd-input bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Max Travelers</label>
                    <input type="number" placeholder="4" value={packageForm.max_travelers} onChange={e => setPackageForm({ ...packageForm, max_travelers: e.target.value })} className="fd-input bg-white" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[#D4A373] to-[#D4A373] hover:from-[#B38355] hover:to-[#B38355] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-[#D4A373]/20 flex items-center justify-center gap-2 mt-4">
                  <Plane size={16} /> Add Package
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Booking Modal */}
      <AnimatePresence>
        {isBookingModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-55 flex items-center justify-center fd-glass-backdrop p-4" onClick={() => setIsBookingModalOpen(false)}>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" onClick={e => e.stopPropagation()}
              className="w-full max-w-md fd-glass-modal rounded-3xl p-7 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 text-[#D4A373] flex items-center justify-center"><CalendarClock size={20} /></div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-zinc-900">New Booking</h2>
                    <p className="text-xs text-zinc-500">Record a package purchase</p>
                  </div>
                </div>
                <button onClick={() => setIsBookingModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddBooking} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Package</label>
                  <select required value={bookingForm.package_id} onChange={e => setBookingForm({ ...bookingForm, package_id: e.target.value })} className="fd-input bg-white appearance-none cursor-pointer">
                    <option value="">Select a package…</option>
                    {packages.filter(p => p.is_active).map(p => <option key={p.id} value={p.id}>{p.name} — {inr(p.price)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Guest / Entity Name</label>
                  <input required placeholder="e.g. Aryan Singh" value={bookingForm.guest_name} onChange={e => setBookingForm({ ...bookingForm, guest_name: e.target.value })} className="fd-input bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Email</label>
                    <input type="email" placeholder="guest@email.com" value={bookingForm.guest_email} onChange={e => setBookingForm({ ...bookingForm, guest_email: e.target.value })} className="fd-input bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Phone</label>
                    <input placeholder="+91 ..." value={bookingForm.guest_phone} onChange={e => setBookingForm({ ...bookingForm, guest_phone: e.target.value })} className="fd-input bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Travelers</label>
                    <input required type="number" min="1" value={bookingForm.travelers_count} onChange={e => setBookingForm({ ...bookingForm, travelers_count: e.target.value })} className="fd-input bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Travel Date</label>
                    <input required type="date" value={bookingForm.travel_date} onChange={e => setBookingForm({ ...bookingForm, travel_date: e.target.value })} className="fd-input bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Payment Status</label>
                  <select value={bookingForm.payment_status} onChange={e => setBookingForm({ ...bookingForm, payment_status: e.target.value })} className="fd-input bg-white appearance-none cursor-pointer">
                    <option value="Pending">Pending</option>
                    <option value="Partial">Partial</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[#D4A373] to-[#D4A373] hover:from-[#B38355] hover:to-[#B38355] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-[#D4A373]/20 flex items-center justify-center gap-2 mt-4">
                  <CreditCard size={16} /> Record Booking
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {isVehicleModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-55 flex items-center justify-center fd-glass-backdrop p-4" onClick={() => setIsVehicleModalOpen(false)}>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" onClick={e => e.stopPropagation()}
              className="w-full max-w-md fd-glass-modal rounded-3xl p-7 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 text-[#D4A373] flex items-center justify-center"><Car size={20} /></div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-zinc-900">Add Vehicle</h2>
                    <p className="text-xs text-zinc-500">Add a new private vehicle</p>
                  </div>
                </div>
                <button onClick={() => setIsVehicleModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddVehicle} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Vehicle Model</label>
                  <input required placeholder="e.g. Toyota Innova Crysta" value={vehicleForm.model} onChange={e => setVehicleForm({ ...vehicleForm, model: e.target.value })} className="fd-input bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Type</label>
                    <select value={vehicleForm.type} onChange={e => setVehicleForm({ ...vehicleForm, type: e.target.value })} className="fd-input bg-white appearance-none cursor-pointer">
                      <option>Sedan</option><option>SUV</option><option>Minivan</option><option>Luxury</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Reg Number</label>
                    <input placeholder="e.g. MH-12-AB-1234" value={vehicleForm.registration_number} onChange={e => setVehicleForm({ ...vehicleForm, registration_number: e.target.value })} className="fd-input bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Capacity</label>
                    <input type="number" placeholder="4" value={vehicleForm.capacity} onChange={e => setVehicleForm({ ...vehicleForm, capacity: e.target.value })} className="fd-input bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Price per Day (₹)</label>
                    <input required type="number" placeholder="0.00" value={vehicleForm.price_per_day} onChange={e => setVehicleForm({ ...vehicleForm, price_per_day: e.target.value })} className="fd-input bg-white" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[#D4A373] to-[#D4A373] hover:from-[#B38355] hover:to-[#B38355] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-[#D4A373]/20 flex items-center justify-center gap-2 mt-4">
                  <Car size={16} /> Add Vehicle
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Vehicle Booking Modal */}
      <AnimatePresence>
        {isVehicleBookingModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-55 flex items-center justify-center fd-glass-backdrop p-4" onClick={() => setIsVehicleBookingModalOpen(false)}>
            <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" onClick={e => e.stopPropagation()}
              className="w-full max-w-md fd-glass-modal rounded-3xl p-7 overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 text-[#D4A373] flex items-center justify-center"><CalendarClock size={20} /></div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-zinc-900">New Vehicle Booking</h2>
                    <p className="text-xs text-zinc-500">Record a vehicle rental</p>
                  </div>
                </div>
                <button onClick={() => setIsVehicleBookingModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><X size={20} /></button>
              </div>
              <form onSubmit={handleAddVehicleBooking} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Vehicle</label>
                  <select required value={vehicleBookingForm.vehicle_id} onChange={e => setVehicleBookingForm({ ...vehicleBookingForm, vehicle_id: e.target.value })} className="fd-input bg-white appearance-none cursor-pointer">
                    <option value="">Select a vehicle…</option>
                    {vehicles.filter(v => v.is_active).map(v => <option key={v.id} value={v.id}>{v.model} ({v.type}) — {inr(v.price_per_day)}/day</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Guest / Entity Name</label>
                  <input required placeholder="e.g. Aryan Singh" value={vehicleBookingForm.guest_name} onChange={e => setVehicleBookingForm({ ...vehicleBookingForm, guest_name: e.target.value })} className="fd-input bg-white" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Phone</label>
                    <input placeholder="+91 ..." value={vehicleBookingForm.guest_phone} onChange={e => setVehicleBookingForm({ ...vehicleBookingForm, guest_phone: e.target.value })} className="fd-input bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Travel Date</label>
                    <input required type="date" value={vehicleBookingForm.travel_date} onChange={e => setVehicleBookingForm({ ...vehicleBookingForm, travel_date: e.target.value })} className="fd-input bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Amount (₹)</label>
                    <input required type="number" placeholder="0.00" value={vehicleBookingForm.amount} onChange={e => setVehicleBookingForm({ ...vehicleBookingForm, amount: e.target.value })} className="fd-input bg-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Payment Status</label>
                    <select value={vehicleBookingForm.payment_status} onChange={e => setVehicleBookingForm({ ...vehicleBookingForm, payment_status: e.target.value })} className="fd-input bg-white appearance-none cursor-pointer">
                      <option value="Pending">Pending</option>
                      <option value="Partial">Partial</option>
                      <option value="Paid">Paid</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-[#D4A373] to-[#D4A373] hover:from-[#B38355] hover:to-[#B38355] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-[#D4A373]/20 flex items-center justify-center gap-2 mt-4">
                  <CreditCard size={16} /> Record Booking
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}