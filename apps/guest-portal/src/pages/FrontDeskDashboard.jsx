import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, CalendarDays, Clock, MapPin, DoorOpen,
  Loader2, X, Phone, Mail, Users, KeySquare, ArrowRightLeft,
  CheckCircle2, LogIn, ChevronDown, History, AlertTriangle,
  Building2, User, CreditCard, CalendarCheck, BedDouble,
  RefreshCw, Filter, Sparkles, Wifi, TrendingUp, ShieldCheck,
  Radio, Zap, Hotel, FileText
} from 'lucide-react';

const API_BASE = 'http://localhost:3000';

// ─── Status Color Map ──────────────────────────────────────
// `accent` is a comma-separated RGB triplet (not a Tailwind class) used to
// drive the card's CSS custom property (--accent) below, so the same status
// color powers the badge, the dot, AND the card gradient/glow treatment
// from a single source of truth. All light/pastel tones — no black, no purple.
const STATUS_STYLES = {
  CHECKED_IN: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', dot: 'bg-emerald-500', ring: 'ring-emerald-500', accent: '16, 185, 129' },
  CONFIRMED: { bg: 'bg-sky-50', text: 'text-sky-700', border: 'border-sky-200', dot: 'bg-sky-500', ring: 'ring-sky-500', accent: '14, 165, 233' },
  PENDING: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', dot: 'bg-amber-500', ring: 'ring-amber-500', accent: '245, 158, 11' },
  CHECKED_OUT: { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200', dot: 'bg-slate-400', ring: 'ring-slate-400', accent: '148, 163, 184' },
  CANCELLED: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200', dot: 'bg-rose-400', ring: 'ring-rose-400', accent: '251, 113, 133' },
};

// Small status icon paired with each state — used on badges and as a faint
// card watermark so the icon language stays consistent across the UI.
const STATUS_ICONS = {
  CHECKED_IN: ShieldCheck,
  CONFIRMED: CalendarCheck,
  PENDING: Clock,
  CHECKED_OUT: DoorOpen,
  CANCELLED: X,
};

// ─── Custom CSS ─────────────────────────────────────────────
// Light, airy, no-black / no-purple palette. Teal/sky/emerald/amber only.
const FD_STYLES = `
  .fd-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
  .fd-scrollbar::-webkit-scrollbar { display: none; }
  .fd-sidebar-scroll { scrollbar-width: none; -ms-overflow-style: none; }
  .fd-sidebar-scroll::-webkit-scrollbar { display: none; }

  /* Soft, solid background — admin dashboard match */
  .fd-app-bg {
    background: #F8F1E3 !important;
    background-attachment: fixed;
    background-size: 140% 140%, 140% 140%, 140% 140%, auto;
    animation: fd-mesh-shift 24s ease-in-out infinite;
  }
  @keyframes fd-mesh-shift {
    0%, 100% { background-position: 0% 0%, 100% 0%, 50% 100%, 0 0; }
    50% { background-position: 10% 8%, 90% 10%, 44% 92%, 0 0; }
  }

  .fd-dot-grid {
    background-image: radial-gradient(rgba(100,116,139,0.10) 1px, transparent 1px);
    background-size: 22px 22px;
    -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.8), rgba(0,0,0,0.08) 65%, transparent 100%);
    mask-image: linear-gradient(180deg, rgba(0,0,0,0.8), rgba(0,0,0,0.08) 65%, transparent 100%);
  }

  .fd-orb { position: absolute; border-radius: 9999px; filter: blur(70px); pointer-events: none; }

  .fd-brand-mark {
    background: linear-gradient(135deg, #D4A373, #B3835B 55%, #D4A373);
    background-size: 200% 200%;
    animation: fd-brand-shimmer 5s ease-in-out infinite;
  }
  @keyframes fd-brand-shimmer {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  @keyframes fd-live-dot {
    0% { box-shadow: 0 0 0 0 rgba(16,185,129,0.55); }
    70% { box-shadow: 0 0 0 8px rgba(16,185,129,0); }
    100% { box-shadow: 0 0 0 0 rgba(16,185,129,0); }
  }
  .fd-live-dot { animation: fd-live-dot 2s cubic-bezier(0.4,0,0.6,1) infinite; }

  .fd-dealdeck-sidebar {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(12px);
    box-shadow: 14px 17px 40px 4px rgba(56, 189, 248, 0.10);
    border: 1px solid rgba(226, 232, 240, 0.8);
  }

  .fd-dealdeck-card {
    background: #FFFFFF;
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0px 18px 40px 0px rgba(56, 189, 248, 0.08);
    transition: box-shadow 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
  }
  .fd-dealdeck-card:hover {
    box-shadow: 0px 24px 48px 0px rgba(56, 189, 248, 0.18);
  }

  /* Focus card — replaces the old purple/indigo solid fill with a light teal/sky gradient */
  .fd-dealdeck-focus-card {
    background: linear-gradient(135deg, #D4A373 0%, #B3835B 100%) !important;
    box-shadow: 0px 20px 45px 0px rgba(212, 163, 115, 0.32) !important;
    transition: box-shadow 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
  }
  .fd-dealdeck-focus-card:hover {
    box-shadow: 0px 26px 55px 0px rgba(212, 163, 115, 0.42) !important;
  }

  /* Decorative glow blob tucked into KPI card corners, appears on hover */
  .fd-kpi-blob {
    position: absolute;
    top: -2.5rem;
    right: -2.5rem;
    width: 8rem;
    height: 8rem;
    border-radius: 9999px;
    filter: blur(30px);
    opacity: 0;
    transition: opacity 0.5s ease;
    pointer-events: none;
  }
  .fd-kpi-tilt:hover .fd-kpi-blob { opacity: 1; }
  .fd-kpi-tilt { transform-style: preserve-3d; will-change: transform; }
  .fd-tilt-sheen { position: absolute; inset: 0; pointer-events: none; z-index: 1; opacity: 0; transition: opacity 0.35s ease; border-radius: inherit; }
  .fd-kpi-tilt:hover .fd-tilt-sheen { opacity: 1; }

  .fd-icon-btn { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); display: inline-flex; }
  .group:hover .fd-icon-btn { transform: translateY(-1px) scale(1.14) rotate(-6deg); }

  .fd-card { position: relative; isolation: isolate; }
  .fd-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 45%, transparent 60%);
    transform: translateX(-120%);
    transition: transform 0.85s cubic-bezier(0.22, 1, 0.36, 1);
    pointer-events: none;
    z-index: 2;
    border-radius: inherit;
  }
  .fd-card:hover::after { transform: translateX(120%); }

  .fd-glass-backdrop { background: rgba(15, 23, 42, 0.35); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
  .fd-glass-modal {
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid rgba(226, 232, 240, 0.8);
    box-shadow: 0 30px 70px -12px rgba(56, 189, 248, 0.28);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
  }

  .fd-search-dropdown {
    background: rgba(255,255,255,0.98);
    border: 1px solid rgba(226,232,240,0.9);
    backdrop-filter: blur(16px);
  }

  .fd-input {
    width: 100%;
    padding: 0.75rem 1.1rem;
    background: #F0FDFA;
    border: 1px solid #CCFBF1;
    border-radius: 1rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
  }
  .fd-input:focus {
    outline: none;
    border-color: #5eead4;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(45,212,191,0.18);
  }

  /* Ripple click effect for buttons */
  .fd-ripple-host { position: relative; overflow: hidden; }
  .fd-ripple {
    position: absolute;
    width: 12px; height: 12px;
    background: rgba(255,255,255,0.6);
    border-radius: 9999px;
    transform: translate(-50%, -50%);
    pointer-events: none;
    animation: fd-ripple-expand 0.65s ease-out forwards;
  }
  @keyframes fd-ripple-expand {
    0% { width: 12px; height: 12px; opacity: 0.7; }
    100% { width: 320px; height: 320px; opacity: 0; }
  }

  @keyframes fd-spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  .fd-spin-slow { animation: fd-spin-slow 3s linear infinite; display: inline-block; }
`;

// ─── Animation Variants ────────────────────────────────────
const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 100,
      damping: 15
    }
  },
  exit: { opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.2 } }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 28, stiffness: 350 } },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.2 } }
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } }
};

// ─── Small helper: animated counting number ─────────────────
// Purely presentational — tweens the displayed digits on change.
function CountUp({ value, className, suffix = '' }) {
  const nodeRef = useRef(null);
  const prevRef = useRef(0);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    const from = prevRef.current;
    const to = typeof value === 'number' ? value : parseFloat(value) || 0;
    const controls = animate(from, to, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(v) {
        node.textContent = `${Math.round(v).toLocaleString('en-IN')}${suffix}`;
      }
    });
    prevRef.current = to;
    return () => controls.stop();
  }, [value, suffix]);

  return <span ref={nodeRef} className={className}>0{suffix}</span>;
}

