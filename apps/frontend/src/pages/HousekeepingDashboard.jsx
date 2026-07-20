import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, animate } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, ClipboardCheck, AlertTriangle, CheckCircle2,
  BedDouble, ArrowRight, Loader2, X, RefreshCw,
  Droplets, Eye, Wrench, ShieldCheck, PackageOpen,
  Plus, Minus, Send, AlertCircle, Building2, TrendingUp, Clock,
  Radio, Zap, SprayCan
} from 'lucide-react';

const API_BASE = 'http://localhost:3000';

// ─── Custom CSS ─────────────────────────────────────────────
// Same visual language as the Front Desk dashboard — light, airy, teal/sky/amber
// mesh background, floating glass sidebar, tilting KPI cards, ripple buttons.
const FD_STYLES = `
  .fd-scrollbar { scrollbar-width: thin; scrollbar-color: transparent transparent; transition: scrollbar-color 0.3s ease; }
  .fd-scrollbar:hover { scrollbar-color: rgba(148,163,184,0.4) transparent; }
  .fd-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
  .fd-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .fd-scrollbar::-webkit-scrollbar-thumb { background: transparent; border-radius: 999px; }
  .fd-scrollbar:hover::-webkit-scrollbar-thumb { background: rgba(148,163,184,0.45); }
  .fd-scrollbar:hover::-webkit-scrollbar-thumb:hover { background: rgba(100,116,139,0.6); }

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

  .fd-dot-grid {
    background-image: radial-gradient(rgba(100,116,139,0.10) 1px, transparent 1px);
    background-size: 22px 22px;
    -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.8), rgba(0,0,0,0.08) 65%, transparent 100%);
    mask-image: linear-gradient(180deg, rgba(0,0,0,0.8), rgba(0,0,0,0.08) 65%, transparent 100%);
  }

  .fd-orb { position: absolute; border-radius: 9999px; filter: blur(70px); pointer-events: none; }

  .fd-brand-mark {
    background: linear-gradient(135deg, #14b8a6, #0ea5e9 55%, #2dd4bf);
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

  .fd-dealdeck-focus-card {
    box-shadow: 0px 20px 45px 0px rgba(20, 184, 166, 0.32) !important;
    transition: box-shadow 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
    cursor: pointer;
  }
  .fd-dealdeck-focus-card:hover {
    box-shadow: 0px 26px 55px 0px rgba(20, 184, 166, 0.42) !important;
  }

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

  .fd-glow-border-wrap { position: relative; }
`;

// ─── Small helper: animated counting number ─────────────────
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

// ─── Small helper: ripple button (motion-enabled, matches Front Desk) ──
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

// ─── Column Theme Config ────────────────────────────────────
// `accent` is a comma-separated RGB triplet used to drive per-card glow
// shadows via a CSS custom property, same pattern as the Front Desk cards.
const COLUMN_THEMES = {
  dirty: {
    label: 'Needs Cleaning',
    icon: Droplets,
    gradient: 'from-rose-500 to-red-500',
    bg: 'bg-rose-50/50',
    border: 'border-rose-200/60',
    badge: 'bg-rose-100 text-rose-700',
    cardAccent: 'border-l-rose-400',
    dotColor: 'bg-rose-500',
    accent: '244, 63, 94',
    glow: '#f43f5e'
  },
  cleaning: {
    label: 'In Progress',
    icon: Sparkles,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50/50',
    border: 'border-amber-200/60',
    badge: 'bg-amber-100 text-amber-700',
    cardAccent: 'border-l-amber-400',
    dotColor: 'bg-amber-500',
    accent: '245, 158, 11',
    glow: '#f59e0b'
  },
  inspecting: {
    label: 'Awaiting Inspection',
    icon: Eye,
    gradient: 'from-blue-500 to-indigo-500',
    bg: 'bg-blue-50/50',
    border: 'border-blue-200/60',
    badge: 'bg-blue-100 text-blue-700',
    cardAccent: 'border-l-blue-400',
    dotColor: 'bg-blue-500',
    accent: '59, 130, 246',
    glow: '#3b82f6'
  }
};

// ─── Amenity Catalog ────────────────────────────────────────
const AMENITY_CATALOG = [
  { name: 'Bath Towels', unit_cost: 50 },
  { name: 'Hand Towels', unit_cost: 25 },
  { name: 'Water Bottles', unit_cost: 20 },
  { name: 'Soap Bars', unit_cost: 15 },
  { name: 'Shampoo', unit_cost: 30 },
  { name: 'Toilet Paper', unit_cost: 10 },
  { name: 'Slippers', unit_cost: 40 },
  { name: 'Tea/Coffee Kit', unit_cost: 35 },
  { name: 'Dental Kit', unit_cost: 20 },
  { name: 'Bathrobe', unit_cost: 120 },
];

// ─── Animation Variants ────────────────────────────────────
const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const columnVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120, damping: 18 } }
};

const cardVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.97 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
  }),
  exit: { opacity: 0, scale: 0.95, y: -10, transition: { duration: 0.2 } }
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

export default function HousekeepingDashboard() {
  const navigate = useNavigate();

  useEffect(() => {
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

  // ─── Data States ───────────────────────────────────────────
  const [board, setBoard] = useState({ dirty: [], cleaning: [], inspecting: [] });
  const [stats, setStats] = useState({ dirty: 0, cleaning: 0, inspecting: 0, available: 0 });
  const [allRooms, setAllRooms] = useState([]);

  // ─── UI States ─────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'dirty' | 'cleaning' | 'inspecting'

  // ─── Modal States ──────────────────────────────────────────
  const [modalType, setModalType] = useState('none'); // 'none' | 'amenity' | 'damage'
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [amenityItems, setAmenityItems] = useState(
    AMENITY_CATALOG.map(a => ({ ...a, quantity: 0 }))
  );
  const [damageForm, setDamageForm] = useState({ room_id: '', issue: '', priority: 'High' });

  // ─── Auth Fetch Wrapper ────────────────────────────────────
  const fetchWithAuth = useCallback(async (url, options = {}) => {
    const token = sessionStorage.getItem('hms_token');
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
      if (res.status === 401) { navigate('/login'); return null; }
      return res;
    } catch (err) {
      console.error('Network error:', err);
      return null;
    }
  }, [navigate]);

  // ─── Data Loader ───────────────────────────────────────────
  const loadBoard = useCallback(async (showLoader = true) => {
    if (showLoader) setIsLoading(true);
    else setIsRefreshing(true);
    setLoadError(null);
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/housekeeping/board`);
      if (res?.ok) {
        const data = await res.json();
        setBoard(data.data.board);
        setStats(data.data.stats);
      } else if (res) {
        const errData = await res.json().catch(() => ({}));
        console.error('Housekeeping board error:', res.status, errData);
        setLoadError(`Server error (${res.status}): ${errData.error || 'Failed to load board'}. Please restart the backend server.`);
      } else {
        setLoadError('Cannot connect to the server. Make sure the backend is running on http://localhost:3000');
      }
    } catch (err) {
      console.error('Board load error:', err);
      setLoadError('Network error — please check your connection and try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchWithAuth]);

  const loadAllRooms = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/rooms`);
      if (res?.ok) {
        const data = await res.json();
        setAllRooms(data.data.rooms);
      }
    } catch (err) {
      console.error('Failed to load all rooms:', err);
    }
  }, []);

  useEffect(() => {
    loadBoard();
    loadAllRooms();
  }, [loadBoard, loadAllRooms]);

  // ─── Action Handlers ──────────────────────────────────────
  const handleStartCleaning = async (roomId) => {
    setIsSubmitting(true);
    const res = await fetchWithAuth(`${API_BASE}/api/housekeeping/rooms/${roomId}/start-cleaning`, { method: 'PATCH' });
    if (res?.ok) loadBoard(false);
    else if (res) { const err = await res.json(); alert(`Error: ${err.error}`); }
    setIsSubmitting(false);
  };

  const handleRequestInspection = async (room) => {
    setSelectedRoom(room);
    setAmenityItems(AMENITY_CATALOG.map(a => ({ ...a, quantity: 0 })));
    setModalType('amenity');
  };

  const submitAmenityAndInspection = async () => {
    setIsSubmitting(true);
    const selectedItems = amenityItems.filter(a => a.quantity > 0);

    if (selectedItems.length > 0) {
      const expenseRes = await fetchWithAuth(`${API_BASE}/api/housekeeping/rooms/${selectedRoom.id}/expenses`, {
        method: 'POST',
        body: JSON.stringify({
          items: selectedItems.map(a => ({
            item_name: a.name,
            quantity: a.quantity,
            unit_cost: a.unit_cost
          }))
        })
      });
      if (!expenseRes?.ok) {
        const err = await expenseRes?.json();
        alert(`Expense logging failed: ${err?.error}`);
        setIsSubmitting(false);
        return;
      }
    }

    const res = await fetchWithAuth(`${API_BASE}/api/housekeeping/rooms/${selectedRoom.id}/request-inspection`, { method: 'PATCH' });
    if (res?.ok) {
      setModalType('none');
      setSelectedRoom(null);
      loadBoard(false);
    } else if (res) {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    }
    setIsSubmitting(false);
  };

  const handleApproveInspection = async (roomId) => {
    setIsSubmitting(true);
    const res = await fetchWithAuth(`${API_BASE}/api/housekeeping/rooms/${roomId}/approve-inspection`, { method: 'PATCH' });
    if (res?.ok) loadBoard(false);
    else if (res) { const err = await res.json(); alert(`Error: ${err.error}`); }
    setIsSubmitting(false);
  };

  const openDamageReport = (room) => {
    setSelectedRoom(room);
    setDamageForm({ room_id: room.id.toString(), issue: '', priority: 'High' });
    setModalType('damage');
  };

  const openGeneralDamageReport = () => {
    setSelectedRoom(null);
    setDamageForm({ room_id: '', issue: '', priority: 'High' });
    setModalType('damage');
  };

  const submitDamageReport = async (e) => {
    e.preventDefault();
    if (!damageForm.room_id) {
      alert('Please select a room.');
      return;
    }
    setIsSubmitting(true);
    const res = await fetchWithAuth(`${API_BASE}/api/housekeeping/rooms/${damageForm.room_id}/report-damage`, {
      method: 'POST',
      body: JSON.stringify({
        issue: damageForm.issue,
        priority: damageForm.priority
      })
    });
    if (res?.ok) {
      setModalType('none');
      setSelectedRoom(null);
      loadBoard(false);
    } else if (res) {
      const err = await res.json();
      alert(`Error: ${err.error}`);
    }
    setIsSubmitting(false);
  };

  const updateAmenityQty = (index, delta) => {
    setAmenityItems(prev => prev.map((item, i) =>
      i === index ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
    ));
  };

  const totalExpense = amenityItems.reduce((sum, a) => sum + (a.quantity * a.unit_cost), 0);

  // ─── Loading State ─────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center gap-5 fd-app-bg relative overflow-hidden">
        <style>{FD_STYLES}</style>
        <div className="fd-orb w-72 h-72 bg-teal-300/30 -top-10 -left-10" />
        <div className="fd-orb w-72 h-72 bg-rose-300/25 bottom-0 right-0" />
        <div className="fd-orb w-64 h-64 bg-amber-200/25 top-1/2 left-1/2" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="relative z-10 w-16 h-16 rounded-2xl fd-brand-mark flex items-center justify-center shadow-xl shadow-teal-500/30"
        >
          <Loader2 size={24} className="text-white" />
        </motion.div>
        <motion.div
          animate={{ width: ['0%', '85%', '100%'] }}
          transition={{ duration: 1.6, ease: 'easeInOut' }}
          className="relative z-10 h-1 rounded-full bg-gradient-to-r from-teal-500 to-rose-400 max-w-xs w-full"
        />
        <p className="relative z-10 text-sm font-semibold text-zinc-500 tracking-wide">Loading Housekeeping Board…</p>
      </div>
    );
  }

  // ─── Error State ─────────────────────────────────────────
  if (loadError) {
    return (
      <div className="min-h-[calc(100vh-6rem)] flex flex-col items-center justify-center gap-4 fd-app-bg px-6 relative overflow-hidden">
        <style>{FD_STYLES}</style>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 18 }}
          className="w-16 h-16 rounded-2xl bg-rose-100 flex items-center justify-center"
        >
          <AlertTriangle size={28} className="text-rose-500" />
        </motion.div>
        <h2 className="text-lg font-serif font-bold text-zinc-900">Connection Error</h2>
        <p className="text-sm text-zinc-500 text-center max-w-md">{loadError}</p>
        <RippleButton
          onClick={() => loadBoard()}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="mt-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-sky-600 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-teal-500/25"
        >
          Retry
        </RippleButton>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] relative fd-app-bg p-6 flex flex-col lg:flex-row gap-6 overflow-hidden">
      <style>{FD_STYLES}</style>

      {/* Ambient decorative orbs — pure atmosphere, no interaction */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <motion.div
          className="fd-orb w-[30rem] h-[30rem] bg-teal-300/25"
          style={{ top: '-8rem', left: '-6rem' }}
          animate={{ x: [0, 46, 0], y: [0, 32, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 17, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="fd-orb w-[34rem] h-[34rem] bg-sky-300/22"
          style={{ top: '18%', right: '-10rem' }}
          animate={{ x: [0, -38, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 21, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="fd-orb w-[26rem] h-[26rem] bg-amber-200/22"
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
        className="w-full lg:w-72 flex-shrink-0 h-full rounded-[2rem] overflow-y-auto fd-scrollbar p-6 flex flex-col gap-6 fd-dealdeck-sidebar z-30"
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: -10, scale: 1.1 }}
            animate={{ y: [0, -3, 0] }}
            transition={{ y: { duration: 3, repeat: Infinity, ease: 'easeInOut' }, rotate: { type: 'spring', stiffness: 400, damping: 12 }, scale: { type: 'spring', stiffness: 400, damping: 12 } }}
            className="relative w-11 h-11 rounded-xl fd-brand-mark flex items-center justify-center shadow-lg shadow-teal-500/30"
          >
            <SprayCan size={20} className="text-white" />
            <Sparkles size={11} className="absolute -top-1.5 -right-1.5 text-amber-300 drop-shadow" />
          </motion.div>
          <div>
            <h1 className="font-serif font-black text-[25px] text-zinc-500 text-base leading-none">Housekeeping</h1>
            <span className="text-[9px] font-bold text-teal-600 uppercase tracking-widest mt-1 flex items-center gap-1">
              <span className="relative flex h-1.5 w-1.5">
                <span className="fd-live-dot absolute inline-flex h-full w-full rounded-full bg-teal-500" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500" />
              </span>
              Staff Operations
            </span>
          </div>
        </div>

        {/* Navigation Categories */}
        <div className="flex flex-col gap-4 flex-1 overflow-y-auto fd-scrollbar pr-1">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Workflow Filters</p>
            <div className="flex flex-col gap-1">
              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveFilter('all')}
                className={`relative z-10 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 overflow-hidden ${activeFilter === 'all' ? 'text-white' : 'text-zinc-500 hover:bg-teal-50 hover:text-teal-700'
                  }`}
              >
                {activeFilter === 'all' && (
                  <motion.span layoutId="fd-sidebar-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="absolute inset-0 bg-gradient-to-r from-teal-500 to-sky-500 shadow-md shadow-teal-500/30 rounded-xl" />
                )}
                <span className="relative flex items-center gap-3"><span className="fd-icon-btn"><Building2 size={15} /></span> All Active Rooms</span>
              </motion.button>

              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveFilter('dirty')}
                className={`relative z-10 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 overflow-hidden ${activeFilter === 'dirty' ? 'text-white' : 'text-zinc-500 hover:bg-rose-50 hover:text-rose-700'
                  }`}
              >
                {activeFilter === 'dirty' && (
                  <motion.span layoutId="fd-sidebar-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="absolute inset-0 bg-gradient-to-r from-rose-500 to-red-500 shadow-md shadow-rose-500/30 rounded-xl" />
                )}
                <span className="relative flex items-center gap-3"><span className="fd-icon-btn"><Droplets size={15} /></span> Needs Cleaning</span>
                <span className={`relative px-2 py-0.5 rounded-md text-[10px] transition-transform duration-300 ${activeFilter === 'dirty' ? 'bg-white/25 text-white scale-110' : 'bg-rose-50 text-rose-700 font-bold'}`}>
                  <CountUp value={stats.dirty} />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveFilter('cleaning')}
                className={`relative z-10 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 overflow-hidden ${activeFilter === 'cleaning' ? 'text-white' : 'text-zinc-500 hover:bg-amber-50 hover:text-amber-700'
                  }`}
              >
                {activeFilter === 'cleaning' && (
                  <motion.span layoutId="fd-sidebar-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 shadow-md shadow-amber-500/30 rounded-xl" />
                )}
                <span className="relative flex items-center gap-3"><span className="fd-icon-btn"><Sparkles size={15} /></span> In Progress</span>
                <span className={`relative px-2 py-0.5 rounded-md text-[10px] transition-transform duration-300 ${activeFilter === 'cleaning' ? 'bg-white/25 text-white scale-110' : 'bg-amber-50 text-amber-700 font-bold'}`}>
                  <CountUp value={stats.cleaning} />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ x: 3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setActiveFilter('inspecting')}
                className={`relative z-10 flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold transition-colors duration-300 overflow-hidden ${activeFilter === 'inspecting' ? 'text-white' : 'text-zinc-500 hover:bg-blue-50 hover:text-blue-700'
                  }`}
              >
                {activeFilter === 'inspecting' && (
                  <motion.span layoutId="fd-sidebar-pill" transition={{ type: 'spring', stiffness: 380, damping: 32 }} className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md shadow-blue-500/30 rounded-xl" />
                )}
                <span className="relative flex items-center gap-3"><span className="fd-icon-btn"><Eye size={15} /></span> Awaiting Inspection</span>
                <span className={`relative px-2 py-0.5 rounded-md text-[10px] transition-transform duration-300 ${activeFilter === 'inspecting' ? 'bg-white/25 text-white scale-110' : 'bg-blue-50 text-blue-700 font-bold'}`}>
                  <CountUp value={stats.inspecting} />
                </span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Create Ticket Sidebar Action */}
        <div className="mt-auto pt-4 border-t border-zinc-100 shrink-0">
          <RippleButton
            onClick={openGeneralDamageReport}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.96 }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-rose-400 to-red-400 hover:from-rose-600 hover:to-red-600 text-white font-bold text-xs py-3.5 rounded-xl transition-all shadow-md shadow-rose-600/30"
          >
            <Wrench size={14} /> Create Ticket
          </RippleButton>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════
          MAIN WORKSPACE CANVAS
          ═══════════════════════════════════════════════════════ */}
      <div className="flex-1 h-full overflow-y-auto fd-scrollbar pr-2 flex flex-col gap-6 min-w-0">

        {/* HEADER RIBBON */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div>
            <h2 className="text-2xl font-black text-zinc-500 tracking-tight mt-0.5">Housekeeping Command Center</h2>
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
              onClick={() => loadBoard(false)}
              className={`p-2.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-teal-50 hover:shadow-md text-zinc-500 transition-all ${isRefreshing ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={15} />
            </motion.button>

            {/* Profile Avatar Widget */}
            <motion.div whileHover={{ y: -2 }} className="flex items-center gap-2 bg-white pl-2.5 pr-3 py-1.5 rounded-xl border border-zinc-200/60 shadow-xs hover:shadow-md transition-shadow duration-300">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                H
              </div>
              <div className="hidden sm:block text-left leading-none">
                <span className="text-xs font-bold text-zinc-900 block">Rajnish</span> {/*username*/}
                <span className="text-[8px] font-semibold text-zinc-600 uppercase tracking-widest mt-0.5 block">Housekeeper</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* 4 TOP KPI STATS CARD ROW */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Needs Cleaning */}
          <TiltCard
            onClick={() => setActiveFilter('dirty')}
            glowHex="#f43f5e"
            className={`fd-kpi-tilt rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden h-36 select-none cursor-pointer ${activeFilter === 'dirty'
              ? 'fd-dealdeck-focus-card text-white bg-gradient-to-br from-rose-500 to-red-500'
              : 'fd-dealdeck-card text-zinc-900 bg-white'
              }`}
          >
            <div className={`fd-kpi-blob ${activeFilter === 'dirty' ? 'bg-white/30' : 'bg-rose-500/10'}`} />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeFilter === 'dirty' ? 'text-white/80' : 'text-zinc-400'
                  }`}>Needs Cleaning</p>
                <h3 className="text-3xl font-black mt-1 leading-none"><CountUp value={stats.dirty} /></h3>
              </div>
              <motion.span
                animate={stats.dirty > 0 && activeFilter !== 'dirty' ? { scale: [1, 1.08, 1] } : {}}
                transition={{ duration: 1.6, repeat: Infinity }}
                className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-0.5 ${activeFilter === 'dirty' ? 'bg-white/20 text-white' : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                <Droplets size={10} /> Dirty
              </motion.span>
            </div>
            <p className={`relative z-10 text-[10px] mt-auto ${activeFilter === 'dirty' ? 'text-white/60' : 'text-zinc-400'
              }`}>Rooms requiring housekeeping attention</p>
          </TiltCard>

          {/* Card 2: In Progress */}
          <TiltCard
            onClick={() => setActiveFilter('cleaning')}
            glowHex="#f59e0b"
            className={`fd-kpi-tilt rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden h-36 select-none cursor-pointer ${activeFilter === 'cleaning'
              ? 'fd-dealdeck-focus-card text-white bg-gradient-to-br from-amber-500 to-orange-500'
              : 'fd-dealdeck-card text-zinc-900 bg-white'
              }`}
          >
            <div className={`fd-kpi-blob ${activeFilter === 'cleaning' ? 'bg-white/30' : 'bg-amber-500/10'}`} />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeFilter === 'cleaning' ? 'text-white/80' : 'text-zinc-400'
                  }`}>In Progress</p>
                <h3 className="text-3xl font-black mt-1 leading-none"><CountUp value={stats.cleaning} /></h3>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-0.5 ${activeFilter === 'cleaning' ? 'bg-white/20 text-white' : 'bg-amber-50 text-amber-700 border border-amber-100'
                }`}>
                <motion.span animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }} className="inline-flex">
                  <Sparkles size={10} />
                </motion.span>
                Cleaning
              </span>
            </div>
            <p className={`relative z-10 text-[10px] mt-auto ${activeFilter === 'cleaning' ? 'text-white/60' : 'text-zinc-400'
              }`}>Rooms currently being cleaned</p>
          </TiltCard>

          {/* Card 3: Awaiting Inspection */}
          <TiltCard
            onClick={() => setActiveFilter('inspecting')}
            glowHex="#3b82f6"
            className={`fd-kpi-tilt rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden h-36 select-none cursor-pointer ${activeFilter === 'inspecting'
              ? 'fd-dealdeck-focus-card text-white bg-gradient-to-br from-blue-500 to-indigo-500'
              : 'fd-dealdeck-card text-zinc-900 bg-white'
              }`}
          >
            <div className={`fd-kpi-blob ${activeFilter === 'inspecting' ? 'bg-white/30' : 'bg-blue-500/10'}`} />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeFilter === 'inspecting' ? 'text-white/80' : 'text-zinc-400'
                  }`}>Awaiting Inspection</p>
                <h3 className="text-3xl font-black mt-1 leading-none"><CountUp value={stats.inspecting} /></h3>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-0.5 ${activeFilter === 'inspecting' ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700 border border-blue-100'
                }`}>
                <Eye size={10} /> Inspecting
              </span>
            </div>
            <p className={`relative z-10 text-[10px] mt-auto ${activeFilter === 'inspecting' ? 'text-white/60' : 'text-zinc-400'
              }`}>Rooms waiting for supervisor approval</p>
          </TiltCard>

          {/* Card 4: Clean & Available */}
          <TiltCard
            onClick={() => setActiveFilter('all')}
            glowHex="#10b981"
            className={`fd-kpi-tilt rounded-[2rem] p-6 flex flex-col justify-between relative overflow-hidden h-36 select-none cursor-pointer ${activeFilter === 'all'
              ? 'fd-dealdeck-focus-card text-white bg-gradient-to-br from-emerald-500 to-teal-500'
              : 'fd-dealdeck-card text-zinc-900 bg-white'
              }`}
          >
            <div className={`fd-kpi-blob ${activeFilter === 'all' ? 'bg-white/30' : 'bg-emerald-500/10'}`} />
            <div className="flex items-start justify-between relative z-10">
              <div>
                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeFilter === 'all' ? 'text-white/80' : 'text-zinc-400'
                  }`}>Clean & Available</p>
                <h3 className="text-3xl font-black mt-1 leading-none"><CountUp value={stats.available} /></h3>
              </div>
              <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold flex items-center gap-0.5 ${activeFilter === 'all' ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                }`}>
                <CheckCircle2 size={10} /> Ready
              </span>
            </div>
            <p className={`relative z-10 text-[10px] mt-auto ${activeFilter === 'all' ? 'text-white/60' : 'text-zinc-400'
              }`}>Vacant and fully cleaned rooms</p>
          </TiltCard>
        </div>

        {/* DIRECT MAINTENANCE QUICK PANEL — shimmering gradient border, matches Front Desk's Walk-In panel */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.45 }}
          className="relative overflow-hidden bg-gradient-to-r from-teal-500 to-sky-500 shadow-md shadow-teal-500/30 rounded-xl p-10 flex flex-col md:flex-row items-center justify-between gap-8"
        >
          <div className="absolute inset-0 bg-[radial-gradient(420px_200px_at_15%_0%,rgba(255,255,255,0.14),transparent_60%)] pointer-events-none" />
          <div className="relative flex items-center gap-6">
            <motion.div
              animate={{ scale: [1, 1.12, 1], rotate: [0, -6, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
              className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm items-center justify-center shrink-0 shadow-lg text-white"
            >
              <Zap size={24} />
            </motion.div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white">Direct Maintenance Dispatch</h3>
              <p className="text-sm text-teal-50 mt-1.5 leading-relaxed max-w-lg">
                Instantly report a room issue to engineering. This blocks the room and assigns a pending work order.
              </p>
            </div>
          </div>
          <div className="relative flex items-center gap-3 shrink-0 w-full md:w-auto justify-end mt-4 md:mt-0">
            <RippleButton
              onClick={openGeneralDamageReport}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="bg-white/20 hover:bg-white/30 border border-white/20 text-white font-bold text-base px-14 py-4.5 rounded-xl transition-colors duration-200 shadow-md w-full sm:w-auto flex items-center justify-center gap-3"
            >
              <Wrench size={18} /> Report Room Issue / Create Ticket
            </RippleButton>
          </div>
        </motion.div>


        {/* 3-COLUMN KANBAN BOARD */}
        <motion.div
          variants={gridContainerVariants}
          initial="hidden"
          animate="visible"
          className={`grid grid-cols-1 ${activeFilter === 'all' ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-5`}
        >
          {Object.entries(COLUMN_THEMES)
            .filter(([status]) => activeFilter === 'all' || activeFilter === status)
            .map(([status, theme]) => {
              const rooms = board[status] || [];
              const Icon = theme.icon;

              return (
                <motion.div key={status} variants={columnVariants} className="flex flex-col">
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 px-1">
                    <div className="flex items-center gap-2.5">
                      <motion.div
                        whileHover={{ rotate: -8, scale: 1.08 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                        className={`w-8 h-8 rounded-lg bg-gradient-to-br ${theme.gradient} flex items-center justify-center shadow-md`}
                      >
                        <Icon size={15} className="text-white" />
                      </motion.div>
                      <div>
                        <h3 className="text-sm font-bold text-zinc-800">{theme.label}</h3>
                        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider">{rooms.length} room{rooms.length !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <motion.span
                      key={rooms.length}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold ${theme.badge}`}
                    >
                      {rooms.length}
                    </motion.span>
                  </div>

                  {/* Column Body */}
                  <div className={`flex-1 rounded-2xl bg-white/20 backdrop-blur-xs border ${theme.border} p-4 min-h-[200px]`}>
                    <AnimatePresence mode="popLayout">
                      {rooms.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="flex flex-col items-center justify-center py-12 text-zinc-400"
                        >
                          <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}>
                            <CheckCircle2 size={28} className="mb-2 text-zinc-300" />
                          </motion.div>
                          <p className="text-xs font-medium">All clear</p>
                        </motion.div>
                      ) : (
                        <div className={activeFilter === 'all' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'}>
                          {rooms.map((room, index) => (
                            <motion.div
                              key={room.id}
                              custom={index}
                              variants={cardVariants}
                              initial="hidden"
                              animate="visible"
                              exit="exit"
                              layout
                              style={{ '--accent': theme.accent }}
                              whileHover={{ y: -5, scale: 1.015, boxShadow: `0px 22px 45px -16px rgba(${theme.accent}, 0.35)` }}
                              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                              className={`fd-card fd-dealdeck-card overflow-hidden border-l-4 ${theme.cardAccent} rounded-2xl p-4`}
                            >
                              {/* Card Content */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2.5">
                                    <motion.div
                                      whileHover={{ scale: 1.1, rotate: -6 }}
                                      transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                                      className="w-9 h-9 rounded-lg bg-zinc-100 flex items-center justify-center"
                                    >
                                      <BedDouble size={16} className="text-zinc-600" />
                                    </motion.div>
                                    <div>
                                      <p className="text-sm font-bold text-zinc-900">Room {room.room_number}</p>
                                      <p className="text-[11px] text-zinc-500 font-medium">{room.room_type}</p>
                                    </div>
                                  </div>
                                  <span className={`w-2 h-2 rounded-full ${theme.dotColor} ${status === 'cleaning' ? 'animate-pulse' : ''}`} />
                                </div>

                                {/* Action Buttons per Status */}
                                <div className="mt-4 flex flex-wrap gap-2">
                                  {status === 'dirty' && (
                                    <RippleButton
                                      onClick={() => handleStartCleaning(room.id)}
                                      disabled={isSubmitting}
                                      whileHover={{ scale: 1.02, y: -1 }}
                                      whileTap={{ scale: 0.97 }}
                                      className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                                    >
                                      <Sparkles size={13} /> Start Cleaning
                                    </RippleButton>
                                  )}

                                  {status === 'cleaning' && (
                                    <>
                                      <RippleButton
                                        onClick={() => handleRequestInspection(room)}
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                                      >
                                        <ClipboardCheck size={13} /> Request Inspection
                                      </RippleButton>
                                      <motion.button
                                        whileHover={{ scale: 1.08, rotate: -6 }}
                                        whileTap={{ scale: 0.94 }}
                                        onClick={() => openDamageReport(room)}
                                        className="flex items-center justify-center gap-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold py-2.5 px-3 rounded-lg transition-all shadow-sm"
                                        title="Report Damage"
                                      >
                                        <AlertTriangle size={13} />
                                      </motion.button>
                                    </>
                                  )}

                                  {status === 'inspecting' && (
                                    <>
                                      <RippleButton
                                        onClick={() => handleApproveInspection(room.id)}
                                        disabled={isSubmitting}
                                        whileHover={{ scale: 1.02, y: -1 }}
                                        whileTap={{ scale: 0.97 }}
                                        className="flex-1 flex items-center justify-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-xs font-bold py-2.5 rounded-lg transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                                      >
                                        <ShieldCheck size={13} /> Approve
                                      </RippleButton>
                                      <motion.button
                                        whileHover={{ scale: 1.08, rotate: -6 }}
                                        whileTap={{ scale: 0.94 }}
                                        onClick={() => openDamageReport(room)}
                                        className="flex items-center justify-center gap-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold py-2.5 px-3 rounded-lg transition-all shadow-sm"
                                        title="Report Damage"
                                      >
                                        <AlertTriangle size={13} />
                                      </motion.button>
                                    </>
                                  )}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
        </motion.div>

        {/* Workflow Legend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-2 mb-6 flex items-center justify-center gap-2 text-[11px] text-zinc-400 font-medium font-sans"
        >
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-400" /> Dirty</span>
          <ArrowRight size={12} className="text-zinc-300" />
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Cleaning</span>
          <ArrowRight size={12} className="text-zinc-300" />
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-400" /> Inspecting</span>
          <ArrowRight size={12} className="text-zinc-300" />
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Available</span>
        </motion.div>
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
            onClick={() => { setModalType('none'); setSelectedRoom(null); }}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg fd-glass-modal rounded-3xl p-7 overflow-y-auto max-h-[90vh]"
            >
              {/* ── AMENITY RESTOCKING MODAL ── */}
              {modalType === 'amenity' && selectedRoom && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center shadow-sm"
                      >
                        <PackageOpen size={20} />
                      </motion.div>
                      <div>
                        <h2 className="text-lg font-serif font-bold text-zinc-900">Amenity Restocking</h2>
                        <p className="text-xs text-zinc-500">Room {selectedRoom.room_number} • {selectedRoom.room_type}</p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ rotate: 90, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => { setModalType('none'); setSelectedRoom(null); }}
                      className="p-2 rounded-xl hover:bg-zinc-100/80 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      <X size={20} />
                    </motion.button>
                  </div>

                  <p className="text-xs text-zinc-500 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 font-medium">
                    <span className="font-bold text-amber-700">Select restocked items</span> below, then submit to log expenses and request inspection.
                  </p>

                  {/* Amenity List */}
                  <div className="space-y-2 max-h-[40vh] overflow-y-auto fd-scrollbar pr-1">
                    {amenityItems.map((item, idx) => (
                      <motion.div
                        key={item.name}
                        whileHover={{ x: 2 }}
                        className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-all ${item.quantity > 0
                          ? 'bg-blue-50/60 border-blue-200'
                          : 'bg-white border-zinc-200/80 hover:border-zinc-300'
                          }`}
                      >
                        <div>
                          <p className={`text-sm font-semibold ${item.quantity > 0 ? 'text-blue-800' : 'text-zinc-700'}`}>{item.name}</p>
                          <p className="text-[10px] text-zinc-400 font-medium">₹{item.unit_cost} per unit</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateAmenityQty(idx, -1)}
                            className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 text-zinc-500 transition-colors"
                          >
                            <Minus size={12} />
                          </motion.button>
                          <motion.span
                            key={item.quantity}
                            initial={{ scale: 1.3 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                            className={`w-8 text-center text-sm font-bold ${item.quantity > 0 ? 'text-blue-700' : 'text-zinc-400'}`}
                          >
                            {item.quantity}
                          </motion.span>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => updateAmenityQty(idx, 1)}
                            className="w-7 h-7 rounded-lg border border-zinc-200 flex items-center justify-center hover:bg-zinc-100 text-zinc-500 transition-colors"
                          >
                            <Plus size={12} />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="bg-gradient-to-r from-zinc-50 to-blue-50/50 border border-zinc-200 border-dashed rounded-xl p-4 flex items-center justify-between">
                    <span className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Restocking Cost</span>
                    <motion.span
                      key={totalExpense}
                      initial={{ scale: 1.2, color: '#1d4ed8' }}
                      animate={{ scale: 1, color: '#18181b' }}
                      transition={{ duration: 0.35 }}
                      className="text-xl font-bold text-zinc-900"
                    >
                      ₹<CountUp value={totalExpense} />
                    </motion.span>
                  </div>

                  <RippleButton
                    onClick={submitAmenityAndInspection}
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    {isSubmitting ? 'Submitting…' : 'Log Expenses & Request Inspection'}
                  </RippleButton>
                </div>
              )}

              {/* ── DAMAGE REPORT MODAL ── */}
              {modalType === 'damage' && (
                <form onSubmit={submitDamageReport} className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <motion.div
                        initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 16 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-100 to-rose-200 text-rose-600 flex items-center justify-center shadow-sm"
                      >
                        <AlertTriangle size={20} />
                      </motion.div>
                      <div>
                        <h2 className="text-lg font-serif font-bold text-zinc-900">Report Damage</h2>
                        <p className="text-xs text-zinc-500">
                          {selectedRoom
                            ? `Room ${selectedRoom.room_number} • ${selectedRoom.room_type}`
                            : 'Create Maintenance Ticket'}
                        </p>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ rotate: 90, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => { setModalType('none'); setSelectedRoom(null); }}
                      className="p-2 rounded-xl hover:bg-zinc-100/80 text-zinc-400 hover:text-zinc-600 transition-colors"
                    >
                      <X size={20} />
                    </motion.button>
                  </div>

                  <div className="bg-rose-50/80 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={18} className="text-rose-500 shrink-0 mt-0.5" />
                    <div className="text-xs text-rose-700">
                      <p className="font-bold">Engineering Hot-Link</p>
                      <p className="mt-0.5">This will create a maintenance ticket and immediately remove the room from the cleaning workflow. The room will be <strong>blocked</strong> from bookings.</p>
                    </div>
                  </div>

                  {!selectedRoom && (
                    <div>
                      <label className="block text-xs font-bold uppercase text-zinc-500 tracking-wider mb-2 font-mono">Select Room</label>
                      <select
                        required
                        value={damageForm.room_id}
                        onChange={e => setDamageForm({ ...damageForm, room_id: e.target.value })}
                        className="fd-input bg-white appearance-none cursor-pointer"
                      >
                        <option value="">-- Choose Room --</option>
                        {allRooms.map(r => (
                          <option key={r.id} value={r.id}>
                            Room {r.room_number} ({r.room_type}) - {r.status}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 tracking-wider mb-2">Issue Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Describe the damage or issue found…"
                      value={damageForm.issue}
                      onChange={e => setDamageForm({ ...damageForm, issue: e.target.value })}
                      className="fd-input resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-500 tracking-wider mb-2">Priority Level</label>
                    <div className="flex gap-2">
                      {['High', 'Medium', 'Low'].map(p => (
                        <motion.button
                          key={p}
                          type="button"
                          whileHover={{ scale: 1.03, y: -1 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => setDamageForm({ ...damageForm, priority: p })}
                          className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${damageForm.priority === p
                            ? p === 'High' ? 'bg-rose-600 text-white border-rose-600 shadow-md' :
                              p === 'Medium' ? 'bg-amber-500 text-white border-amber-500 shadow-md' :
                                'bg-zinc-700 text-white border-zinc-700 shadow-md'
                            : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                            }`}
                        >
                          {p}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <RippleButton
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={{ scale: 1.015, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-700 hover:to-red-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Wrench size={16} />}
                    {isSubmitting ? 'Reporting…' : 'Report & Send to Engineering'}
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