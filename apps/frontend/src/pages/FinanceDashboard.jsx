import React, { useState, useEffect, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import {
  DollarSign, FileText, CreditCard, ArrowUpRight, Download,
  CheckCircle2, Clock, Building2, RefreshCw, TrendingUp, Landmark, Receipt,
  Wallet, ShieldCheck, Search, Plus, X, Loader2, AlertTriangle, Link2, ScanLine,
  PieChart, Plane, UtensilsCrossed, Sofa, Car, Sparkles, ChefHat, PartyPopper,
  BedDouble, Filter, TrendingDown, Truck, CalendarClock, Scale,
  Target, Percent, Users, UserCheck, LockKeyhole, Undo2, ArrowRightLeft, LogOut, Zap
} from 'lucide-react';

// =============================================
// CENTRALIZED API CONFIG
// =============================================
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}`
});

// Standard Currency Formatter
const inr = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`;

// Compact Currency Formatter (for KPIs and tight spaces)
const shortInr = (n) => {
  const num = Number(n || 0);
  if (isNaN(num)) return '₹0';
  if (num >= 100000) return `₹${(num / 100000).toFixed(2)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num.toLocaleString('en-IN')}`;
};

// =============================================
// SVG DONUT CHART (payment method split)
// =============================================
function DonutChart({ data, size = 170, centerLabel = 'Collected' }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return <div className="flex items-center justify-center text-zinc-400 text-sm" style={{ width: size, height: size }}>No Data</div>;

  const radius = 62;
  const strokeWidth = 20;
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
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-zinc-900" style={{ fontSize: '20px', fontWeight: 900 }}>{shortInr(total)}</text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-zinc-400" style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>{centerLabel}</text>
      </svg>
    </div>
  );
}