// ─── Small helper: pointer-tilt wrapper for KPI cards ───────
function TiltCard({ children, className, onClick, glowHex = '#14b8a6', style }) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const springRx = useSpring(rx, { stiffness: 220, damping: 18 });
  const springRy = useSpring(ry, { stiffness: 220, damping: 18 });
  const mx = useMotionValue(50);
  const my = useMotionValue(50);

  const handleMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    ry.set((px - 0.5) * 12);
    rx.set((0.5 - py) * 12);
    mx.set(px * 100);
    my.set(py * 100);
  };
  const handleLeave = () => { rx.set(0); ry.set(0); };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      style={{ rotateX: springRx, rotateY: springRy, transformPerspective: 900, ...style }}
      className={className}
    >
      <motion.div
        className="fd-tilt-sheen"
        style={{
          background: useTransform(
            [mx, my],
            ([x, y]) => `radial-gradient(220px circle at ${x}% ${y}%, ${glowHex}2b, transparent 65%)`
          )
        }}
      />
      {children}
    </motion.div>
  );
}

// ─── Small helper: ripple button ─────────────────────────────
function RippleButton({ onClick, className, children, disabled, type = 'button', ...rest }) {
  const [ripples, setRipples] = useState([]);

  const fire = (e) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const id = Date.now() + Math.random();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipples((prev) => [...prev, { id, x, y }]);
    setTimeout(() => setRipples((prev) => prev.filter((r) => r.id !== id)), 650);
    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      onClick={fire}
      disabled={disabled}
      className={`fd-ripple-host ${className || ''}`}
      {...rest}
    >
      {children}
      {ripples.map((r) => (
        <span key={r.id} className="fd-ripple" style={{ left: r.x, top: r.y }} />
      ))}
    </motion.button>
  );
}

