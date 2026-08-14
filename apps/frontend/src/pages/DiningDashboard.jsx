import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import DepartmentHRModule from '../components/DepartmentHRModule';
import StaffDirectoryModule from '../components/StaffDirectoryModule';
import {
  Utensils, Coffee, Clock, CheckCircle2, ChefHat, Receipt,
  Calendar, Users, BellRing, Building2, Search, ArrowUpRight,
  TrendingUp, PieChart, LayoutGrid, X, Loader2, Plus, Flame, MapPin,
  RefreshCw, LogOut, Zap, Edit2, Trash2, Minus, PenLine,
  Package, ClipboardList, DollarSign, Activity, Truck, RefreshCcw,
  AlertCircle, Timer, ArrowRight
} from 'lucide-react';

// =============================================
// Helper Components
// =============================================

function SalesVsSpendVsConsumptionChart({ data = [] }) {
  return (
    <div className="h-40 w-full flex items-center justify-center bg-zinc-50 rounded-xl border border-zinc-100/60 shadow-inner">
      <div className="flex flex-col items-center gap-2 opacity-50">
        <Activity size={24} className="text-indigo-400" />
        <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Chart Data Simulation</span>
      </div>
    </div>
  );
}

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
          <motion.div initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }} className="absolute pointer-events-none px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white text-[10px] font-bold shadow-lg shadow-[#D4A373]/20 whitespace-nowrap" style={{ left: `${(active.x / width) * 100}%`, top: `${(active.y / height) * 100}%`, transform: 'translate(-50%, -140%)' }}>
            {active.label}: <span className="text-amber-300">{active.value} Orders</span>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="flex justify-between mt-1 px-1">
        {data.map((t, i) => (<span key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)} className={`text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all duration-200 ${hoverIdx === i ? 'text-[#D4A373]' : (t.isToday ? 'text-rose-500 animate-pulse font-extrabold' : 'text-zinc-400')}`}>{t.label}</span>))}
      </div>
    </div>
  );
}

// Map Backend Icon Names to Lucide Components
const iconMap = {
  Receipt: <Receipt size={16} />,
  Flame: <Flame size={16} />,
  Clock: <Clock size={16} />,
  Users: <Users size={16} />
};