// =============================================
// REVENUE TREND LINE (SVG sparkline)
// =============================================
function RevenueTrendLine({ data = [] }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const width = 600;
  const height = 160;
  const padX = 24;
  const padY = 20;

  const max = Math.max(...data.map(t => t.value), 1);
  const min = Math.min(...data.map(t => t.value), 0);
  const range = max - min || 1;

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
          <linearGradient id="revAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#059669" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#059669" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="revLineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#047857" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={i} x1={padX} x2={width - padX} y1={padY + f * (height - padY * 2)} y2={padY + f * (height - padY * 2)} stroke="#f1f2f6" strokeWidth="1" />
        ))}

        <motion.path d={areaPath} fill="url(#revAreaFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} />

        <motion.path
          d={linePath} fill="none" stroke="url(#revLineStroke)" strokeWidth={active ? 3.5 : 2.5}
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, filter: active ? 'drop-shadow(0 0 6px rgba(5,150,105,0.55))' : 'drop-shadow(0 0 0px rgba(5,150,105,0))' }}
          transition={{ pathLength: { duration: 1.4, ease: 'easeOut' }, filter: { duration: 0.25 } }}
        />

        <AnimatePresence>
          {active && (
            <motion.line x1={active.x} x2={active.x} y1={padY} y2={height - padY} stroke="#a7f3d0" strokeWidth="1.5" strokeDasharray="4 3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          )}
        </AnimatePresence>

        {points.map((p, i) => (
          <g key={i}>
            <rect x={p.x - (width / data.length) / 2} y={0} width={width / data.length} height={height} fill="transparent" onMouseEnter={() => setHoverIdx(i)} />
            {p.isToday && (
              <motion.circle cx={p.x} cy={p.y} initial={{ r: 8 }} fill="none" stroke="#f97316" strokeWidth="2"
                animate={{ scale: [1, 2.2, 1], opacity: [0.9, 0.1, 0.9] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} style={{ pointerEvents: 'none' }} />
            )}
            <motion.circle cx={p.x} cy={p.y} initial={{ r: p.isToday ? 5 : 3 }} fill={p.isToday ? "#f97316" : "#ffffff"} stroke="#059669"
              strokeWidth={hoverIdx === i ? 3 : 2} animate={{ r: hoverIdx === i ? 6 : (p.isToday ? 5 : 3) }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }} style={{ cursor: 'pointer' }} />
            {hoverIdx === i && (
              <motion.circle cx={p.x} cy={p.y} fill="none" stroke="#34d399" strokeWidth="1.5"
                initial={{ opacity: 0.8, r: 4 }} animate={{ opacity: 0, r: 14 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut' }} />
            )}
          </g>
        ))}
      </svg>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute pointer-events-none px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white text-[10px] font-bold shadow-lg shadow-[#D4A373]/20 whitespace-nowrap"
            style={{ left: `${(active.x / width) * 100}%`, top: `${(active.y / height) * 100}%`, transform: 'translate(-50%, -140%)' }}
          >
            {active.label}: <span className="text-emerald-300">₹{active.value.toLocaleString('en-IN')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-1 px-1">
        {data.map((t, i) => (
          <span key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
            className={`text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all duration-200 ${hoverIdx === i ? 'text-[#D4A373]' : (t.isToday ? 'text-[#D4A373] animate-pulse font-extrabold' : 'text-zinc-400')
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
// EXPENSE TREND LINE (rose/amber palette variant)
// =============================================
function ExpenseTrendLine({ data = [] }) {
  const [hoverIdx, setHoverIdx] = useState(null);
  const width = 600;
  const height = 160;
  const padX = 24;
  const padY = 20;

  const max = Math.max(...data.map(t => t.value), 1);
  const min = Math.min(...data.map(t => t.value), 0);
  const range = max - min || 1;

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
          <linearGradient id="expAreaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e11d48" stopOpacity="0.24" />
            <stop offset="100%" stopColor="#e11d48" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="expLineStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#be123c" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((f, i) => (
          <line key={i} x1={padX} x2={width - padX} y1={padY + f * (height - padY * 2)} y2={padY + f * (height - padY * 2)} stroke="#f1f2f6" strokeWidth="1" />
        ))}

        <motion.path d={areaPath} fill="url(#expAreaFill)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} />

        <motion.path
          d={linePath} fill="none" stroke="url(#expLineStroke)" strokeWidth={active ? 3.5 : 2.5}
          strokeLinecap="round" strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, filter: active ? 'drop-shadow(0 0 6px rgba(225,29,72,0.5))' : 'drop-shadow(0 0 0px rgba(225,29,72,0))' }}
          transition={{ pathLength: { duration: 1.4, ease: 'easeOut' }, filter: { duration: 0.25 } }}
        />

        <AnimatePresence>
          {active && (
            <motion.line x1={active.x} x2={active.x} y1={padY} y2={height - padY} stroke="#fecdd3" strokeWidth="1.5" strokeDasharray="4 3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          )}
        </AnimatePresence>

        {points.map((p, i) => (
          <g key={i}>
            <rect x={p.x - (width / data.length) / 2} y={0} width={width / data.length} height={height} fill="transparent" onMouseEnter={() => setHoverIdx(i)} />
            {p.isToday && (
              <motion.circle cx={p.x} cy={p.y} initial={{ r: 8 }} fill="none" stroke="#f97316" strokeWidth="2"
                animate={{ scale: [1, 2.2, 1], opacity: [0.9, 0.1, 0.9] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} style={{ pointerEvents: 'none' }} />
            )}
            <motion.circle cx={p.x} cy={p.y} initial={{ r: p.isToday ? 5 : 3 }} fill={p.isToday ? "#f97316" : "#ffffff"} stroke="#e11d48"
              strokeWidth={hoverIdx === i ? 3 : 2} animate={{ r: hoverIdx === i ? 6 : (p.isToday ? 5 : 3) }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }} style={{ cursor: 'pointer' }} />
            {hoverIdx === i && (
              <motion.circle cx={p.x} cy={p.y} fill="none" stroke="#fb7185" strokeWidth="1.5"
                initial={{ opacity: 0.8, r: 4 }} animate={{ opacity: 0, r: 14 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'easeOut' }} />
            )}
          </g>
        ))}
      </svg>

      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="absolute pointer-events-none px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white text-[10px] font-bold shadow-lg shadow-rose-500/20 whitespace-nowrap"
            style={{ left: `${(active.x / width) * 100}%`, top: `${(active.y / height) * 100}%`, transform: 'translate(-50%, -140%)' }}
          >
            {active.label}: <span className="text-rose-300">₹{active.value.toLocaleString('en-IN')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-1 px-1">
        {data.map((t, i) => (
          <span key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
            className={`text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all duration-200 ${hoverIdx === i ? 'text-rose-600' : (t.isToday ? 'text-[#D4A373] animate-pulse font-extrabold' : 'text-zinc-400')
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
// HORIZONTAL BAR RANK CHART (expense by category)
// =============================================
function BarRankChart({ data = [] }) {
  const sorted = [...data].sort((a, b) => b.value - a.value);
  const max = Math.max(...sorted.map(d => d.value), 1);

  return (
    <div className="flex flex-col gap-3.5">
      {sorted.map((d, i) => (
        <div key={d.label} className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white shadow-sm" style={{ background: d.color }}>
            {d.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-zinc-600 truncate">{d.label}</span>
              <span className="text-[11px] font-black text-zinc-900 shrink-0 ml-2">₹{d.value.toLocaleString('en-IN')}</span>
            </div>
            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden shadow-inner">
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
          <linearGradient id={`kpiYieldFill-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.path d="M0 25 L12 18 L24 22 L36 10 L48 14 L60 4 V32 H0 Z" fill={`url(#kpiYieldFill-${color.replace('#','')})`}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} />
        <motion.path d="M0 25 L12 18 L24 22 L36 10 L48 14 L60 4" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round"
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, ease: 'easeOut', delay: 0.2 }} />
        <motion.circle cx="60" cy="4" r="3" fill={color} initial={{ scale: 0 }} animate={{ scale: [0, 1.4, 1] }} transition={{ duration: 0.5, delay: 1.5 }} />
      </svg>
    </div>
  );
};

// =============================================
// MAIN COMPONENT
// =============================================
export default function FinanceDashboard() {
  const navigate = useNavigate();

  // ─── Broadcast States (Real-Time SSE) ───────────────────────
  const [broadcasts, setBroadcasts] = React.useState([]);
  const [dismissedBroadcasts, setDismissedBroadcasts] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem('hms_dismissed_broadcasts')) || []; } catch { return []; }
  });

  React.useEffect(() => {
    localStorage.setItem('hms_dismissed_broadcasts', JSON.stringify(dismissedBroadcasts));
  }, [dismissedBroadcasts]);

  React.useEffect(() => {
    const token = sessionStorage.getItem('hms_token');
    fetch(`${API_BASE_URL}/api/broadcasts`, { headers: getHeaders() })
      .then(res => res.json())
      .then(data => { if (data?.data?.broadcasts) setBroadcasts(data.data.broadcasts); })
      .catch(e => console.error('Failed to fetch broadcasts:', e));

    const eventSource = new EventSource(`${API_BASE_URL}/api/broadcasts/stream?token=${token}`);
    eventSource.onmessage = (event) => {
      const newBroadcast = JSON.parse(event.data);
      setBroadcasts((prevBroadcasts) => [newBroadcast, ...prevBroadcasts]);
      toast('New Department Broadcast!', { icon: '📣' });
    };
    eventSource.onerror = (error) => { eventSource.close(); };
    return () => eventSource.close();
  }, []);

  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);

  // States
  const [apiOverview, setApiOverview] = useState(null);
  const [apiExpenses, setApiExpenses] = useState([]);
  const [apiInvoices, setApiInvoices] = useState([]);
  const [apiPayables, setApiPayables] = useState([]);
  const [apiReconciliations, setApiReconciliations] = useState([]);
  const [apiLedger, setApiLedger] = useState([]);
  const [apiStatements, setApiStatements] = useState(null);
  const [apiBudgets, setApiBudgets] = useState([]);
  const [apiPayroll, setApiPayroll] = useState([]);
  const [apiDeposits, setApiDeposits] = useState([]);
  const [apiBankAccounts, setApiBankAccounts] = useState([]);
  const [apiCashRegister, setApiCashRegister] = useState(null);

  const fetchFinanceData = async (silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      const [overviewRes, expensesRes, invoicesRes, payablesRes, reconRes, ledgerRes, stmtRes, budgetRes, cashRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/finance/overview`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/finance/expenses`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/finance/invoices`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/finance/payables`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/finance/reconciliations`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/finance/ledger`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/finance/statements`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/finance/budgets`, { headers: getHeaders() }),
        fetch(`${API_BASE_URL}/api/finance/cash-register`, { headers: getHeaders() })
      ]);

      if (overviewRes.ok) setApiOverview((await overviewRes.json()).data);
      if (expensesRes.ok) setApiExpenses((await expensesRes.json()).data.expenses);
      if (invoicesRes.ok) setApiInvoices((await invoicesRes.json()).data.invoices);
      if (payablesRes.ok) setApiPayables((await payablesRes.json()).data.payables);
      if (reconRes.ok) setApiReconciliations((await reconRes.json()).data.reconciliations);
      if (ledgerRes.ok) setApiLedger((await ledgerRes.json()).data.ledger);
      if (stmtRes.ok) setApiStatements((await stmtRes.json()).data);
      if (budgetRes.ok) setApiBudgets((await budgetRes.json()).data.budgets);
      if (cashRes.ok) setApiCashRegister((await cashRes.json()).data);
    } catch (err) {
      console.error('Failed to fetch finance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFinanceData();
  }, []);

  const refresh = () => { fetchFinanceData(); };

  // --- Modals & Forms ---
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [reconSearch, setReconSearch] = useState('');
  const [entryForm, setEntryForm] = useState({ account: '', type: 'Debit', amount: '', narration: '' });

  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('All');
  const [expenseForm, setExpenseForm] = useState({ category: 'Kitchen Items', vendor: '', amount: '', method: 'Bank Transfer', notes: '' });

  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ billTo: '', type: 'Guest Folio', amount: '', dueDate: '', notes: '' });

  const [payableSearch, setPayableSearch] = useState('');
  const [payableStatusFilter, setPayableStatusFilter] = useState('All');
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billForm, setBillForm] = useState({ vendor: '', category: 'Kitchen & F&B Supplies', amount: '', dueDate: '', notes: '' });

  const [statementView, setStatementView] = useState('pnl');

  const [depositSearch, setDepositSearch] = useState('');
  const [depositStatusFilter, setDepositStatusFilter] = useState('All');

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ from: 'HDFC Current A/c', to: 'ICICI Savings A/c', amount: '', notes: '' });

  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [cashForm, setCashForm] = useState({ actual_amount: '', notes: '' });

  // --- Data Computation ---
  const todaysRevenueVal = apiOverview?.todaysRevenue || 0;
  const pendingRecVal = apiOverview?.pendingReceivables || 0;
  const overviewTotalTax = (apiInvoices || []).reduce((sum, inv) => sum + Number(inv.tax_amount || 0), 0);

  const cashRegisterValue = apiCashRegister?.actual_amount ? `₹${Number(apiCashRegister.actual_amount).toLocaleString('en-IN')}` : "₹0";
  const cashRegisterSub = apiCashRegister ? `${apiCashRegister.status} • counted ${new Date(apiCashRegister.counted_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Not counted today";
  const cashRegisterBalanced = apiCashRegister?.status === 'Balanced';

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

  const revenueTrend = [
    { label: 'Mon', value: 118000 }, { label: 'Tue', value: 96500 }, { label: 'Wed', value: 132000 },
    { label: 'Thu', value: 121000 }, { label: 'Fri', value: 148500 }, { label: 'Sat', value: 165200 },
    { label: 'Today', value: 142500, isToday: true },
  ];

  const paymentMethodColors = { 'Credit Card': '#4f46e5', 'Bank Transfer': '#0ea5e9', 'Cash': '#f59e0b', 'UPI': '#10b981' };
  const fallbackColors = ['#4f46e5', '#0ea5e9', '#f59e0b', '#10b981', '#ec4899', '#8b5cf6'];
  const paymentSplit = apiOverview?.paymentSplit?.length > 0 ? apiOverview.paymentSplit.map((item, idx) => ({
    label: item.label || 'Unknown', value: Number(item.value), color: paymentMethodColors[item.label] || fallbackColors[idx % fallbackColors.length]
  })) : [];

  const recentTransactions = apiOverview?.recentTransactions?.length ? apiOverview.recentTransactions.map(t => ({
    id: `TXN-${t.id.substring(0, 4).toUpperCase()}`, guest: t.guest || 'N/A', room: t.room_number || 'N/A', amount: `₹${Number(t.amount).toLocaleString('en-IN')}`,
    method: t.payment_method || 'N/A', status: t.status || 'Settled', date: new Date(t.created_at).toLocaleDateString()
  })) : [];

  const reconciliationItems = (apiReconciliations || []).map(r => ({
    id: `BS-${r.id.substring(0, 4).toUpperCase()}`, source: r.source, ref: r.reference_number,
    date: new Date(r.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
    amount: `₹${Number(r.amount).toLocaleString('en-IN')}`, rawAmount: Number(r.amount),
    matchedWith: r.matched_with, status: r.status, rawId: r.id
  })).filter(r => (r.ref + r.source + r.status).toLowerCase().includes(reconSearch.toLowerCase()));

  const totalTax = (apiInvoices || []).reduce((sum, inv) => sum + Number(inv.tax_amount || 0), 0);
  const cgst = totalTax / 2;
  const sgst = totalTax / 2;

  const gstBreakup = [
    { label: 'CGST', value: `₹${cgst.toLocaleString('en-IN')}`, sub: '9% output tax' },
    { label: 'SGST', value: `₹${sgst.toLocaleString('en-IN')}`, sub: '9% output tax' },
    { label: 'IGST', value: '₹0', sub: 'Inter-state supply' },
    { label: 'Total Liability', value: `₹${totalTax.toLocaleString('en-IN')}`, sub: 'Due 20th next month' },
  ];

  let cumulativeBalance = 0;
  const ledgerEntries = (apiLedger || []).slice().reverse().map(l => {
    cumulativeBalance += Number(l.amount);
    return {
      voucher: l.reference_number || `JV-${l.id.substring(0, 4).toUpperCase()}`, account: l.transaction_type,
      debit: Number(l.amount) > 0 ? `₹${Number(l.amount).toLocaleString('en-IN')}` : '-',
      credit: Number(l.amount) < 0 ? `₹${Math.abs(Number(l.amount)).toLocaleString('en-IN')}` : '-',
      balance: `₹${cumulativeBalance.toLocaleString('en-IN')}`, date: new Date(l.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    };
  }).reverse();

  // --- Expense Management ---
  const expenseCatSpent = {};
  (apiExpenses || []).forEach(e => { expenseCatSpent[e.category] = (expenseCatSpent[e.category] || 0) + Number(e.amount); });

  const expenseCategories = [
    { key: 'travel', label: 'Travel Packages', icon: <Plane size={15} />, spent: expenseCatSpent['Travel Packages'] || 0, budget: 100000, color: '#6366f1' },
    { key: 'dining', label: 'Dining', icon: <UtensilsCrossed size={15} />, spent: expenseCatSpent['Dining'] || 0, budget: 160000, color: '#f59e0b' },
    { key: 'roomAcc', label: 'Room Accessories', icon: <Sofa size={15} />, spent: expenseCatSpent['Room Accessories'] || 0, budget: 70000, color: '#0ea5e9' },
    { key: 'vehicles', label: 'Hotel Vehicles', icon: <Car size={15} />, spent: expenseCatSpent['Hotel Vehicles'] || 0, budget: 45000, color: '#f43f5e' },
    { key: 'amenities', label: 'Other Amenities', icon: <Sparkles size={15} />, spent: expenseCatSpent['Other Amenities'] || 0, budget: 30000, color: '#a855f7' },
    { key: 'accounts', label: 'Hotel Accounts', icon: <Landmark size={15} />, spent: expenseCatSpent['Hotel Accounts'] || 0, budget: 210000, color: '#10b981' },
    { key: 'kitchen', label: 'Kitchen Items', icon: <ChefHat size={15} />, spent: expenseCatSpent['Kitchen Items'] || 0, budget: 120000, color: '#eab308' },
    { key: 'roomBookings', label: 'Room Bookings Ops', icon: <BedDouble size={15} />, spent: expenseCatSpent['Room Bookings Ops'] || 0, budget: 85000, color: '#4f46e5' },
    { key: 'eventBookings', label: 'Event Bookings Ops', icon: <PartyPopper size={15} />, spent: expenseCatSpent['Event Bookings Ops'] || 0, budget: 150000, color: '#ec4899' },
  ];

  const totalExpense = expenseCategories.reduce((s, c) => s + c.spent, 0);
  const totalExpenseBudget = expenseCategories.reduce((s, c) => s + c.budget, 0);
  const expenseUtilizationPct = Math.round((totalExpense / totalExpenseBudget) * 100) || 0;
  const overBudgetCount = expenseCategories.filter(c => c.spent > c.budget).length;
  const topExpenseCategory = [...expenseCategories].sort((a, b) => b.spent - a.spent)[0];

  const expenseTrend = apiOverview?.sixMonthExpenseTrend || [
    { label: '', value: 0 }, { label: '', value: 0 }, { label: '', value: 0 }, { label: '', value: 0 }, { label: '', value: 0 }, { label: 'Today', value: totalExpense, isToday: true }
  ];

  const currentMonthExp = expenseTrend[5]?.value || 0;
  const lastMonthExp = expenseTrend[4]?.value || 0;
  const momChangePct = lastMonthExp > 0 ? (((currentMonthExp - lastMonthExp) / lastMonthExp) * 100).toFixed(1) : 0;

  const expenseEntries = (apiExpenses?.length ? apiExpenses.map(e => ({
    id: `EXP-${e.id.substring(0, 4).toUpperCase()}`, category: e.category, vendor: e.vendor, method: e.payment_method,
    amount: `₹${Number(e.amount).toLocaleString('en-IN')}`, date: new Date(e.created_at).toLocaleDateString(), status: e.status
  })) : []).filter(e =>
    (expenseCategoryFilter === 'All' || e.category === expenseCategoryFilter) &&
    (e.vendor + e.id + e.category).toLowerCase().includes(expenseSearch.toLowerCase())
  );

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.vendor || !expenseForm.amount) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/expenses`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(expenseForm) });
      if (res.ok) { fetchFinanceData(true); toast.success('Expense recorded'); } else throw new Error();
    } catch (err) { toast.error('Failed to log expense'); }
    setIsExpenseModalOpen(false); setExpenseForm({ category: 'Kitchen Items', vendor: '', amount: '', method: 'Bank Transfer', notes: '' });
  };

  const handleAddEntry = (e) => { e.preventDefault(); setIsEntryModalOpen(false); setEntryForm({ account: '', type: 'Debit', amount: '', narration: '' }); };

  // --- Invoices & Billing ---
  const allInvoices = (apiInvoices || []).map(inv => {
    const rawStatus = inv.status || 'UNPAID';
    let statusFormatted = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
    if (statusFormatted === 'Unpaid') statusFormatted = 'Overdue';
    return {
      id: inv.invoice_number || 'INV-0000', billTo: inv.bill_to, type: inv.invoice_type, amount: Number(inv.total_amount) || 0,
      paid: Number(inv.paid_amount) || 0, dueDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-',
      status: statusFormatted, rawId: inv.id
    };
  });
  const invoicesData = allInvoices.filter(i => (invoiceStatusFilter === 'All' || i.status === invoiceStatusFilter) && (i.id + i.billTo + i.type).toLowerCase().includes(invoiceSearch.toLowerCase()));
  const totalInvoiced = allInvoices.filter(i => i.amount > 0).reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = allInvoices.reduce((s, i) => s + Math.max(i.amount - i.paid, 0), 0);
  const overdueInvoices = allInvoices.filter(i => i.status === 'Overdue');
  const overdueAmount = overdueInvoices.reduce((s, i) => s + (i.amount - i.paid), 0);
  const creditNotesCount = allInvoices.filter(i => i.type === 'Credit Note').length;
  const invoiceStatusSplit = ['Paid', 'Partial', 'Overdue', 'Draft'].map((s, idx) => ({
    label: s, value: allInvoices.filter(i => i.status === s).reduce((sum, i) => sum + Math.max(i.amount, 0), 0),
    color: ['#10b981', '#f59e0b', '#f43f5e', '#94a3b8'][idx],
  })).filter(s => s.value > 0);
  let b0_30 = 0, b31_60 = 0, b61_90 = 0, b90 = 0;
  const now = new Date();
  (apiInvoices || []).forEach(inv => {
    if (inv.status === 'PAID') return;
    const due = new Date(inv.due_date); if (isNaN(due)) return;
    const diffDays = Math.ceil(Math.abs(now - due) / (1000 * 60 * 60 * 24));
    const amt = Number(inv.total_amount) - Number(inv.paid_amount);
    if (diffDays <= 30) b0_30 += amt; else if (diffDays <= 60) b31_60 += amt; else if (diffDays <= 90) b61_90 += amt; else b90 += amt;
  });
  const agingBuckets = [
    { label: '0–30 Days', value: b0_30, color: '#10b981', icon: <Clock size={12} /> },
    { label: '31–60 Days', value: b31_60, color: '#f59e0b', icon: <Clock size={12} /> },
    { label: '61–90 Days', value: b61_90, color: '#f43f5e', icon: <Clock size={12} /> },
    { label: '90+ Days', value: b90, color: '#7c2d12', icon: <Clock size={12} /> },
  ];
  const handleAddInvoice = async (e) => {
    e.preventDefault();
    if (!invoiceForm.billTo || !invoiceForm.amount) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/invoices`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(invoiceForm) });
      if (res.ok) { fetchFinanceData(true); toast.success('Invoice created'); } else throw new Error();
    } catch (err) { toast.error('Failed to create invoice'); }
    setIsInvoiceModalOpen(false); setInvoiceForm({ billTo: '', type: 'Guest Folio', amount: '', dueDate: '', notes: '' });
  };

  // --- Accounts Payable ---
  const vendorCategories = ['Kitchen & F&B Supplies', 'Housekeeping & Amenities', 'Utilities', 'Maintenance & AMC', 'Travel & Transport', 'Events & Décor'];
  const allPayables = (apiPayables || []).map(b => ({
    id: b.bill_number, vendor: b.vendor, category: b.category, amount: Number(b.amount) || 0,
    dueDate: b.due_date ? new Date(b.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '-', status: b.status, rawId: b.id
  }));
  const payablesData = allPayables.filter(b => (payableStatusFilter === 'All' || b.status === payableStatusFilter) && (b.id + b.vendor + b.category).toLowerCase().includes(payableSearch.toLowerCase()));

  const handleAddBill = async (e) => {
    e.preventDefault();
    if (!billForm.vendor || !billForm.amount) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/payables`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(billForm) });
      if (res.ok) { fetchFinanceData(true); toast.success('Bill saved'); } else throw new Error();
    } catch (err) { toast.error('Failed to save vendor bill'); }
    setIsBillModalOpen(false); setBillForm({ vendor: '', category: 'Kitchen & F&B Supplies', amount: '', dueDate: '', notes: '' });
  };

  // --- Financial Statements ---
  const revRooms = apiStatements?.revenue?.find(r => r.invoice_type === 'Guest Folio')?.total || 0;
  const revCorporate = apiStatements?.revenue?.find(r => r.invoice_type === 'Corporate Account')?.total || 0;
  const revBanquet = apiStatements?.revenue?.find(r => r.invoice_type === 'Banquet')?.total || 0;
  const revenueByDept = [
    { label: 'Rooms (Guest Folios)', value: Number(revRooms), color: '#059669' }, { label: 'Corporate & B2B', value: Number(revCorporate), color: '#f59e0b' },
    { label: 'Banquets & Events', value: Number(revBanquet), color: '#6366f1' }, { label: 'Other', value: 0, color: '#ec4899' },
  ];
  const totalRevenuePnl = revenueByDept.reduce((s, d) => s + d.value, 0);
  const pnlExpenses = (apiStatements?.expenses || []).map((e, i) => { const colors = ['#f59e0b', '#4f46e5', '#0ea5e9', '#ec4899', '#7c3aed', '#10b981']; return { label: e.category, value: Number(e.total), color: colors[i % colors.length] }; });
  if (pnlExpenses.length === 0) pnlExpenses.push({ label: 'No Expenses Logged', value: 0, color: '#ccc' });
  const totalPnlExpenses = pnlExpenses.reduce((s, e) => s + e.value, 0);
  const netProfit = totalRevenuePnl - totalPnlExpenses;

  const balanceSheet = {
    assets: [
      { label: 'Cash & Bank Balances', value: Number(apiStatements?.assets?.cash_and_bank || 0) }, { label: 'Accounts Receivable', value: Number(apiStatements?.assets?.receivable || 0) },
      { label: 'Inventory (F&B, Supplies)', value: Number(apiStatements?.assets?.inventory || 0) }, { label: 'Property & Equipment (Net)', value: Number(apiStatements?.assets?.property_and_equipment || 0) },
    ],
    liabilities: [
      { label: 'Accounts Payable', value: Number(apiStatements?.liabilities?.payable || 0) }, { label: 'GST / Tax Payable', value: Number(apiStatements?.liabilities?.taxes || 0) },
      { label: 'Guest Deposits Held', value: Number(apiStatements?.liabilities?.deposits || 0) }, { label: 'Long-term Loan', value: Number(apiStatements?.liabilities?.long_term_loan || 0) },
    ],
    equity: [{ label: "Owner's Equity & Retained Earnings", value: Number(apiStatements?.equity?.owners_equity || 0) + netProfit }],
  };
  const totalAssets = balanceSheet.assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = balanceSheet.liabilities.reduce((s, l) => s + l.value, 0);
  const totalEquity = balanceSheet.equity.reduce((s, e) => s + e.value, 0);

  const cashFlow = {
    operating: [{ label: 'Net Profit', value: netProfit }, { label: 'Change in Receivables', value: -Number(apiStatements?.assets?.receivable || 0) }, { label: 'Change in Payables', value: Number(apiStatements?.liabilities?.payable || 0) }],
    investing: [{ label: 'Property Improvements', value: Number(apiStatements?.cashFlow?.property_improvements || 0) }],
    financing: [{ label: 'Loan Repayment', value: Number(apiStatements?.cashFlow?.loan_repayment || 0) }],
  };
  const cfOperating = cashFlow.operating.reduce((s, i) => s + i.value, 0);
  const cfInvesting = cashFlow.investing.reduce((s, i) => s + i.value, 0);
  const cfFinancing = cashFlow.financing.reduce((s, i) => s + i.value, 0);
  const netCashFlow = cfOperating + cfInvesting + cfFinancing;

  // --- Budgeting ---
  const budgetByDept = (apiBudgets || []).map(b => {
    let actual = 0;
    if (b.type === 'Revenue') {
      if (b.department_name === 'Rooms') actual = (apiInvoices || []).filter(i => i.invoice_type === 'Guest Folio').reduce((s, i) => s + Number(i.total_amount), 0);
      else if (b.department_name === 'Banquets & Events') actual = (apiInvoices || []).filter(i => i.invoice_type === 'Banquet').reduce((s, i) => s + Number(i.total_amount), 0);
    } else actual = (apiExpenses || []).filter(e => e.category === b.department_name).reduce((s, e) => s + Number(e.amount), 0);
    return { dept: b.department_name, budget: Number(b.budget_amount), actual, color: '#D4A373' };
  });
  if (budgetByDept.length === 0) budgetByDept.push({ dept: 'No Budgets Set', budget: 1, actual: 0, color: '#ccc' });

  // --- Payroll ---
  const payrollByDept = (apiPayroll || []).map(p => ({ ...p, color: themeMap[p.theme]?.ring || '#6366f1' }));
  const totalHeadcount = payrollByDept.reduce((s, d) => s + (d.headcount || 0), 0);
  const totalGrossPayroll = payrollByDept.reduce((s, d) => s + (d.gross || 0), 0);
  const totalPfLiability = payrollByDept.reduce((s, d) => s + (d.pf || 0), 0);
  const totalEsiLiability = payrollByDept.reduce((s, d) => s + (d.esi || 0), 0);
  const avgCostPerEmployee = totalHeadcount > 0 ? Math.round(totalGrossPayroll / totalHeadcount) : 0;

  // --- Bank ---
  const bankAccounts = apiBankAccounts || [];
  const totalBankBalance = bankAccounts.reduce((s, a) => s + (a.balance || 0), 0);
  const handleAddTransfer = (e) => { e.preventDefault(); setIsTransferModalOpen(false); setTransferForm({ from: 'HDFC Current A/c', to: 'ICICI Savings A/c', amount: '', notes: '' }); };
  const handleAddCashCount = async (e) => {
    e.preventDefault();
    if (!cashForm.actual_amount) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/finance/cash-register`, { method: 'POST', headers: getHeaders(), body: JSON.stringify(cashForm) });
      if (res.ok) { setApiCashRegister((await res.json()).data); toast.success('Count submitted'); } else throw new Error();
    } catch (err) { toast.error('Failed to log count'); }
    setIsCashModalOpen(false); setCashForm({ actual_amount: '', notes: '' });
  };

  const navGroups = [
    { heading: 'Accounts & Finance', items: [{ key: 'overview', label: 'Financial Overview', icon: <Building2 size={15} /> }, { key: 'invoices', label: 'Invoices & Billing', icon: <FileText size={15} /> }, { key: 'expenses', label: 'Expenses & Payables', icon: <PieChart size={15} /> }, { key: 'reconciliation', label: 'Reconciliation', icon: <Link2 size={15} /> }] },
    { heading: 'Planning & Reporting', items: [{ key: 'statements', label: 'Financial Statements', icon: <Scale size={15} /> }] },
    { heading: 'Treasury & HR', items: [{ key: 'payroll', label: 'Payroll & Staff Costs', icon: <Users size={15} /> }, { key: 'bank', label: 'Bank & Deposits', icon: <Landmark size={15} /> }] },
  ];

  // KPI Groupings using dynamic Graphic renderer
  const overviewKpis = [
    { label: "Today's Revenue", value: shortInr(todaysRevenueVal), sub: "Live from API", icon: <DollarSign size={16} />, theme: 'emerald', graphicIndex: 1 },
    { label: "Pending Receivables", value: shortInr(pendingRecVal), sub: "Live from API", icon: <Clock size={16} />, theme: 'amber', graphicIndex: 2 },
    { label: "Tax Collected (GST)", value: shortInr(overviewTotalTax), sub: "Live from Invoices", icon: <FileText size={16} />, theme: 'indigo', graphicIndex: 3 },
    { label: "Cash Register", value: cashRegisterValue, sub: cashRegisterSub, icon: <Wallet size={16} />, theme: 'sky', action: () => setIsCashModalOpen(true), graphicIndex: 0, pct: cashRegisterBalanced ? 1 : 0 },
  ];

  const expenseKpis = [
    { label: 'Total Monthly Expense', value: shortInr(totalExpense), sub: `${expenseUtilizationPct}% of ${shortInr(totalExpenseBudget)} budget`, icon: <Wallet size={16} />, theme: 'rose', graphicIndex: 1 },
    { label: 'Highest Category', value: topExpenseCategory?.label || 'N/A', sub: `${shortInr(topExpenseCategory?.spent || 0)} spent`, icon: topExpenseCategory?.icon || <PieChart size={16} />, theme: 'indigo', graphicIndex: 2 },
    { label: 'Budget Utilization', value: `${expenseUtilizationPct}%`, sub: `${overBudgetCount} categor${overBudgetCount === 1 ? 'y' : 'ies'} over budget`, icon: <ScanLine size={16} />, theme: overBudgetCount > 0 ? 'orange' : 'emerald', graphicIndex: 0, pct: expenseUtilizationPct / 100 },
    { label: 'Month-on-Month', value: `${momChangePct > 0 ? '+' : ''}${momChangePct}%`, sub: `vs ${shortInr(expenseTrend[4]?.value || 0)} last month`, icon: momChangePct > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />, theme: momChangePct > 0 ? 'orange' : 'emerald', graphicIndex: 3 },
  ];

  const invoiceKpis = [
    { label: 'Total Invoiced', value: shortInr(totalInvoiced), sub: `${allInvoices.filter(i => i.amount > 0).length} invoices this month`, icon: <FileText size={16} />, theme: 'indigo', graphicIndex: 1 },
    { label: 'Outstanding', value: shortInr(totalOutstanding), sub: 'Across guest & corporate accounts', icon: <Clock size={16} />, theme: 'amber', graphicIndex: 2 },
    { label: 'Overdue', value: shortInr(overdueAmount), sub: `${overdueInvoices.length} invoice${overdueInvoices.length === 1 ? '' : 's'} past due`, icon: <AlertTriangle size={16} />, theme: 'rose', graphicIndex: 3 },
    { label: 'Credit Notes Issued', value: creditNotesCount, sub: 'This month', icon: <Undo2 size={16} />, theme: 'sky', graphicIndex: 0, pct: null },
  ];

  const payrollKpis = [
    { label: 'Total Payroll', value: shortInr(totalGrossPayroll), sub: `${totalHeadcount} staff across 6 departments`, icon: <Users size={16} />, theme: 'indigo', graphicIndex: 1 },
    { label: 'PF Liability', value: shortInr(totalPfLiability), sub: 'Employer + employee contribution', icon: <ShieldCheck size={16} />, theme: 'orange', graphicIndex: 2 },
    { label: 'ESI Liability', value: shortInr(totalEsiLiability), sub: 'Due with this cycle', icon: <FileText size={16} />, theme: 'rose', graphicIndex: 3 },
    { label: 'Avg Cost / Employee', value: shortInr(avgCostPerEmployee), sub: 'Gross, per month', icon: <UserCheck size={16} />, theme: 'sky', graphicIndex: 0, pct: null },
  ];

  const bankKpis = [
    { label: 'Total Bank Balance', value: shortInr(totalBankBalance), sub: `Across ${bankAccounts.length} accounts`, icon: <Landmark size={16} />, theme: 'sky', graphicIndex: 1 },
    { label: 'Accounts', value: bankAccounts.length, sub: 'Current, savings, escrow & payroll', icon: <Building2 size={16} />, theme: 'indigo', graphicIndex: 2 },
    { label: 'Pending Transfers', value: 0, sub: 'Awaiting settlement', icon: <ArrowRightLeft size={16} />, theme: 'orange', graphicIndex: 3 },
  ];

  const renderKpiCards = (kpiArray) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {kpiArray.map((kpi, i) => {
        const t = enhancedThemeMap[kpi.theme] || enhancedThemeMap['orange'];
        const dotColor = { sky: '#0ea5e9', rose: '#e11d48', emerald: '#10b981', violet: '#8b5cf6', orange: '#D4A373', indigo: '#4f46e5', amber: '#f59e0b' }[kpi.theme] || '#D4A373';
        
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, type: 'spring', stiffness: 200, damping: 20 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={kpi.action}
            style={{ '--kpi-glow': t.glow }}
            className={`relative rounded-[2rem] p-6 overflow-hidden group select-none flex items-center justify-between border border-zinc-200/70 bg-gradient-to-br ${t.gradient} shadow-[0_1px_2px_rgba(0,0,0,0.04),0_10px_24px_-16px_rgba(0,0,0,0.15)] transition-shadow duration-500 hover:shadow-[0_20px_45px_-18px_var(--kpi-glow)] ring-1 ${t.ring} ${kpi.action ? 'cursor-pointer' : ''}`}
          >
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none" style={{ background: t.glow }} />
            <div className="relative flex-1 min-w-0 pr-1">
              <div className="flex items-start justify-between mb-3">
                <motion.div whileHover={{ rotate: -8, scale: 1.1 }} transition={{ type: 'spring', stiffness: 400, damping: 14 }} className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${t.iconBg}`}>
                  {kpi.icon}
                </motion.div>
              </div>
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 + 0.2 }} className="text-2xl lg:text-xl xl:text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1.5">
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
  );

  return (
    <div className="min-h-[calc(100vh-6rem)] relative fd-app-bg fd-scrollbar p-6 flex flex-col lg:flex-row gap-6">
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-bold shadow-lg rounded-2xl' }} />
      <style>{`
        /* Global Template Animations */
        @keyframes fd-shimmer { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes fd-float { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(14px,-10px) scale(1.06); } }
        @keyframes fd-float-rev { 0%, 100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-12px,10px) scale(1.05); } }
        .fd-sheen { position: absolute; inset: 0; background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.4) 45%, transparent 60%); transform: translateX(-130%); transition: transform 0.85s cubic-bezier(0.22,1,0.36,1); pointer-events: none; z-index: 3; border-radius: inherit; }
        .group:hover .fd-sheen { transform: translateX(130%); }
        .fd-orb { position: absolute; border-radius: 9999px; filter: blur(46px); pointer-events: none; }
        
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

        .fd-app-bg { background: #F8F1E3 !important; }
        .fd-dealdeck-sidebar { background: #FFFFFF; box-shadow: 14px 17px 40px 4px rgba(112, 144, 176, 0.08); border: 1px solid rgba(226, 232, 240, 0.8); }
        .fd-input { width: 100%; padding: 0.75rem 1.1rem; background: #F4F7FE; border: 1px solid #E2E8F0; border-radius: 1rem; font-size: 0.875rem; font-weight: 500; outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .fd-input:focus { border-color: #D4A373; box-shadow: 0 0 0 3px rgba(212,163,115,0.2); }
        
        .fd-glass-backdrop { background: rgba(24, 24, 27, 0.4); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
        .fd-glass-modal { background: rgba(255, 255, 255, 0.98); border: 1px solid rgba(226, 232, 240, 0.8); box-shadow: 0 30px 70px -12px rgba(112, 144, 176, 0.25); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); }
      `}</style>

      {/* LEFT SIDEBAR */}
      <div className="w-full lg:w-72 shrink-0 rounded-[2rem] p-6 flex flex-col gap-6 fd-dealdeck-sidebar sticky top-[7.5rem] self-start z-30 lg:h-[calc(100vh-7.8rem)]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-xs shrink-0">
            <Landmark size={19} className="text-[#D4A373]" />
          </div>
          <div>
            <h1 className="font-serif font-black text-[25px] text-zinc-500 text-base leading-none">Finance</h1>
            <span className="text-[9px] font-bold text-[#D4A373] uppercase tracking-widest mt-1 block">Operations Hub</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 overflow-y-auto fd-sidebar-scroll pr-1">
          {navGroups.map(group => (
            <div key={group.heading}>
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2 px-2">{group.heading}</p>
              <div className="flex flex-col gap-1">
                {group.items.map(item => (
                  <button
                    key={item.key}
                    onClick={() => setActiveTab(item.key)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-left ${activeTab === item.key
                      ? 'bg-[#D4A373] text-white shadow-md shadow-[#D4A373]/30'
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

        <div className="rounded-2xl bg-gradient-to-br from-zinc-50 to-white border border-zinc-100 p-4 flex items-start gap-3 shadow-sm">
          <ShieldCheck size={18} className="text-[#D4A373] shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-zinc-900 leading-tight">Books balanced</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">No variance flagged today.</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden min-w-0">
        {/* TOP HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h2 className="text-2xl font-black text-zinc-500 tracking-tight mt-0.5">Finance &amp; Accounting Portal</h2>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
              <span className="relative flex h-1.5 w-1.5"><span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" /><span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" /></span>
              <span className="text-[9px] font-bold uppercase tracking-wider">Books Live</span>
            </div>
            <button onClick={refresh} className={`p-2.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-500 transition-all ${isLoading ? 'animate-spin' : ''}`}>
              <RefreshCw size={15} />
            </button>
            <button className="bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#D4A373] transition-colors flex items-center gap-2 shadow-sm">
              <Download size={14} /> Export
            </button>
            {(() => {
              const staffName = sessionStorage.getItem('hms_name') || 'Staff';
              const initials = staffName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'ST';
              return (
                <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="group flex items-center gap-3 bg-white pl-3 pr-4 py-1.5 rounded-2xl border border-zinc-200/60 shadow-xs hover:shadow-md hover:border-rose-200 hover:bg-rose-50 transition-all cursor-pointer" title="Sign Out">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-teal-600 group-hover:from-rose-500 group-hover:to-rose-600 text-white font-bold text-xs flex items-center justify-center shadow-xs transition-colors">{initials}</div>
                  <div className="hidden sm:block text-left leading-none pr-1">
                    <span className="text-xs font-bold text-zinc-900 group-hover:text-rose-600 transition-colors block">{staffName}</span>
                    <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-widest mt-0.5 block group-hover:text-rose-400 transition-colors">Finance Officer</span>
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
            <motion.div key={broadcast.id} initial={{ opacity: 0, y: -20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 p-[2px] shadow-lg shadow-rose-500/20 mb-4 shrink-0">
              <div className="w-full h-full relative bg-white/10 backdrop-blur-md rounded-[calc(1.5rem-2px)] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="relative shrink-0"><div className="absolute inset-0 bg-white/40 rounded-full animate-ping opacity-75" /><div className="relative w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white border border-white/40 shadow-sm backdrop-blur-lg"><Zap size={18} className="drop-shadow-md" /></div></div>
                  <div className="flex-1 text-white flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/20">{broadcast.target_dept === 'ALL' ? 'GLOBAL BROADCAST' : 'DEPARTMENT ALERT'}</span>
                      <span className="text-[10px] font-semibold text-white/80 border-l border-white/20 pl-2">From: {broadcast.sender_name}</span>
                    </div>
                    <p className="text-sm font-bold tracking-wide drop-shadow-sm leading-snug">{broadcast.message}</p>
                  </div>
                </div>
                <button onClick={() => setDismissedBroadcasts(prev => [...prev, broadcast.id])} className="shrink-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors border border-white/10"><X size={14} /></button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-96 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-xs font-medium uppercase tracking-wider">Syncing ledger entries...</p>
            </motion.div>
          ) : (
            <div className="space-y-6">

              {/* ============================================ */}
              {/* TAB: FINANCIAL OVERVIEW                       */}
              {/* ============================================ */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* KPI Cards */}
                  {renderKpiCards(overviewKpis)}

                  {/* Charts row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                      <div className="fd-sheen" />
                      <div className="fd-orb -top-14 -right-14 w-40 h-40 bg-[#D4A373]/10" style={{ animation: 'fd-float 8s ease-in-out infinite' }} />
                      <div className="relative flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#D4A373] flex items-center justify-center shadow-md"><TrendingUp size={14} className="text-white" /></div>
                          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">6-Month Revenue Projection</h3>
                        </div>
                        <span className="text-[9px] font-bold text-[#D4A373] uppercase tracking-widest bg-zinc-50 px-2.5 py-1 rounded-full border border-zinc-200">Forecast</span>
                      </div>
                      <div className="relative"><RevenueTrendLine data={revenueTrend} /></div>
                    </motion.div>

                    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                      <div className="fd-sheen" />
                      <div className="fd-orb -top-14 -left-14 w-40 h-40 bg-indigo-500/10" style={{ animation: 'fd-float-rev 9s ease-in-out infinite' }} />
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md"><CreditCard size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Payment Method Split</h3>
                      </div>
                      <div className="relative flex flex-col sm:flex-row items-center justify-around gap-6">
                        <DonutChart data={paymentSplit} />
                        <div className="grid grid-cols-1 gap-y-2.5">
                          {paymentSplit.map((d, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-2 group/legend">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-sm transition-transform duration-200 group-hover/legend:scale-125" style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}66` }} />
                              <span className="text-[11px] text-zinc-500 font-semibold truncate max-w-[110px]">{d.label}</span>
                              <span className="text-xs font-black text-zinc-900 ml-auto">₹{d.value.toLocaleString('en-IN')}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Recent Transactions Table */}
                  <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300, damping: 20 }} className="group relative overflow-hidden bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                    <div className="fd-sheen" />
                    <div className="fd-orb -bottom-14 -right-14 w-48 h-48 bg-[#D4A373]/10" style={{ animation: 'fd-float 9s ease-in-out infinite' }} />
                    <div className="relative p-5 border-b border-zinc-100 flex justify-between items-center">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><DollarSign size={16} className="text-[#D4A373]" /> Recent Transactions</h3>
                      <button onClick={() => setActiveTab('reconciliation')} className="text-xs font-bold uppercase tracking-wider text-[#D4A373] hover:text-[#B3835B] flex items-center gap-1">View Full Ledger <ArrowUpRight size={12} /></button>
                    </div>
                    <div className="relative overflow-x-auto fd-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-zinc-100 bg-zinc-50/70 text-[10px] uppercase tracking-wider text-zinc-500 font-black">
                            <th className="py-3 px-5">Ref ID</th>
                            <th className="py-3 px-5">Guest / Entity</th>
                            <th className="py-3 px-5">Method</th>
                            <th className="py-3 px-5">Date</th>
                            <th className="py-3 px-5 text-right">Amount</th>
                            <th className="py-3 px-5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                          {recentTransactions.map((txn, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="py-3 px-5 text-xs font-mono text-zinc-500">{txn.id}</td>
                              <td className="py-3 px-5 text-sm font-bold text-zinc-900">{txn.guest} <span className="block text-[10px] font-normal text-zinc-400">Room {txn.room}</span></td>
                              <td className="py-3 px-5 text-sm text-zinc-600">{txn.method}</td>
                              <td className="py-3 px-5 text-sm text-zinc-600">{txn.date}</td>
                              <td className="py-3 px-5 text-sm font-bold text-zinc-900 text-right">{txn.amount}</td>
                              <td className="py-3 px-5 text-right">
                                <span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${txn.status === 'Settled' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>
                                  {txn.status === 'Settled' ? <CheckCircle2 size={10} /> : <Clock size={10} />} {txn.status}
                                </span>
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
              {/* TAB: EXPENSE MANAGEMENT                       */}
              {/* ============================================ */}
              {activeTab === 'expenses' && (
                <motion.div key="expenses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* Hero Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 bg-gradient-to-r from-rose-600 to-pink-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <motion.div className="fd-orb w-52 h-52 bg-white/10" style={{ top: '-3.5rem', right: '-2.5rem' }} animate={{ x: [0, 18, 0], y: [0, -12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
                    <div className="relative flex items-center gap-3 text-white">
                      <motion.div animate={{ rotate: [0, -8, 8, 0], y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="hidden sm:flex w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 items-center justify-center shadow-lg text-xl">
                        💸
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">Expense &amp; Budget Engine</h2>
                        <p className="text-xs text-white/85 mt-0.5">Unified vendor bills, operational costs, and budget tracking.</p>
                      </div>
                    </div>
                    <motion.button onClick={() => setIsExpenseModalOpen(true)} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="relative bg-white text-rose-600 hover:bg-zinc-50 font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all">
                      <motion.span animate={{ rotate: [0, 90, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex"><Plus size={14} /></motion.span> Record Expense
                    </motion.button>
                  </motion.div>

                  {/* KPI Cards Row */}
                  {renderKpiCards(expenseKpis)}

                  {/* Charts row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                      <div className="fd-sheen" />
                      <div className="fd-orb -top-14 -left-14 w-40 h-40 bg-rose-500/10" style={{ animation: 'fd-float 8s ease-in-out infinite' }} />
                      <div className="relative flex items-center gap-2 mb-5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md"><PieChart size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Spend by Category</h3>
                      </div>
                      <div className="relative"><BarRankChart data={expenseCategories.map(c => ({ label: c.label, value: c.spent, color: c.color, icon: c.icon }))} /></div>
                    </motion.div>

                    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                      <div className="fd-sheen" />
                      <div className="fd-orb -top-14 -right-14 w-40 h-40 bg-indigo-500/10" style={{ animation: 'fd-float-rev 8s ease-in-out infinite' }} />
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md"><ScanLine size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Category Share</h3>
                      </div>
                      <div className="relative flex flex-col sm:flex-row items-center justify-around gap-6">
                        <DonutChart data={expenseCategories.map(c => ({ label: c.label, value: c.spent, color: c.color }))} centerLabel="Spent" />
                        <div className="grid grid-cols-1 gap-y-2 max-h-[210px] overflow-y-auto fd-scrollbar pr-1">
                          {expenseCategories.map((d, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2 group/legend">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-sm" style={{ backgroundColor: d.color }} />
                              <span className="text-[11px] text-zinc-500 font-semibold truncate max-w-[130px]">{d.label}</span>
                              <span className="text-xs font-black text-zinc-900 ml-auto">₹{d.spent.toLocaleString('en-IN')}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Expense trend */}
                  <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                    <div className="fd-sheen" />
                    <div className="fd-orb -bottom-16 -right-10 w-56 h-56 bg-rose-500/10" style={{ animation: 'fd-float 9s ease-in-out infinite' }} />
                    <div className="relative flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md"><TrendingUp size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">6-Month Expense Trend</h3>
                      </div>
                      <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">All Categories</span>
                    </div>
                    <div className="relative"><ExpenseTrendLine data={expenseTrend} /></div>
                  </motion.div>

                  {/* Budget utilization lists */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div whileHover={{ y: -2 }} className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                      <div className="fd-sheen" />
                      <h3 className="relative font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-5"><Filter size={16} className="text-rose-500" /> Budget Utilization</h3>
                      <div className="relative flex flex-col gap-4">
                        {expenseCategories.map((c, i) => {
                          const pct = Math.round((c.spent / c.budget) * 100);
                          const over = c.spent > c.budget;
                          return (
                            <div key={c.key}>
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="flex items-center gap-2 text-xs font-bold text-zinc-700"><span className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0" style={{ background: c.color }}>{c.icon}</span>{c.label}</span>
                                <span className={`text-[11px] font-black ${over ? 'text-rose-600' : 'text-zinc-500'}`}>₹{c.spent.toLocaleString('en-IN')} / ₹{c.budget.toLocaleString('en-IN')} ({pct}%)</span>
                              </div>
                              <div className="h-2 rounded-full bg-zinc-100 overflow-hidden shadow-inner"><motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }} transition={{ duration: 0.9, delay: i * 0.05, ease: 'easeOut' }} className={`h-full rounded-full ${over ? 'bg-rose-500' : pct >= 90 ? 'bg-amber-400' : 'bg-[#D4A373]'}`} /></div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>

                    <motion.div whileHover={{ y: -2 }} className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                      <div className="fd-sheen" />
                      <h3 className="relative font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-5"><Percent size={16} className="text-indigo-600" /> Budget vs Actual by Dept</h3>
                      <div className="relative flex flex-col gap-5">
                        {budgetByDept.map((d, i) => {
                          const variancePct = (((d.actual - d.budget) / d.budget) * 100).toFixed(1);
                          const over = d.actual > d.budget;
                          const maxVal = Math.max(d.budget, d.actual);
                          return (
                            <div key={i}>
                              <div className="flex items-center justify-between mb-1.5"><span className="text-xs font-bold text-zinc-700">{d.dept}</span><span className={`text-[11px] font-black ${over ? 'text-rose-600' : 'text-[#D4A373]'}`}>{over ? '+' : ''}{variancePct}% vs budget</span></div>
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2"><span className="text-[9px] font-bold uppercase text-zinc-400 w-14 shrink-0">Budget</span><div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(d.budget / maxVal) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.05 }} className="h-full rounded-full bg-zinc-300" /></div><span className="text-[10px] font-bold text-zinc-500 w-24 text-right shrink-0">₹{d.budget.toLocaleString('en-IN')}</span></div>
                                <div className="flex items-center gap-2"><span className="text-[9px] font-bold uppercase text-zinc-400 w-14 shrink-0">Actual</span><div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${(d.actual / maxVal) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.05 + 0.1 }} className={`h-full rounded-full ${over ? 'bg-rose-500' : 'bg-[#D4A373]'}`} /></div><span className="text-[10px] font-bold text-zinc-900 w-24 text-right shrink-0">₹{d.actual.toLocaleString('en-IN')}</span></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  </div>

                  {/* Ledger Tables */}
                  <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="group relative overflow-hidden bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                    <div className="fd-sheen" />
                    <div className="relative p-6 border-b border-zinc-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Receipt size={16} className="text-rose-500" /> Expense Ledger</h3>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-56"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><input value={expenseSearch} onChange={e => setExpenseSearch(e.target.value)} placeholder="Search vendor..." className="w-full py-1.5 pl-8 pr-3 rounded-lg text-xs bg-zinc-50 border border-zinc-200 focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] outline-none" /></div>
                        <select value={expenseCategoryFilter} onChange={e => setExpenseCategoryFilter(e.target.value)} className="w-full sm:w-44 py-1.5 px-3 rounded-lg text-xs bg-zinc-50 border border-zinc-200 outline-none cursor-pointer"><option value="All">All Categories</option>{expenseCategories.map(c => <option key={c.key} value={c.label}>{c.label}</option>)}</select>
                      </div>
                    </div>
                    <div className="relative overflow-x-auto fd-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-zinc-50/70 border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-500 font-black">
                            <th className="py-3 px-5">Ref ID</th><th className="py-3 px-5">Category</th><th className="py-3 px-5">Vendor</th><th className="py-3 px-5">Method</th><th className="py-3 px-5 text-right">Amount</th><th className="py-3 px-5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                          {expenseEntries.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-xs text-zinc-400 italic">No expenses match your filters.</td></tr>}
                          {expenseEntries.map((e, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="py-3 px-5 text-xs font-mono text-zinc-500">{e.id}</td>
                              <td className="py-3 px-5"><span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">{e.category}</span></td>
                              <td className="py-3 px-5 text-sm font-bold text-zinc-900">{e.vendor}</td>
                              <td className="py-3 px-5 text-xs text-zinc-600">{e.method}</td>
                              <td className="py-3 px-5 text-sm font-bold text-zinc-900 text-right">{e.amount}</td>
                              <td className="py-3 px-5 text-right"><span className="px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 border-emerald-200"><CheckCircle2 size={10} /> {e.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="group relative overflow-hidden bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                    <div className="fd-sheen" />
                    <div className="relative p-6 border-b border-zinc-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Truck size={16} className="text-indigo-600" /> Vendor Bills</h3>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-48"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><input value={payableSearch} onChange={e => setPayableSearch(e.target.value)} placeholder="Search bill..." className="w-full py-1.5 pl-8 pr-3 rounded-lg text-xs bg-zinc-50 border border-zinc-200 focus:border-[#D4A373] outline-none" /></div>
                        <select value={payableStatusFilter} onChange={e => setPayableStatusFilter(e.target.value)} className="w-full sm:w-36 py-1.5 px-3 rounded-lg text-xs bg-zinc-50 border border-zinc-200 outline-none cursor-pointer"><option value="All">All Statuses</option><option value="Scheduled">Scheduled</option><option value="Overdue">Overdue</option><option value="Paid">Paid</option></select>
                        <button onClick={() => setIsBillModalOpen(true)} className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5 shrink-0"><Plus size={12} /> Add Bill</button>
                      </div>
                    </div>
                    <div className="relative overflow-x-auto fd-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-zinc-50/70 border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-500 font-black">
                            <th className="py-3 px-5">Bill #</th><th className="py-3 px-5">Vendor</th><th className="py-3 px-5">Category</th><th className="py-3 px-5">Due Date</th><th className="py-3 px-5 text-right">Amount</th><th className="py-3 px-5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                          {payablesData.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-xs text-zinc-400 italic">No vendor bills match your filters.</td></tr>}
                          {payablesData.map((b, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="py-3 px-5 text-xs font-mono text-zinc-500">{b.id}</td><td className="py-3 px-5 text-sm font-bold text-zinc-900">{b.vendor}</td><td className="py-3 px-5"><span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">{b.category}</span></td><td className="py-3 px-5 text-xs text-zinc-600">{b.dueDate}</td><td className="py-3 px-5 text-sm font-bold text-zinc-900 text-right">₹{b.amount.toLocaleString('en-IN')}</td>
                              <td className="py-3 px-5 text-right"><span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${b.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : b.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-600 border-amber-200'}`}>{b.status === 'Paid' ? <CheckCircle2 size={10} /> : b.status === 'Overdue' ? <AlertTriangle size={10} /> : <Clock size={10} />} {b.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </motion.div>
              )}


              {/* ============================================ */}
              {/* TAB: INVOICES & BILLING                       */}
              {/* ============================================ */}
              {activeTab === 'invoices' && (
                <motion.div key="invoices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* Hero Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 bg-gradient-to-r from-indigo-600 to-blue-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <motion.div className="fd-orb w-52 h-52 bg-white/10" style={{ top: '-3.5rem', right: '-2.5rem' }} animate={{ x: [0, 18, 0], y: [0, -12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
                    <div className="relative flex items-center gap-3 text-white">
                      <motion.div animate={{ rotate: [0, -8, 8, 0], y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="hidden sm:flex w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 items-center justify-center shadow-lg text-xl">
                        📄
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">Billing & Invoicing Engine</h2>
                        <p className="text-xs text-white/85 mt-0.5">Guest folios, corporate accounts, and automated GST tracking.</p>
                      </div>
                    </div>
                    <motion.button onClick={() => setIsInvoiceModalOpen(true)} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="relative bg-white text-indigo-600 hover:bg-zinc-50 font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all">
                      <motion.span animate={{ rotate: [0, 90, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex"><Plus size={14} /></motion.span> Create Invoice
                    </motion.button>
                  </motion.div>

                  {/* KPI Cards */}
                  {renderKpiCards(invoiceKpis)}

                  {/* GST Breakup */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {gstBreakup.map((g, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="group relative overflow-hidden bg-white rounded-[1.5rem] p-5 border border-zinc-200 shadow-sm" style={{ boxShadow: '0 8px 30px rgba(0,0,0,0.02)' }}>
                        <div className="fd-sheen" />
                        <p className="relative text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 truncate">{g.label}</p>
                        <p className="relative text-2xl font-black text-zinc-900 mb-1 truncate">{g.value}</p>
                        <p className="relative text-[10px] text-zinc-400 truncate">{g.sub}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }} className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                      <div className="fd-sheen" />
                      <div className="fd-orb -top-14 -left-14 w-40 h-40 bg-rose-500/10" style={{ animation: 'fd-float 8s ease-in-out infinite' }} />
                      <div className="relative flex items-center gap-2 mb-5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md"><CalendarClock size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Receivables Aging</h3>
                      </div>
                      <div className="relative"><BarRankChart data={agingBuckets} /></div>
                    </motion.div>
                    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }} className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                      <div className="fd-sheen" />
                      <div className="fd-orb -top-14 -right-14 w-40 h-40 bg-[#D4A373]/10" style={{ animation: 'fd-float-rev 9s ease-in-out infinite' }} />
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#D4A373] to-[#D4A373] flex items-center justify-center shadow-md"><PieChart size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Invoice Status Split</h3>
                      </div>
                      <div className="relative flex flex-col sm:flex-row items-center justify-around gap-6">
                        <DonutChart data={invoiceStatusSplit} centerLabel="Invoiced" />
                        <div className="grid grid-cols-1 gap-y-2.5">
                          {invoiceStatusSplit.map((d, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-2 group/legend">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-sm" style={{ backgroundColor: d.color }} />
                              <span className="text-[11px] text-zinc-500 font-semibold truncate max-w-[110px]">{d.label}</span>
                              <span className="text-xs font-black text-zinc-900 ml-auto">₹{d.value.toLocaleString('en-IN')}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="group relative overflow-hidden bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                    <div className="fd-sheen" />
                    <div className="relative p-6 border-b border-zinc-100 flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><FileText size={16} className="text-indigo-600" /> All Invoices & Credit Notes</h3>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-56"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" /><input value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)} placeholder="Search bill to..." className="w-full py-1.5 pl-8 pr-3 rounded-lg text-xs bg-zinc-50 border border-zinc-200 outline-none" /></div>
                        <select value={invoiceStatusFilter} onChange={e => setInvoiceStatusFilter(e.target.value)} className="w-full sm:w-36 py-1.5 px-3 rounded-lg text-xs bg-zinc-50 border border-zinc-200 outline-none cursor-pointer"><option value="All">All Statuses</option><option value="Paid">Paid</option><option value="Overdue">Overdue</option><option value="Draft">Draft</option></select>
                      </div>
                    </div>
                    <div className="relative overflow-x-auto fd-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-zinc-50/70 border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-500 font-black">
                            <th className="py-3 px-5">Invoice #</th><th className="py-3 px-5">Bill To</th><th className="py-3 px-5">Type</th><th className="py-3 px-5">Due Date</th><th className="py-3 px-5 text-right">Amount</th><th className="py-3 px-5 text-right">Status</th><th className="py-3 px-5 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                          {invoicesData.length === 0 && <tr><td colSpan={7} className="p-8 text-center text-xs text-zinc-400 italic">No invoices match.</td></tr>}
                          {invoicesData.map((inv, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="py-3 px-5 text-xs font-mono text-zinc-500">{inv.id}</td><td className="py-3 px-5 text-sm font-bold text-zinc-900">{inv.billTo}</td><td className="py-3 px-5"><span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200">{inv.type}</span></td><td className="py-3 px-5 text-xs text-zinc-600">{inv.dueDate}</td><td className={`py-3 px-5 text-sm font-bold text-right ${inv.amount < 0 ? 'text-rose-500' : 'text-zinc-900'}`}>{inv.amount < 0 ? '-' : ''}₹{Math.abs(inv.amount).toLocaleString('en-IN')}</td>
                              <td className="py-3 px-5 text-right"><span className={`px-2.5 py-1 rounded-md text-[9px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                  : inv.status === 'Partial' ? 'bg-amber-50 text-amber-600 border-amber-200'
                                    : inv.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border-rose-200'
                                      : inv.status === 'Issued' ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                        : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                                  }`}>
                                  {inv.status === 'Paid' ? <CheckCircle2 size={10} /> : inv.status === 'Overdue' ? <AlertTriangle size={10} /> : <Clock size={10} />} {inv.status}
                                </span></td>
                              <td className="py-3 px-5 text-right"><button className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 hover:bg-indigo-50 px-2 py-1 rounded-md transition-colors">Download</button></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </motion.div>
                </motion.div>
              )}



              {/* ============================================ */}
              {/* TAB: FINANCIAL STATEMENTS                     */}
              {/* ============================================ */}
              {activeTab === 'statements' && (
                <motion.div key="statements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* Hero Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 bg-gradient-to-r from-violet-600 to-purple-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <motion.div className="fd-orb w-52 h-52 bg-white/10" style={{ top: '-3.5rem', right: '-2.5rem' }} animate={{ x: [0, 18, 0], y: [0, -12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
                    <div className="relative flex items-center gap-3 text-white">
                      <motion.div animate={{ rotate: [0, -8, 8, 0], y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="hidden sm:flex w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 items-center justify-center shadow-lg text-xl">
                        ⚖️
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">Core Financial Statements</h2>
                        <p className="text-xs text-white/85 mt-0.5">Automated P&L, Balance Sheet, and Trial Balances.</p>
                      </div>
                    </div>
                  </motion.div>

                  <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-zinc-200/60 w-fit shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
                    {[
                      { key: 'pnl', label: 'Profit & Loss', icon: <TrendingUp size={13} /> },
                      { key: 'balance', label: 'Balance Sheet', icon: <Scale size={13} /> },
                      { key: 'cashflow', label: 'Cash Flow', icon: <ArrowRightLeft size={13} /> },
                      { key: 'ledger', label: 'General Ledger', icon: <Receipt size={13} /> },
                    ].map(v => (
                      <button key={v.key} onClick={() => setStatementView(v.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${statementView === v.key ? 'bg-violet-600 text-white shadow-md shadow-violet-600/20' : 'text-zinc-500 hover:bg-zinc-50'}`}>
                        {v.icon} {v.label}
                      </button>
                    ))}
                  </div>

                  {statementView === 'pnl' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <motion.div whileHover={{ y: -4 }} className="group relative overflow-hidden bg-white rounded-[1.5rem] p-6 border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"><div className="fd-sheen" /><p className="relative text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 truncate">Total Revenue</p><p className="relative text-3xl font-black text-emerald-600 truncate">₹{totalRevenuePnl.toLocaleString('en-IN')}</p></motion.div>
                        <motion.div whileHover={{ y: -4 }} className="group relative overflow-hidden bg-white rounded-[1.5rem] p-6 border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"><div className="fd-sheen" /><p className="relative text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 truncate">Total Expenses</p><p className="relative text-3xl font-black text-rose-600 truncate">₹{totalPnlExpenses.toLocaleString('en-IN')}</p></motion.div>
                        <motion.div whileHover={{ y: -4 }} className="group relative overflow-hidden bg-white rounded-[1.5rem] p-6 border border-zinc-200 shadow-[0_8px_30px_rgb(0,0,0,0.03)]"><div className="fd-sheen" /><p className="relative text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 truncate">Net Profit</p><p className="relative text-3xl font-black text-violet-600 truncate">₹{netProfit.toLocaleString('en-IN')} <span className="text-xs font-bold text-violet-400">({((netProfit / totalRevenuePnl) * 100).toFixed(1)}% margin)</span></p></motion.div>
                      </div>

                      <div className="grid grid-cols-1 gap-6">
                        <motion.div whileHover={{ y: -4 }} className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                          <div className="fd-sheen" />
                          <div className="relative flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center shadow-md"><BedDouble size={14} className="text-white" /></div>
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Revenue by Department</h3>
                          </div>
                          <div className="relative flex flex-col sm:flex-row items-center justify-around gap-6">
                            <DonutChart data={revenueByDept} centerLabel="Revenue" />
                            <div className="grid grid-cols-1 gap-y-2.5">
                              {revenueByDept.map((d, i) => (
                                <div key={i} className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: d.color }} /><span className="text-xs text-zinc-500 font-semibold">{d.label}</span><span className="text-xs font-black text-zinc-900 ml-auto">₹{d.value.toLocaleString('en-IN')}</span></div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {statementView === 'balance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <motion.div whileHover={{ y: -2 }} className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                        <div className="fd-sheen" />
                        <h3 className="relative font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-4"><Landmark size={16} className="text-[#D4A373]" /> Assets</h3>
                        <div className="relative divide-y divide-zinc-100">
                          {balanceSheet.assets.map((a, i) => (
                            <div key={i} className="flex items-center justify-between py-3"><span className="text-sm text-zinc-600 break-words mr-2">{a.label}</span><span className="text-sm font-bold text-zinc-900 whitespace-nowrap">₹{a.value.toLocaleString('en-IN')}</span></div>
                          ))}
                        </div>
                        <div className="relative flex items-center justify-between pt-4 mt-2 border-t border-zinc-200"><span className="text-sm font-black uppercase tracking-wider text-zinc-900">Total Assets</span><span className="text-lg font-black text-[#D4A373]">₹{totalAssets.toLocaleString('en-IN')}</span></div>
                      </motion.div>

                      <motion.div whileHover={{ y: -2 }} className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                        <div className="fd-sheen" />
                        <h3 className="relative font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-4"><Scale size={16} className="text-violet-600" /> Liabilities &amp; Equity</h3>
                        <div className="relative">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Liabilities</p>
                          <div className="divide-y divide-zinc-100 mb-3">
                            {balanceSheet.liabilities.map((l, i) => (
                              <div key={i} className="flex items-center justify-between py-2"><span className="text-sm text-zinc-600 break-words mr-2">{l.label}</span><span className="text-sm font-bold text-zinc-900 whitespace-nowrap">₹{l.value.toLocaleString('en-IN')}</span></div>
                            ))}
                          </div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Equity</p>
                          <div className="divide-y divide-zinc-100">
                            {balanceSheet.equity.map((e, i) => (
                              <div key={i} className="flex items-center justify-between py-2"><span className="text-sm text-zinc-600 break-words mr-2">{e.label}</span><span className="text-sm font-bold text-zinc-900 whitespace-nowrap">₹{e.value.toLocaleString('en-IN')}</span></div>
                            ))}
                          </div>
                          <div className="flex items-center justify-between pt-4 mt-2 border-t border-zinc-200"><span className="text-sm font-black uppercase tracking-wider text-zinc-900">Total Liabilities + Equity</span><span className="text-lg font-black text-violet-600">₹{(totalLiabilities + totalEquity).toLocaleString('en-IN')}</span></div>
                          <div className={`mt-4 flex items-center gap-2 text-[11px] font-bold px-3 py-2 rounded-xl ${totalAssets === (totalLiabilities + totalEquity) ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}><CheckCircle2 size={14} /> Books balance: Assets = Liabilities + Equity</div>
                        </div>
                      </motion.div>
                    </div>
                  )}

                  {statementView === 'cashflow' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                        {[
                          { label: 'Operating', value: cfOperating, theme: '#D4A373' }, { label: 'Investing', value: cfInvesting, theme: 'rose' },
                          { label: 'Financing', value: cfFinancing, theme: '#D4A373' }, { label: 'Net Cash Flow', value: netCashFlow, theme: 'indigo' },
                        ].map((c, i) => {
                          const t = themeMap[c.theme] || themeMap['#D4A373'];
                          return (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="group relative overflow-hidden bg-white rounded-[1.5rem] p-5 border border-zinc-200 shadow-sm"><div className="fd-sheen" /><p className="relative text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 break-words">{c.label}</p><p className={`relative text-2xl font-black break-words ${c.value < 0 ? 'text-rose-600' : 'text-zinc-900'}`}>{c.value < 0 ? '-' : ''}₹{Math.abs(c.value).toLocaleString('en-IN')}</p></motion.div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[
                          { label: 'Operating Activities', items: cashFlow.operating, subtotal: cfOperating, icon: <RefreshCw size={14} /> },
                          { label: 'Investing Activities', items: cashFlow.investing, subtotal: cfInvesting, icon: <Building2 size={14} /> },
                          { label: 'Financing Activities', items: cashFlow.financing, subtotal: cfFinancing, icon: <Landmark size={14} /> },
                        ].map((section, si) => (
                          <motion.div key={si} whileHover={{ y: -2 }} className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                            <div className="fd-sheen" />
                            <h3 className="relative font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-4">{section.icon} {section.label}</h3>
                            <div className="relative divide-y divide-zinc-100">
                              {section.items.map((it, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5"><span className="text-xs text-zinc-600 break-words mr-2">{it.label}</span><span className={`text-xs font-bold whitespace-nowrap ${it.value < 0 ? 'text-rose-500' : 'text-zinc-900'}`}>{it.value < 0 ? '-' : '+'}₹{Math.abs(it.value).toLocaleString('en-IN')}</span></div>
                              ))}
                            </div>
                            <div className="relative flex items-center justify-between pt-3 mt-2 border-t border-zinc-200"><span className="text-xs font-black uppercase tracking-wider text-zinc-900">Subtotal</span><span className={`text-sm font-black ${section.subtotal < 0 ? 'text-rose-600' : 'text-[#D4A373]'}`}>{section.subtotal < 0 ? '-' : ''}₹{Math.abs(section.subtotal).toLocaleString('en-IN')}</span></div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}

                  {statementView === 'ledger' && (
                    <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="group relative overflow-hidden bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                      <div className="fd-sheen" />
                      <div className="relative p-6 border-b border-zinc-100 flex justify-between items-center">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Receipt size={16} className="text-[#D4A373]" /> General Ledger</h3>
                      </div>
                      <div className="relative overflow-x-auto fd-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                          <thead>
                            <tr className="bg-zinc-50/70 border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-500 font-black">
                              <th className="py-3 px-5">Voucher</th><th className="py-3 px-5">Account Head</th><th className="py-3 px-5">Date</th><th className="py-3 px-5 text-right">Debit</th><th className="py-3 px-5 text-right">Credit</th><th className="py-3 px-5 text-right">Balance</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-50">
                            {ledgerEntries.map((l, idx) => (
                              <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                                <td className="py-3 px-5 text-xs font-mono text-zinc-500">{l.voucher}</td><td className="py-3 px-5 text-sm font-bold text-zinc-900">{l.account}</td><td className="py-3 px-5 text-sm text-zinc-600">{l.date}</td><td className="py-3 px-5 text-sm font-bold text-rose-500 text-right">{l.debit}</td><td className="py-3 px-5 text-sm font-bold text-emerald-500 text-right">{l.credit}</td><td className="py-3 px-5 text-sm font-black text-zinc-900 text-right">{l.balance}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )}


              {/* ============================================ */}
              {/* TAB: PAYROLL & STAFF COSTS                    */}
              {/* ============================================ */}
              {activeTab === 'payroll' && (
                <motion.div key="payroll" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* Hero Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 bg-gradient-to-r from-amber-500 to-orange-500 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <motion.div className="fd-orb w-52 h-52 bg-white/10" style={{ top: '-3.5rem', right: '-2.5rem' }} animate={{ x: [0, 18, 0], y: [0, -12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
                    <div className="relative flex items-center gap-3 text-white">
                      <motion.div animate={{ rotate: [0, -8, 8, 0], y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="hidden sm:flex w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 items-center justify-center shadow-lg text-xl">
                        🧑‍💼
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">Payroll & Labor Costs</h2>
                        <p className="text-xs text-white/85 mt-0.5">Salary disbursements, PF/ESI tracking, and headcount analytics.</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* KPI Cards */}
                  {renderKpiCards(payrollKpis)}

                  <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 350, damping: 22 }} className="group relative overflow-hidden bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                    <div className="fd-sheen" />
                    <div className="relative flex items-center gap-2 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-indigo-500 flex items-center justify-center shadow-md"><Users size={14} className="text-white" /></div>
                      <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Labor Cost by Department</h3>
                    </div>
                    <div className="relative"><BarRankChart data={payrollByDept.map(d => ({ label: d.label, value: d.gross, color: d.color, icon: <Users size={13} /> }))} /></div>
                  </motion.div>

                  <motion.div whileHover={{ y: -2 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="group relative overflow-hidden bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200">
                    <div className="fd-sheen" />
                    <div className="relative p-6 border-b border-zinc-100 flex justify-between items-center">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Users size={16} className="text-indigo-600" /> Payroll by Department</h3>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ties into Admin Staff Hub</span>
                    </div>
                    <div className="relative overflow-x-auto fd-scrollbar">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="bg-zinc-50/70 border-b border-zinc-100 text-[10px] uppercase tracking-wider text-zinc-500 font-black">
                            <th className="py-3 px-5">Department</th><th className="py-3 px-5 text-right">Headcount</th><th className="py-3 px-5 text-right">Gross Salary</th><th className="py-3 px-5 text-right">PF</th><th className="py-3 px-5 text-right">ESI</th><th className="py-3 px-5 text-right">Net Payable</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-50">
                          {payrollByDept.map((d, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="py-3 px-5 text-sm font-bold text-zinc-900"><span className="inline-flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full shadow-sm shrink-0" style={{ background: d.color }} /> {d.label}</span></td>
                              <td className="py-3 px-5 text-sm text-zinc-600 text-right">{d.headcount}</td>
                              <td className="py-3 px-5 text-sm font-bold text-zinc-900 text-right">₹{d.gross.toLocaleString('en-IN')}</td>
                              <td className="py-3 px-5 text-sm text-zinc-600 text-right">₹{d.pf.toLocaleString('en-IN')}</td>
                              <td className="py-3 px-5 text-sm text-zinc-600 text-right">₹{d.esi.toLocaleString('en-IN')}</td>
                              <td className="py-3 px-5 text-sm font-black text-indigo-600 text-right">₹{(d.gross - d.pf - d.esi).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-zinc-200">
                            <td className="py-3 px-5 text-xs font-black uppercase text-zinc-900">Total</td>
                            <td className="py-3 px-5 text-sm font-black text-zinc-900 text-right">{totalHeadcount}</td>
                            <td className="py-3 px-5 text-sm font-black text-zinc-900 text-right">₹{totalGrossPayroll.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-5 text-sm font-black text-zinc-900 text-right">₹{totalPfLiability.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-5 text-sm font-black text-zinc-900 text-right">₹{totalEsiLiability.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-5 text-sm font-black text-indigo-600 text-right">₹{(totalGrossPayroll - totalPfLiability - totalEsiLiability).toLocaleString('en-IN')}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </motion.div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: BANK ACCOUNTS                            */}
              {/* ============================================ */}
              {activeTab === 'bank' && (
                <motion.div key="bank" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  {/* Hero Banner */}
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                    className="relative overflow-hidden rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 bg-gradient-to-r from-sky-500 to-blue-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <motion.div className="fd-orb w-52 h-52 bg-white/10" style={{ top: '-3.5rem', right: '-2.5rem' }} animate={{ x: [0, 18, 0], y: [0, -12, 0] }} transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }} />
                    <div className="relative flex items-center gap-3 text-white">
                      <motion.div animate={{ rotate: [0, -8, 8, 0], y: [0, -3, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }} className="hidden sm:flex w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md border border-white/20 items-center justify-center shadow-lg text-xl">
                        🏦
                      </motion.div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight flex items-center gap-2">Treasury & Bank Accounts</h2>
                        <p className="text-xs text-white/85 mt-0.5">Manage bank balances, transfer funds, and monitor liquidity.</p>
                      </div>
                    </div>
                    <motion.button onClick={() => setIsTransferModalOpen(true)} whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="relative bg-white text-sky-600 hover:bg-zinc-50 font-bold text-xs px-5 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition-all">
                      <motion.span animate={{ rotate: [0, 90, 0] }} transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="inline-flex"><ArrowRightLeft size={14} /></motion.span> New Transfer
                    </motion.button>
                  </motion.div>

                  {/* KPI Cards */}
                  {renderKpiCards(bankKpis)}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {bankAccounts.map((acc, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} whileHover={{ y: -5, scale: 1.015 }}
                        className="relative overflow-hidden rounded-[1.75rem] p-5 text-white shadow-[0_8px_30px_rgb(0,0,0,0.08)]"
                        style={{ background: `linear-gradient(135deg, ${acc.color}, ${acc.color}cc)` }}>
                        <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                        <div className="relative flex items-center justify-between mb-6">
                          <Landmark size={20} className="opacity-90" />
                          <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">{acc.type}</span>
                        </div>
                        <p className="relative text-xl lg:text-2xl font-black tracking-tight mb-1 truncate">₹{acc.balance.toLocaleString('en-IN')}</p>
                        <p className="relative text-xs font-semibold opacity-80 break-words">{acc.name}</p>
                        <p className="relative text-[10px] font-mono opacity-60 mt-0.5 truncate">{acc.number}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* =============================================
          MODAL SYSTEM
          ============================================= */}
      
      {/* New Ledger Entry Modal */}
      <AnimatePresence>
        {isEntryModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-55 flex items-center justify-center fd-glass-backdrop p-4"
            onClick={() => setIsEntryModalOpen(false)}
          >
            <motion.div
              variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md fd-glass-modal rounded-3xl p-7 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 text-[#D4A373] flex items-center justify-center">
                    <Receipt size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-zinc-900">New Ledger Entry</h2>
                    <p className="text-xs text-zinc-500">Post a manual journal voucher</p>
                  </div>
                </div>
                <button onClick={() => setIsEntryModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddEntry} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Account Head</label>
                  <input
                    required
                    placeholder="e.g. Room Revenue, Bank — HDFC"
                    value={entryForm.account}
                    onChange={e => setEntryForm({ ...entryForm, account: e.target.value })}
                    className="fd-input bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Entry Type</label>
                    <select
                      value={entryForm.type}
                      onChange={e => setEntryForm({ ...entryForm, type: e.target.value })}
                      className="fd-input bg-white appearance-none cursor-pointer"
                    >
                      <option value="Debit">Debit</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Amount (₹)</label>
                    <input
                      required
                      type="number"
                      placeholder="0.00"
                      value={entryForm.amount}
                      onChange={e => setEntryForm({ ...entryForm, amount: e.target.value })}
                      className="fd-input bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Narration</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the reason for this entry..."
                    value={entryForm.narration}
                    onChange={e => setEntryForm({ ...entryForm, narration: e.target.value })}
                    className="fd-input resize-none bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#D4A373] to-[#D4A373] hover:from-[#B38355] hover:to-[#B38355] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-[#D4A373]/20 flex items-center justify-center gap-2 mt-4"
                >
                  <Receipt size={16} /> Post Entry to Ledger
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {isExpenseModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-55 flex items-center justify-center fd-glass-backdrop p-4"
            onClick={() => setIsExpenseModalOpen(false)}
          >
            <motion.div
              variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md fd-glass-modal rounded-3xl p-7 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-zinc-900">Record Expense</h2>
                    <p className="text-xs text-zinc-500">Log a cost against an operational category</p>
                  </div>
                </div>
                <button onClick={() => setIsExpenseModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Category</label>
                  <select
                    value={expenseForm.category}
                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                    className="fd-input bg-white appearance-none cursor-pointer"
                  >
                    {expenseCategories.map(c => <option key={c.key} value={c.label}>{c.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Vendor / Description</label>
                  <input
                    required
                    placeholder="e.g. Metro Cash & Carry"
                    value={expenseForm.vendor}
                    onChange={e => setExpenseForm({ ...expenseForm, vendor: e.target.value })}
                    className="fd-input bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Amount (₹)</label>
                    <input
                      required
                      type="number"
                      placeholder="0.00"
                      value={expenseForm.amount}
                      onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                      className="fd-input bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Payment Method</label>
                    <select
                      value={expenseForm.method}
                      onChange={e => setExpenseForm({ ...expenseForm, method: e.target.value })}
                      className="fd-input bg-white appearance-none cursor-pointer"
                    >
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="Credit Card">Credit Card</option>
                      <option value="Cash">Cash</option>
                      <option value="UPI">UPI</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Optional notes for this expense..."
                    value={expenseForm.notes}
                    onChange={e => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                    className="fd-input resize-none bg-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  <Wallet size={16} /> Save Expense
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Invoice Modal */}
      <AnimatePresence>
        {isInvoiceModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-55 flex items-center justify-center fd-glass-backdrop p-4"
            onClick={() => setIsInvoiceModalOpen(false)}
          >
            <motion.div
              variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md fd-glass-modal rounded-3xl p-7 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 text-[#D4A373] flex items-center justify-center">
                    <FileText size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-zinc-900">Create Invoice</h2>
                    <p className="text-xs text-zinc-500">Guest folio, corporate invoice or credit note</p>
                  </div>
                </div>
                <button onClick={() => setIsInvoiceModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddInvoice} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Bill To</label>
                  <input
                    required
                    placeholder="e.g. Guest name or corporate account"
                    value={invoiceForm.billTo}
                    onChange={e => setInvoiceForm({ ...invoiceForm, billTo: e.target.value })}
                    className="fd-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Type</label>
                    <select
                      value={invoiceForm.type}
                      onChange={e => setInvoiceForm({ ...invoiceForm, type: e.target.value })}
                      className="fd-input bg-white appearance-none cursor-pointer"
                    >
                      <option value="Guest Folio">Guest Folio</option>
                      <option value="Corporate Account">Corporate Account</option>
                      <option value="Banquet Invoice">Banquet Invoice</option>
                      <option value="Credit Note">Credit Note</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Amount (₹)</label>
                    <input
                      required
                      type="number"
                      placeholder="0"
                      value={invoiceForm.amount}
                      onChange={e => setInvoiceForm({ ...invoiceForm, amount: e.target.value })}
                      className="fd-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Due Date</label>
                  <input
                    type="date"
                    value={invoiceForm.dueDate}
                    onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                    className="fd-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Optional notes for this invoice..."
                    value={invoiceForm.notes}
                    onChange={e => setInvoiceForm({ ...invoiceForm, notes: e.target.value })}
                    className="fd-input resize-none bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#D4A373] to-[#D4A373] hover:from-[#B38355] hover:to-[#B38355] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-[#D4A373]/20 flex items-center justify-center gap-2 mt-4"
                >
                  <FileText size={16} /> Create Invoice
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Vendor Bill Modal */}
      <AnimatePresence>
        {isBillModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-55 flex items-center justify-center fd-glass-backdrop p-4"
            onClick={() => setIsBillModalOpen(false)}
          >
            <motion.div
              variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md fd-glass-modal rounded-3xl p-7 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Truck size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-zinc-900">Add Vendor Bill</h2>
                    <p className="text-xs text-zinc-500">Record a new supplier invoice</p>
                  </div>
                </div>
                <button onClick={() => setIsBillModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddBill} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Vendor Name</label>
                  <input
                    required
                    placeholder="e.g. Metro Cash & Carry"
                    value={billForm.vendor}
                    onChange={e => setBillForm({ ...billForm, vendor: e.target.value })}
                    className="fd-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Category</label>
                  <select
                    value={billForm.category}
                    onChange={e => setBillForm({ ...billForm, category: e.target.value })}
                    className="fd-input bg-white appearance-none cursor-pointer"
                  >
                    {vendorCategories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Amount (₹)</label>
                    <input
                      required
                      type="number"
                      placeholder="0"
                      value={billForm.amount}
                      onChange={e => setBillForm({ ...billForm, amount: e.target.value })}
                      className="fd-input"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Due Date</label>
                    <input
                      type="date"
                      value={billForm.dueDate}
                      onChange={e => setBillForm({ ...billForm, dueDate: e.target.value })}
                      className="fd-input"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Optional notes for this bill..."
                    value={billForm.notes}
                    onChange={e => setBillForm({ ...billForm, notes: e.target.value })}
                    className="fd-input resize-none bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  <Truck size={16} /> Save Vendor Bill
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Bank Transfer Modal */}
      <AnimatePresence>
        {isTransferModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.25 } }} exit={{ opacity: 0, transition: { duration: 0.2 } }}
            className="fixed inset-0 z-55 flex items-center justify-center fd-glass-backdrop p-4"
            onClick={() => setIsTransferModalOpen(false)}
          >
            <motion.div
              variants={modalVariants} initial="hidden" animate="visible" exit="exit"
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md fd-glass-modal rounded-3xl p-7 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center">
                    <ArrowRightLeft size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-bold text-zinc-900">New Transfer</h2>
                    <p className="text-xs text-zinc-500">Move funds between bank accounts</p>
                  </div>
                </div>
                <button onClick={() => setIsTransferModalOpen(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all"><X size={20} /></button>
              </div>

              <form onSubmit={handleAddTransfer} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">From Account</label>
                    <select
                      value={transferForm.from}
                      onChange={e => setTransferForm({ ...transferForm, from: e.target.value })}
                      className="fd-input bg-white appearance-none cursor-pointer"
                    >
                      {bankAccounts.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">To Account</label>
                    <select
                      value={transferForm.to}
                      onChange={e => setTransferForm({ ...transferForm, to: e.target.value })}
                      className="fd-input bg-white appearance-none cursor-pointer"
                    >
                      {bankAccounts.map(a => <option key={a.name} value={a.name}>{a.name}</option>)}
                    </select>
                  </div>
                </div>
                {transferForm.from === transferForm.to && (
                  <p className="text-[11px] font-semibold text-rose-500 flex items-center gap-1"><AlertTriangle size={12} /> From and To accounts must be different.</p>
                )}
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Amount (₹)</label>
                  <input
                    required
                    type="number"
                    placeholder="0"
                    value={transferForm.amount}
                    onChange={e => setTransferForm({ ...transferForm, amount: e.target.value })}
                    className="fd-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Optional notes for this transfer..."
                    value={transferForm.notes}
                    onChange={e => setTransferForm({ ...transferForm, notes: e.target.value })}
                    className="fd-input resize-none bg-white"
                  />
                </div>
                <button
                  type="submit"
                  disabled={transferForm.from === transferForm.to}
                  className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  <ArrowRightLeft size={16} /> Confirm Transfer
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
        
        {/* Cash Count Modal */}
        {isCashModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-[#fcfcfc] rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200/60"
            >
              <div className="bg-gradient-to-br from-sky-50 to-white px-6 py-5 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg shadow-sky-500/20 text-white">
                    <Wallet size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-zinc-900 tracking-tight leading-none">Count Cash Register</h2>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mt-1">Reconcile physical cash</p>
                  </div>
                </div>
                <button onClick={() => setIsCashModalOpen(false)} className="w-8 h-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all shadow-sm">
                  <X size={14} strokeWidth={3} />
                </button>
              </div>

              <form onSubmit={handleAddCashCount} className="p-6 flex flex-col gap-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Actual Cash in Drawer (₹)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="e.g. 15000"
                    value={cashForm.actual_amount}
                    onChange={e => setCashForm({ ...cashForm, actual_amount: e.target.value })}
                    className="fd-input"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-zinc-400 tracking-wider mb-2">Notes</label>
                  <textarea
                    rows={3}
                    placeholder="Optional notes (e.g. why it's short)..."
                    value={cashForm.notes}
                    onChange={e => setCashForm({ ...cashForm, notes: e.target.value })}
                    className="fd-input resize-none bg-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 mt-4"
                >
                  <CheckCircle2 size={16} /> Submit Count
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