function RoomStatsRings({ deluxeOcc, suiteOcc, standardOcc }) {
  const tracks = [
    { label: 'Deluxe', value: deluxeOcc, color: '#0ea5e9', radius: 60, strokeWidth: 8 },
    { label: 'Suite', value: suiteOcc, color: '#fb923c', radius: 46, strokeWidth: 8 },
    { label: 'Standard', value: standardOcc, color: '#14b8a6', radius: 32, strokeWidth: 8 }
  ];

  return (
    <div className="relative w-44 h-44 flex items-center justify-center">
      <svg width={170} height={170} className="transform -rotate-90">
        {tracks.map((track, i) => {
          const circ = 2 * Math.PI * track.radius;
          const offset = circ * (1 - Math.min(Math.max(track.value, 0), 1));
          return (
            <g key={i}>
              <circle
                cx={85}
                cy={85}
                r={track.radius}
                fill="none"
                stroke="#EFF6FF"
                strokeWidth={track.strokeWidth}
              />
              <motion.circle
                cx={85}
                cy={85}
                r={track.radius}
                fill="none"
                stroke={track.color}
                strokeWidth={track.strokeWidth}
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: i * 0.15 }}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest leading-none">Rooms</span>
        <span className="text-xl font-black text-zinc-800 tracking-tight mt-0.5 flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="fd-live-dot absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </span>
          Live
        </span>
      </div>
    </div>
  );
}

export default function FrontDeskDashboard() {
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // ─── Data States ───────────────────────────────────────────
  const [overviewData, setOverviewData] = useState({ stats: [], recentGuests: [] });
  const [activeStays, setActiveStays] = useState([]);
  const [allBookings, setAllBookings] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [allHotelRooms, setAllHotelRooms] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  // ─── UI States ─────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('arrivals'); // 'all' | 'arrivals' | 'departures' | 'inhouse'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [viewMode, setViewMode] = useState('active'); // 'active' | 'history'
  const [historyFilter, setHistoryFilter] = useState('');
  const [historyPage, setHistoryPage] = useState(1);
  const historyItemsPerPage = 10;

  // ─── Modal States ──────────────────────────────────────────
  const [modalType, setModalType] = useState('none');
  const [selectedStay, setSelectedStay] = useState(null);
  const [actionForm, setActionForm] = useState({ new_room_id: '', new_check_out_date: '' });
  const [bookingForm, setBookingForm] = useState({
    guest_name: '', guest_email: '', guest_phone: '', guest_id_number: '', number_of_guests: 1,
    room_id: '', check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: '', total_price: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Broadcast States ──────────────────────────────────────
  const [broadcasts, setBroadcasts] = useState([]);
  const [dismissedBroadcasts, setDismissedBroadcasts] = useState(() => {
    try { return JSON.parse(localStorage.getItem('hms_dismissed_broadcasts')) || []; } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('hms_dismissed_broadcasts', JSON.stringify(dismissedBroadcasts));
  }, [dismissedBroadcasts]);

  // ─── Auth Fetch Wrapper ────────────────────────────────────
  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem('hms_token');
    if (!token) { navigate('/login'); return null; }
    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
      if (res.status === 401 || res.status === 403) { navigate('/login'); return null; }
      return res;
    } catch (err) {
      console.error('Network error:', err);
      return null;
    }
  }, [navigate]);

  // ─── Data Loaders ──────────────────────────────────────────
  const loadAvailableRooms = useCallback(async () => {
    const res = await fetchWithAuth(`${API_BASE}/api/front-desk/rooms/available`);
    if (res?.ok) {
      const data = await res.json();
      setAvailableRooms(data.data.rooms);
    }
  }, [fetchWithAuth]);

  const loadAllHotelRooms = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rooms`);
      if (res?.ok) {
        const data = await res.json();
        setAllHotelRooms(data.data.rooms);
      }
    } catch (err) {
      console.error('Failed to load all hotel rooms:', err);
    }
  }, []);

  const loadDashboard = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [overviewRes, staysRes] = await Promise.all([
        fetchWithAuth(`${API_BASE}/api/front-desk/overview`),
        fetchWithAuth(`${API_BASE}/api/front-desk/stays`),
        loadAvailableRooms(),
        loadAllHotelRooms()
      ]);

      if (overviewRes?.ok) setOverviewData(await overviewRes.json());
      if (staysRes?.ok) {
        const data = await staysRes.json();
        setActiveStays(data.data.stays);
      }
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchWithAuth, loadAvailableRooms, loadAllHotelRooms]);

  const loadAllBookings = useCallback(async () => {
    const url = historyFilter
      ? `${API_BASE}/api/front-desk/bookings/all?status=${historyFilter}`
      : `${API_BASE}/api/front-desk/bookings/all`;
    const res = await fetchWithAuth(url);
    if (res?.ok) {
      const data = await res.json();
      setAllBookings(data.data.bookings);
    }
  }, [fetchWithAuth, historyFilter]);

  // ─── Effects ───────────────────────────────────────────────
  useEffect(() => {
    // Dynamically apply gradient fill background to the main App wrapper
    const appWrapper = document.querySelector('.min-h-screen.bg-\\[\\#FDFBF7\\]');
    if (appWrapper) {
      appWrapper.classList.remove('bg-[#FDFBF7]');
      appWrapper.classList.add('fd-app-bg');
    }
    document.body.classList.add('fd-app-bg');

    return () => {
      if (appWrapper) {
        appWrapper.classList.add('bg-[#FDFBF7]');
        appWrapper.classList.remove('fd-app-bg');
      }
      document.body.classList.remove('fd-app-bg');
    };
  }, []);

  const fetchBroadcasts = useCallback(async () => {
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/broadcasts`);
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

  useEffect(() => { loadDashboard(); }, [loadDashboard]);

  useEffect(() => {
    if (viewMode === 'history') loadAllBookings();
  }, [viewMode, historyFilter, loadAllBookings]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) { setSearchResults([]); return; }
    const timer = setTimeout(async () => {
      const res = await fetchWithAuth(`${API_BASE}/api/front-desk/guests/search?q=${encodeURIComponent(searchQuery)}`);
      if (res?.ok) {
        const data = await res.json();
        setSearchResults(data.data.guests);
        setIsSearchOpen(true);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchWithAuth]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Auto-calculate booking price
  useEffect(() => {
    if (!bookingForm.room_id || !bookingForm.check_out_date) return;
    const selectedRoom = availableRooms.find(r => r.id.toString() === bookingForm.room_id.toString());
    if (!selectedRoom) return;
    const days = Math.ceil((new Date(bookingForm.check_out_date) - new Date(bookingForm.check_in_date)) / (1000 * 60 * 60 * 24));
    if (days > 0) setBookingForm(prev => ({ ...prev, total_price: days * selectedRoom.base_price }));
  }, [bookingForm.room_id, bookingForm.check_out_date, bookingForm.check_in_date, availableRooms]);

  // ─── Filter Logic ──────────────────────────────────────────
  const getLocalDateString = (dateObjOrStr) => {
    if (!dateObjOrStr) return '';
    if (typeof dateObjOrStr === 'string') {
      const match = dateObjOrStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      if (match) return `${match[1]}-${match[2]}-${match[3]}`;
    }
    const d = new Date(dateObjOrStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString(new Date());

  const isPendingCheckin = (stay) => {
    if (stay.booking_status !== 'CONFIRMED') return false;
    const checkinStr = getLocalDateString(stay.check_in_date);
    return checkinStr <= today;
  };

  const isPendingCheckout = (stay) => {
    if (!stay || stay.booking_status !== 'CHECKED_IN') return false;
    const checkoutStr = getLocalDateString(stay.check_out_date);
    if (!checkoutStr) return false;
    if (checkoutStr < today) return true;
    if (checkoutStr === today) {
      const now = new Date();
      return now.getHours() >= 11;
    }
    return false;
  };

  const safeDateRender = (dateStr) => {
    try {
      if (!dateStr) return 'N/A';
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Invalid Date';
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    } catch (e) {
      return 'N/A';
    }
  };

  const filteredStays = activeStays.filter(stay => {
    if (activeFilter === 'arrivals') {
      return getLocalDateString(stay.check_in_date) === today && (stay.booking_status === 'CONFIRMED' || stay.booking_status === 'CHECKED_IN');
    }
    if (activeFilter === 'departures') {
      return getLocalDateString(stay.check_out_date) === today && (stay.booking_status === 'CHECKED_IN' || stay.booking_status === 'CHECKED_OUT');
    }
    if (activeFilter === 'inhouse') {
      return stay.booking_status === 'CHECKED_IN';
    }
    if (activeFilter === 'pending_checkin') {
      return isPendingCheckin(stay);
    }
    if (activeFilter === 'pending_checkout') {
      return isPendingCheckout(stay);
    }
    return true;
  });

  // ─── Computed Stats ────────────────────────────────────────
  const arrivalsCount = activeStays.filter(s => getLocalDateString(s.check_in_date) === today && (s.booking_status === 'CONFIRMED' || s.booking_status === 'CHECKED_IN')).length;
  const departuresCount = activeStays.filter(s => getLocalDateString(s.check_out_date) === today && (s.booking_status === 'CHECKED_IN' || s.booking_status === 'CHECKED_OUT')).length;
  const inhouseCount = activeStays.filter(s => s.booking_status === 'CHECKED_IN').length;
  const pendingCheckinsCount = activeStays.filter(s => isPendingCheckin(s)).length;
  const pendingCheckoutsCount = activeStays.filter(s => isPendingCheckout(s)).length;
  const availableCount = overviewData.stats?.find(s => s.label === 'Available Rooms')?.value || '0';

  // ─── Action Handlers ──────────────────────────────────────
  const handleCheckin = async (bookingId) => {
    setIsSubmitting(true);
    const res = await fetchWithAuth(`${API_BASE}/api/front-desk/bookings/${bookingId}/checkin`, { method: 'POST' });
    if (res?.ok) {
      setModalType('none');
      setSelectedStay(null);
      loadDashboard(false);
    } else if (res) {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    }
    setIsSubmitting(false);
  };

  const handleCheckout = async (bookingId) => {
    setIsSubmitting(true);
    const res = await fetchWithAuth(`${API_BASE}/api/front-desk/bookings/${bookingId}/checkout`, { method: 'POST' });
    if (res?.ok) {
      setModalType('none');
      setSelectedStay(null);
      loadDashboard(false);
    } else if (res) {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    }
    setIsSubmitting(false);
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setIsSubmitting(true);
    const res = await fetchWithAuth(`${API_BASE}/api/bookings/${bookingId}/cancel`, { method: 'PATCH' });
    if (res?.ok) {
      loadDashboard(false);
    } else if (res) {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    }
    setIsSubmitting(false);
  };

  const handleExtendStay = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetchWithAuth(`${API_BASE}/api/front-desk/bookings/${selectedStay.booking_id}/extend`, {
      method: 'PATCH',
      body: JSON.stringify({ new_check_out_date: actionForm.new_check_out_date })
    });
    if (res?.ok) {
      setModalType('none');
      setSelectedStay(null);
      setActionForm({ new_room_id: '', new_check_out_date: '' });
      loadDashboard(false);
    } else if (res) {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    }
    setIsSubmitting(false);
  };

  const handleRoomChange = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetchWithAuth(`${API_BASE}/api/front-desk/bookings/${selectedStay.booking_id}/change-room`, {
      method: 'PATCH',
      body: JSON.stringify({ new_room_id: actionForm.new_room_id })
    });
    if (res?.ok) {
      setModalType('none');
      setSelectedStay(null);
      setActionForm({ new_room_id: '', new_check_out_date: '' });
      loadDashboard(false);
    } else if (res) {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    }
    setIsSubmitting(false);
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetchWithAuth(`${API_BASE}/api/front-desk/bookings/manual`, {
      method: 'POST',
      body: JSON.stringify(bookingForm)
    });
    if (res?.ok) {
      setModalType('none');
      setBookingForm({
        guest_name: '', guest_email: '', guest_phone: '', guest_id_number: '', number_of_guests: 1,
        room_id: '', check_in_date: new Date().toISOString().split('T')[0],
        check_out_date: '', total_price: 0
      });
      loadDashboard(false);
    } else if (res) {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    }
    setIsSubmitting(false);
  };

  // ─── Modal Openers ────────────────────────────────────────
  const openCheckin = (stay) => { setSelectedStay(stay); setModalType('checkin'); };
  const openCheckout = (stay) => { setSelectedStay(stay); setModalType('checkout'); };
  const openExtend = (stay) => { setSelectedStay(stay); setActionForm({ ...actionForm, new_check_out_date: '' }); setModalType('extend'); };
  const openRoomChange = async (stay) => {
    setSelectedStay(stay);
    await loadAvailableRooms();
    setActionForm({ ...actionForm, new_room_id: '' });
    setModalType('change_room');
  };
  const openWalkIn = async () => {
    await loadAvailableRooms();
    setBookingForm({
      guest_name: '', guest_email: '', guest_phone: '',
      room_id: '', check_in_date: new Date().toISOString().split('T')[0],
      check_out_date: '', total_price: 0
    });
    setModalType('booking');
  };

  const getStatusStyle = (status) => STATUS_STYLES[status] || STATUS_STYLES.PENDING;
  const getStatusIcon = (status) => STATUS_ICONS[status] || Clock;

  // ─── Loading State ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center gap-5 fd-app-bg relative overflow-hidden">
        <style>{FD_STYLES}</style>
        <div className="fd-orb w-72 h-72 bg-[#D4A373]/15 -top-10 -left-10" />
        <div className="fd-orb w-72 h-72 bg-sky-300/30 bottom-0 right-0" />
        <div className="fd-orb w-64 h-64 bg-amber-200/25 top-1/2 left-1/2" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="relative z-10 w-16 h-16 rounded-2xl fd-brand-mark flex items-center justify-center shadow-xl shadow-[#D4A373]/30"
        >
          <Loader2 size={24} className="text-white" />
        </motion.div>
        <motion.div
          animate={{ width: ['0%', '85%', '100%'] }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
          className="relative z-10 h-1 rounded-full bg-gradient-to-r from-[#D4A373] to-[#B3835B] max-w-xs w-full"
        />
        <p className="relative z-10 text-sm font-semibold text-zinc-500 tracking-wide">Loading Front Desk Operations…</p>
      </div>
    );
  }

  // Dynamic occupancy calculations
  const totalStandard = allHotelRooms.filter(r => r.room_type?.toLowerCase().includes('standard')).length || 6;
  const totalDeluxe = allHotelRooms.filter(r => r.room_type?.toLowerCase().includes('deluxe')).length || 3;
  const totalSuites = allHotelRooms.filter(r => r.room_type?.toLowerCase().includes('suite') || r.room_type?.toLowerCase().includes('villa')).length || 12;

  const occupiedStandard = allHotelRooms.filter(r => r.room_type?.toLowerCase().includes('standard') && r.status === 'OCCUPIED').length;
  const occupiedDeluxe = allHotelRooms.filter(r => r.room_type?.toLowerCase().includes('deluxe') && r.status === 'OCCUPIED').length;
  const occupiedSuites = allHotelRooms.filter(r => (r.room_type?.toLowerCase().includes('suite') || r.room_type?.toLowerCase().includes('villa')) && r.status === 'OCCUPIED').length;

  const vacantStandard = allHotelRooms.filter(r => r.room_type?.toLowerCase().includes('standard') && r.status === 'AVAILABLE').length;
  const vacantDeluxe = allHotelRooms.filter(r => r.room_type?.toLowerCase().includes('deluxe') && r.status === 'AVAILABLE').length;
  const vacantSuites = allHotelRooms.filter(r => (r.room_type?.toLowerCase().includes('suite') || r.room_type?.toLowerCase().includes('villa')) && r.status === 'AVAILABLE').length;

  const deluxeOccRate = occupiedDeluxe / totalDeluxe;
  const suiteOccRate = occupiedSuites / totalSuites;
  const standardOccRate = occupiedStandard / totalStandard;

  return (
    <div className="h-[calc(100vh-6rem)] relative fd-app-bg p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
      <style>{FD_STYLES}</style>

      {/* Ambient decorative orbs — pure atmosphere, no interaction */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="fd-orb w-[30rem] h-[30rem] bg-[#D4A373]/10"
          style={{ top: '-8rem', left: '-6rem' }}
          animate={{ x: [0, 46, 0], y: [0, 32, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="fd-orb w-[34rem] h-[34rem] bg-[#D4A373]/10"
          style={{ top: '18%', right: '-10rem' }}
          animate={{ x: [0, -38, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="fd-orb w-[26rem] h-[26rem] bg-[#D4A373]/15"
          style={{ bottom: '-4rem', left: '30%' }}
          animate={{ x: [0, 34, 0], y: [0, -24, 0], scale: [1, 1.06, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="absolute inset-0 fd-dot-grid" />
      </div>

      {/* ═══════════════════════════════════════════════════════
          LEFT FLOATING SIDEBAR
          ═══════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full lg:w-72 shrink-0 rounded-[2rem] p-6 flex flex-col gap-6 fd-dealdeck-sidebar sticky top-[7.5rem] self-start z-30 lg:h-[calc(100vh-7.8rem)]"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: -10, scale: 1.1 }}
            animate={{ y: [0, -3, 0] }}
            transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, rotate: { type: 'spring', stiffness: 400, damping: 12 }, scale: { type: 'spring', stiffness: 400, damping: 12 } }}
            className="relative w-11 h-11 rounded-xl fd-brand-mark flex items-center justify-center shadow-xs bg-zinc-50 border border-zinc-100"
          >
            <Hotel size={20} className="text-[#D4A373]" />
          </motion.div>
          <div>
            <h1 className="font-serif font-black text-[25px] text-zinc-500 text-base leading-none">Front Desk</h1>
            <span className="text-[9px] font-bold text-[#D4A373] uppercase tracking-widest mt-1 flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="fd-live-dot absolute inline-flex h-full w-full rounded-full bg-[#D4A373]" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#D4A373]" />
              </span>
              HMS Reception
            </span>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto fd-sidebar-scroll pr-1">
          {/* Section: Menu */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Menu</p>
            <div className="relative flex flex-col gap-1">
              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setViewMode('active'); setActiveFilter('all'); }}
                className={`relative z-10 flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 text-left overflow-hidden ${viewMode === 'active' && activeFilter === 'all' ? 'text-white' : 'text-zinc-500 hover:bg-amber-50 hover:text-[#D4A373]'
                  }`}
              >
                {viewMode === 'active' && activeFilter === 'all' && (
                  <motion.span layoutId="fd-sidebar-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="absolute inset-0 bg-gradient-to-r from-[#D4A373] to-[#B3835B] shadow-md shadow-[#D4A373]/30 rounded-xl" />
                )}
                <span className="relative fd-icon-btn"><BedDouble size={15} /></span>
                <span className="relative">All Active Stays</span>
              </motion.button>
              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setViewMode('active'); setActiveFilter('arrivals'); }}
                className={`relative z-10 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 overflow-hidden ${viewMode === 'active' && activeFilter === 'arrivals' ? 'text-white' : 'text-zinc-500 hover:bg-amber-50 hover:text-[#D4A373]'
                  }`}
              >
                {viewMode === 'active' && activeFilter === 'arrivals' && (
                  <motion.span layoutId="fd-sidebar-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="absolute inset-0 bg-gradient-to-r from-[#D4A373] to-[#B3835B] shadow-md shadow-[#D4A373]/30 rounded-xl" />
                )}
                <span className="relative flex items-center gap-3"><span className="fd-icon-btn"><LogIn size={15} /></span> Arrivals Today</span>
                <span className={`relative px-2 py-0.5 rounded-md text-[10px] transition-transform duration-300 ${viewMode === 'active' && activeFilter === 'arrivals' ? 'bg-white/25 text-white scale-110' : 'bg-amber-50 text-[#D4A373]'}`}>
                  <CountUp value={arrivalsCount} />
                </span>
              </motion.button>
              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setViewMode('active'); setActiveFilter('departures'); }}
                className={`relative z-10 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 overflow-hidden ${viewMode === 'active' && activeFilter === 'departures' ? 'text-white' : 'text-zinc-500 hover:bg-amber-50 hover:text-[#D4A373]'
                  }`}
              >
                {viewMode === 'active' && activeFilter === 'departures' && (
                  <motion.span layoutId="fd-sidebar-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="absolute inset-0 bg-gradient-to-r from-[#D4A373] to-[#B3835B] shadow-md shadow-[#D4A373]/30 rounded-xl" />
                )}
                <span className="relative flex items-center gap-3"><span className="fd-icon-btn"><DoorOpen size={15} /></span> Departures Today</span>
                <span className={`relative px-2 py-0.5 rounded-md text-[10px] transition-transform duration-300 ${viewMode === 'active' && activeFilter === 'departures' ? 'bg-white/25 text-white scale-110' : 'bg-amber-50 text-[#D4A373]'}`}>
                  <CountUp value={departuresCount} />
                </span>
              </motion.button>
              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setViewMode('active'); setActiveFilter('inhouse'); }}
                className={`relative z-10 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 overflow-hidden ${viewMode === 'active' && activeFilter === 'inhouse' ? 'text-white' : 'text-zinc-500 hover:bg-amber-50 hover:text-[#D4A373]'
                  }`}
              >
                {viewMode === 'active' && activeFilter === 'inhouse' && (
                  <motion.span layoutId="fd-sidebar-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="absolute inset-0 bg-gradient-to-r from-[#D4A373] to-[#B3835B] shadow-md shadow-[#D4A373]/30 rounded-xl" />
                )}
                <span className="relative flex items-center gap-3"><span className="fd-icon-btn"><Users size={15} /></span> In-House Guests</span>
                <span className={`relative px-2 py-0.5 rounded-md text-[10px] transition-transform duration-300 ${viewMode === 'active' && activeFilter === 'inhouse' ? 'bg-white/25 text-white scale-110' : 'bg-amber-50 text-[#D4A373]'}`}>
                  <CountUp value={inhouseCount} />
                </span>
              </motion.button>
            </div>
          </div>

          {/* Section: Pending & Status */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Alerts</p>
            <div className="relative flex flex-col gap-1">
              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setViewMode('active'); setActiveFilter('pending_checkin'); }}
                className={`relative z-10 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 overflow-hidden ${viewMode === 'active' && activeFilter === 'pending_checkin' ? 'text-white' : 'text-zinc-500 hover:bg-amber-50 hover:text-[#D4A373]'
                  }`}
              >
                {viewMode === 'active' && activeFilter === 'pending_checkin' && (
                  <motion.span layoutId="fd-sidebar-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="absolute inset-0 bg-gradient-to-r from-[#D4A373] to-[#B3835B] shadow-md shadow-[#D4A373]/30 rounded-xl" />
                )}
                <span className="relative flex items-center gap-3"><span className="fd-icon-btn"><CalendarCheck size={15} /></span> Pending Check-ins</span>
                <span className={`relative px-2 py-0.5 rounded-md text-[10px] transition-transform duration-300 ${viewMode === 'active' && activeFilter === 'pending_checkin' ? 'bg-white/25 text-white scale-110' : 'bg-amber-50 text-[#D4A373]'}`}>
                  <CountUp value={pendingCheckinsCount} />
                </span>
              </motion.button>
              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setViewMode('active'); setActiveFilter('pending_checkout'); }}
                className={`relative z-10 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 overflow-hidden ${viewMode === 'active' && activeFilter === 'pending_checkout' ? 'text-white' : 'text-zinc-500 hover:bg-amber-50 hover:text-[#D4A373]'
                  }`}
              >
                {viewMode === 'active' && activeFilter === 'pending_checkout' && (
                  <motion.span layoutId="fd-sidebar-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="absolute inset-0 bg-gradient-to-r from-[#D4A373] to-[#B3835B] shadow-md shadow-[#D4A373]/30 rounded-xl" />
                )}
                <span className="relative flex items-center gap-3">
                  <motion.span
                    animate={pendingCheckoutsCount > 0 ? { scale: [1, 1.25, 1] } : {}}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="fd-icon-btn"
                  >
                    <AlertTriangle size={15} className={viewMode === 'active' && activeFilter === 'pending_checkout' ? 'text-white' : 'text-rose-500'} />
                  </motion.span>
                  Pending Checkouts
                </span>
                <span className={`relative px-2 py-0.5 rounded-md text-[10px] transition-transform duration-300 ${viewMode === 'active' && activeFilter === 'pending_checkout' ? 'bg-white/25 text-white scale-110' : 'bg-amber-100 text-[#D4A373] font-black'}`}>
                  <CountUp value={pendingCheckoutsCount} />
                </span>
              </motion.button>
            </div>
          </div>


          {/* Section: History */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">History &amp; Ledger</p>
            <motion.button
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setViewMode('history'); loadAllBookings(); }}
              className={`relative z-10 w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 text-left overflow-hidden ${viewMode === 'history' ? 'text-white' : 'text-zinc-500 hover:bg-amber-50 hover:text-amber-700'
                }`}
            >
              {viewMode === 'history' && (
                <motion.span layoutId="fd-sidebar-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-400 shadow-md shadow-amber-500/30 rounded-xl" />
              )}
              <span className="relative fd-icon-btn"><History size={15} /></span>
              <span className="relative">Booking History Log</span>
            </motion.button>
          </div>
        </div>

      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          MAIN WORKSPACE CANVAS
          ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col gap-6 overflow-y-auto fd-scrollbar min-w-0 pr-2 pb-6">

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

        {/* HEADER RIBBON */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h2 className="text-2xl font-black text-zinc-500 tracking-tight mt-0.5">Reception Command Center</h2>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            {/* Live Indicator */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="fd-live-dot absolute inline-flex h-full w-full rounded-full bg-emerald-500" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider">Live System</span>
            </div>

            {/* Refresh */}
            <motion.button
              whileHover={{ scale: 1.06, rotate: isRefreshing ? 0 : 180 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => loadDashboard(false)}
              className={`p-2.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-amber-50 hover:shadow-md text-zinc-500 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={15} />
            </motion.button>

            {/* Profile Avatar Widget */}
            {(() => {
              const staffName = localStorage.getItem('hms_name') || 'Staff';
              const staffRole = localStorage.getItem('hms_role') || 'FRONT_DESK';
              const initials = staffName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'FD';
              const designationMap = {
                FRONT_DESK: 'Front Desk Agent', RECEPTION: 'Front Desk Agent',
                HOUSEKEEPING: 'Housekeeper', ADMIN: 'Administrator',
                FINANCE: 'Finance Officer', RESTAURANT: 'Restaurant Staff'
              };
              const designation = designationMap[staffRole] || 'Staff';
              return (
                <motion.div whileHover={{ y: -2 }} className="flex items-center gap-2 bg-white pl-2.5 pr-3 py-1.5 rounded-xl border border-zinc-200/60 shadow-xs hover:shadow-md transition-shadow duration-300">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#D4A373] to-[#B3835B] text-white font-bold text-xs flex items-center justify-center shadow-xs">
                    {initials}
                  </div>
                  <div className="hidden sm:block text-left leading-none">
                    <span className="text-xs font-bold text-zinc-900 block">{staffName}</span>
                    <span className="text-[8px] font-semibold text-zinc-600 uppercase tracking-widest mt-0.5 block">{designation}</span>
                  </div>
                </motion.div>
              );
            })()}
          </div>
        </motion.div>

        {/* 4 TOP KPI STATS CARD ROW — tilting glass cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Total Occupancy */}
          <TiltCard
            glowHex="#14b8a6"
            onClick={() => { setViewMode('active'); setActiveFilter('all'); }}
            className={`fd-kpi-tilt rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden h-36 select-none ${activeFilter === 'all' && viewMode === 'active' ? 'fd-dealdeck-focus-card text-white' : 'fd-dealdeck-card text-zinc-900 bg-white'
              }`}
          >
            <div className={`fd-kpi-blob ${activeFilter === 'all' && viewMode === 'active' ? 'bg-white/30' : 'bg-[#D4A373]/20'}`} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeFilter === 'all' && viewMode === 'active' ? 'text-white/80' : 'text-zinc-400'}`}>Total Occupancy</p>
                <h3 className="text-3xl font-black mt-1 leading-none"><CountUp value={Math.round((inhouseCount / 20) * 100)} suffix="%" /></h3>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-0.5 ${activeFilter === 'all' && viewMode === 'active' ? 'bg-white/20 text-white' : 'bg-amber-50 text-[#D4A373]'
                }`}>
                <TrendingUp size={10} /> +2.08%
              </span>
            </div>
            <p className={`relative text-[10px] mt-auto ${activeFilter === 'all' && viewMode === 'active' ? 'text-white/60' : 'text-zinc-400'}`}>Rooms occupied today ({inhouseCount} stays)</p>
          </TiltCard>

          {/* Card 2: Arrivals Today */}
          <TiltCard
            glowHex="#10b981"
            onClick={() => { setViewMode('active'); setActiveFilter('arrivals'); }}
            className={`fd-kpi-tilt rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden h-36 select-none ${activeFilter === 'arrivals' && viewMode === 'active' ? 'fd-dealdeck-focus-card text-white' : 'fd-dealdeck-card text-zinc-900 bg-white'
              }`}
          >
            <div className={`fd-kpi-blob ${activeFilter === 'arrivals' && viewMode === 'active' ? 'bg-white/30' : 'bg-emerald-300/40'}`} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeFilter === 'arrivals' && viewMode === 'active' ? 'text-white/80' : 'text-zinc-400'}`}>Arrivals Today</p>
                <h3 className="text-3xl font-black mt-1 leading-none"><CountUp value={arrivalsCount} /></h3>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-0.5 ${activeFilter === 'arrivals' && viewMode === 'active' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                <TrendingUp size={10} /> +12.4%
              </span>
            </div>
            <p className={`relative text-[10px] mt-auto ${activeFilter === 'arrivals' && viewMode === 'active' ? 'text-white/60' : 'text-zinc-400'}`}>Scheduled check-ins for the day</p>
          </TiltCard>

          {/* Card 3: Departures Today */}
          <TiltCard
            glowHex="#f59e0b"
            onClick={() => { setViewMode('active'); setActiveFilter('departures'); }}
            className={`fd-kpi-tilt rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden h-36 select-none ${activeFilter === 'departures' && viewMode === 'active' ? 'fd-dealdeck-focus-card text-white' : 'fd-dealdeck-card text-zinc-900 bg-white'
              }`}
          >
            <div className={`fd-kpi-blob ${activeFilter === 'departures' && viewMode === 'active' ? 'bg-white/30' : 'bg-amber-300/40'}`} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeFilter === 'departures' && viewMode === 'active' ? 'text-white/80' : 'text-zinc-400'}`}>Departures Today</p>
                <h3 className="text-3xl font-black mt-1 leading-none"><CountUp value={departuresCount} /></h3>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-0.5 ${activeFilter === 'departures' && viewMode === 'active' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                Balanced
              </span>
            </div>
            <p className={`relative text-[10px] mt-auto ${activeFilter === 'departures' && viewMode === 'active' ? 'text-white/60' : 'text-zinc-400'}`}>Scheduled room check-outs</p>
          </TiltCard>

          {/* Card 4: Overstay Warnings */}
          <TiltCard
            glowHex="#fb7185"
            onClick={() => { setViewMode('active'); setActiveFilter('pending_checkout'); }}
            className={`fd-kpi-tilt rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden h-36 select-none ${activeFilter === 'pending_checkout' && viewMode === 'active' ? 'fd-dealdeck-focus-card text-white' : 'fd-dealdeck-card text-zinc-900 bg-white'
              }`}
          >
            <div className={`fd-kpi-blob ${activeFilter === 'pending_checkout' && viewMode === 'active' ? 'bg-white/30' : 'bg-rose-300/40'}`} />
            <div className="relative flex items-start justify-between">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeFilter === 'pending_checkout' && viewMode === 'active' ? 'text-white/80' : 'text-zinc-400'}`}>Overstay Warnings</p>
                <h3 className="text-3xl font-black mt-1 leading-none"><CountUp value={pendingCheckoutsCount} /></h3>
              </div>
              <motion.span
                animate={pendingCheckoutsCount > 0 && !(activeFilter === 'pending_checkout' && viewMode === 'active') ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 1.4, repeat: Infinity }}
                className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-0.5 ${activeFilter === 'pending_checkout' && viewMode === 'active' ? 'bg-white/20 text-white' : (pendingCheckoutsCount > 0 ? 'bg-rose-50 text-rose-700 border border-rose-100' : 'bg-zinc-100 text-zinc-500')
                  }`}
              >
                {pendingCheckoutsCount > 0 ? 'Action Needed' : 'All Clear'}
              </motion.span>
            </div>
            <p className={`relative text-[10px] mt-auto ${activeFilter === 'pending_checkout' && viewMode === 'active' ? 'text-white/60' : 'text-zinc-400'}`}>Guests past 11:00 AM limit</p>
          </TiltCard>
        </div>

        {/* WALK-IN BOOKING QUICK PANEL — light gradient, no black/purple */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="fd-glow-border-wrap rounded-[2rem] p-[2px]"
          style={{ background: 'linear-gradient(120deg, #D4A373, #B3835B, #D4A373)', backgroundSize: '200% 200%', animation: 'fd-brand-shimmer 8s ease-in-out infinite' }}
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-[#D4A373] via-[#D4A373] to-[#B3835B] text-white rounded-[calc(2rem-2px)] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="absolute inset-0 bg-[radial-gradient(420px_200px_at_15%_0%,rgba(255,255,255,0.18),transparent_60%)] pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] }}
                transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
                className="hidden sm:flex w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm items-center justify-center shrink-0 shadow-lg"
              >
                <Zap size={18} className="text-white" />
              </motion.div>
              <div>
                <h3 className="text-base font-black tracking-tight">Walk-In Reservation Quick Desk</h3>
                <p className="text-xs text-white/80 mt-0.5 leading-normal">
                  Instantly check in walk-in guests, assign rooms, and generate direct billing invoices.
                </p>
              </div>
            </div>
            <div className="relative flex items-center gap-3 shrink-0 w-full md:w-auto justify-end">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-xs text-white font-bold backdrop-blur-sm">
                <CheckCircle2 size={13} className="text-emerald-200" />
                <CountUp value={parseInt(availableCount) || 0} /> Rooms Vacant
              </span>
              <RippleButton
                onClick={openWalkIn}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-[#B3835B] font-bold text-xs px-5 py-3 rounded-xl transition-colors duration-200 shadow-lg w-full sm:w-auto hover:bg-amber-50"
              >
                New Walk-In Booking
              </RippleButton>
            </div>
          </div>
        </motion.div>

        {/* WORKSPACE CONTENT GRID: GUEST LIST vs STATS */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">

          {/* LEFT WIDE AREA: GUEST LIST (col-span-2) */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            <AnimatePresence mode="wait">

              {/* VIEW 1: ACTIVE STAYS VIEW */}
              {viewMode === 'active' && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-5 bg-white rounded-[2rem] p-6 shadow-[0px_18px_40px_rgba(56,189,248,0.08)] border border-zinc-100"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div>
                      <h3 className="text-lg font-black text-zinc-900">
                        {activeFilter === 'all' && 'All Active Stays'}
                        {activeFilter === 'arrivals' && 'Arrivals Scheduled'}
                        {activeFilter === 'departures' && 'Departures Scheduled'}
                        {activeFilter === 'inhouse' && 'Guests In-House'}
                        {activeFilter === 'pending_checkin' && 'Pending Check-ins'}
                        {activeFilter === 'pending_checkout' && 'Pending Checkouts'}
                      </h3>
                      <p className="text-xs text-zinc-400 mt-0.5">Filter active stays from side controls or lookup via name.</p>
                    </div>

                    {/* Search Field inside Guest list container */}
                    <div ref={searchRef} className="relative w-full md:w-72">
                      <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 transition-all duration-300 group-focus-within:text-[#D4A373] group-focus-within:scale-110" size={16} />
                        <input
                          type="text"
                          placeholder="Search guests or rooms…"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          onFocus={() => searchResults.length > 0 && setIsSearchOpen(true)}
                          className="fd-input !pl-10 pr-4"
                        />
                        {searchQuery && (
                          <motion.button
                            whileHover={{ rotate: 90, scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => { setSearchQuery(''); setSearchResults([]); setIsSearchOpen(false); }}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                          >
                            <X size={14} />
                          </motion.button>
                        )}
                      </div>

                      {/* Dropdown search output */}
                      <AnimatePresence>
                        {isSearchOpen && searchResults.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, y: -8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            className="absolute top-full mt-2 w-full fd-search-dropdown rounded-2xl z-40 overflow-hidden shadow-lg p-2"
                          >
                            {searchResults.map((guest) => (
                              <button
                                key={guest.id}
                                onClick={() => {
                                  setIsSearchOpen(false);
                                  setSearchQuery('');
                                  if (guest.room_number) {
                                    setActiveFilter('all');
                                    setTimeout(() => {
                                      const el = document.getElementById(`stay-${guest.room_number}`);
                                      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                      el?.classList.add('ring-2', 'ring-[#D4A373]', 'ring-offset-2');
                                      setTimeout(() => el?.classList.remove('ring-2', 'ring-[#D4A373]', 'ring-offset-2'), 2000);
                                    }, 100);
                                  }
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-amber-50 transition-colors text-left text-xs"
                              >
                                <div className="w-8 h-8 rounded-full bg-amber-50 text-[#D4A373] font-bold flex items-center justify-center">
                                  {guest.name?.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-zinc-900 truncate">{guest.name}</p>
                                  <p className="text-[10px] text-zinc-400 truncate">Room {guest.room_number || 'Inactive'}</p>
                                </div>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {filteredStays.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-dashed border-zinc-200 rounded-2xl p-12 text-center bg-amber-50/20"
                    >
                      <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
                        <BedDouble size={32} className="text-[#D4A373]/50 mx-auto mb-2" />
                      </motion.div>
                      <p className="text-sm font-bold text-zinc-400">No Stays Found</p>
                      <p className="text-xs text-zinc-400 mt-0.5">Try clearing filters or check in a walk-in reservation.</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      layout
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <AnimatePresence mode="popLayout">
                        {filteredStays.map((stay, idx) => {
                          const ss = getStatusStyle(stay.booking_status);
                          const StatusIcon = getStatusIcon(stay.booking_status);

                          return (
                            <motion.div
                              key={stay.booking_id}
                              id={`stay-${stay.room_number}`}
                              variants={cardVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              layout
                              style={{ '--accent': ss.accent }}
                              whileHover={{ y: -5, scale: 1.015, boxShadow: `0px 22px 45px -16px rgba(${ss.accent}, 0.32)` }}
                              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                              className="fd-card bg-white rounded-[1.5rem] border border-zinc-200/60 p-4 shadow-sm relative overflow-hidden"
                            >
                              <div className="flex justify-between items-start gap-2 mb-3">
                                <div className="flex gap-2.5 items-center min-w-0">
                                  <motion.div
                                    whileHover={{ scale: 1.1, rotate: -6 }}
                                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                    className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-amber-50 text-[#B3835B] font-black text-xs flex items-center justify-center shrink-0 shadow-xs ring-2 ring-white"
                                    style={{ boxShadow: `0 0 0 3px rgba(${ss.accent}, 0.15)` }}
                                  >
                                    {stay.guest_name?.charAt(0)}
                                  </motion.div>
                                  <div className="min-w-0">
                                    <h4 className="font-bold text-zinc-900 text-sm truncate">{stay.guest_name}</h4>
                                    <p className="text-[10px] text-zinc-400 truncate">Rm {stay.room_number} · {stay.room_type}</p>
                                  </div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border flex items-center gap-1 ${ss.bg} ${ss.text} ${ss.border}`}>
                                  {stay.booking_status === 'CHECKED_IN' ? (
                                    <span className="relative flex h-1.5 w-1.5">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                    </span>
                                  ) : (
                                    <StatusIcon size={9} />
                                  )}
                                  {stay.booking_status.replace('_', ' ')}
                                </span>
                              </div>

                              {/* Info grid */}
                              <div className="relative grid grid-cols-2 gap-2 text-[11px] text-zinc-500 bg-amber-50/40 p-2.5 rounded-xl border border-zinc-200">
                                <div>
                                  <span className="block text-[9px] uppercase tracking-wider text-zinc-400">Check-in</span>
                                  <span className="font-bold text-zinc-800">{safeDateRender(stay.check_in_date)}</span>
                                </div>
                                <div>
                                  <span className="block text-[9px] uppercase tracking-wider text-zinc-400">Check-out</span>
                                  <span className={`font-bold ${isPendingCheckout(stay) ? 'text-rose-500' : 'text-zinc-800'}`}>
                                    {safeDateRender(stay.check_out_date)}
                                    {isPendingCheckout(stay) && ' (Late)'}
                                  </span>
                                </div>
                                <div className="col-span-2 pt-1 border-t border-[#D4A373]/30/40 flex justify-between items-center text-xs">
                                  <span className="font-bold text-zinc-800">Total Charged</span>
                                  <span className="font-black text-[#D4A373]">₹{parseInt(stay.total_price).toLocaleString('en-IN')}</span>
                                </div>
                              </div>

                              {/* Stays actions */}
                              <div className="relative mt-3 pt-2.5 border-t border-zinc-100 flex justify-end gap-1">
                                {stay.booking_status === 'CONFIRMED' && (
                                  <>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.94 }}
                                      onClick={() => openCheckin(stay)}
                                      className="group flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-colors"
                                    >
                                      <span className="fd-icon-btn"><LogIn size={11} /></span> Check In
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.94 }}
                                      onClick={() => handleCancel(stay.booking_id || stay.id)}
                                      className="group flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                                    >
                                      <span className="fd-icon-btn"><X size={11} /></span> Cancel
                                    </motion.button>
                                  </>
                                )}
                                {stay.booking_status === 'CHECKED_IN' && (
                                  <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.94 }}
                                    onClick={() => openCheckout(stay)}
                                    className="group flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-colors"
                                  >
                                    <span className="fd-icon-btn"><DoorOpen size={11} /></span> Check Out
                                  </motion.button>
                                )}
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.94 }}
                                  onClick={() => openExtend(stay)}
                                  className="group flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-zinc-600 hover:bg-amber-50 hover:text-amber-700 border border-transparent hover:border-amber-100 transition-colors"
                                >
                                  <span className="fd-icon-btn"><Clock size={11} /></span> Extend
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.94 }}
                                  onClick={() => openRoomChange(stay)}
                                  className="group flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-zinc-600 hover:bg-amber-50 hover:text-[#D4A373] border border-transparent hover:border-sky-100 transition-colors"
                                >
                                  <span className="fd-icon-btn"><ArrowRightLeft size={11} /></span> Shift Room
                                </motion.button>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {/* VIEW 2: HISTORY ARCHIVES VIEW */}
              {viewMode === 'history' && (
                <motion.div
                  key="history"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col gap-5 bg-white rounded-[2rem] p-6 shadow-[0px_18px_40px_rgba(56,189,248,0.08)] border border-zinc-100"
                >
                  <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-zinc-900">Archive Bookings Log</h3>
                      <p className="text-xs text-zinc-400 mt-0.5">Historical ledger logs and checkouts.</p>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-1 bg-amber-50/60 p-0.5 rounded-xl border border-zinc-200">
                      {['', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'CANCELLED'].map(f => (
                        <button
                          key={f}
                          onClick={() => { setHistoryFilter(f); setHistoryPage(1); }}
                          className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${historyFilter === f
                            ? 'bg-[#D4A373] text-white shadow-xs'
                            : 'text-zinc-500 hover:text-[#B3835B]'
                            }`}
                        >
                          {f || 'All'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-zinc-100 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          <th className="p-3 font-bold">Guest</th>
                          <th className="p-3 font-bold">Room</th>
                          <th className="p-3 font-bold">Check-in</th>
                          <th className="p-3 font-bold">Check-out</th>
                          <th className="p-3 font-bold">Amount</th>
                          <th className="p-3 font-bold text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-50 text-xs">
                        {(() => {
                          const startIndex = (historyPage - 1) * historyItemsPerPage;
                          const paginatedBookings = allBookings.slice(startIndex, startIndex + historyItemsPerPage);
                          const totalPages = Math.ceil(allBookings.length / historyItemsPerPage);

                          if (allBookings.length === 0) {
                            return (
                              <tr>
                                <td colSpan="6" className="p-8 text-center text-zinc-400 italic">
                                  No historical bookings matched filters.
                                </td>
                              </tr>
                            );
                          }

                          return (
                            <>
                              {paginatedBookings.map((b) => {
                                const bs = getStatusStyle(b.booking_status);
                                return (
                                  <tr key={b.booking_id} className="hover:bg-amber-50/40 transition-colors">
                                    <td className="p-3 font-bold text-zinc-900">
                                      {b.guest_name}
                                      <span className="block text-[10px] font-normal text-zinc-400 mt-0.5">{b.guest_email}</span>
                                    </td>
                                    <td className="p-3">
                                      <span className="font-bold text-zinc-800 bg-amber-50 px-1.5 py-0.5 rounded">{b.room_number}</span>
                                      <span className="text-zinc-400 ml-1.5">{b.room_type}</span>
                                    </td>
                                    <td className="p-3 text-zinc-600">{new Date(b.check_in_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td className="p-3 text-zinc-600">{new Date(b.check_out_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td className="p-3 font-bold text-zinc-900">₹{parseInt(b.total_price).toLocaleString('en-IN')}</td>
                                    <td className="p-3 text-right">
                                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${bs.bg} ${bs.text} ${bs.border}`}>
                                        <span className={`w-1 h-1 rounded-full ${bs.dot}`} />
                                        {b.booking_status.replace('_', ' ')}
                                      </span>
                                    </td>
                                  </tr>
                                );
                              })}
                              {totalPages > 1 && (
                                <tr>
                                  <td colSpan="6" className="p-3 border-t border-zinc-200">
                                    <div className="flex items-center justify-between">
                                      <span className="text-[10px] text-zinc-400">Showing {startIndex + 1} to {Math.min(startIndex + historyItemsPerPage, allBookings.length)} of {allBookings.length} bookings</span>
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                                          disabled={historyPage === 1}
                                          className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-amber-50 text-[10px] font-bold disabled:opacity-50"
                                        >
                                          Prev
                                        </button>
                                        <span className="text-[10px] font-bold bg-amber-50 px-2.5 py-1 rounded-lg">{historyPage} / {totalPages}</span>
                                        <button
                                          onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                                          disabled={historyPage === totalPages}
                                          className="px-2.5 py-1 bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-amber-50 text-[10px] font-bold disabled:opacity-50"
                                        >
                                          Next
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
                          );
                        })()}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* RIGHT SIDEBAR PANEL: CONCENTRIC ROOM CHART & DETAILS */}
          <div className="flex flex-col gap-6">

            {/* Concentric Progress Rings */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="bg-white rounded-[2rem] p-6 shadow-[0px_18px_40px_rgba(56,189,248,0.08)] border border-zinc-100 flex flex-col items-center"
            >
              <div className="w-full text-left mb-4">
                <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                  <Building2 size={16} className="text-[#D4A373]" /> Occupancy breakdown
                </h3>
                <p className="text-[10px] text-zinc-400 mt-0.5">Real-time room occupancy rates by type</p>
              </div>

              {/* Chart */}
              <RoomStatsRings
                deluxeOcc={deluxeOccRate}
                suiteOcc={suiteOccRate}
                standardOcc={standardOccRate}
              />

              {/* Legend with matching colors */}
              <div className="w-full mt-4 flex flex-col gap-2 border-t border-zinc-100 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0ea5e9]" />
                    <span className="font-medium text-zinc-600">Deluxe Rooms</span>
                  </div>
                  <span className="font-bold text-zinc-900">{occupiedDeluxe} / {totalDeluxe}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#fb923c]" />
                    <span className="font-medium text-zinc-600">Suites</span>
                  </div>
                  <span className="font-bold text-zinc-900">{occupiedSuites} / {totalSuites}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#14b8a6]" />
                    <span className="font-medium text-zinc-600">Standard Rooms</span>
                  </div>
                  <span className="font-bold text-zinc-900">{occupiedStandard} / {totalStandard}</span>
                </div>
              </div>
            </motion.div>

            {/* Inventory available rooms list */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.4 }}
              className="bg-white rounded-[2rem] p-6 shadow-[0px_18px_40px_rgba(56,189,248,0.08)] border border-zinc-100 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-500" /> Room Inventory
                  </h3>
                  <p className="text-[10px] text-zinc-400 mt-0.5">Vacant rooms ready for walk-ins</p>
                </div>
                <motion.button
                  whileHover={{ x: 2 }}
                  onClick={async () => { await loadAvailableRooms(); setModalType('available_rooms'); }}
                  className="text-[10px] font-bold text-[#D4A373] hover:text-[#B3835B]"
                >
                  View Details
                </motion.button>
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center py-2 px-3 bg-sky-50/60 rounded-xl border border-sky-100">
                  <span className="text-xs font-bold text-zinc-800">Deluxe (Vacant)</span>
                  <span className="text-xs font-bold text-zinc-500">{vacantDeluxe} Available</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-amber-50/60 rounded-xl border border-amber-100">
                  <span className="text-xs font-bold text-zinc-800">Standard (Vacant)</span>
                  <span className="text-xs font-bold text-zinc-500">{vacantStandard} Available</span>
                </div>
                <div className="flex justify-between items-center py-2 px-3 bg-amber-50/60 rounded-xl border border-zinc-200">
                  <span className="text-xs font-bold text-zinc-800">Suites (Vacant)</span>
                  <span className="text-xs font-bold text-zinc-500">{vacantSuites} Available</span>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          GLASSMORPHISM MODAL SYSTEM
          ═══════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {modalType !== 'none' && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-50 flex items-center justify-center fd-glass-backdrop p-4"
            onClick={() => { setModalType('none'); setSelectedStay(null); }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg fd-glass-modal rounded-3xl p-7 overflow-y-auto max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <motion.div
                    initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                    className={`relative w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${modalType === 'checkin' ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700' :
                      modalType === 'checkout' ? 'bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600' :
                        modalType === 'extend' ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700' :
                          modalType === 'change_room' ? 'bg-gradient-to-br from-sky-100 to-sky-200 text-sky-700' :
                            modalType === 'available_rooms' ? 'bg-gradient-to-br from-[#D4A373]/10 to-[#D4A373]/20 text-[#B3835B]' :
                              'bg-gradient-to-br from-[#D4A373]/10 to-[#D4A373]/20 text-[#B3835B]'
                      }`}
                  >
                    {modalType === 'checkin' && <LogIn size={20} />}
                    {modalType === 'checkout' && <DoorOpen size={20} />}
                    {modalType === 'extend' && <Clock size={20} />}
                    {modalType === 'change_room' && <ArrowRightLeft size={20} />}
                    {modalType === 'booking' && <Plus size={20} />}
                    {modalType === 'available_rooms' && <CheckCircle2 size={20} />}
                  </motion.div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-zinc-900">
                      {modalType === 'checkin' && 'Guest Check-In'}
                      {modalType === 'checkout' && 'Guest Check-Out'}
                      {modalType === 'extend' && 'Extend Stay'}
                      {modalType === 'change_room' && 'Change Room'}
                      {modalType === 'booking' && 'Walk-In Booking'}
                      {modalType === 'available_rooms' && 'Available Rooms'}
                    </h2>
                    {selectedStay && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {selectedStay.guest_name} • Room {selectedStay.room_number}
                      </p>
                    )}
                  </div>
                </div>
                <motion.button
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => { setModalType('none'); setSelectedStay(null); }}
                  className="p-2 rounded-xl hover:bg-zinc-100/80 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <X size={20} />
                </motion.button>
              </div>

              {/* ── CHECK-IN MODAL ── */}
              {modalType === 'checkin' && selectedStay && (
                <div className="space-y-5">
                  <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                      <CalendarCheck size={16} /> Confirm Guest Arrival
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><p className="text-zinc-500 font-medium">Guest</p><p className="font-bold text-zinc-800 mt-0.5">{selectedStay.guest_name}</p></div>
                      <div><p className="text-zinc-500 font-medium">Room</p><p className="font-bold text-zinc-800 mt-0.5">{selectedStay.room_number} ({selectedStay.room_type})</p></div>
                      <div><p className="text-zinc-500 font-medium">Check-In</p><p className="font-bold text-zinc-800 mt-0.5">{new Date(selectedStay.check_in_date).toLocaleDateString()}</p></div>
                      <div><p className="text-zinc-500 font-medium">Check-Out</p><p className="font-bold text-zinc-800 mt-0.5">{new Date(selectedStay.check_out_date).toLocaleDateString()}</p></div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">This will set the booking status to <strong>CHECKED IN</strong> and mark Room {selectedStay.room_number} as <strong>OCCUPIED</strong>.</p>
                  <RippleButton
                    onClick={() => handleCheckin(selectedStay.booking_id)}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                    {isSubmitting ? 'Processing…' : 'Confirm Check-In'}
                  </RippleButton>
                </div>
              )}

              {/* ── CHECK-OUT MODAL ── */}
              {modalType === 'checkout' && selectedStay && (
                <div className="space-y-5">
                  <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-rose-700">
                      <AlertTriangle size={16} /> Guest Departure Confirmation
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><p className="text-zinc-500 font-medium">Guest</p><p className="font-bold text-zinc-800 mt-0.5">{selectedStay.guest_name}</p></div>
                      <div><p className="text-zinc-500 font-medium">Room</p><p className="font-bold text-zinc-800 mt-0.5">{selectedStay.room_number} ({selectedStay.room_type})</p></div>
                      <div><p className="text-zinc-500 font-medium">Total Billed</p><p className="font-bold text-zinc-800 mt-0.5">₹{parseInt(selectedStay.total_price).toLocaleString('en-IN')}</p></div>
                      <div><p className="text-zinc-500 font-medium">Expected Out</p><p className="font-bold text-zinc-800 mt-0.5">{new Date(selectedStay.check_out_date).toLocaleDateString()}</p></div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">This will mark the booking as <strong>CHECKED OUT</strong> and set Room {selectedStay.room_number} to <strong>DIRTY</strong> for housekeeping.</p>
                  <RippleButton
                    onClick={() => handleCheckout(selectedStay.booking_id)}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-rose-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <DoorOpen size={16} />}
                    {isSubmitting ? 'Processing…' : 'Confirm Check-Out'}
                  </RippleButton>
                </div>
              )}

              {/* ── EXTEND STAY MODAL ── */}
              {modalType === 'extend' && selectedStay && (
                <form onSubmit={handleExtendStay} className="space-y-5">
                  <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
                      <Clock size={16} /> Stay Extension
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><p className="text-zinc-500 font-medium">Guest</p><p className="font-bold text-zinc-800 mt-0.5">{selectedStay.guest_name}</p></div>
                      <div><p className="text-zinc-500 font-medium">Room</p><p className="font-bold text-zinc-800 mt-0.5">{selectedStay.room_number}</p></div>
                      <div><p className="text-zinc-500 font-medium">Current Check-Out</p><p className="font-bold text-zinc-800 mt-0.5">{new Date(selectedStay.check_out_date).toLocaleDateString()}</p></div>
                      <div><p className="text-zinc-500 font-medium">Current Total</p><p className="font-bold text-zinc-800 mt-0.5">₹{parseInt(selectedStay.total_price).toLocaleString('en-IN')}</p></div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 tracking-wider mb-2">New Departure Date</label>
                    <input
                      type="date"
                      required
                      min={selectedStay.check_out_date?.split('T')[0]}
                      value={actionForm.new_check_out_date}
                      onChange={e => setActionForm({ ...actionForm, new_check_out_date: e.target.value })}
                      className="fd-input"
                    />
                  </div>
                  <RippleButton
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Clock size={16} />}
                    {isSubmitting ? 'Processing…' : 'Confirm Extension'}
                  </RippleButton>
                </form>
              )}

              {/* ── CHANGE ROOM MODAL ── */}
              {modalType === 'change_room' && selectedStay && (
                <form onSubmit={handleRoomChange} className="space-y-5">
                  <div className="bg-sky-50/80 border border-sky-200 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-sm font-bold text-sky-800">
                      <ArrowRightLeft size={16} /> Room Reallocation
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div><p className="text-zinc-500 font-medium">Guest</p><p className="font-bold text-zinc-800 mt-0.5">{selectedStay.guest_name}</p></div>
                      <div><p className="text-zinc-500 font-medium">Current Room</p><p className="font-bold text-zinc-800 mt-0.5">{selectedStay.room_number} ({selectedStay.room_type})</p></div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 tracking-wider mb-2">Select New Room</label>
                    <select
                      required
                      value={actionForm.new_room_id}
                      onChange={e => setActionForm({ ...actionForm, new_room_id: e.target.value })}
                      className="fd-input"
                    >
                      <option value="">— Available Rooms —</option>
                      {availableRooms.map(r => (
                        <option key={r.id} value={r.id}>
                          Room {r.room_number} — {r.room_type} (₹{r.base_price}/night)
                        </option>
                      ))}
                    </select>
                  </div>
                  <RippleButton
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <ArrowRightLeft size={16} />}
                    {isSubmitting ? 'Processing…' : 'Confirm Room Change'}
                  </RippleButton>
                </form>
              )}

              {/* ── AVAILABLE ROOMS MODAL ── */}
              {modalType === 'available_rooms' && (
                <div className="space-y-5">
                  <div className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">
                    {availableRooms.length} Room{availableRooms.length !== 1 ? 's' : ''} Ready
                  </div>
                  {availableRooms.length === 0 ? (
                    <div className="bg-amber-50/40 border border-dashed border-[#D4A373]/30 rounded-xl p-10 text-center">
                      <BedDouble size={28} className="text-[#D4A373]/50 mx-auto mb-3" />
                      <p className="text-sm font-medium text-zinc-400">No rooms available at the moment.</p>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[50vh] overflow-y-auto fd-scrollbar pr-1">
                      {availableRooms.map((room) => (
                        <motion.div
                          key={room.id}
                          whileHover={{ x: 2 }}
                          className="flex items-center justify-between gap-3 bg-white border border-zinc-200/80 rounded-xl px-4 py-3.5 hover:border-[#D4A373]/30 hover:bg-amber-50/30 transition-all group"
                        >
                          <div className="flex items-center gap-3">
                            <motion.div
                              whileHover={{ rotate: -6, scale: 1.08 }}
                              className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center shrink-0 shadow-sm"
                            >
                              <BedDouble size={18} className="text-[#B3835B]" />
                            </motion.div>
                            <div>
                              <p className="text-sm font-bold text-zinc-900">Room {room.room_number}</p>
                              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">{room.room_type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-zinc-800">₹{parseInt(room.base_price).toLocaleString('en-IN')}</p>
                            <p className="text-[10px] text-zinc-400 font-medium">per night</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                  <RippleButton
                    onClick={() => { setModalType('none'); openWalkIn(); }}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-[#D4A373] to-[#B3835B] hover:from-[#C08A5D] hover:to-[#A3734B] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-[#D4A373]/25 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Create Walk-In Booking
                  </RippleButton>
                </div>
              )}

              {/* ── WALK-IN BOOKING MODAL ── */}
              {modalType === 'booking' && (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 tracking-wider mb-2">Guest Information</label>
                    <div className="space-y-3">
                      <div className="relative">
                        <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          type="text"
                          placeholder="Full Name"
                          required
                          value={bookingForm.guest_name}
                          onChange={e => setBookingForm({ ...bookingForm, guest_name: e.target.value })}
                          className="fd-input !pl-11"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Mail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="email"
                            placeholder="Email"
                            required
                            value={bookingForm.guest_email}
                            onChange={e => setBookingForm({ ...bookingForm, guest_email: e.target.value })}
                            className="fd-input !pl-11"
                          />
                        </div>
                        <div className="relative">
                          <Phone size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Phone"
                            required
                            value={bookingForm.guest_phone}
                            onChange={e => setBookingForm({ ...bookingForm, guest_phone: e.target.value })}
                            className="fd-input !pl-11"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="relative">
                          <Users size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <select
                            value={bookingForm.number_of_guests}
                            onChange={(e) => setBookingForm({ ...bookingForm, number_of_guests: parseInt(e.target.value) })}
                            className="fd-input !pl-11 appearance-none cursor-pointer"
                          >
                            {[1, 2, 3, 4, 5, 6].map(num => (
                              <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                            ))}
                          </select>
                        </div>
                        <div className="relative">
                          <FileText size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input
                            type="text"
                            placeholder="Govt. ID Number"
                            required
                            value={bookingForm.guest_id_number}
                            onChange={e => setBookingForm({ ...bookingForm, guest_id_number: e.target.value })}
                            className="fd-input !pl-11"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 tracking-wider mb-2">Room & Stay Details</label>
                    <div className="space-y-3">
                      <select
                        required
                        value={bookingForm.room_id}
                        onChange={e => setBookingForm({ ...bookingForm, room_id: e.target.value })}
                        className="fd-input"
                      >
                        <option value="">— Select Room —</option>
                        {availableRooms.map(r => (
                          <option key={r.id} value={r.id}>
                            Room {r.room_number} — {r.room_type} (₹{r.base_price}/night)
                          </option>
                        ))}
                      </select>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 mb-1">CHECK-IN</label>
                          <input
                            type="date"
                            required
                            value={bookingForm.check_in_date}
                            onChange={e => setBookingForm({ ...bookingForm, check_in_date: e.target.value })}
                            className="fd-input"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-zinc-400 mb-1">CHECK-OUT</label>
                          <input
                            type="date"
                            required
                            min={bookingForm.check_in_date}
                            value={bookingForm.check_out_date}
                            onChange={e => setBookingForm({ ...bookingForm, check_out_date: e.target.value })}
                            className="fd-input"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Display */}
                  <div className="bg-gradient-to-r from-[#D4A373]/5 to-[#D4A373]/10 border border-[#D4A373]/30 border-dashed rounded-xl p-4 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Calculated Total</span>
                    <motion.span
                      key={bookingForm.total_price}
                      initial={{ scale: 1.2, color: '#0d9488' }}
                      animate={{ scale: 1, color: '#18181b' }}
                      transition={{ duration: 0.35 }}
                      className="text-xl font-bold"
                    >
                      ₹<CountUp value={bookingForm.total_price} />
                    </motion.span>
                  </div>

                  {bookingForm.number_of_guests > 3 && <div className="text-amber-600 text-xs bg-amber-50 border border-amber-200 p-2.5 rounded-lg text-center font-medium">For more than 3 guests, please book an additional room.</div>}

                  <RippleButton
                    type="submit"
                    disabled={isSubmitting || bookingForm.number_of_guests > 3}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-[#D4A373] to-[#B3835B] hover:from-[#C08A5D] hover:to-[#A3734B] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-[#D4A373]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {isSubmitting ? 'Creating…' : 'Create Walk-In Booking'}
                  </RippleButton>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}