// =============================================
// MAIN DASHBOARD COMPONENT
// =============================================
export default function DiningDashboard() {
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

  const fetchDiningData = React.useCallback(async () => {
    try {
      const token = sessionStorage.getItem('hms_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      const [kotsRes, tablesRes, menuRes, overviewRes, invRes, guestsRes] = await Promise.all([
        fetch('http://localhost:3000/api/dining/kots', { headers }),
        fetch('http://localhost:3000/api/dining/tables', { headers }),
        fetch('http://localhost:3000/api/dining/menu', { headers }),
        fetch('http://localhost:3000/api/dining/overview', { headers }),
        fetch('http://localhost:3000/api/dining/inventory', { headers }),
        fetch('http://localhost:3000/api/dining/in-house-guests', { headers })
      ]);
      if (kotsRes.ok) { const d = await kotsRes.json(); setActiveKOTs(d.data || []); }
      if (tablesRes.ok) { const d = await tablesRes.json(); setTables(d.data || []); }
      if (menuRes.ok) { const d = await menuRes.json(); setPosMenu(d.data || []); }
      if (overviewRes.ok) { const d = await overviewRes.json(); setOverview(d.data || { metrics: [], orderTrend: [], salesSplit: [] }); }
      if (invRes.ok) { 
        const d = await invRes.json(); 
        if (d.data) {
          setInventoryItems(d.data.items || []);
          setProcurementLogs(d.data.procurement || []);
          setWastageLogs(d.data.wastage || []);
          setInventoryStats(prev => ({ ...prev, ...d.data.stats }));
        }
      }
      if (guestsRes.ok) { const d = await guestsRes.json(); setInHouseGuests(d.data || []); }
    } catch (e) {
      console.error('Failed to fetch dining data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDiningData();
    const interval = setInterval(fetchDiningData, 30000);
    return () => clearInterval(interval);
  }, [fetchDiningData]);
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = location.state?.fromAdmin === true || sessionStorage.getItem('hms_role')?.toUpperCase() === 'ADMIN';
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

  const [activeTab, setActiveTab] = useState(accessLevel === 'EXECUTIVE' ? 'kots' : 'overview');
  const [isLoading, setIsLoading] = useState(true);
  const [expandedColumn, setExpandedColumn] = useState(null);

  // Filters & State connected to the DB
  const [orderSearch, setOrderSearch] = useState('');
  const [isKOTModalOpen, setIsKOTModalOpen] = useState(false);
  const [kotForm, setKotForm] = useState({ table: '', items: '', notes: '' });

  const [activeKOTs, setActiveKOTs] = useState([]);
  const [tables, setTables] = useState([]);
  const [menuPerformance, setMenuPerformance] = useState([]);
  const [overview, setOverview] = useState({ metrics: [], orderTrend: [], salesSplit: [] });

  // POS & Menu Management States
  const [isMenuManageMode, setIsMenuManageMode] = useState(false);
  const [posSearch, setPosSearch] = useState('');
  const [posSpicy, setPosSpicy] = useState(false);
  const [posGlutenFree, setPosGlutenFree] = useState(false);
  const [posNuts, setPosNuts] = useState(false);
  const [posDietary, setPosDietary] = useState('All Items');
  const [posCategory, setPosCategory] = useState('All');
  const [posCart, setPosCart] = useState([]);
  const [posTable, setPosTable] = useState('');
  const [menuForm, setMenuForm] = useState({ id: null, item: '', category: '', price: '', dietary: 'Veg', is_spicy: false, is_gluten_free: false, contains_nuts: false });

  const posCategories = ['All', 'Starters', 'Mains', 'Breads', 'Desserts', 'Beverages', 'Chef Specials', 'Salads', 'Soups', 'Pizzas'];
  const [posMenu, setPosMenu] = useState([]);

  const posFilteredMenu = posMenu.filter(m => {
    if (posCategory !== 'All' && m.category !== posCategory) return false;
    if (posDietary !== 'All Items' && m.dietary !== posDietary) return false;
    if (posSpicy && !m.is_spicy) return false;
    if (posGlutenFree && !m.is_gluten_free) return false;
    if (posNuts && !m.contains_nuts) return false;
    if (posSearch && !m.item.toLowerCase().includes(posSearch.toLowerCase())) return false;
    return true;
  });

  const addToCart = (m) => {
    setPosCart(prev => {
      const existing = prev.find(x => x.id === m.id);
      if (existing) return prev.map(x => x.id === m.id ? { ...x, qty: x.qty + 1 } : x);
      return [...prev, { ...m, qty: 1, note: '' }];
    });
  };
  const updateCartQty = (id, delta) => setPosCart(prev => prev.map(x => x.id === id ? { ...x, qty: Math.max(0, x.qty + delta) } : x).filter(x => x.qty > 0));
  const updateCartNote = (id, note) => setPosCart(prev => prev.map(x => x.id === id ? { ...x, note } : x));

  const cartTotal = posCart.reduce((sum, item) => sum + (parseFloat(item.price) * item.qty), 0);
  const cartTax = cartTotal * 0.05;
  const cartGrandTotal = cartTotal + cartTax;

  const handlePunchPOS = async () => {
    if (posCart.length === 0 || !posTable) return alert('Select a table and items first!');
    try {
      const res = await fetch('http://localhost:3000/api/dining/kots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}` },
        body: JSON.stringify({ table: posTable, items: JSON.stringify(posCart), type: 'Dine-in' })
      });
      if (res.ok) {
        alert('KOT Punched to Kitchen!');
        setPosCart([]);
        setPosTable('');
        fetchDiningData();
      }
    } catch (e) { console.error(e); }
  };
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = menuForm.id ? `http://localhost:3000/api/dining/menu/${menuForm.id}` : 'http://localhost:3000/api/dining/menu';
      const method = menuForm.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}` },
        body: JSON.stringify(menuForm)
      });
      if (res.ok) {
        fetchDiningData();
        setMenuForm({ id: null, item: '', category: '', price: '', dietary: 'Veg', is_spicy: false, is_gluten_free: false, contains_nuts: false });
      }
    } catch (e) { console.error(e); }
  };
  const handleMenuDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/dining/menu/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}` }
      });
      if (res.ok) fetchDiningData();
    } catch (e) { console.error(e); }
  };
  
  const updateTableStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:3000/api/dining/tables/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchDiningData();
    } catch (e) { console.error(e); }
  };

  const handleAddTable = async (tableNumber, capacity) => {
    try {
      const res = await fetch(`http://localhost:3000/api/dining/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}` },
        body: JSON.stringify({ table_number: tableNumber, capacity: capacity || 4 })
      });
      if (res.ok) fetchDiningData();
    } catch (e) { console.error(e); }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Delete this table?')) return;
    try {
      const res = await fetch(`http://localhost:3000/api/dining/tables/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}` }
      });
      if (res.ok) fetchDiningData();
    } catch (e) { console.error(e); }
  };

  const updateKOTStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:3000/api/dining/kots/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}` },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchDiningData();
    } catch (e) { console.error(e); }
  };

  const [inventoryTab, setInventoryTab] = useState('master');
  const [isWastageModalOpen, setIsWastageModalOpen] = useState(false);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [materialForm, setMaterialForm] = useState({ id: null, name: '', category: '', uom: 'kg', unit_cost: '', par_level: '', is_active: true });

  const [inventoryStats, setInventoryStats] = useState({
    revenueToday: 0,
    procurementSpendToday: 0,
    utilizedValueToday: 0,
    grossProfitToday: 0,
    profitGapData: [],
    spendCategories: [
      { label: 'Meat & Poultry', value: 35, color: '#f43f5e' },
      { label: 'Dairy', value: 20, color: '#3b82f6' },
      { label: 'Produce', value: 25, color: '#10b981' },
      { label: 'Dry Goods', value: 20, color: '#f59e0b' }
    ]
  });

  const [inventoryItems, setInventoryItems] = useState([]);
  const [reconciliationData, setReconciliationData] = useState([]);
  const [procurementLogs, setProcurementLogs] = useState([]);
  const [wastageLogs, setWastageLogs] = useState([]);

  const openEodModal = () => alert('EOD Modal Opened');
  const toggleMaterialStatus = (item) => alert(`Toggled status for ${item.name}`);

  // Billing States
  const [billingForm, setBillingForm] = useState({ table_number: '', payment_method: 'Card', is_room_charge: false, booking_id: '', room_number: '' });
  const [removedItemsCount, setRemovedItemsCount] = useState({});
  const [discountPercent, setDiscountPercent] = useState(0);
  const [applyServiceCharge, setApplyServiceCharge] = useState(false);

  const [inHouseGuests, setInHouseGuests] = useState([]);

  const handleSelectBillingTable = (table_number) => {
    setBillingForm(prev => ({ ...prev, table_number }));
    setRemovedItemsCount({});
    setDiscountPercent(0);
    setApplyServiceCharge(false);
  };

  const handleSettleBill = async (e, total) => {
    e.preventDefault();
    if (!billingForm.table_number) return alert('Select a table first.');
    if (billingForm.is_room_charge && !billingForm.booking_id) return alert('Select a room for the charge.');
    
    try {
      const res = await fetch('http://localhost:3000/api/dining/settle-bill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}` },
        body: JSON.stringify({ ...billingForm, total_amount: total })
      });
      if (res.ok) {
        alert(`Bill settled successfully for ${billingForm.table_number}. Total: ₹${total}`);
        setBillingForm({ table_number: '', payment_method: 'Card', is_room_charge: false, booking_id: '', room_number: '' });
        setRemovedItemsCount({});
        setDiscountPercent(0);
        setApplyServiceCharge(false);
        fetchDiningData();
      } else {
        alert('Failed to settle bill.');
      }
    } catch (e) {
      console.error(e);
      alert('Error settling bill.');
    }
  };

  const themeMap = {
    '#D4A373': { iconBg: 'bg-[#D4A373] text-zinc-900 shadow-lg shadow-[#D4A373]/30', gradient: 'from-amber-50 via-white to-white', ring: 'ring-amber-500/10', glow: 'rgba(212,163,115,0.35)' },
    amber: { iconBg: 'bg-gradient-to-br from-[#D4A373] to-[#b9834f] text-white shadow-lg shadow-[#D4A373]/30', gradient: 'from-amber-50 via-white to-white', ring: 'ring-amber-500/10', glow: 'rgba(245,158,11,0.35)' },
    rose: { iconBg: 'bg-gradient-to-br from-rose-400 to-pink-600 text-white shadow-lg shadow-rose-500/30', gradient: 'from-rose-50 via-white to-white', ring: 'ring-rose-500/10', glow: 'rgba(244,63,94,0.35)' },
    emerald: { iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30', gradient: 'from-emerald-50 via-white to-white', ring: 'ring-emerald-500/10', glow: 'rgba(16,185,129,0.35)' },
    indigo: { iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30', gradient: 'from-indigo-50 via-white to-white', ring: 'ring-indigo-500/10', glow: 'rgba(99,102,241,0.35)' },
  };

  // Small decorative graphics cycled per KPI card, mirroring the Admin dashboard's KPI cards
  const kpiGraphic = (i, color) => {
    const kind = i % 4;
    if (kind === 0) {
      return (
        <div className="relative flex items-center justify-center shrink-0 ml-4">
          <svg className="w-14 h-14 rotate-[-90deg]">
            <circle cx="28" cy="28" r="20" fill="none" stroke={`${color}22`} strokeWidth="4" />
            <motion.circle cx="28" cy="28" r="20" fill="none" strokeWidth="4.5" stroke={color}
              strokeDasharray={2 * Math.PI * 20}
              initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
              animate={{ strokeDashoffset: (2 * Math.PI * 20) * 0.28 }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
              strokeLinecap="round" />
          </svg>
        </div>
      );
    }
    if (kind === 1) {
      return (
        <div className="shrink-0 ml-4 border rounded-xl bg-white p-1.5 shadow-sm" style={{ borderColor: `${color}33` }}>
          <svg className="w-16 h-9 overflow-visible">
            <motion.path d="M0 22 Q8 6, 16 16 T32 3 T48 12 T60 8" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
              initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeOut' }} />
            <motion.circle cx="60" cy="8" r="3" fill={color} initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} transition={{ duration: 0.5, delay: 1.3 }} />
          </svg>
        </div>
      );
    }
    if (kind === 2) {
      return (
        <div className="flex gap-1.5 h-7 items-end shrink-0 ml-4 border rounded-xl bg-white px-2.5 py-1.5 shadow-sm" style={{ borderColor: `${color}33` }}>
          {[...Array(5)].map((_, idx) => (
            <motion.div key={idx} className="w-2.5 rounded-t-md" style={{ background: idx < 3 ? color : '#e4e4e7' }}
              initial={{ height: 0 }} animate={{ height: idx < 3 ? '20px' : '8px' }}
              transition={{ duration: 0.6, delay: idx * 0.08, type: 'spring', stiffness: 200 }} />
          ))}
        </div>
      );
    }
    return (
      <div className="shrink-0 ml-4 border rounded-xl bg-white p-1.5 shadow-sm" style={{ borderColor: `${color}33` }}>
        <svg className="w-16 h-9 overflow-visible">
          <motion.path d="M0 25 L12 18 L24 22 L36 10 L48 14 L60 4" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }} />
          <motion.circle cx="60" cy="4" r="3" fill={color} initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} transition={{ duration: 0.5, delay: 1.5 }} />
        </svg>
      </div>
    );
  };

  const fetchData = async () => {
    try {
      const token = sessionStorage.getItem('hms_token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [kotsRes, tablesRes, menuRes, overviewRes] = await Promise.all([
        fetch('http://localhost:3000/api/dining/kots', { headers }),
        fetch('http://localhost:3000/api/dining/tables', { headers }),
        fetch('http://localhost:3000/api/dining/menu', { headers }),
        fetch('http://localhost:3000/api/dining/overview', { headers })
      ]);

      if (kotsRes.ok) {
        const data = await kotsRes.json();
        setActiveKOTs(data.data.map(k => ({
          id: k.id.slice(0, 8),
          table: k.table_number,
          items: k.items,
          time: new Date(k.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: k.status,
          type: k.type
        })));
      }

      if (tablesRes.ok) {
        const data = await tablesRes.json();
        setTables(data.data);
      }

      if (menuRes.ok) {
        const data = await menuRes.json();
        setMenuPerformance(data.data);
      }

      if (overviewRes.ok) {
        const data = await overviewRes.json();
        setOverview(data.data);
      }
    } catch (err) {
      console.error('Failed to sync dining data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refresh = () => {
    setIsLoading(true);
    fetchData();
  };

  const handleAddKOT = async (e) => {
    e.preventDefault();
    if (!kotForm.table || !kotForm.items) return;

    try {
      const token = sessionStorage.getItem('hms_token');
      const res = await fetch('http://localhost:3000/api/dining/kots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          table: kotForm.table,
          items: kotForm.items,
          type: kotForm.table.includes('Room') ? 'Room Service' : 'Dine-in'
        })
      });
      if (res.ok) {
        refresh(); // Refresh state from DB
        setIsKOTModalOpen(false);
        setKotForm({ table: '', items: '', notes: '' });
      }
    } catch (err) {
      console.error(err);
      alert('Error connecting to database');
    }
  };

  const navGroups = [
    {
      heading: 'F&B Operations',
      items: [
        ...(accessLevel !== 'EXECUTIVE' ? [{ key: 'overview', label: 'Dashboard', icon: <PieChart size={15} /> }] : []),
        { key: 'kots', label: 'Kitchen Orders (KOT)', icon: <ChefHat size={15} /> },
        { key: 'tables', label: 'Table Management', icon: <LayoutGrid size={15} /> }
      ]
    },
    ...(accessLevel !== 'EXECUTIVE' ? [{
      heading: 'Management',
      items: [
        { key: 'menu', label: 'Menu & POS', icon: <Utensils size={15} /> },
        { key: 'inventory', label: 'Inventory & Procurement', icon: <Package size={15} /> },
        { key: 'billing', label: 'Billing & Settlements', icon: <Receipt size={15} /> }
      ]
    }] : []),
    {
      heading: '',
      items: [
        ...(accessLevel === 'MANAGER' ? [

          { key: 'hr_hub', label: 'HR Hub', icon: <Users size={15} /> }
        ] : []),
        { key: 'directory', label: 'Info Directory', icon: <Users size={15} /> }
      ]
    }
  ];

  return (
    <div className="min-h-[calc(100vh-6rem)] relative dd-app-bg dd-scrollbar p-6 flex flex-col lg:flex-row gap-6">
      <style>{`
        .dd-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(161,161,170,0.4) transparent; }
        .dd-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .dd-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .dd-scrollbar::-webkit-scrollbar-thumb { background: rgba(161, 161, 170, 0.45); border-radius: 999px; }
        
        .dd-app-bg {
          background: #F8F1E3 !important;
        }

        .dd-sidebar { background: #FFFFFF; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); border: 1px solid rgba(226, 232, 240, 0.8); }
        .dd-card { background: #FFFFFF; border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0px 18px 40px 0px rgba(112, 144, 176, 0.08); transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
        .dd-card:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0px 24px 48px 0px rgba(112, 144, 176, 0.16); }
        .dd-icon-btn { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1); display: inline-flex; }
        .group:hover .dd-icon-btn { transform: translateY(-1px) scale(1.12) rotate(-6deg); }
        .dd-glass-backdrop { background: rgba(24, 24, 27, 0.4); backdrop-filter: blur(10px); }
        .dd-glass-modal { background: rgba(255, 255, 255, 0.98); border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 30px 70px -12px rgba(245,158,11, 0.25); backdrop-filter: blur(24px); }
        .dd-input { width: 100%; padding: 0.75rem 1.1rem; background: #F4F7FE; border: 1px solid #E2E8F0; border-radius: 1rem; font-size: 0.875rem; font-weight: 500; outline: none; transition: border 0.3s; }
        .dd-input:focus { border-color: #D4A373; }
      `}</style>

      {/* FIXED SIDEBAR */}
      <div className="w-full lg:w-72 shrink-0 rounded-[2rem] p-6 flex flex-col gap-6 dd-sidebar lg:fixed lg:top-30 lg:left-6 z-30 lg:h-[calc(100vh-7.8rem)]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-xs shrink-0">
            <Coffee size={19} className="text-[#D4A373]" />
          </div>
          <div>
            <h1 className="font-serif font-black text-[23px] text-zinc-600 text-base leading-none">Restaurant</h1>
            <span className="text-[9px] font-bold text-[#D4A373] uppercase tracking-widest mt-1 block">F&B Operations</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 overflow-y-auto pr-1">
          {navGroups.map((group, index) => (
            <div key={group.heading || `group-${index}`}>
              {group.heading && <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">{group.heading}</p>}
              <div className="flex flex-col gap-1">
                {group.items.map(item => (
                  <button key={item.key} onClick={() => setActiveTab(item.key)} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === item.key ? 'bg-[#D4A373] text-zinc-900 shadow-md shadow-[#D4A373]/20' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}>
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {isAdmin && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">Command Center</p>
              <button onClick={() => navigate('/dashboard/admin')} className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 hover:text-[#D4A373] transition-all text-left">
                <span className="flex items-center gap-3"><Building2 size={15} /> Back to Admin</span><ArrowUpRight size={14} className="opacity-50" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MAIN CONTENT WORKSPACE */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden min-w-0 lg:ml-[21rem]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-zinc-600 tracking-tight mt-0.5">
              {{ overview: 'Dining Overview', kots: 'Kitchen Order Tickets', tables: 'Table Management', menu: 'Menu & Inventory', billing: 'Billing & Settlements' }[activeTab]}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">Manage kitchen workflows, restaurant seating, and F&B revenue.</p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider">Live System</span>
            </div>
            <button onClick={refresh} className="p-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-500 transition-all"><RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} /></button>
            {(() => {
              const staffName = sessionStorage.getItem('hms_name') || 'Staff';
              const initials = staffName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ST';
              let designation = 'Restaurant admin';
              try {
                const user = JSON.parse(sessionStorage.getItem('hms_user'));
                if (user && user.designation) designation = user.designation;
              } catch (e) { }
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
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-500 to-red-600 group-hover:from-rose-500 group-hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-xs transition-colors">
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
              <p className="text-xs font-medium uppercase tracking-wider">Syncing operations...</p>
            </motion.div>
          ) : (
            <div className="space-y-6">

              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {overview.metrics && overview.metrics.map((kpi, i) => {
                      const t = themeMap[kpi.theme] || themeMap['#D4A373'];
                      const dotColor = kpi.theme && kpi.theme.startsWith('#') ? kpi.theme : { amber: '#D4A373', rose: '#e11d48', emerald: '#059669', indigo: '#4f46e5' }[kpi.theme] || '#D4A373';
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 16 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
                          whileHover={{ y: -8, scale: 1.02 }}
                          style={{ '--kpi-glow': t.glow }}
                          className={`relative rounded-[2rem] p-6 overflow-hidden group select-none flex items-center justify-between gap-2 border border-zinc-200/70 bg-gradient-to-br ${t.gradient} shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_-16px_rgba(0,0,0,0.15)] transition-shadow duration-500 hover:shadow-[0_20px_45px_-18px_var(--kpi-glow)] ring-1 ${t.ring}`}
                        >
                          {/* decorative glow blob */}
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
                                {iconMap[kpi.iconName]}
                              </motion.div>
                            </div>
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.08 + 0.2 }}
                              className="text-2xl 2xl:text-3xl font-black text-zinc-900 tracking-tight leading-none mb-1.5 break-words"
                            >
                              {kpi.value}
                            </motion.p>
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                            <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                          </div>
                          <div className="relative">{kpiGraphic(i, dotColor)}</div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                      className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                      <div className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-[#D4A373] flex items-center justify-center shadow-md shadow-[#D4A373]/30">
                          <TrendingUp size={14} className="text-white" />
                        </div>
                        <h3 className="font-black text-sm uppercase text-zinc-800">Order Volume Trend</h3>
                      </div>
                      <OrderTrendLine data={overview.orderTrend || []} />
                    </motion.div>
                    <motion.div
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 350, damping: 22 }}
                      className="relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
                    >
                      <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-rose-200/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-rose-500 flex items-center justify-center shadow-md shadow-rose-500/30">
                          <PieChart size={14} className="text-white" />
                        </div>
                        <h3 className="font-black text-sm uppercase text-zinc-800">Sales by Outlet</h3>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-around gap-6">
                        <DonutChart data={overview.salesSplit || []} centerLabel="Orders" />
                        <div className="grid grid-cols-1 gap-y-2.5">
                          {overview.salesSplit && overview.salesSplit.map((d, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                              <span className="text-[11px] text-zinc-500 font-semibold">{d.label}</span>
                              <span className="text-xs font-black text-zinc-900 ml-auto">{d.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {/* TAB: KITCHEN ORDER TICKETS (KOT) */}
              {activeTab === 'kots' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 h-[calc(100vh-14rem)] flex flex-col">
                  {/* Enhanced Header Bar */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-5 rounded-[2rem] border border-zinc-200/60 shadow-sm gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#D4A373] to-[#b9834f] flex items-center justify-center shadow-lg shadow-[#D4A373]/30">
                        <ChefHat size={18} className="text-white" />
                      </div>
                      <div>
                        <h2 className="font-black text-zinc-900 text-base tracking-tight">Live Kitchen Display</h2>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                          <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Live</span>
                        </div>
                      </div>
                    </div>
                    {/* Quick Stats Row */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {[
                        { label: 'New', count: activeKOTs.filter(k => k.status === 'New').length, color: '#0ea5e9', bg: 'bg-sky-50 border-sky-200' },
                        { label: 'Preparing', count: activeKOTs.filter(k => k.status === 'Preparing').length, color: '#f59e0b', bg: 'bg-amber-50 border-amber-200' },
                        { label: 'Ready', count: activeKOTs.filter(k => k.status === 'Ready').length, color: '#10b981', bg: 'bg-emerald-50 border-emerald-200' },
                        { label: 'Served', count: activeKOTs.filter(k => k.status === 'Served').length, color: '#6b7280', bg: 'bg-zinc-50 border-zinc-200' },
                      ].map(s => (
                        <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold ${s.bg}`}>
                          <span className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                          <span className="text-zinc-600">{s.label}</span>
                          <span className="font-black text-zinc-900">{s.count}</span>
                        </div>
                      ))}
                      <button onClick={() => setActiveTab('menu')} className="bg-gradient-to-r from-[#D4A373] to-[#b9834f] text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:shadow-lg hover:shadow-[#D4A373]/30 transition-all hover:-translate-y-0.5 flex items-center gap-1.5">
                        <Plus size={14} strokeWidth={3} /> Punch Order
                      </button>
                    </div>
                  </div>

                  {/* Kanban Board */}
                  <div className="flex-1 flex flex-col xl:flex-row gap-4 overflow-x-hidden pb-2">
                    {['New', 'Preparing', 'Ready', 'Served'].map(status => {
                      const columnKOTs = activeKOTs.filter(k => k.status === status);
                      const colConfig = {
                        'New': { color: '#0ea5e9', gradient: 'from-sky-500 to-blue-600', lightBg: 'bg-sky-50/70', borderColor: 'border-sky-200/60', icon: <AlertCircle size={14} />, nextLabel: 'Start Preparing' },
                        'Preparing': { color: '#f59e0b', gradient: 'from-amber-400 to-orange-500', lightBg: 'bg-amber-50/70', borderColor: 'border-amber-200/60', icon: <Flame size={14} />, nextLabel: 'Mark Ready' },
                        'Ready': { color: '#10b981', gradient: 'from-emerald-500 to-teal-600', lightBg: 'bg-emerald-50/70', borderColor: 'border-emerald-200/60', icon: <CheckCircle2 size={14} />, nextLabel: 'Mark Served' },
                        'Served': { color: '#6b7280', gradient: 'from-zinc-400 to-zinc-500', lightBg: 'bg-zinc-50/70', borderColor: 'border-zinc-200/60', icon: <CheckCircle2 size={14} />, nextLabel: null },
                      }[status];
                      
                      let widthClass = 'w-full xl:w-1/4 xl:flex-1';
                      if (expandedColumn) {
                         if (expandedColumn === status) {
                            widthClass = 'w-full xl:flex-[3] xl:min-w-[55%]';
                         } else {
                            widthClass = 'w-full xl:flex-1 xl:min-w-[12%] opacity-60 hover:opacity-100';
                         }
                      }
                      
                      return (
                        <div key={status} onClick={() => setExpandedColumn(expandedColumn === status ? null : status)} className={`flex flex-col rounded-[1.5rem] border ${colConfig.borderColor} ${colConfig.lightBg} overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-500 shrink-0 ${widthClass}`}>
                          {/* Column Header */}
                          <div className={`p-3.5 bg-gradient-to-r ${colConfig.gradient} flex items-center justify-between shrink-0`}>
                            <div className="flex items-center gap-2">
                              <span className="relative flex h-2.5 w-2.5">
                                {status !== 'Served' && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-40"></span>}
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white/90"></span>
                              </span>
                              <h4 className="text-xs font-black uppercase tracking-[0.15em] text-white">{status}</h4>
                            </div>
                            <span className="text-[10px] font-black text-white/90 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full min-w-[28px] text-center">{columnKOTs.length}</span>
                          </div>

                          {/* Column Body */}
                          <div className="flex-1 overflow-y-auto dd-scrollbar p-2.5 space-y-2.5">
                            {columnKOTs.length === 0 && (
                              <div className="h-full flex flex-col items-center justify-center text-center py-8 opacity-40">
                                {status === 'New' ? <Utensils size={28} strokeWidth={1.5} className="mb-2 text-sky-400" /> :
                                  status === 'Preparing' ? <Flame size={28} strokeWidth={1.5} className="mb-2 text-amber-400" /> :
                                    status === 'Ready' ? <BellRing size={28} strokeWidth={1.5} className="mb-2 text-emerald-400" /> :
                                      <CheckCircle2 size={28} strokeWidth={1.5} className="mb-2 text-zinc-400" />}
                                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">No {status.toLowerCase()} orders</p>
                              </div>
                            )}
                            {columnKOTs.map(kot => (
                              <motion.div
                                key={kot.id}
                                layout
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={(e) => { e.stopPropagation(); setSelectedKOT(kot); }}
                                className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm relative overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
                              >
                                {/* Thick Accent Bar */}
                                <div className={`absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b ${colConfig.gradient} rounded-l-2xl`} />

                                {/* Card Content */}
                                <div className="pl-4 pr-3 pt-3 pb-2.5">
                                  {/* Table & Meta Row */}
                                  <div className="flex justify-between items-center mb-2.5">
                                    <div className="flex items-center gap-2">
                                      <span className="font-black text-sm text-zinc-900 bg-zinc-100 px-2.5 py-1 rounded-lg border border-zinc-200/60">{kot.table}</span>
                                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-[0.12em]" style={{ background: `${colConfig.color}15`, color: colConfig.color }}>{kot.type}</span>
                                    </div>
                                    <div className="flex items-center gap-1 text-zinc-400">
                                      <Timer size={11} strokeWidth={2.5} />
                                      <span className="text-[10px] font-bold">{kot.time}</span>
                                    </div>
                                  </div>

                                  {/* Items List */}
                                  <div className="mb-2.5">
                                    {(() => {
                                      try {
                                        const parsed = typeof kot.items === 'string' ? JSON.parse(kot.items) : kot.items;
                                        if (Array.isArray(parsed)) {
                                          return (
                                            <div className="space-y-1.5">
                                              {parsed.map((item, idx) => (
                                                <div key={idx} className="flex items-start gap-2">
                                                  <span className="shrink-0 w-5 h-5 rounded-md bg-zinc-900 text-white text-[10px] font-black flex items-center justify-center mt-0.5">{item.qty}</span>
                                                  <div className="flex-1 min-w-0">
                                                    <span className="text-xs font-bold text-zinc-800 leading-tight block">{item.item}</span>
                                                    {item.note && (
                                                      <div className="mt-1 flex items-start gap-1.5 bg-amber-50 border border-amber-200/60 rounded-lg px-2 py-1">
                                                        <PenLine size={9} className="text-amber-500 mt-0.5 shrink-0" />
                                                        <span className="text-[10px] text-amber-700 font-semibold leading-tight">{item.note}</span>
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          );
                                        }
                                      } catch (e) { }
                                      return <p className="text-xs text-zinc-600 font-medium leading-relaxed whitespace-pre-wrap">{typeof kot.items === 'string' ? kot.items : JSON.stringify(kot.items)}</p>;
                                    })()}
                                  </div>

                                  {/* Footer */}
                                  <div className="flex justify-between items-center pt-2 border-t border-zinc-100">
                                    <span className="text-[9px] font-mono font-bold text-zinc-300 tracking-wider">{kot.id}</span>
                                    {status !== 'Served' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const nextStatus = status === 'New' ? 'Preparing' : status === 'Preparing' ? 'Ready' : 'Served';
                                          updateKOTStatus(kot.full_id, nextStatus);
                                        }}
                                        className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md`}
                                        style={{ background: `${colConfig.color}12`, color: colConfig.color }}
                                        onMouseEnter={e => { e.currentTarget.style.background = colConfig.color; e.currentTarget.style.color = '#fff'; }}
                                        onMouseLeave={e => { e.currentTarget.style.background = `${colConfig.color}12`; e.currentTarget.style.color = colConfig.color; }}
                                      >
                                        {colConfig.nextLabel} <ArrowRight size={12} strokeWidth={2.5} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </motion.div>
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
              
                  {/* Local styles for this section only — shimmering border, floating orbs, tilt sheen */}
                  <style>{`
                    @keyframes tb-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                    @keyframes tb-float { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(10px,-8px) scale(1.05); } }
                    @keyframes tb-pulse-ring { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,0.35); } 70% { box-shadow: 0 0 0 8px rgba(99,102,241,0); } 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); } }
                    .tb-glow-wrap { position: relative; border-radius: 1.75rem; padding: 2px; background-size: 220% 220%; animation: tb-shimmer 10s ease-in-out infinite; }
                    .tb-ring-pulse { animation: tb-pulse-ring 2.4s cubic-bezier(0.4,0,0.6,1) infinite; }
                    .tb-card { position: relative; isolation: isolate; overflow: hidden; }
                    .tb-card::after {
                      content: '';
                      position: absolute; inset: 0;
                      background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.6) 45%, transparent 60%);
                      transform: translateX(-130%);
                      transition: transform 0.8s cubic-bezier(0.22,1,0.36,1);
                      pointer-events: none; z-index: 2; border-radius: inherit;
                    }
                    .tb-card:hover::after { transform: translateX(130%); }
                  `}</style>
              
                  {/* Header / Legend */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white p-5 rounded-[1.5rem] border border-zinc-200/60 shadow-sm flex flex-wrap gap-4 justify-between items-center"
                  >
                    <div className="flex items-center gap-2 text-sm font-bold uppercase text-zinc-800">
                      <motion.div
                        whileHover={{ rotate: -10, scale: 1.1 }}
                        animate={{ y: [0, -2, 0] }}
                        transition={{ y: { duration: 2.6, repeat: Infinity, ease: 'easeInOut' }, rotate: { type: 'spring', stiffness: 400, damping: 14 } }}
                        className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/30 tb-ring-pulse"
                      >
                        <MapPin size={14} className="text-white" />
                      </motion.div>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-blue-600">Floor Plan Status</span>
                      <button onClick={() => {
                        const num = prompt('Enter Table Number (e.g., T11):');
                        if (num) {
                          const cap = prompt('Enter Capacity (e.g., 4):');
                          handleAddTable(num, parseInt(cap) || 4);
                        }
                      }} className="ml-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-indigo-500/30 flex items-center gap-1">
                        <Plus size={12} strokeWidth={3} /> Add Table
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-4 text-xs font-bold text-zinc-500">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#D4A373]/20 border border-[#D4A373]/40 shadow-sm" /> Available</span>
                      <span className="flex items-center gap-1.5"><span className="relative w-3 h-3 rounded-full bg-rose-100 border border-rose-400 shadow-sm"><span className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-40" /></span> Occupied</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-100 border border-amber-400 shadow-sm" /> Dirty</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-100 border border-sky-400 shadow-sm" /> Reserved</span>
                    </div>
                  </motion.div>
              
                  {/* Table Grid */}
                  <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
                    className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
                  >
                    {tables.map(t => {
                      const styles = {
                        Available: 'bg-gradient-to-br from-[#D4A373]/10 to-white border-[#D4A373]/40 text-[#B8895A]',
                        Occupied: 'bg-gradient-to-br from-rose-50 to-white border-rose-300 text-rose-700',
                        Dirty: 'bg-gradient-to-br from-amber-50 to-white border-amber-300 text-amber-700',
                        Reserved: 'bg-gradient-to-br from-sky-50 to-white border-sky-300 text-sky-700'
                      }[t.status] || 'bg-zinc-50 border-zinc-200 text-zinc-700';
              
                      const glow = {
                        Available: 'rgba(212,163,115,0.35)',
                        Occupied: 'rgba(244,63,94,0.3)',
                        Dirty: 'rgba(245,158,11,0.3)',
                        Reserved: 'rgba(14,165,233,0.3)'
                      }[t.status] || 'rgba(113,113,122,0.2)';
              
                      return (
                        <motion.div
                          key={t.id}
                          variants={{ hidden: { opacity: 0, y: 14, scale: 0.96 }, visible: { opacity: 1, y: 0, scale: 1 } }}
                          whileHover={{ y: -5, scale: 1.05, boxShadow: `0px 18px 36px -14px ${glow}` }}
                          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                          className={`tb-card p-4 rounded-[1.5rem] border-2 flex flex-col items-center justify-center gap-2 shadow-sm relative group ${styles}`}
                        >
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDeleteTable(t.id); }}
                            className="absolute top-2 left-2 p-1.5 rounded-full bg-white/50 text-zinc-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shadow-sm border border-black/5"
                            title="Delete Table"
                          >
                            <Trash2 size={10} />
                          </button>
                          {t.status === 'Occupied' && (
                            <span className="absolute top-2 right-2 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
                            </span>
                          )}
                          <div className="relative flex items-center justify-between w-full text-[10px] font-bold uppercase tracking-widest opacity-70">
                            <span className="flex items-center gap-1"><Users size={10} /> {t.capacity} Pax</span>
                            <span className="flex items-center gap-1">{t.reserved_time && <Clock size={10} />}{t.reserved_time || ''}</span>
                          </div>
                          <motion.h3
                            whileHover={{ scale: 1.08 }}
                            transition={{ type: 'spring', stiffness: 400, damping: 14 }}
                            className="relative text-2xl font-black tracking-tight"
                          >
                            {t.table_number}
                          </motion.h3>
                          <select
                            value={t.status}
                            onChange={(e) => updateTableStatus(t.id, e.target.value)}
                            className="relative text-[9px] font-black uppercase tracking-widest bg-white/60 px-2.5 py-1 rounded-full outline-none cursor-pointer appearance-none text-center hover:bg-white transition-colors shadow-sm border border-black/5"
                          >
                            <option value="Available">Available</option>
                            <option value="Occupied">Occupied</option>
                            <option value="Dirty">Dirty</option>
                            <option value="Reserved">Reserved</option>
                          </select>
                        </motion.div>
                      )
                    })}
                  </motion.div>
                </motion.div>
              )}

              {/* TAB: MENU & INVENTORY (POS) */}
              {activeTab === 'menu' && (
                <div className="flex flex-col gap-4 h-full">
                  <div className="flex justify-between items-center bg-white px-4 py-2 rounded-2xl border border-zinc-200 shadow-sm">
                    <div className="flex items-center gap-2">
                      <Utensils size={18} className="text-[#D4A373]" />
                      <h3 className="font-black text-sm uppercase tracking-widest text-zinc-800">Menu & POS System</h3>
                    </div>
                    <button onClick={() => setIsMenuManageMode(!isMenuManageMode)} className="px-4 py-1.5 bg-[#D4A373]/10 text-[#D4A373] hover:bg-[#D4A373] hover:text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors">
                      {isMenuManageMode ? 'Switch to POS Mode' : 'Manage Menu'}
                    </button>
                  </div>
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-14rem)]">
                    {/* Left Canvas */}
                    <div className={`w-full flex flex-col gap-4 h-full min-h-0 ${isMenuManageMode ? 'lg:w-full' : 'lg:w-[70%]'}`}>
                      {/* Top Control Bar */}
                      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-3 rounded-2xl shadow-sm border border-zinc-200 gap-3">
                        <div className="flex-1 w-full max-w-md relative">
                          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input type="text" placeholder="Search dish" value={posSearch} onChange={e => setPosSearch(e.target.value)} className="w-full bg-zinc-50 border border-zinc-200 rounded-xl py-2 pl-9 pr-4 text-sm outline-none focus:border-[#D4A373] transition-colors" />
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <button onClick={() => setPosSpicy(!posSpicy)} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] transition-colors ${posSpicy ? 'bg-red-100 border-red-300 shadow-sm' : 'bg-zinc-50 border-zinc-200 opacity-50 hover:opacity-100'} border`} title="Spicy">🌶️</button>
                          <button onClick={() => setPosGlutenFree(!posGlutenFree)} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] transition-colors ${posGlutenFree ? 'bg-yellow-100 border-yellow-300 shadow-sm' : 'bg-zinc-50 border-zinc-200 opacity-50 hover:opacity-100'} border`} title="Gluten-Free">🌾</button>
                          <button onClick={() => setPosNuts(!posNuts)} className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] transition-colors ${posNuts ? 'bg-orange-100 border-orange-300 shadow-sm' : 'bg-zinc-50 border-zinc-200 opacity-50 hover:opacity-100'} border`} title="Contains Nuts">🥜</button>
                        </div>
                        <div className="flex bg-zinc-100 p-1 rounded-xl shrink-0 w-full sm:w-auto overflow-x-auto dd-scrollbar">
                          {['Pure Veg', 'Non-Veg', 'Egg', 'All Items'].map(t => (
                            <button key={t} onClick={() => setPosDietary(t)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${posDietary === t ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                              {t === 'Pure Veg' && '🟢 '}
                              {t === 'Non-Veg' && '🔴 '}
                              {t === 'Egg' && '🥚 '}
                              {t === 'All Items' && '🟡 '}
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {!isMenuManageMode ? (
                        <>
                          {/* Category Ribbon */}
                          <div className="flex overflow-x-auto gap-2 pb-2 dd-scrollbar shrink-0">
                            {posCategories.map(c => (
                              <button key={c} onClick={() => setPosCategory(c)} className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-colors ${posCategory === c ? 'bg-[#D4A373] text-white shadow-md' : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-50'}`}>{c}</button>
                            ))}
                          </div>
                          {/* Menu Grid */}
                          <div className="flex-1 overflow-y-auto dd-scrollbar grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-4">
                            {posFilteredMenu.map(m => {
                              const catTheme = {
                                'Starters': 'from-blue-500/10 to-blue-500/5 text-blue-600',
                                'Mains': 'from-emerald-500/10 to-emerald-500/5 text-emerald-600',
                                'Breads': 'from-amber-500/10 to-amber-500/5 text-amber-600',
                                'Desserts': 'from-rose-500/10 to-rose-500/5 text-rose-600',
                                'Beverages': 'from-cyan-500/10 to-cyan-500/5 text-cyan-600',
                                'Chef Specials': 'from-indigo-500/10 to-indigo-500/5 text-indigo-600'
                              }[m.category] || 'from-[#D4A373]/10 to-[#D4A373]/5 text-[#D4A373]';
                              const badgeTheme = {
                                'Starters': 'bg-blue-500/10 text-blue-600',
                                'Mains': 'bg-emerald-500/10 text-emerald-600',
                                'Breads': 'bg-amber-500/10 text-amber-600',
                                'Desserts': 'bg-rose-500/10 text-rose-600',
                                'Beverages': 'bg-cyan-500/10 text-cyan-600',
                                'Chef Specials': 'bg-indigo-500/10 text-indigo-600'
                              }[m.category] || 'bg-[#D4A373]/10 text-[#D4A373]';

                              return (
                                <div key={m.id} className="group relative bg-white rounded-3xl p-5 border border-zinc-200/80 hover:border-[#D4A373]/40 transition-all duration-300 shadow-sm hover:shadow-xl hover:-translate-y-1 overflow-hidden cursor-pointer flex flex-col justify-between min-h-[160px]" onClick={() => addToCart(m)}>
                                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${catTheme} rounded-full -translate-y-16 translate-x-12 group-hover:scale-150 transition-transform duration-500 pointer-events-none`} />

                                  <div>
                                    <div className="mb-3 flex items-start justify-between relative z-10">
                                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${badgeTheme}`}>{m.category}</span>
                                      <div className="flex gap-1.5 items-center bg-white/50 backdrop-blur-sm rounded p-0.5 shadow-sm">
                                        {m.is_spicy && <span className="bg-red-50 text-red-500 rounded p-1" title="Spicy"><Flame size={12} strokeWidth={3} /></span>}
                                        {m.dietary === 'Veg' ? <div className="w-4 h-4 border-[1.5px] border-emerald-600 flex items-center justify-center p-[2px] rounded-sm"><div className="bg-emerald-600 w-full h-full rounded-full" /></div> : m.dietary === 'Egg' ? <span className="text-xs grayscale leading-none" title="Contains Egg">🥚</span> : <div className="w-4 h-4 border-[1.5px] border-rose-600 flex items-center justify-center p-[2px] rounded-sm"><div className="bg-rose-600 w-full h-full rounded-full" /></div>}
                                      </div>
                                    </div>
                                    <h4 className="font-black text-[15px] text-zinc-900 leading-tight mb-1 group-hover:text-[#D4A373] transition-colors relative z-10 pr-4">{m.item}</h4>
                                    <div className="flex gap-2 text-[9px] font-bold text-zinc-400 uppercase tracking-wider relative z-10">
                                      {m.is_gluten_free && <span>Gluten Free</span>}
                                      {m.is_gluten_free && m.contains_nuts && <span>•</span>}
                                      {m.contains_nuts && <span>Nuts</span>}
                                    </div>
                                  </div>

                                  <div className="mt-5 flex items-end justify-between relative z-10">
                                    <span className="font-black text-zinc-900 text-xl tracking-tighter">₹{m.price}</span>
                                    <button onClick={(e) => { e.stopPropagation(); addToCart(m); }} className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white hover:bg-[#D4A373] hover:rotate-90 transition-all duration-300 shadow-lg shadow-zinc-900/20 group-hover:shadow-[#D4A373]/30 shrink-0">
                                      <Plus size={18} strokeWidth={3} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col lg:flex-row gap-6 w-full h-full min-h-0">
                          {/* Left: Add/Edit Form */}
                          <div className="w-full lg:w-[35%] bg-white rounded-[1.5rem] border border-zinc-200 p-6 shadow-sm h-full overflow-y-auto hide-scrollbar shrink-0">
                            <div className="mb-6">
                              <h3 className="font-black text-xl text-zinc-900 flex items-center gap-2"><Utensils size={18} className="text-[#D4A373]" /> {menuForm.id ? 'Edit Dish' : 'Add New Dish'}</h3>
                              <p className="text-xs text-zinc-500 font-bold mt-1">Configure dish details and pricing.</p>
                            </div>
                            <form onSubmit={handleMenuSubmit} className="flex flex-col gap-4">
                              <div>
                                <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5">Item Name</label>
                                <input type="text" className="dd-input bg-zinc-50" placeholder="e.g. Butter Chicken" value={menuForm.item} onChange={e => setMenuForm({ ...menuForm, item: e.target.value })} required />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5">Category</label>
                                  <select className="dd-input bg-zinc-50" value={menuForm.category} onChange={e => setMenuForm({ ...menuForm, category: e.target.value })} required>
                                    <option value="">Select Category</option>
                                    {posCategories.filter(c => c !== 'All').map(c => (
                                      <option key={c} value={c}>{c}</option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5">Price (₹)</label>
                                  <input type="number" className="dd-input bg-zinc-50 font-black" placeholder="0.00" value={menuForm.price} onChange={e => setMenuForm({ ...menuForm, price: e.target.value })} required />
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-bold uppercase text-zinc-500 mb-1.5">Dietary</label>
                                <div className="flex bg-zinc-100 p-1 rounded-xl">
                                  {['Veg', 'Non-Veg', 'Egg'].map(t => (
                                    <button type="button" key={t} onClick={() => setMenuForm({ ...menuForm, dietary: t })} className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${menuForm.dietary === t ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}>
                                      {t}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs font-bold uppercase text-zinc-500 mb-2">Tags</label>
                                <div className="flex flex-wrap gap-4">
                                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 cursor-pointer">
                                    <input type="checkbox" checked={menuForm.is_spicy} onChange={e => setMenuForm({ ...menuForm, is_spicy: e.target.checked })} className="w-4 h-4 rounded border-zinc-300 text-rose-600 focus:ring-rose-500" />
                                    🌶️ Spicy
                                  </label>
                                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 cursor-pointer">
                                    <input type="checkbox" checked={menuForm.is_gluten_free} onChange={e => setMenuForm({ ...menuForm, is_gluten_free: e.target.checked })} className="w-4 h-4 rounded border-zinc-300 text-yellow-500 focus:ring-yellow-500" />
                                    🌾 Gluten-Free
                                  </label>
                                  <label className="flex items-center gap-2 text-sm font-bold text-zinc-700 cursor-pointer">
                                    <input type="checkbox" checked={menuForm.contains_nuts} onChange={e => setMenuForm({ ...menuForm, contains_nuts: e.target.checked })} className="w-4 h-4 rounded border-zinc-300 text-amber-600 focus:ring-amber-500" />
                                    🥜 Contains Nuts
                                  </label>
                                </div>
                              </div>
                              <div className="mt-4 flex gap-2">
                                {menuForm.id && (
                                  <button type="button" onClick={() => setMenuForm({ id: null, item: '', category: '', price: '', dietary: 'Veg', is_spicy: false, is_gluten_free: false, contains_nuts: false })} className="flex-1 bg-zinc-200 text-zinc-700 font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-zinc-300 transition-colors">Cancel Edit</button>
                                )}
                                <button type="submit" className="flex-[2] bg-zinc-900 text-white font-black uppercase tracking-widest text-[10px] py-4 rounded-xl hover:bg-black transition-colors shadow-lg shadow-zinc-900/20">
                                  {menuForm.id ? 'Save Changes' : 'Create Dish'}
                                </button>
                              </div>
                            </form>
                          </div>

                          {/* Right: Menu Table */}
                          <div className="w-full lg:w-[65%] overflow-y-auto hide-scrollbar bg-white rounded-[1.5rem] border border-zinc-200 p-6 shadow-sm h-full">
                            <div className="flex justify-between items-center mb-6">
                              <div>
                                <h3 className="font-black text-xl text-zinc-900">Existing Dishes</h3>
                                <p className="text-xs text-zinc-500 font-bold">Manage all dishes across the menu.</p>
                              </div>
                            </div>
                            <div className="overflow-x-auto hide-scrollbar">
                              <table className="w-full text-left text-sm border-collapse">
                                <thead>
                                  <tr className="text-zinc-400 border-b border-zinc-100">
                                    <th className="pb-3 font-bold uppercase tracking-widest text-[10px]">Item Name</th>
                                    <th className="pb-3 font-bold uppercase tracking-widest text-[10px]">Category</th>
                                    <th className="pb-3 font-bold uppercase tracking-widest text-[10px]">Price</th>
                                    <th className="pb-3 font-bold uppercase tracking-widest text-[10px]">Dietary / Tags</th>
                                    <th className="pb-3 font-bold uppercase tracking-widest text-[10px] text-right">Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {posFilteredMenu.map(m => (
                                    <tr key={m.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors group">
                                      <td className="py-4 font-black text-zinc-800">{m.item}</td>
                                      <td className="py-4 font-bold text-zinc-500">{m.category}</td>
                                      <td className="py-4 font-black text-[#D4A373]">₹{m.price}</td>
                                      <td className="py-4">
                                        <div className="flex items-center gap-2">
                                          <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest ${m.dietary === 'Veg' ? 'bg-emerald-100 text-emerald-700' : m.dietary === 'Egg' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>{m.dietary}</span>
                                          {m.is_spicy && <span title="Spicy">🌶️</span>}
                                          {m.is_gluten_free && <span title="Gluten-Free">🌾</span>}
                                          {m.contains_nuts && <span title="Contains Nuts">🥜</span>}
                                        </div>
                                      </td>
                                      <td className="py-4 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button onClick={() => setMenuForm(m)} className="p-2 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                          <button onClick={() => handleMenuDelete(m.id)} className="p-2 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                  {posFilteredMenu.length === 0 && (
                                    <tr>
                                      <td colSpan="5" className="py-8 text-center text-zinc-400 font-bold text-sm">No menu items found.</td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Right Pane (30%) - Hidden in Manage Mode */}
                    {!isMenuManageMode && (
                      <div className="w-full lg:w-[30%] bg-white rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col overflow-hidden h-[400px] lg:h-auto">
                        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex flex-col gap-3 shrink-0">
                          <h3 className="font-black text-zinc-800 flex items-center gap-2"><ChefHat size={18} className="text-[#D4A373]" /> Active KOT</h3>
                          <select value={posTable} onChange={e => setPosTable(e.target.value)} className="dd-input text-sm font-bold bg-white" required>
                            <option value="">Select Table / Room...</option>
                            {tables.filter(t => t.status === 'Occupied' || t.status === 'Available').map(t => (
                              <option key={t.id} value={t.table_number}>{t.table_number} ({t.status})</option>
                            ))}
                            <option disabled>──────</option>
                            <option value="Room 101">Room 101</option>
                            <option value="Room 102">Room 102</option>
                            <option value="Room 103">Room 103</option>
                          </select>
                        </div>

                        <div className="flex-1 overflow-y-auto dd-scrollbar p-2">
                          {posCart.length === 0 && <div className="h-full flex flex-col items-center justify-center text-zinc-400 opacity-50"><Utensils size={32} className="mb-2" /> <p className="text-xs font-bold">Cart is empty</p></div>}
                          {posCart.map(c => (
                            <div key={c.id} className="p-3 bg-zinc-50 border border-zinc-100 rounded-xl mb-2 group">
                              <div className="flex justify-between items-start mb-2">
                                <div className="flex-1 pr-2">
                                  <h4 className="text-xs font-bold text-zinc-800 leading-tight">{c.item}</h4>
                                  <span className="text-[10px] font-bold text-[#D4A373]">₹{c.price}</span>
                                </div>
                                <div className="flex items-center gap-2 bg-white border border-zinc-200 rounded-lg p-0.5">
                                  <button onClick={() => updateCartQty(c.id, -1)} className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 rounded"><Minus size={12} /></button>
                                  <span className="text-xs font-bold w-4 text-center">{c.qty}</span>
                                  <button onClick={() => updateCartQty(c.id, 1)} className="w-5 h-5 flex items-center justify-center text-zinc-500 hover:bg-zinc-100 rounded"><Plus size={12} /></button>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 opacity-50 focus-within:opacity-100 transition-opacity">
                                <PenLine size={12} className="text-zinc-400" />
                                <input type="text" placeholder="Add note (e.g. Extra spicy)" value={c.note} onChange={e => updateCartNote(c.id, e.target.value)} className="bg-transparent text-[10px] w-full outline-none text-zinc-600 placeholder-zinc-400" />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="p-4 border-t border-zinc-100 bg-zinc-50/80 shrink-0 space-y-2">
                          <div className="flex justify-between text-xs font-bold text-zinc-500"><span>Item Total</span><span>₹{cartTotal.toFixed(2)}</span></div>
                          <div className="flex justify-between text-xs font-bold text-zinc-500"><span>Est. Taxes (5%)</span><span>₹{cartTax.toFixed(2)}</span></div>
                          <div className="flex justify-between text-lg font-black text-zinc-900 pt-2 border-t border-zinc-200/60"><span>Total</span><span>₹{cartGrandTotal.toFixed(2)}</span></div>
                          <button onClick={handlePunchPOS} disabled={!posTable || posCart.length === 0} className="w-full mt-2 bg-zinc-900 disabled:bg-zinc-300 disabled:cursor-not-allowed hover:bg-black text-white py-3 rounded-xl font-black uppercase tracking-widest text-xs flex justify-center items-center gap-2 shadow-lg shadow-zinc-900/20 transition-all hover:-translate-y-0.5">
                            <Flame size={16} /> Punch to Kitchen
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>
              )}

              {/* TAB: KITCHEN INVENTORY & PROCUREMENT */}
              {activeTab === 'inventory' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Header Ribbon & KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <div className="lg:col-span-4 flex justify-between items-center bg-white p-5 rounded-[2rem] border border-zinc-200/60 shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                          <Package size={18} className="text-white" />
                        </div>
                        <div>
                          <h2 className="font-black text-zinc-900 text-sm tracking-tight">Kitchen Inventory & Procurement</h2>
                          <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5 block">Back-of-House Operations</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setIsWastageModalOpen(true)} className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all flex items-center gap-1.5">
                          <Minus size={12} strokeWidth={3} /> Record Wastage
                        </button>
                        <button onClick={() => { setMaterialForm({ id: null, name: '', category: '', uom: 'kg', unit_cost: '', par_level: '', is_active: true }); setIsMaterialModalOpen(true); }} className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-zinc-700 bg-white border border-zinc-200 hover:bg-zinc-50 transition-all shadow-sm flex items-center gap-1.5">
                          <Plus size={12} strokeWidth={3} /> New Material
                        </button>
                        <button onClick={openEodModal} className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 flex items-center gap-1.5">
                          <ClipboardList size={12} strokeWidth={3} /> Record EOD Stock
                        </button>
                        <button onClick={() => setIsDeliveryModalOpen(true)} className="px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider text-white bg-zinc-900 hover:bg-black shadow-lg shadow-zinc-900/20 transition-all hover:-translate-y-0.5 flex items-center gap-1.5">
                          <Plus size={12} strokeWidth={3} /> Log Delivery
                        </button>
                      </div>
                    </div>

                    {[
                      { label: "Today's F&B Sales", value: `₹${(inventoryStats.revenueToday || 0).toLocaleString()}`, sub: "Total sale per day", icon: <TrendingUp size={16} />, theme: 'emerald' },
                      { label: "Today's Procurement", value: `₹${(inventoryStats.procurementSpendToday || 0).toLocaleString()}`, sub: "Total buying cost today", icon: <Truck size={16} />, theme: 'indigo' },
                      { label: "Today's Material Utilized", value: `₹${(inventoryStats.utilizedValueToday || 0).toLocaleString()}`, sub: "Cost of raw materials used", icon: <Flame size={16} />, theme: 'amber' },
                      { label: "True Daily Profit", value: `₹${(inventoryStats.grossProfitToday || 0).toLocaleString()}`, sub: "Sales minus Utilization", icon: <DollarSign size={16} />, theme: 'emerald' },
                    ].map((kpi, i) => {
                      const t = themeMap[kpi.theme] || themeMap['indigo'];
                      const dotColor = { amber: '#D4A373', rose: '#e11d48', emerald: '#059669', indigo: '#4f46e5' }[kpi.theme] || '#4f46e5';
                      return (
                        <div key={i} className={`relative rounded-[2rem] p-6 overflow-hidden group select-none flex items-center justify-between border border-zinc-200/70 bg-gradient-to-br ${t.gradient} shadow-sm transition-shadow duration-500 hover:shadow-md ring-1 ${t.ring}`}>
                          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" style={{ background: t.glow }} />
                          <div className="relative flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-4">
                              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.iconBg}`}>{kpi.icon}</div>
                            </div>
                            <p className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1.5">{kpi.value}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Analytics Section (Middle Row) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60 relative">
                      <div className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
                          <Activity size={14} className="text-white" />
                        </div>
                        <h3 className="font-black text-xs uppercase text-zinc-800">Sales vs Spend vs Consumption (7 Days)</h3>
                      </div>
                      <SalesVsSpendVsConsumptionChart data={inventoryStats.profitGapData} />
                      <div className="flex justify-center gap-6 mt-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sales (Revenue)</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600"><span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Procurement (Buying)</div>
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-600"><span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Utilization (COGS)</div>
                      </div>
                    </div>

                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/60 relative overflow-hidden">
                      <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-md shadow-indigo-500/30">
                          <PieChart size={14} className="text-white" />
                        </div>
                        <h3 className="font-black text-xs uppercase text-zinc-800">Spend By Category</h3>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 h-[180px]">
                        <DonutChart data={inventoryStats.spendCategories} centerLabel="Spend" />
                        <div className="grid grid-cols-1 gap-y-2.5 w-full sm:w-auto">
                          {inventoryStats.spendCategories.map((d, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                              <span className="text-[10px] text-zinc-500 font-semibold">{d.label}</span>
                              <span className="text-[11px] font-black text-zinc-900 ml-auto">{d.value}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Workspace (Data Tables) */}
                  <div className="bg-white rounded-[2rem] border border-zinc-200/60 shadow-sm overflow-hidden flex flex-col h-[400px]">
                    <div className="flex border-b border-zinc-100 bg-zinc-50/50 p-2 gap-2 overflow-x-auto dd-scrollbar shrink-0">
                      <div className="flex items-center p-1.5 bg-zinc-100/50 rounded-2xl w-fit">
                        {[{ id: 'master', icon: Package, label: 'Master List' }, { id: 'reconciliation', icon: ClipboardList, label: 'Reconciliation' }, { id: 'procurement', icon: Truck, label: 'Procurement Logs' }, { id: 'wastage', icon: Trash2, label: 'Wastage Logs' }].map(t => (
                          <button key={t.id} onClick={() => setInventoryTab(t.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${inventoryTab === t.id ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-zinc-200/50' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'}`}>
                            <t.icon size={14} strokeWidth={inventoryTab === t.id ? 3 : 2.5} />
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex-1 overflow-auto dd-scrollbar p-0">
                      {inventoryTab === 'master' && (
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-500 tracking-wider sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                            <tr>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Item Name</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Category</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Stock Level</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Par Level</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Unit Cost</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Asset Value</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold text-center">Status</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold text-right sticky right-0 bg-zinc-50">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs font-medium text-zinc-700">
                            {inventoryItems.map(item => (
                              <tr key={item.id} className={`border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors ${item.is_active === false ? 'opacity-50' : ''}`}>
                                <td className="p-4 py-3">
                                  <div className="font-bold text-zinc-900">{item.name} {item.is_active === false && <span className="ml-2 text-[9px] px-1.5 py-0.5 bg-zinc-200 text-zinc-600 rounded">Archived</span>}</div>
                                  <div className="text-[9px] text-zinc-400 uppercase tracking-widest">{item.id}</div>
                                </td>
                                <td className="p-4 py-3">{item.category}</td>
                                <td className="p-4 py-3 font-bold">{item.stock} {item.uom}</td>
                                <td className="p-4 py-3 text-zinc-500 font-semibold">{item.stock} / {item.par_level} {item.uom}</td>
                                <td className="p-4 py-3">₹{item.unit_cost} / {item.uom}</td>
                                <td className="p-4 py-3 font-bold text-[#D4A373]">₹{(item.stock * item.unit_cost).toLocaleString()}</td>
                                <td className="p-4 py-3 text-center">
                                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${item.status === 'In Stock' ? 'bg-emerald-100 text-emerald-700' : item.status === 'Low' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                    {item.status}
                                  </span>
                                </td>
                                <td className="p-4 py-3 text-right sticky right-0 bg-transparent backdrop-blur-md">
                                  <div className="flex items-center justify-end gap-2">
                                    <button onClick={() => { setMaterialForm(item); setIsMaterialModalOpen(true); }} className="w-8 h-8 rounded-lg bg-zinc-50 text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 flex items-center justify-center transition-colors">
                                      <Edit2 size={14} strokeWidth={2.5} />
                                    </button>
                                    <button onClick={() => toggleMaterialStatus(item)} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${item.is_active !== false ? 'bg-zinc-50 text-zinc-400 hover:text-rose-600 hover:bg-rose-50' : 'bg-rose-50 text-rose-600 hover:text-rose-700 hover:bg-rose-100'}`}>
                                      {item.is_active !== false ? <Trash2 size={14} strokeWidth={2.5} /> : <RefreshCcw size={14} strokeWidth={2.5} />}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {inventoryTab === 'reconciliation' && (
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-500 tracking-wider sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                            <tr>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Item Name</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Category</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold text-right">Opening Stock</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold text-right text-indigo-600">Bought (+)</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold text-right">Closing Stock</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold text-right text-orange-600">Utilized Qty</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold text-right">Utilized Value</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs font-medium text-zinc-700">
                            {reconciliationData.map(item => (
                              <tr key={item.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                                <td className="p-4 py-3">
                                  <div className="font-bold text-zinc-900">{item.name}</div>
                                  <div className="text-[9px] text-zinc-400 uppercase tracking-widest">{item.uom}</div>
                                </td>
                                <td className="p-4 py-3">{item.category}</td>
                                <td className="p-4 py-3 text-right">{item.opening_stock}</td>
                                <td className="p-4 py-3 font-bold text-indigo-600 text-right">{item.bought_today > 0 ? `+${item.bought_today}` : '-'}</td>
                                <td className="p-4 py-3 text-right">{item.eod_closing_stock !== null ? item.eod_closing_stock : <span className="text-zinc-400 italic">Pending EOD</span>}</td>
                                <td className="p-4 py-3 font-bold text-orange-600 text-right">{item.eod_utilized_qty !== null ? item.eod_utilized_qty : '-'}</td>
                                <td className="p-4 py-3 font-bold text-zinc-900 text-right">₹{item.eod_utilized_value !== null ? item.eod_utilized_value.toLocaleString() : '0'}</td>
                              </tr>
                            ))}
                            {reconciliationData.length === 0 && (
                              <tr><td colSpan={7} className="text-center p-8 text-zinc-400 italic">No active reconciliation data available.</td></tr>
                            )}
                          </tbody>
                        </table>
                      )}

                      {inventoryTab === 'procurement' && (
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-500 tracking-wider sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                            <tr>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Date</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Vendor/Supplier</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Invoice #</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Category</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Amount Spent</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold text-center">Payment</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs font-medium text-zinc-700">
                            {procurementLogs.map(item => (
                              <tr key={item.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                                <td className="p-4 py-3 text-zinc-500 font-semibold">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="p-4 py-3 font-bold text-zinc-900">{item.vendor}</td>
                                <td className="p-4 py-3 font-mono text-[10px] bg-zinc-100 px-2 py-1 rounded inline-block mt-1.5">{item.invoice_number}</td>
                                <td className="p-4 py-3">{item.category}</td>
                                <td className="p-4 py-3 font-black text-rose-600">₹{parseFloat(item.amount).toLocaleString()}</td>
                                <td className="p-4 py-3 text-center">
                                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${item.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                    {item.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}

                      {inventoryTab === 'wastage' && (
                        <table className="w-full text-left border-collapse">
                          <thead className="bg-zinc-50 text-[10px] uppercase font-bold text-zinc-500 tracking-wider sticky top-0 z-10 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
                            <tr>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Date</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Item</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Quantity Lost</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold">Reason</th>
                              <th className="p-4 py-3 border-b border-zinc-100 font-bold text-right">Financial Loss</th>
                            </tr>
                          </thead>
                          <tbody className="text-xs font-medium text-zinc-700">
                            {wastageLogs.map(item => (
                              <tr key={item.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                                <td className="p-4 py-3 text-zinc-500 font-semibold">{new Date(item.date).toLocaleDateString()}</td>
                                <td className="p-4 py-3 font-bold text-zinc-900">{item.item_name}</td>
                                <td className="p-4 py-3 font-bold">{item.quantity}</td>
                                <td className="p-4 py-3">
                                  <span className="bg-zinc-100 px-2.5 py-1 rounded-md text-[10px] font-bold text-zinc-600">
                                    {item.reason}
                                  </span>
                                </td>
                                <td className="p-4 py-3 font-black text-rose-600 text-right">₹{parseFloat(item.loss_amount).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB: BILLING & SETTLEMENTS */}
              {activeTab === 'billing' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-6 h-[600px]">

                  {/* Left Pane: Active Checks (30%) */}
                  <div className="w-[30%] bg-white rounded-3xl p-5 border border-zinc-200/80 shadow-sm flex flex-col h-full relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4A373]/10 to-transparent rounded-full -translate-y-16 translate-x-16 pointer-events-none" />
                    <h3 className="font-black text-sm text-zinc-900 mb-5 flex items-center gap-2 relative z-10"><MapPin size={18} className="text-[#D4A373]" /> Active Checks</h3>
                    <div className="flex flex-col gap-3 overflow-y-auto dd-scrollbar flex-1 pr-2 relative z-10">
                      {tables.filter(t => t.status === 'Occupied').length === 0 && (
                        <div className="text-center py-10 opacity-60">
                          <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-3">
                            <Receipt size={24} className="text-zinc-400" />
                          </div>
                          <p className="text-zinc-500 font-bold text-[11px] uppercase tracking-wider">No active tables</p>
                        </div>
                      )}
                      {tables.filter(t => t.status === 'Occupied').map(t => {
                        const tUnbilled = activeKOTs.filter(k => k.table === t.table_number && k.status !== 'Served');
                        let tTotal = 0;
                        tUnbilled.forEach(k => {
                          try { const p = typeof k.items === 'string' ? JSON.parse(k.items) : k.items; if (Array.isArray(p)) p.forEach(i => tTotal += Number(i.price) * Number(i.qty)) } catch (e) { }
                        });
                        const firstOrderTime = tUnbilled.length > 0 ? tUnbilled[tUnbilled.length - 1].time : (t.time || '');
                        const isSelected = billingForm.table_number === t.table_number;

                        return (
                          <div key={t.id} onClick={() => handleSelectBillingTable(t.table_number)} className={`p-4 rounded-2xl cursor-pointer transition-all duration-300 relative overflow-hidden group ${isSelected ? 'border-transparent shadow-lg shadow-[#D4A373]/20 scale-[1.02]' : 'border border-zinc-200 hover:border-[#D4A373]/30 hover:shadow-md bg-white'}`}>
                            {isSelected && <div className="absolute inset-0 bg-gradient-to-br from-[#D4A373] to-[#b3855a] opacity-10" />}
                            {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D4A373]" />}
                            <div className="flex justify-between items-center mb-1 relative z-10">
                              <span className={`font-black text-lg ${isSelected ? 'text-[#D4A373]' : 'text-zinc-800'}`}>{t.table_number}</span>
                              <span className={`text-[11px] font-black px-2.5 py-1 rounded-md ${isSelected ? 'bg-[#D4A373] text-white' : 'bg-zinc-100 text-zinc-600 group-hover:bg-[#D4A373]/10 group-hover:text-[#D4A373]'}`}>₹{(tTotal * 1.05).toFixed(2)}</span>
                            </div>
                            <div className={`text-[11px] font-bold relative z-10 flex items-center gap-1 ${isSelected ? 'text-zinc-600' : 'text-zinc-400'}`}>
                              <Clock size={12} />
                              Seated at {firstOrderTime || 'Recently'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Right Canvas: Live Invoice (70%) */}
                  <div className="w-[70%] bg-white rounded-3xl border border-zinc-200/80 shadow-sm h-full flex flex-col overflow-hidden relative">
                    {!billingForm.table_number ? (
                      <div className="flex-1 flex flex-col items-center justify-center text-center bg-zinc-50/50">
                        <div className="w-24 h-24 rounded-full bg-white shadow-sm border border-zinc-100 flex items-center justify-center mb-5">
                          <Receipt size={40} strokeWidth={1.5} className="text-zinc-300" />
                        </div>
                        <p className="text-sm font-black text-zinc-400 tracking-[0.2em]">SELECT A TABLE TO INVOICE</p>
                      </div>
                    ) : (
                      (() => {
                        const unbilled = activeKOTs.filter(k => k.table === billingForm.table_number && k.status !== 'Served');
                        const itemMap = {};
                        unbilled.forEach(kot => {
                          try {
                            const parsed = typeof kot.items === 'string' ? JSON.parse(kot.items) : kot.items;
                            if (Array.isArray(parsed)) {
                              parsed.forEach(item => {
                                if (itemMap[item.item]) {
                                  itemMap[item.item].qty += Number(item.qty);
                                } else {
                                  itemMap[item.item] = { ...item, qty: Number(item.qty), price: Number(item.price) };
                                }
                              });
                            }
                          } catch (e) { }
                        });
                        const aggregatedItems = Object.values(itemMap).map(item => {
                          const removed = removedItemsCount[item.item] || 0;
                          return { ...item, qty: Math.max(0, item.qty - removed) };
                        }).filter(item => item.qty > 0);

                        const subtotal = aggregatedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
                        const discountAmount = subtotal * (discountPercent / 100);
                        const afterDiscount = subtotal - discountAmount;
                        const serviceChargeAmount = applyServiceCharge ? (afterDiscount * 0.10) : 0;
                        const cgst = afterDiscount * 0.025;
                        const sgst = afterDiscount * 0.025;
                        const grandTotal = afterDiscount + serviceChargeAmount + cgst + sgst;
                        const invoiceNo = `INV-${Math.floor(Date.now() / 1000).toString().slice(-4)}`;

                        return (
                          <div className="flex flex-col h-full relative w-full">
                            {/* Header */}
                            <div className="px-8 py-5 border-b border-zinc-100 flex justify-between items-center bg-white shrink-0 z-10">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-[#D4A373]/10 flex items-center justify-center text-[#D4A373]">
                                  <Receipt size={24} strokeWidth={2.5} />
                                </div>
                                <div>
                                  <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1">{billingForm.table_number}</h2>
                                  <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-wider bg-orange-50 border border-orange-200/50 text-orange-600 px-2 py-0.5 rounded shadow-sm">
                                    <Flame size={10} strokeWidth={2.5} />
                                    {unbilled.length} Active KOT{unbilled.length !== 1 ? 's' : ''}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <h3 className="text-lg font-black text-zinc-800 tracking-wider bg-zinc-100 px-3 py-1 rounded-lg inline-block mb-1">{invoiceNo}</h3>
                                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{new Date().toLocaleDateString()} &bull; {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              </div>
                            </div>

                            <div className="flex flex-1 overflow-hidden bg-white">
                              {/* Ledger */}
                              <div className="flex-1 overflow-y-auto dd-scrollbar p-8 border-r border-zinc-100 relative">
                                {/* Watermark */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                                  <Receipt size={200} />
                                </div>
                                <table className="w-full text-left border-collapse relative z-10">
                                  <thead>
                                    <tr className="text-[10px] font-black text-zinc-400 uppercase tracking-widest border-b-2 border-zinc-100">
                                      <th className="pb-4 w-14">Qty</th>
                                      <th className="pb-4">Item Details</th>
                                      <th className="pb-4 text-right">Rate</th>
                                      <th className="pb-4 text-right">Amount</th>
                                      <th className="pb-4 w-10"></th>
                                    </tr>
                                  </thead>
                                  <tbody className="text-[13px] font-bold text-zinc-800">
                                    {aggregatedItems.map((item, idx) => (
                                      <tr key={idx} className="border-b border-zinc-100/70 group hover:bg-zinc-50/80 transition-colors">
                                        <td className="py-4">
                                          <span className="bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded-md text-xs">{item.qty}x</span>
                                        </td>
                                        <td className="py-4 font-black text-zinc-900">{item.item}</td>
                                        <td className="py-4 text-right text-zinc-400">₹{item.price.toFixed(2)}</td>
                                        <td className="py-4 text-right font-black text-[#D4A373]">₹{(item.price * item.qty).toFixed(2)}</td>
                                        <td className="py-4 text-right">
                                          <button type="button" onClick={() => setRemovedItemsCount(prev => ({ ...prev, [item.item]: (prev[item.item] || 0) + 1 }))} className="w-7 h-7 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all focus:outline-none" title="Remove 1 qty">
                                            <Minus size={14} strokeWidth={3} />
                                          </button>
                                        </td>
                                      </tr>
                                    ))}
                                    {aggregatedItems.length === 0 && (
                                      <tr>
                                        <td colSpan="5" className="py-16 text-center text-zinc-300 font-bold">No items to bill. Add items to KOT first.</td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>

                              {/* Financial Math */}
                              <div className="w-[38%] bg-zinc-50 p-8 flex flex-col shrink-0">
                                <div className="space-y-4 text-[11px] font-black text-zinc-500 flex-1 uppercase tracking-wider">
                                  <div className="flex justify-between items-center text-zinc-800 text-sm">
                                    <span>Subtotal</span>
                                    <span className="font-black">₹{subtotal.toFixed(2)}</span>
                                  </div>

                                  {/* Discount Toggle */}
                                  <div className="flex justify-between items-center pt-3 border-t border-zinc-200/60">
                                    <span className="flex items-center gap-2 cursor-pointer text-indigo-600 hover:text-indigo-800 transition-colors" onClick={() => setDiscountPercent(discountPercent === 10 ? 0 : 10)}>
                                      <div className={`w-8 h-4.5 rounded-full transition-colors relative ${discountPercent > 0 ? 'bg-indigo-600' : 'bg-zinc-300'}`}>
                                        <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all ${discountPercent > 0 ? 'left-[18px]' : 'left-0.5'}`} />
                                      </div>
                                      VIP Discount (10%)
                                    </span>
                                    {discountPercent > 0 ? <span className="text-rose-500 font-black">-₹{discountAmount.toFixed(2)}</span> : <span>-₹0.00</span>}
                                  </div>

                                  {/* Service Charge Toggle */}
                                  <div className="flex justify-between items-center pt-2">
                                    <span className="flex items-center gap-2 cursor-pointer text-sky-600 hover:text-sky-800 transition-colors" onClick={() => setApplyServiceCharge(!applyServiceCharge)}>
                                      <div className={`w-8 h-4.5 rounded-full transition-colors relative ${applyServiceCharge ? 'bg-sky-500' : 'bg-zinc-300'}`}>
                                        <div className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all ${applyServiceCharge ? 'left-[18px]' : 'left-0.5'}`} />
                                      </div>
                                      Service Charge (10%)
                                    </span>
                                    {applyServiceCharge ? <span className="text-zinc-800 font-black">₹{serviceChargeAmount.toFixed(2)}</span> : <span>₹0.00</span>}
                                  </div>

                                  <div className="flex justify-between items-center pt-2">
                                    <span>CGST (2.5%)</span>
                                    <span className="text-zinc-800 font-black">₹{cgst.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between items-center pt-2">
                                    <span>SGST (2.5%)</span>
                                    <span className="text-zinc-800 font-black">₹{sgst.toFixed(2)}</span>
                                  </div>
                                </div>

                                <div className="mt-8 pt-6 border-t-2 border-dashed border-zinc-300">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Payable</p>
                                  <h1 className="text-4xl leading-none font-black text-emerald-600 tracking-tighter">₹{grandTotal.toFixed(2)}</h1>
                                </div>
                              </div>
                            </div>

                            {/* Payment Terminal Footer */}
                            <div className="p-6 bg-white border-t border-zinc-100 shrink-0 z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Select Payment Method</p>
                              <div className="grid grid-cols-4 gap-3 mb-5">
                                {['Cash', 'Card', 'UPI'].map(method => (
                                  <button key={method} type="button" onClick={() => setBillingForm(prev => ({ ...prev, payment_method: method, is_room_charge: false, booking_id: '' }))} className={`py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${billingForm.payment_method === method && !billingForm.is_room_charge ? 'bg-[#D4A373] text-white shadow-lg shadow-[#D4A373]/30 scale-[1.02]' : 'bg-zinc-50 border border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 hover:border-zinc-300'}`}>
                                    <span className={`mr-2 ${billingForm.payment_method === method && !billingForm.is_room_charge ? 'opacity-100' : 'opacity-60'}`}>
                                      {method === 'Cash' && '💵'}
                                      {method === 'Card' && '💳'}
                                      {method === 'UPI' && '📱'}
                                    </span>
                                    {method}
                                  </button>
                                ))}

                                <button type="button" onClick={() => setBillingForm(prev => ({ ...prev, is_room_charge: true, payment_method: 'Room Charge' }))} className={`py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all duration-300 ${billingForm.is_room_charge ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-[1.02]' : 'bg-zinc-50 border border-zinc-200 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800 hover:border-zinc-300'}`}>
                                  <span className={`mr-2 ${billingForm.is_room_charge ? 'opacity-100' : 'opacity-60'}`}>🚪</span> Room
                                </button>
                              </div>

                              <AnimatePresence>
                                {billingForm.is_room_charge && (
                                  <motion.div initial={{ opacity: 0, height: 0, marginBottom: 0 }} animate={{ opacity: 1, height: 'auto', marginBottom: 20 }} exit={{ opacity: 0, height: 0, marginBottom: 0 }} className="overflow-hidden">
                                    <select value={billingForm.booking_id} onChange={e => {
                                      const g = inHouseGuests.find(x => x.booking_id === e.target.value);
                                      setBillingForm(prev => ({ ...prev, booking_id: e.target.value, room_number: g?.room_number || '' }));
                                    }} className="w-full bg-indigo-50/50 border border-indigo-100 text-indigo-900 text-sm font-bold py-3.5 px-5 rounded-xl focus:ring-2 focus:ring-indigo-500 appearance-none outline-none transition-colors">
                                      <option value="">👉 Select Checked-In Guest 👈</option>
                                      {inHouseGuests.map(g => (
                                        <option key={g.booking_id} value={g.booking_id}>{g.guest_name} — Room {g.room_number}</option>
                                      ))}
                                    </select>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <button onClick={(e) => handleSettleBill(e, grandTotal.toFixed(2))} disabled={(billingForm.is_room_charge && !billingForm.booking_id) || grandTotal === 0} className="w-full bg-zinc-900 group text-white font-black text-[13px] py-4 rounded-xl hover:bg-[#D4A373] hover:scale-[1.01] transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:scale-100 disabled:bg-zinc-300 disabled:cursor-not-allowed shadow-xl shadow-zinc-900/20 uppercase tracking-widest">
                                <CheckCircle2 size={18} strokeWidth={3} className={grandTotal > 0 && (!billingForm.is_room_charge || billingForm.booking_id) ? "text-[#D4A373] group-hover:text-white transition-colors" : "text-white"} /> SETTLE BILL & FREE TABLE
                              </button>
                            </div>
                          </div>
                        );
                      })()
                    )}
                  </div>
                </motion.div>
              )}

              {/* TAB: HR HUB */}
              {activeTab === 'hr_hub' && accessLevel === 'MANAGER' && (
                <DepartmentHRModule departmentName="DINING" />
              )}

              {/* TAB: DIRECTORY */}
              {activeTab === 'directory' && (
                <div className="h-[800px] overflow-hidden rounded-[2rem] shadow-2xl shadow-indigo-900/5">
                  <StaffDirectoryModule />
                </div>
              )}

            </div>
          )}
        </AnimatePresence>
      </div>

      {/* KOT MODAL */}
      <AnimatePresence>
        {isKOTModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-55 flex items-center justify-center dd-glass-backdrop p-4" onClick={() => setIsKOTModalOpen(false)}>
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()} className="w-full max-w-md dd-glass-modal rounded-3xl p-7">
              <div className="flex justify-between items-center mb-6"><div><h2 className="text-lg font-serif font-bold text-zinc-900">Punch KOT</h2></div><button onClick={() => setIsKOTModalOpen(false)}><X size={20} className="text-zinc-500" /></button></div>
              <form onSubmit={handleAddKOT} className="space-y-4">
                <div><label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Table / Room</label><input required placeholder="e.g. Table 5 or Room 102" value={kotForm.table} onChange={e => setKotForm({ ...kotForm, table: e.target.value })} className="dd-input" /></div>
                <div><label className="block text-[10px] font-bold uppercase text-zinc-400 mb-1">Order Items</label><textarea required rows={4} placeholder="e.g. 2x Butter Chicken, 1x Naan" value={kotForm.items} onChange={e => setKotForm({ ...kotForm, items: e.target.value })} className="dd-input resize-none" /></div>
                <button type="submit" className="w-full bg-[#D4A373] hover:bg-[#D4A373] text-white font-bold py-3 rounded-xl uppercase tracking-wider text-xs transition-colors">Send to Kitchen</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
