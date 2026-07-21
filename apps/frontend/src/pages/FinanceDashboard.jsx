import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, FileText, CreditCard, ArrowUpRight, Download,
  CheckCircle2, Clock, Building2, RefreshCw, TrendingUp, Landmark, Receipt,
  Wallet, ShieldCheck, Search, Plus, X, Loader2, AlertTriangle, Link2, ScanLine,
  PieChart, Plane, UtensilsCrossed, Sofa, Car, Sparkles, ChefHat, PartyPopper,
  BedDouble, Filter, TrendingDown, Printer, Truck, CalendarClock, Scale,
  Target, Percent, Users, UserCheck, LockKeyhole, Undo2, History, ShieldAlert,
  ArrowRightLeft, FileBarChart2, FileSpreadsheet, FileDown
} from 'lucide-react';

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
        <text x={cx} y={cy - 6} textAnchor="middle" className="fill-zinc-900" style={{ fontSize: '20px', fontWeight: 900 }}>₹{(total / 1000).toFixed(0)}k</text>
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
            className="absolute pointer-events-none px-2.5 py-1.5 rounded-lg bg-zinc-900 text-white text-[10px] font-bold shadow-lg shadow-emerald-500/20 whitespace-nowrap"
            style={{ left: `${(active.x / width) * 100}%`, top: `${(active.y / height) * 100}%`, transform: 'translate(-50%, -140%)' }}
          >
            {active.label}: <span className="text-emerald-300">₹{active.value.toLocaleString('en-IN')}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-1 px-1">
        {data.map((t, i) => (
          <span key={i} onMouseEnter={() => setHoverIdx(i)} onMouseLeave={() => setHoverIdx(null)}
            className={`text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all duration-200 ${hoverIdx === i ? 'text-emerald-600' : (t.isToday ? 'text-orange-500 animate-pulse font-extrabold' : 'text-zinc-400')
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
            className={`text-[9px] font-black uppercase tracking-wide cursor-pointer transition-all duration-200 ${hoverIdx === i ? 'text-rose-600' : (t.isToday ? 'text-orange-500 animate-pulse font-extrabold' : 'text-zinc-400')
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
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ background: d.color }}>
            {d.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-zinc-600 truncate">{d.label}</span>
              <span className="text-[11px] font-black text-zinc-900 shrink-0 ml-2">₹{d.value.toLocaleString('en-IN')}</span>
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
// MAIN COMPONENT
// =============================================
export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);
  const [reconSearch, setReconSearch] = useState('');
  const [entryForm, setEntryForm] = useState({ account: '', type: 'Debit', amount: '', narration: '' });
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState('All');
  const [expenseForm, setExpenseForm] = useState({ category: 'Kitchen Items', vendor: '', amount: '', method: 'Bank Transfer', notes: '' });

  // --- Invoices & Billing ---
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('All');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ billTo: '', type: 'Guest Folio', amount: '', dueDate: '', notes: '' });

  // --- Accounts Payable ---
  const [payableSearch, setPayableSearch] = useState('');
  const [payableStatusFilter, setPayableStatusFilter] = useState('All');
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billForm, setBillForm] = useState({ vendor: '', category: 'Kitchen & F&B Supplies', amount: '', dueDate: '', notes: '' });

  // --- Financial Statements ---
  const [statementView, setStatementView] = useState('pnl');

  // --- Guest Deposits & Advances ---
  const [depositSearch, setDepositSearch] = useState('');
  const [depositStatusFilter, setDepositStatusFilter] = useState('All');

  // --- Audit Trail ---
  const [auditSearch, setAuditSearch] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState('All');

  // --- Bank Accounts ---
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({ from: 'HDFC Current A/c', to: 'ICICI Savings A/c', amount: '', notes: '' });

  // --- Custom Reports ---
  const [generatingReportKey, setGeneratingReportKey] = useState(null);

  const refresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 700);
  };

  // --- Simulated data ---
  const metrics = [
    { label: "Today's Revenue", value: "₹1,42,500", sub: "82% of ₹1,75,000 target", icon: <DollarSign size={16} />, theme: 'emerald', pct: 82 },
    { label: "Pending Receivables", value: "₹34,200", sub: "3 invoices outstanding", icon: <Clock size={16} />, theme: 'amber', bars: [40, 65, 30, 55] },
    { label: "Tax Collected (GST)", value: "₹25,650", sub: "CGST + SGST this month", icon: <FileText size={16} />, theme: 'indigo', pct: 61 },
    { label: "Cash Register", value: "₹18,400", sub: "Balanced • counted 6:00 PM", icon: <Wallet size={16} />, theme: 'sky', balanced: true },
  ];

  const themeMap = {
    emerald: { iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30', glow: 'rgba(16,185,129,0.35)', ring: '#059669', track: '#eefcf5' },
    amber: { iconBg: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30', glow: 'rgba(245,158,11,0.35)', ring: '#d97706', track: '#fffaf0' },
    indigo: { iconBg: 'bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/30', glow: 'rgba(99,102,241,0.35)', ring: '#4f46e5', track: '#eef2ff' },
    sky: { iconBg: 'bg-gradient-to-br from-sky-500 to-blue-500 text-white shadow-lg shadow-sky-500/30', glow: 'rgba(14,165,233,0.35)', ring: '#0284c7', track: '#f0f9ff' },
  };

  const revenueTrend = [
    { label: 'Mon', value: 118000 }, { label: 'Tue', value: 96500 }, { label: 'Wed', value: 132000 },
    { label: 'Thu', value: 121000 }, { label: 'Fri', value: 148500 }, { label: 'Sat', value: 165200 },
    { label: 'Today', value: 142500, isToday: true },
  ];

  const paymentSplit = [
    { label: 'Credit Card', value: 74500, color: '#4f46e5' },
    { label: 'Bank Transfer', value: 45000, color: '#0ea5e9' },
    { label: 'Cash', value: 18400, color: '#f59e0b' },
    { label: 'UPI', value: 4600, color: '#10b981' },
  ];

  const recentTransactions = [
    { id: 'TXN-8821', guest: 'Aryan Singh', room: '204', amount: '₹12,500', method: 'Credit Card', status: 'Settled', date: 'Today, 10:45 AM' },
    { id: 'TXN-8822', guest: 'Corporate Account', room: 'Multiple', amount: '₹45,000', method: 'Bank Transfer', status: 'Pending Recon', date: 'Today, 09:30 AM' },
    { id: 'TXN-8823', guest: 'Rohan Desai', room: '108', amount: '₹4,200', method: 'Cash', status: 'Settled', date: 'Yesterday, 08:15 PM' },
    { id: 'TXN-8824', guest: 'Priya Nair', room: '312', amount: '₹8,900', method: 'UPI', status: 'Settled', date: 'Yesterday, 05:40 PM' },
  ];

  const reconciliationItems = [
    { id: 'BS-4471', source: 'Bank Statement', ref: 'NEFT-88213', date: 'Jul 16', amount: '₹45,000', matchedWith: 'TXN-8822', status: 'Unmatched' },
    { id: 'BS-4472', source: 'Bank Statement', ref: 'CC-SETL-902', date: 'Jul 16', amount: '₹12,500', matchedWith: 'TXN-8821', status: 'Matched' },
    { id: 'BS-4473', source: 'Gateway Payout', ref: 'RZP-77281', date: 'Jul 15', amount: '₹8,900', matchedWith: 'TXN-8824', status: 'Matched' },
    { id: 'BS-4474', source: 'Bank Statement', ref: 'NEFT-88220', date: 'Jul 15', amount: '₹6,750', matchedWith: null, status: 'Unmatched' },
  ].filter(r => (r.ref + r.source + r.status).toLowerCase().includes(reconSearch.toLowerCase()));

  const gstBreakup = [
    { label: 'CGST', value: '₹9,850', sub: '9% output tax' },
    { label: 'SGST', value: '₹9,850', sub: '9% output tax' },
    { label: 'IGST', value: '₹5,950', sub: 'Inter-state supply' },
    { label: 'Total Liability', value: '₹25,650', sub: 'Due 20th Aug' },
  ];

  const ledgerEntries = [
    { voucher: 'JV-2201', account: 'Room Revenue', debit: '-', credit: '₹1,42,500', balance: '₹8,42,110', date: 'Today' },
    { voucher: 'JV-2200', account: 'GST Output', debit: '-', credit: '₹25,650', balance: '₹1,12,340', date: 'Today' },
    { voucher: 'JV-2199', account: 'Accounts Receivable', debit: '₹34,200', credit: '-', balance: '₹34,200', date: 'Today' },
    { voucher: 'JV-2198', account: 'Bank — HDFC Current', debit: '₹45,000', credit: '-', balance: '₹6,18,220', date: 'Yesterday' },
  ];

  // --- Expense Management data ---
  const expenseCategories = [
    { key: 'travel', label: 'Travel Packages', icon: <Plane size={15} />, spent: 82500, budget: 100000, color: '#6366f1' },
    { key: 'dining', label: 'Dining', icon: <UtensilsCrossed size={15} />, spent: 145200, budget: 160000, color: '#f59e0b' },
    { key: 'roomAcc', label: 'Room Accessories', icon: <Sofa size={15} />, spent: 58300, budget: 70000, color: '#0ea5e9' },
    { key: 'vehicles', label: 'Hotel Vehicles', icon: <Car size={15} />, spent: 41200, budget: 45000, color: '#f43f5e' },
    { key: 'amenities', label: 'Other Amenities', icon: <Sparkles size={15} />, spent: 23800, budget: 30000, color: '#a855f7' },
    { key: 'accounts', label: 'Hotel Accounts', icon: <Landmark size={15} />, spent: 198500, budget: 210000, color: '#10b981' },
    { key: 'kitchen', label: 'Kitchen Items', icon: <ChefHat size={15} />, spent: 128000, budget: 120000, color: '#eab308' },
    { key: 'roomBookings', label: 'Room Bookings Ops', icon: <BedDouble size={15} />, spent: 76900, budget: 85000, color: '#4f46e5' },
    { key: 'eventBookings', label: 'Event Bookings Ops', icon: <PartyPopper size={15} />, spent: 134600, budget: 150000, color: '#ec4899' },
  ];

  const totalExpense = expenseCategories.reduce((s, c) => s + c.spent, 0);
  const totalExpenseBudget = expenseCategories.reduce((s, c) => s + c.budget, 0);
  const expenseUtilizationPct = Math.round((totalExpense / totalExpenseBudget) * 100);
  const overBudgetCount = expenseCategories.filter(c => c.spent > c.budget).length;
  const topExpenseCategory = [...expenseCategories].sort((a, b) => b.spent - a.spent)[0];

  const expenseTrend = [
    { label: 'Feb', value: 620000 }, { label: 'Mar', value: 645000 }, { label: 'Apr', value: 598000 },
    { label: 'May', value: 671000 }, { label: 'Jun', value: 705000 }, { label: 'Jul', value: totalExpense, isToday: true },
  ];
  const momChangePct = (((expenseTrend[5].value - expenseTrend[4].value) / expenseTrend[4].value) * 100).toFixed(1);

  const expenseEntries = [
    { id: 'EXP-3301', category: 'Kitchen Items', vendor: 'Metro Cash & Carry', method: 'Bank Transfer', amount: '₹18,400', date: 'Today', status: 'Approved' },
    { id: 'EXP-3300', category: 'Dining', vendor: 'Fresh Produce Co.', method: 'Cash', amount: '₹9,200', date: 'Today', status: 'Approved' },
    { id: 'EXP-3299', category: 'Hotel Vehicles', vendor: 'Shell Fuel Station', method: 'Credit Card', amount: '₹6,500', date: 'Yesterday', status: 'Pending' },
    { id: 'EXP-3298', category: 'Travel Packages', vendor: 'MakeMyTrip Corporate', method: 'Bank Transfer', amount: '₹32,000', date: 'Yesterday', status: 'Approved' },
    { id: 'EXP-3297', category: 'Event Bookings Ops', vendor: 'Bloom Décor Studio', method: 'Bank Transfer', amount: '₹28,500', date: 'Jul 14', status: 'Approved' },
    { id: 'EXP-3296', category: 'Room Accessories', vendor: 'IKEA Business', method: 'Credit Card', amount: '₹14,750', date: 'Jul 14', status: 'Pending' },
    { id: 'EXP-3295', category: 'Hotel Accounts', vendor: 'State Electricity Board', method: 'Bank Transfer', amount: '₹45,200', date: 'Jul 13', status: 'Approved' },
    { id: 'EXP-3294', category: 'Other Amenities', vendor: 'Spa Supplies Ltd', method: 'Cash', amount: '₹7,900', date: 'Jul 13', status: 'Approved' },
    { id: 'EXP-3293', category: 'Room Bookings Ops', vendor: 'Housekeeping Services Co', method: 'Bank Transfer', amount: '₹21,300', date: 'Jul 12', status: 'Approved' },
  ].filter(e =>
    (expenseCategoryFilter === 'All' || e.category === expenseCategoryFilter) &&
    (e.vendor + e.id + e.category).toLowerCase().includes(expenseSearch.toLowerCase())
  );

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!expenseForm.vendor || !expenseForm.amount) return;
    setIsExpenseModalOpen(false);
    setExpenseForm({ category: 'Kitchen Items', vendor: '', amount: '', method: 'Bank Transfer', notes: '' });
  };

  const handleAddEntry = (e) => {
    e.preventDefault();
    if (!entryForm.account || !entryForm.amount) return;
    setIsEntryModalOpen(false);
    setEntryForm({ account: '', type: 'Debit', amount: '', narration: '' });
  };

  // --- Invoices & Billing data ---
  const allInvoices = [
    { id: 'INV-5501', billTo: 'Aryan Singh', type: 'Guest Folio', amount: 18500, paid: 18500, dueDate: 'Jul 16', status: 'Paid' },
    { id: 'INV-5500', billTo: 'Meridian Corporate Travel', type: 'Corporate Account', amount: 145000, paid: 60000, dueDate: 'Jul 22', status: 'Partial' },
    { id: 'INV-5499', billTo: 'Rohan Desai', type: 'Guest Folio', amount: 4200, paid: 4200, dueDate: 'Jul 15', status: 'Paid' },
    { id: 'INV-5498', billTo: 'Zenith Events Pvt Ltd', type: 'Banquet Invoice', amount: 285000, paid: 0, dueDate: 'Jul 10', status: 'Overdue' },
    { id: 'INV-5497', billTo: 'Priya Nair', type: 'Guest Folio', amount: 8900, paid: 8900, dueDate: 'Jul 14', status: 'Paid' },
    { id: 'INV-5496', billTo: 'Corporate Account — Infosys', type: 'Corporate Account', amount: 62000, paid: 0, dueDate: 'Jul 25', status: 'Draft' },
    { id: 'CN-0087', billTo: 'Meridian Corporate Travel', type: 'Credit Note', amount: -5000, paid: -5000, dueDate: '—', status: 'Issued' },
    { id: 'INV-5495', billTo: 'Vikram Malhotra', type: 'Guest Folio', amount: 12400, paid: 0, dueDate: 'Jul 5', status: 'Overdue' },
  ];
  const invoicesData = allInvoices.filter(i =>
    (invoiceStatusFilter === 'All' || i.status === invoiceStatusFilter) &&
    (i.id + i.billTo + i.type).toLowerCase().includes(invoiceSearch.toLowerCase())
  );
  const totalInvoiced = allInvoices.filter(i => i.amount > 0).reduce((s, i) => s + i.amount, 0);
  const totalOutstanding = allInvoices.reduce((s, i) => s + Math.max(i.amount - i.paid, 0), 0);
  const overdueInvoices = allInvoices.filter(i => i.status === 'Overdue');
  const overdueAmount = overdueInvoices.reduce((s, i) => s + (i.amount - i.paid), 0);
  const creditNotesCount = allInvoices.filter(i => i.type === 'Credit Note').length;
  const invoiceStatusSplit = ['Paid', 'Partial', 'Overdue', 'Draft'].map((s, idx) => ({
    label: s, value: allInvoices.filter(i => i.status === s).reduce((sum, i) => sum + Math.max(i.amount, 0), 0),
    color: ['#10b981', '#f59e0b', '#f43f5e', '#94a3b8'][idx],
  })).filter(s => s.value > 0);
  const agingBuckets = [
    { label: '0–30 Days', value: 62000, color: '#10b981' },
    { label: '31–60 Days', value: 85000, color: '#f59e0b' },
    { label: '61–90 Days', value: 297400, color: '#f43f5e' },
    { label: '90+ Days', value: 12400, color: '#7c2d12' },
  ];
  const handleAddInvoice = (e) => {
    e.preventDefault();
    if (!invoiceForm.billTo || !invoiceForm.amount) return;
    setIsInvoiceModalOpen(false);
    setInvoiceForm({ billTo: '', type: 'Guest Folio', amount: '', dueDate: '', notes: '' });
  };

  // --- Accounts Payable / Vendor Bills data ---
  const vendorCategories = ['Kitchen & F&B Supplies', 'Housekeeping & Amenities', 'Utilities', 'Maintenance & AMC', 'Travel & Transport', 'Events & Décor'];
  const allPayables = [
    { id: 'BILL-2210', vendor: 'Metro Cash & Carry', category: 'Kitchen & F&B Supplies', amount: 48200, dueDate: 'Jul 18', status: 'Scheduled' },
    { id: 'BILL-2209', vendor: 'State Electricity Board', category: 'Utilities', amount: 145200, dueDate: 'Jul 20', status: 'Scheduled' },
    { id: 'BILL-2208', vendor: 'CoolAir HVAC Services', category: 'Maintenance & AMC', amount: 32000, dueDate: 'Jul 12', status: 'Overdue' },
    { id: 'BILL-2207', vendor: 'Spa Supplies Ltd', category: 'Housekeeping & Amenities', amount: 21500, dueDate: 'Jul 24', status: 'Scheduled' },
    { id: 'BILL-2206', vendor: 'Bloom Décor Studio', category: 'Events & Décor', amount: 58500, dueDate: 'Jul 9', status: 'Paid' },
    { id: 'BILL-2205', vendor: 'MakeMyTrip Corporate', category: 'Travel & Transport', amount: 76000, dueDate: 'Jul 8', status: 'Paid' },
    { id: 'BILL-2204', vendor: 'Shell Fuel Station', category: 'Travel & Transport', amount: 14200, dueDate: 'Jul 5', status: 'Overdue' },
  ];
  const payablesData = allPayables.filter(b =>
    (payableStatusFilter === 'All' || b.status === payableStatusFilter) &&
    (b.id + b.vendor + b.category).toLowerCase().includes(payableSearch.toLowerCase())
  );
  const vendorLedger = [
    { vendor: 'Metro Cash & Carry', color: '#f59e0b', outstanding: 48200 },
    { vendor: 'State Electricity Board', color: '#0ea5e9', outstanding: 145200 },
    { vendor: 'CoolAir HVAC Services', color: '#f43f5e', outstanding: 32000 },
    { vendor: 'Spa Supplies Ltd', color: '#a855f7', outstanding: 21500 },
  ];
  const totalPayables = allPayables.reduce((s, b) => s + b.amount, 0);
  const overduePayables = allPayables.filter(b => b.status === 'Overdue');
  const dueThisWeek = allPayables.filter(b => b.status === 'Scheduled');
  const handleAddBill = (e) => {
    e.preventDefault();
    if (!billForm.vendor || !billForm.amount) return;
    setIsBillModalOpen(false);
    setBillForm({ vendor: '', category: 'Kitchen & F&B Supplies', amount: '', dueDate: '', notes: '' });
  };

  // --- Financial Statements data ---
  const revenueByDept = [
    { label: 'Rooms', value: 2840000, color: '#059669' },
    { label: 'F&B', value: 1265000, color: '#f59e0b' },
    { label: 'Banquets & Events', value: 985000, color: '#6366f1' },
    { label: 'Spa & Other', value: 310000, color: '#ec4899' },
  ];
  const totalRevenuePnl = revenueByDept.reduce((s, d) => s + d.value, 0);
  const pnlExpenses = [
    { label: 'Cost of Goods (F&B)', value: 512000, color: '#f59e0b', icon: <UtensilsCrossed size={15} /> },
    { label: 'Staff Costs & Payroll', value: 1180000, color: '#4f46e5', icon: <Users size={15} /> },
    { label: 'Utilities & Maintenance', value: 340000, color: '#0ea5e9', icon: <Building2 size={15} /> },
    { label: 'Marketing & Admin', value: 215000, color: '#ec4899', icon: <Sparkles size={15} /> },
    { label: 'Depreciation', value: 120000, color: '#7c3aed', icon: <TrendingDown size={15} /> },
  ];
  const totalPnlExpenses = pnlExpenses.reduce((s, e) => s + e.value, 0);
  const netProfit = totalRevenuePnl - totalPnlExpenses;
  const balanceSheet = {
    assets: [
      { label: 'Cash & Bank Balances', value: 1842000 },
      { label: 'Accounts Receivable', value: 452400 },
      { label: 'Inventory (F&B, Supplies)', value: 218000 },
      { label: 'Property & Equipment (Net)', value: 18500000 },
    ],
    liabilities: [
      { label: 'Accounts Payable', value: 340900 },
      { label: 'GST / Tax Payable', value: 25650 },
      { label: 'Guest Deposits Held', value: 186000 },
      { label: 'Long-term Loan', value: 6200000 },
    ],
    equity: [{ label: "Owner's Equity & Retained Earnings", value: 14260850 }],
  };
  const totalAssets = balanceSheet.assets.reduce((s, a) => s + a.value, 0);
  const totalLiabilities = balanceSheet.liabilities.reduce((s, l) => s + l.value, 0);
  const totalEquity = balanceSheet.equity.reduce((s, e) => s + e.value, 0);
  const cashFlow = {
    operating: [
      { label: 'Net Profit', value: netProfit },
      { label: 'Depreciation Add-back', value: 120000 },
      { label: 'Change in Receivables', value: -68000 },
      { label: 'Change in Payables', value: 42500 },
    ],
    investing: [{ label: 'Kitchen Equipment Purchase', value: -185000 }, { label: 'Property Improvements', value: -240000 }],
    financing: [{ label: 'Loan Repayment', value: -150000 }, { label: 'Owner Drawings', value: -80000 }],
  };
  const cfOperating = cashFlow.operating.reduce((s, i) => s + i.value, 0);
  const cfInvesting = cashFlow.investing.reduce((s, i) => s + i.value, 0);
  const cfFinancing = cashFlow.financing.reduce((s, i) => s + i.value, 0);
  const netCashFlow = cfOperating + cfInvesting + cfFinancing;

  // --- Budgeting & Forecasting data ---
  const budgetByDept = [
    { dept: 'Rooms', budget: 2700000, actual: 2840000 },
    { dept: 'F&B', budget: 1350000, actual: 1265000 },
    { dept: 'Banquets & Events', budget: 900000, actual: 985000 },
    { dept: 'Housekeeping', budget: 420000, actual: 398000 },
    { dept: 'Maintenance', budget: 260000, actual: 305000 },
    { dept: 'Marketing & Admin', budget: 230000, actual: 215000 },
  ];
  const totalBudget = budgetByDept.reduce((s, d) => s + d.budget, 0);
  const totalActual = budgetByDept.reduce((s, d) => s + d.actual, 0);
  const overallVariancePct = (((totalActual - totalBudget) / totalBudget) * 100).toFixed(1);
  const forecastTrend = [
    { label: 'Aug', value: 5480000 }, { label: 'Sep', value: 5620000 }, { label: 'Oct', value: 5910000 },
    { label: 'Nov', value: 6240000 }, { label: 'Dec', value: 7150000 }, { label: 'Jan', value: 6480000 },
  ];

  // --- Payroll & Staff Costs data ---
  const payrollByDept = [
    { label: 'Front Office', headcount: 18, gross: 612000, pf: 73440, esi: 14688, color: '#4f46e5' },
    { label: 'Housekeeping', headcount: 26, gross: 754000, pf: 90480, esi: 18096, color: '#0ea5e9' },
    { label: 'F&B / Kitchen', headcount: 34, gross: 1088000, pf: 130560, esi: 26112, color: '#f59e0b' },
    { label: 'Sales & Banquets', headcount: 9, gross: 486000, pf: 58320, esi: 11664, color: '#ec4899' },
    { label: 'Maintenance & Security', headcount: 14, gross: 392000, pf: 47040, esi: 9408, color: '#10b981' },
    { label: 'Admin & Finance', headcount: 7, gross: 318000, pf: 38160, esi: 7632, color: '#7c3aed' },
  ];
  const totalHeadcount = payrollByDept.reduce((s, d) => s + d.headcount, 0);
  const totalGrossPayroll = payrollByDept.reduce((s, d) => s + d.gross, 0);
  const totalPfLiability = payrollByDept.reduce((s, d) => s + d.pf, 0);
  const totalEsiLiability = payrollByDept.reduce((s, d) => s + d.esi, 0);
  const avgCostPerEmployee = Math.round(totalGrossPayroll / totalHeadcount);

  // --- Guest Deposits & Advances data ---
  const allDeposits = [
    { id: 'DEP-6601', guest: 'Aryan Singh', ref: 'BKG-2214', type: 'Security Deposit', amount: 5000, date: 'Jul 16', status: 'Held' },
    { id: 'DEP-6600', guest: 'Zenith Events Pvt Ltd', ref: 'BKQ-0091', type: 'Advance Booking', amount: 120000, date: 'Jul 10', status: 'Applied to Bill' },
    { id: 'DEP-6599', guest: 'Priya Nair', ref: 'BKG-2209', type: 'Security Deposit', amount: 3000, date: 'Jul 14', status: 'Refunded' },
    { id: 'DEP-6598', guest: 'Meridian Corporate Travel', ref: 'BKG-2188', type: 'Advance Booking', amount: 45000, date: 'Jul 6', status: 'Held' },
    { id: 'DEP-6597', guest: 'Rohan Desai', ref: 'BKG-2199', type: 'Security Deposit', amount: 5000, date: 'Jul 15', status: 'Refunded' },
    { id: 'DEP-6596', guest: 'No-show — Vikram M.', ref: 'BKG-2150', type: 'Advance Booking', amount: 8500, date: 'Jul 2', status: 'Forfeited' },
  ];
  const depositsData = allDeposits.filter(d =>
    (depositStatusFilter === 'All' || d.status === depositStatusFilter) &&
    (d.id + d.guest + d.ref + d.type).toLowerCase().includes(depositSearch.toLowerCase())
  );
  const totalHeldEscrow = allDeposits.filter(d => d.status === 'Held').reduce((s, d) => s + d.amount, 0);
  const totalAdvanceBookings = allDeposits.filter(d => d.type === 'Advance Booking').reduce((s, d) => s + d.amount, 0);
  const refundsPendingCount = allDeposits.filter(d => d.status === 'Held' && d.type === 'Security Deposit').length;
  const totalForfeited = allDeposits.filter(d => d.status === 'Forfeited').reduce((s, d) => s + d.amount, 0);

  // --- Audit Trail data ---
  const allAuditLog = [
    { id: 'AUD-9001', user: 'Finance Controller', action: 'Posted Entry', target: 'JV-2201 · Room Revenue', time: 'Today, 11:20 AM', approval: 'Auto-approved' },
    { id: 'AUD-9000', user: 'A. Kapoor (Accountant)', action: 'Edited Entry', target: 'INV-5500 · Amount corrected', time: 'Today, 10:05 AM', approval: 'Pending Review' },
    { id: 'AUD-8999', user: 'Finance Controller', action: 'Approved Expense', target: 'EXP-3295 · ₹45,200', time: 'Yesterday, 06:40 PM', approval: 'Approved' },
    { id: 'AUD-8998', user: 'S. Rao (Auditor)', action: 'Flagged Entry', target: 'BILL-2208 · Overdue > 30 days', time: 'Yesterday, 04:12 PM', approval: 'Escalated' },
    { id: 'AUD-8997', user: 'Finance Controller', action: 'Deleted Entry', target: 'JV-2187 · Duplicate voucher', time: 'Jul 14, 02:30 PM', approval: 'Approved' },
    { id: 'AUD-8996', user: 'A. Kapoor (Accountant)', action: 'Posted Entry', target: 'JV-2186 · Bank — HDFC Current', time: 'Jul 14, 09:15 AM', approval: 'Auto-approved' },
  ];
  const auditLog = allAuditLog.filter(a =>
    (auditActionFilter === 'All' || a.action === auditActionFilter) &&
    (a.user + a.action + a.target).toLowerCase().includes(auditSearch.toLowerCase())
  );
  const pendingApprovalsCount = allAuditLog.filter(a => a.approval === 'Pending Review' || a.approval === 'Escalated').length;
  const flaggedHighValueCount = allAuditLog.filter(a => a.approval === 'Escalated').length;
  const auditActionTypes = ['Posted Entry', 'Edited Entry', 'Approved Expense', 'Flagged Entry', 'Deleted Entry'];

  // --- Bank Accounts data ---
  const bankAccounts = [
    { name: 'HDFC Current A/c', number: '••• 4471', balance: 618220, type: 'Current', color: '#4f46e5' },
    { name: 'ICICI Savings A/c', number: '••• 2290', balance: 342800, type: 'Savings', color: '#0ea5e9' },
    { name: 'Axis Escrow A/c', number: '••• 7734', balance: 186000, type: 'Escrow (Guest Deposits)', color: '#10b981' },
    { name: 'SBI Payroll A/c', number: '••• 9012', balance: 695000, type: 'Payroll', color: '#f59e0b' },
  ];
  const totalBankBalance = bankAccounts.reduce((s, a) => s + a.balance, 0);
  const recentTransfers = [
    { id: 'TRF-441', from: 'HDFC Current A/c', to: 'SBI Payroll A/c', amount: 695000, date: 'Jul 15', status: 'Completed' },
    { id: 'TRF-440', from: 'ICICI Savings A/c', to: 'HDFC Current A/c', amount: 150000, date: 'Jul 12', status: 'Completed' },
    { id: 'TRF-439', from: 'HDFC Current A/c', to: 'Axis Escrow A/c', amount: 45000, date: 'Jul 10', status: 'Completed' },
    { id: 'TRF-438', from: 'HDFC Current A/c', to: 'ICICI Savings A/c', amount: 80000, date: 'Jul 18', status: 'Pending' },
  ];
  const standingInstructions = [
    { label: 'Loan EMI — Axis Bank', amount: 125000, frequency: 'Monthly, 5th', account: 'HDFC Current A/c' },
    { label: 'Payroll Sweep', amount: 695000, frequency: 'Monthly, 1st', account: 'HDFC Current A/c → SBI Payroll' },
  ];
  const pendingTransfersCount = recentTransfers.filter(t => t.status === 'Pending').length;
  const handleAddTransfer = (e) => {
    e.preventDefault();
    if (!transferForm.amount || transferForm.from === transferForm.to) return;
    setIsTransferModalOpen(false);
    setTransferForm({ from: 'HDFC Current A/c', to: 'ICICI Savings A/c', amount: '', notes: '' });
  };

  // --- Custom Reports data ---
  const reportTemplates = [
    { key: 'gstr1', label: 'GSTR-1', desc: 'Outward supplies return, ready for GST portal filing.', icon: <FileText size={18} />, lastGenerated: 'Jul 1' },
    { key: 'gstr3b', label: 'GSTR-3B', desc: 'Summary return with tax liability and ITC.', icon: <FileBarChart2 size={18} />, lastGenerated: 'Jul 1' },
    { key: 'zreport', label: 'Day-End Z-Report', desc: 'Closing register totals across all POS outlets.', icon: <Receipt size={18} />, lastGenerated: 'Today' },
    { key: 'deptRevenue', label: 'Department Revenue Report', desc: 'Rooms, F&B and banquet revenue split by day.', icon: <PieChart size={18} />, lastGenerated: 'Jul 15' },
  ];
  const generatedReportsHistory = [
    { id: 'RPT-771', name: 'GSTR-3B — June 2026', generatedOn: 'Jul 1, 09:12 AM', format: 'PDF' },
    { id: 'RPT-770', name: 'Day-End Z-Report — Jul 15', generatedOn: 'Jul 16, 12:02 AM', format: 'PDF' },
    { id: 'RPT-769', name: 'Department Revenue — Jun 2026', generatedOn: 'Jul 2, 04:40 PM', format: 'Excel' },
    { id: 'RPT-768', name: 'GSTR-1 — June 2026', generatedOn: 'Jul 1, 09:05 AM', format: 'PDF' },
  ];
  const handleGenerateReport = (key) => {
    setGeneratingReportKey(key);
    setTimeout(() => setGeneratingReportKey(null), 1200);
  };

  const navGroups = [
    {
      heading: 'Accounts & Finance',
      items: [
        { key: 'overview', label: 'Financial Overview', icon: <Building2 size={15} /> },
        { key: 'invoices', label: 'Invoices & Billing', icon: <FileText size={15} /> },
        { key: 'payables', label: 'Accounts Payable', icon: <Truck size={15} /> },
        { key: 'expenses', label: 'Expense Management', icon: <PieChart size={15} /> },
        { key: 'reconciliation', label: 'Reconciliation', icon: <Link2 size={15} /> },
        { key: 'reports', label: 'Tax & Ledgers', icon: <Receipt size={15} /> },
      ],
    },
    {
      heading: 'Planning & Reporting',
      items: [
        { key: 'statements', label: 'Financial Statements', icon: <Scale size={15} /> },
        { key: 'budgeting', label: 'Budgeting & Forecasting', icon: <Target size={15} /> },
        { key: 'customReports', label: 'Custom Reports', icon: <FileSpreadsheet size={15} /> },
      ],
    },
    {
      heading: 'Payroll & Deposits',
      items: [
        { key: 'payroll', label: 'Payroll & Staff Costs', icon: <Users size={15} /> },
        { key: 'deposits', label: 'Guest Deposits', icon: <LockKeyhole size={15} /> },
      ],
    },
    {
      heading: 'Governance',
      items: [
        { key: 'audit', label: 'Audit Trail', icon: <History size={15} /> },
        { key: 'bank', label: 'Bank Accounts', icon: <Landmark size={15} /> },
      ],
    },
  ];
  const navItems = navGroups.flatMap(g => g.items);

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
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/30 shrink-0">
            <Landmark size={19} />
          </div>
          <div>
            <h1 className="font-serif font-black text-[25px] text-zinc-500 text-base leading-none">Finance Head</h1>
            <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-1 block">Finance Dashboard</span>
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
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
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
              onClick={() => navigate('/dashboard/Admin')}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold text-zinc-500 hover:bg-zinc-50 hover:text-emerald-600 transition-all text-left"
            >
              <span className="flex items-center gap-3"><Building2 size={15} /> Back to Admin</span>
              <ArrowUpRight size={14} className="opacity-50" />
            </button>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-4 flex items-start gap-3">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-[11px] font-bold text-zinc-900 leading-tight">Books balanced</p>
            <p className="text-[10px] text-zinc-500 mt-0.5">No variance flagged today.</p>
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
            <h2 className="text-2xl font-black text-zinc-500 tracking-tight mt-0.5">
              {{
                overview: 'Financial Overview', expenses: 'Expense Management', reconciliation: 'Reconciliation', reports: 'Tax & Ledgers',
                invoices: 'Invoices & Billing', payables: 'Accounts Payable', statements: 'Financial Statements', budgeting: 'Budgeting & Forecasting',
                payroll: 'Payroll & Staff Costs', deposits: 'Guest Deposits & Advances', audit: 'Audit Trail', bank: 'Bank Accounts', customReports: 'Custom Reports',
              }[activeTab]}
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              {{
                overview: 'Real-time ledger, revenue and reconciliation metrics.',
                expenses: 'Travel, dining, kitchen, vehicles, amenities and every operational cost center.',
                reconciliation: 'Match bank statements and gateway payouts against recorded transactions.',
                reports: 'GST breakup, journal vouchers and the general ledger.',
                invoices: 'Guest folios, corporate invoices, credit notes and partial payments.',
                payables: 'Supplier bills, due dates, payment scheduling and vendor balances.',
                statements: 'Profit & Loss, Balance Sheet and Cash Flow at a glance.',
                budgeting: 'Budget vs actual by department, variance and forward projections.',
                payroll: 'Salary disbursements, PF/ESI liabilities and department-wise labor cost.',
                deposits: 'Security deposits and advance bookings held in escrow, with refund tracking.',
                audit: 'Who edited or posted each ledger entry, and the approval chain behind it.',
                bank: 'Balances across accounts, inter-account transfers and standing instructions.',
                customReports: 'GSTR-ready exports, day-end Z-reports and department revenue reports.',
              }[activeTab]}
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              <span className="text-[9px] font-bold uppercase tracking-wider">Books Live</span>
            </div>

            <button
              onClick={refresh}
              className={`p-2.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-500 transition-all ${isLoading ? 'animate-spin' : ''}`}
            >
              <RefreshCw size={15} />
            </button>

            <button className="bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-600 transition-colors flex items-center gap-2 shadow-sm">
              <Download size={14} /> Export
            </button>

            <div className="hidden md:flex items-center gap-2 bg-white pl-2.5 pr-3 py-1.5 rounded-xl border border-zinc-200/60 shadow-xs">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">F</div>
              <div className="text-left leading-none">
                <span className="text-xs font-bold text-zinc-900 block">Finance Controller</span>
                <span className="text-[8px] font-semibold text-zinc-600 uppercase tracking-widest mt-0.5 block">Accounts</span>
              </div>
            </div>
          </div>
        </div>

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

                  {/* KPI Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {metrics.map((kpi, i) => {
                      const t = themeMap[kpi.theme];
                      return (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                          whileHover={{ y: -5, scale: 1.015 }}
                          className="relative overflow-hidden bg-white rounded-[1.75rem] p-5 border border-zinc-200/60 flex items-start justify-between"
                          style={{ boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px ${t.glow}` }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${t.iconBg}`}>
                              {kpi.icon}
                            </div>
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 + 0.2 }} className="text-3xl font-black text-zinc-900 tracking-tight leading-none mb-1.5">
                              {kpi.value}
                            </motion.p>
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                            <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                          </div>

                          <div className="relative shrink-0 ml-3">
                            {kpi.pct !== undefined && (
                              <div className="relative flex items-center justify-center">
                                <svg className="w-14 h-14 rotate-[-90deg]" style={{ filter: `drop-shadow(0 0 6px ${t.glow})` }}>
                                  <circle cx="28" cy="28" r="20" fill="none" stroke={t.track} strokeWidth="4" />
                                  <motion.circle
                                    cx="28" cy="28" r="20" fill="none" strokeWidth="4.5" stroke={t.ring}
                                    strokeDasharray={2 * Math.PI * 20}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 20 }}
                                    animate={{ strokeDashoffset: (2 * Math.PI * 20) - (kpi.pct / 100) * (2 * Math.PI * 20) }}
                                    transition={{ duration: 1.3, ease: "easeOut" }}
                                    strokeLinecap="round"
                                  />
                                </svg>
                                <span className="absolute text-[10px] font-black" style={{ color: t.ring }}>{kpi.pct}%</span>
                              </div>
                            )}
                            {kpi.bars && (
                              <div className="flex items-end gap-1 h-14 w-16">
                                {kpi.bars.map((b, bi) => (
                                  <motion.div key={bi} initial={{ height: 0 }} animate={{ height: `${b}%` }}
                                    transition={{ delay: bi * 0.08 + 0.3, duration: 0.6, ease: 'easeOut' }}
                                    className="flex-1 rounded-t-md" style={{ background: `linear-gradient(180deg, #fbbf24, ${t.ring})` }} />
                                ))}
                              </div>
                            )}
                            {kpi.balanced && (
                              <motion.div
                                animate={{ boxShadow: ['0 0 0 0 rgba(2,132,199,0.35)', '0 0 0 8px rgba(2,132,199,0)', '0 0 0 0 rgba(2,132,199,0)'] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="w-14 h-14 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center"
                              >
                                <CheckCircle2 size={22} className="text-sky-600" />
                              </motion.div>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Charts row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="relative overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(5,150,105,0.25)] border border-zinc-200/60"
                    >
                      <div className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
                            <TrendingUp size={14} className="text-white" />
                          </div>
                          <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">7-Day Revenue Trend</h3>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Live</span>
                      </div>
                      <div className="relative">
                        <RevenueTrendLine data={revenueTrend} />
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="relative overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(99,102,241,0.25)] border border-zinc-200/60"
                    >
                      <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                          <CreditCard size={14} className="text-white" />
                        </div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Payment Method Split</h3>
                      </div>
                      <div className="relative flex flex-col sm:flex-row items-center justify-around gap-6">
                        <DonutChart data={paymentSplit} />
                        <div className="grid grid-cols-1 gap-y-2.5">
                          {paymentSplit.map((d, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-2 group/legend">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-sm transition-transform duration-200 group-hover/legend:scale-125"
                                style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}66` }} />
                              <span className="text-[11px] text-zinc-500 font-semibold truncate max-w-[110px]">{d.label}</span>
                              <span className="text-xs font-black text-zinc-900 ml-auto">₹{d.value.toLocaleString('en-IN')}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Recent Transactions Table */}
                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 flex justify-between items-center bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><DollarSign size={16} className="text-emerald-600" /> Recent Transactions</h3>
                      <button onClick={() => setActiveTab('reconciliation')} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                        View Full Ledger <ArrowUpRight size={12} />
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                            <th className="p-4 font-bold">Ref ID</th>
                            <th className="p-4 font-bold">Guest / Entity</th>
                            <th className="p-4 font-bold">Method</th>
                            <th className="p-4 font-bold">Date &amp; Time</th>
                            <th className="p-4 font-bold text-right">Amount</th>
                            <th className="p-4 font-bold text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {recentTransactions.map((txn, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="p-4 text-xs font-mono text-zinc-500">{txn.id}</td>
                              <td className="p-4 text-sm font-bold text-zinc-900">{txn.guest} <span className="block text-xs font-normal text-zinc-400">Room {txn.room}</span></td>
                              <td className="p-4 text-sm text-zinc-600">{txn.method}</td>
                              <td className="p-4 text-sm text-zinc-600">{txn.date}</td>
                              <td className="p-4 text-sm font-bold text-zinc-900 text-right">{txn.amount}</td>
                              <td className="p-4 text-right">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${txn.status === 'Settled' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                  }`}>
                                  {txn.status === 'Settled' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                  {txn.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: EXPENSE MANAGEMENT                       */}
              {/* ============================================ */}
              {activeTab === 'expenses' && (
                <motion.div key="expenses" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* KPI Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: 'Total Monthly Expense', value: `₹${totalExpense.toLocaleString('en-IN')}`, sub: `${expenseUtilizationPct}% of ₹${totalExpenseBudget.toLocaleString('en-IN')} budget`, icon: <Wallet size={16} />, theme: 'rose' },
                      { label: 'Highest Category', value: topExpenseCategory.label, sub: `₹${topExpenseCategory.spent.toLocaleString('en-IN')} spent`, icon: topExpenseCategory.icon, theme: 'indigo' },
                      { label: 'Budget Utilization', value: `${expenseUtilizationPct}%`, sub: `${overBudgetCount} categor${overBudgetCount === 1 ? 'y' : 'ies'} over budget`, icon: <ScanLine size={16} />, theme: overBudgetCount > 0 ? 'amber' : 'emerald' },
                      { label: 'Month-on-Month', value: `${momChangePct > 0 ? '+' : ''}${momChangePct}%`, sub: `vs ₹${expenseTrend[4].value.toLocaleString('en-IN')} last month`, icon: momChangePct > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />, theme: momChangePct > 0 ? 'amber' : 'emerald' },
                    ].map((kpi, i) => {
                      const t = { rose: { iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30', glow: 'rgba(225,29,72,0.3)' }, ...themeMap }[kpi.theme];
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                          whileHover={{ y: -5, scale: 1.015 }}
                          className="relative overflow-hidden bg-white rounded-[1.75rem] p-5 border border-zinc-200/60"
                          style={{ boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px ${t.glow}` }}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${t.iconBg}`}>{kpi.icon}</div>
                          <p className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1.5 truncate">{kpi.value}</p>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Charts row: category ranking + share donut */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="relative overflow-hidden bg-gradient-to-br from-white via-white to-rose-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(225,29,72,0.2)] border border-zinc-200/60"
                    >
                      <div className="absolute -top-14 -left-14 w-40 h-40 rounded-full bg-rose-200/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center gap-2 mb-5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/30">
                          <PieChart size={14} className="text-white" />
                        </div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Spend by Category</h3>
                      </div>
                      <div className="relative">
                        <BarRankChart data={expenseCategories.map(c => ({ label: c.label, value: c.spent, color: c.color, icon: c.icon }))} />
                      </div>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -6, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="relative overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(99,102,241,0.25)] border border-zinc-200/60"
                    >
                      <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/30">
                          <ScanLine size={14} className="text-white" />
                        </div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Category Share</h3>
                      </div>
                      <div className="relative flex flex-col sm:flex-row items-center justify-around gap-6">
                        <DonutChart data={expenseCategories.map(c => ({ label: c.label, value: c.spent, color: c.color }))} centerLabel="Spent" />
                        <div className="grid grid-cols-1 gap-y-2 max-h-[210px] overflow-y-auto fd-scrollbar pr-1">
                          {expenseCategories.map((d, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center gap-2 group/legend">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-sm transition-transform duration-200 group-hover/legend:scale-125"
                                style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}66` }} />
                              <span className="text-[11px] text-zinc-500 font-semibold truncate max-w-[130px]">{d.label}</span>
                              <span className="text-xs font-black text-zinc-900 ml-auto">₹{d.spent.toLocaleString('en-IN')}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Expense trend */}
                  <motion.div
                    whileHover={{ y: -4 }}
                    transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="relative overflow-hidden bg-gradient-to-br from-white via-white to-rose-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(225,29,72,0.2)] border border-zinc-200/60"
                  >
                    <div className="absolute -bottom-16 -right-10 w-56 h-56 rounded-full bg-rose-200/20 blur-3xl pointer-events-none" />
                    <div className="relative flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/30">
                          <TrendingUp size={14} className="text-white" />
                        </div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">6-Month Expense Trend</h3>
                      </div>
                      <span className="text-[9px] font-bold text-rose-500 uppercase tracking-widest bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">All Categories</span>
                    </div>
                    <div className="relative">
                      <ExpenseTrendLine data={expenseTrend} />
                    </div>
                  </motion.div>

                  {/* Budget utilization list */}
                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden p-6">
                    <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-5"><Filter size={16} className="text-rose-500" /> Budget Utilization by Category</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                      {expenseCategories.map((c, i) => {
                        const pct = Math.round((c.spent / c.budget) * 100);
                        const over = c.spent > c.budget;
                        return (
                          <div key={c.key}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="flex items-center gap-2 text-xs font-bold text-zinc-700">
                                <span className="w-6 h-6 rounded-md flex items-center justify-center text-white shrink-0" style={{ background: c.color }}>{c.icon}</span>
                                {c.label}
                              </span>
                              <span className={`text-[11px] font-black ${over ? 'text-rose-600' : 'text-zinc-500'}`}>
                                ₹{c.spent.toLocaleString('en-IN')} / ₹{c.budget.toLocaleString('en-IN')} ({pct}%)
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(pct, 100)}%` }}
                                transition={{ duration: 0.9, delay: i * 0.05, ease: 'easeOut' }}
                                className={`h-full rounded-full ${over ? 'bg-rose-500' : pct >= 90 ? 'bg-amber-400' : 'bg-emerald-500'}`}
                              />
                            </div>
                            {over && <p className="text-[10px] text-rose-500 font-semibold mt-1 flex items-center gap-1"><AlertTriangle size={10} /> Over budget by ₹{(c.spent - c.budget).toLocaleString('en-IN')}</p>}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Expense Ledger Table */}
                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Receipt size={16} className="text-rose-500" /> Expense Ledger</h3>
                      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                        <div className="relative w-full sm:w-56">
                          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input value={expenseSearch} onChange={e => setExpenseSearch(e.target.value)} placeholder="Search vendor or ID..." className="fd-input pl-9 py-2 text-xs" />
                        </div>
                        <select value={expenseCategoryFilter} onChange={e => setExpenseCategoryFilter(e.target.value)} className="fd-input py-2 text-xs bg-white appearance-none cursor-pointer w-full sm:w-52">
                          <option value="All">All Categories</option>
                          {expenseCategories.map(c => <option key={c.key} value={c.label}>{c.label}</option>)}
                        </select>
                        <button
                          onClick={() => setIsExpenseModalOpen(true)}
                          className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-rose-600 transition-colors flex items-center justify-center gap-2 shrink-0"
                        >
                          <Plus size={13} /> Add Expense
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                            <th className="p-4 font-bold">Ref ID</th>
                            <th className="p-4 font-bold">Category</th>
                            <th className="p-4 font-bold">Vendor / Description</th>
                            <th className="p-4 font-bold">Method</th>
                            <th className="p-4 font-bold">Date</th>
                            <th className="p-4 font-bold text-right">Amount</th>
                            <th className="p-4 font-bold text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {expenseEntries.length === 0 && (
                            <tr><td colSpan={7} className="p-8 text-center text-xs text-zinc-400">No expenses match your filters.</td></tr>
                          )}
                          {expenseEntries.map((e, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="p-4 text-xs font-mono text-zinc-500">{e.id}</td>
                              <td className="p-4">
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">{e.category}</span>
                              </td>
                              <td className="p-4 text-sm font-bold text-zinc-900">{e.vendor}</td>
                              <td className="p-4 text-sm text-zinc-600">{e.method}</td>
                              <td className="p-4 text-sm text-zinc-600">{e.date}</td>
                              <td className="p-4 text-sm font-bold text-zinc-900 text-right">{e.amount}</td>
                              <td className="p-4 text-right">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${e.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                  }`}>
                                  {e.status === 'Approved' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                  {e.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: RECONCILIATION                           */}
              {/* ============================================ */}
              {activeTab === 'reconciliation' && (
                <motion.div key="reconciliation" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[
                      { label: 'Matched', value: reconciliationItems.filter(r => r.status === 'Matched').length, icon: <CheckCircle2 size={16} />, theme: 'emerald' },
                      { label: 'Unmatched', value: reconciliationItems.filter(r => r.status === 'Unmatched').length, icon: <AlertTriangle size={16} />, theme: 'amber' },
                      { label: 'Total Variance', value: '₹6,750', icon: <ScanLine size={16} />, theme: 'indigo' },
                    ].map((kpi, i) => {
                      const t = themeMap[kpi.theme];
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                          className="bg-white rounded-[1.5rem] p-5 border border-zinc-200/60 flex items-center gap-4"
                          style={{ boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px ${t.glow}` }}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.iconBg}`}>{kpi.icon}</div>
                          <div>
                            <p className="text-2xl font-black text-zinc-900 leading-none">{kpi.value}</p>
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mt-1">{kpi.label}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Link2 size={16} className="text-emerald-600" /> Bank &amp; Gateway Matching</h3>
                      <div className="relative w-full sm:w-64">
                        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                        <input
                          value={reconSearch}
                          onChange={e => setReconSearch(e.target.value)}
                          placeholder="Search reference or source..."
                          className="fd-input pl-9 py-2 text-xs"
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                            <th className="p-4 font-bold">Source</th>
                            <th className="p-4 font-bold">Reference</th>
                            <th className="p-4 font-bold">Date</th>
                            <th className="p-4 font-bold">Matched With</th>
                            <th className="p-4 font-bold text-right">Amount</th>
                            <th className="p-4 font-bold text-right">Status</th>
                            <th className="p-4 font-bold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {reconciliationItems.map((r, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="p-4 text-sm font-semibold text-zinc-700">{r.source}</td>
                              <td className="p-4 text-xs font-mono text-zinc-500">{r.ref}</td>
                              <td className="p-4 text-sm text-zinc-600">{r.date}</td>
                              <td className="p-4 text-xs font-mono text-zinc-500">{r.matchedWith || '—'}</td>
                              <td className="p-4 text-sm font-bold text-zinc-900 text-right">{r.amount}</td>
                              <td className="p-4 text-right">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${r.status === 'Matched' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                  }`}>
                                  {r.status === 'Matched' ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                                  {r.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                {r.status === 'Unmatched' ? (
                                  <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700">Mark Matched</button>
                                ) : (
                                  <span className="text-xs text-zinc-300">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: TAX & LEDGERS                            */}
              {/* ============================================ */}
              {activeTab === 'reports' && (
                <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {gstBreakup.map((g, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        className="bg-white rounded-[1.5rem] p-5 border border-zinc-200/60"
                        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px rgba(79,70,229,0.2)' }}>
                        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">{g.label}</p>
                        <p className="text-2xl font-black text-zinc-900 mb-1">{g.value}</p>
                        <p className="text-[10px] text-zinc-400">{g.sub}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 flex justify-between items-center bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Receipt size={16} className="text-emerald-600" /> General Ledger</h3>
                      <button
                        onClick={() => setIsEntryModalOpen(true)}
                        className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-600 transition-colors flex items-center gap-2"
                      >
                        <Plus size={13} /> New Entry
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                            <th className="p-4 font-bold">Voucher</th>
                            <th className="p-4 font-bold">Account Head</th>
                            <th className="p-4 font-bold">Date</th>
                            <th className="p-4 font-bold text-right">Debit</th>
                            <th className="p-4 font-bold text-right">Credit</th>
                            <th className="p-4 font-bold text-right">Balance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {ledgerEntries.map((l, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="p-4 text-xs font-mono text-zinc-500">{l.voucher}</td>
                              <td className="p-4 text-sm font-bold text-zinc-900">{l.account}</td>
                              <td className="p-4 text-sm text-zinc-600">{l.date}</td>
                              <td className="p-4 text-sm text-red-500 text-right">{l.debit}</td>
                              <td className="p-4 text-sm text-emerald-600 text-right">{l.credit}</td>
                              <td className="p-4 text-sm font-bold text-zinc-900 text-right">{l.balance}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
              {/* ============================================ */}
              {/* TAB: INVOICES & BILLING                       */}
              {/* ============================================ */}
              {activeTab === 'invoices' && (
                <motion.div key="invoices" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* KPI Cards Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: 'Total Invoiced', value: `₹${totalInvoiced.toLocaleString('en-IN')}`, sub: `${allInvoices.filter(i => i.amount > 0).length} invoices this month`, icon: <FileText size={16} />, theme: 'emerald' },
                      { label: 'Outstanding', value: `₹${totalOutstanding.toLocaleString('en-IN')}`, sub: 'Across guest & corporate accounts', icon: <Clock size={16} />, theme: 'amber' },
                      { label: 'Overdue', value: `₹${overdueAmount.toLocaleString('en-IN')}`, sub: `${overdueInvoices.length} invoice${overdueInvoices.length === 1 ? '' : 's'} past due`, icon: <AlertTriangle size={16} />, theme: 'rose' },
                      { label: 'Credit Notes Issued', value: creditNotesCount, sub: 'This month', icon: <Undo2 size={16} />, theme: 'indigo' },
                    ].map((kpi, i) => {
                      const t = { rose: { iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30', glow: 'rgba(225,29,72,0.3)' }, ...themeMap }[kpi.theme];
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                          whileHover={{ y: -5, scale: 1.015 }}
                          className="relative overflow-hidden bg-white rounded-[1.75rem] p-5 border border-zinc-200/60"
                          style={{ boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px ${t.glow}` }}
                        >
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${t.iconBg}`}>{kpi.icon}</div>
                          <p className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1.5 truncate">{kpi.value}</p>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  {/* Charts row: aging + status split */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="relative overflow-hidden bg-gradient-to-br from-white via-white to-rose-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(225,29,72,0.2)] border border-zinc-200/60">
                      <div className="absolute -top-14 -left-14 w-40 h-40 rounded-full bg-rose-200/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center gap-2 mb-5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/30"><CalendarClock size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Receivables Aging</h3>
                      </div>
                      <div className="relative"><BarRankChart data={agingBuckets} /></div>
                    </motion.div>

                    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="relative overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(5,150,105,0.2)] border border-zinc-200/60">
                      <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-emerald-200/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30"><PieChart size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Invoice Status Split</h3>
                      </div>
                      <div className="relative flex flex-col sm:flex-row items-center justify-around gap-6">
                        <DonutChart data={invoiceStatusSplit} centerLabel="Invoiced" />
                        <div className="grid grid-cols-1 gap-y-2.5">
                          {invoiceStatusSplit.map((d, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-center gap-2 group/legend">
                              <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-sm transition-transform duration-200 group-hover/legend:scale-125"
                                style={{ backgroundColor: d.color, boxShadow: `0 0 8px ${d.color}66` }} />
                              <span className="text-[11px] text-zinc-500 font-semibold truncate max-w-[110px]">{d.label}</span>
                              <span className="text-xs font-black text-zinc-900 ml-auto">₹{d.value.toLocaleString('en-IN')}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Invoices Table */}
                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><FileText size={16} className="text-emerald-600" /> All Invoices &amp; Credit Notes</h3>
                      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                        <div className="relative w-full sm:w-56">
                          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input value={invoiceSearch} onChange={e => setInvoiceSearch(e.target.value)} placeholder="Search invoice or guest..." className="fd-input pl-9 py-2 text-xs" />
                        </div>
                        <select value={invoiceStatusFilter} onChange={e => setInvoiceStatusFilter(e.target.value)} className="fd-input py-2 text-xs bg-white appearance-none cursor-pointer w-full sm:w-44">
                          <option value="All">All Statuses</option>
                          <option value="Paid">Paid</option>
                          <option value="Partial">Partial</option>
                          <option value="Overdue">Overdue</option>
                          <option value="Draft">Draft</option>
                          <option value="Issued">Issued</option>
                        </select>
                        <button onClick={() => setIsInvoiceModalOpen(true)} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 shrink-0">
                          <Plus size={13} /> Create Invoice
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                            <th className="p-4 font-bold">Invoice #</th>
                            <th className="p-4 font-bold">Bill To</th>
                            <th className="p-4 font-bold">Type</th>
                            <th className="p-4 font-bold">Due Date</th>
                            <th className="p-4 font-bold text-right">Amount</th>
                            <th className="p-4 font-bold text-right">Status</th>
                            <th className="p-4 font-bold text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {invoicesData.length === 0 && (<tr><td colSpan={7} className="p-8 text-center text-xs text-zinc-400">No invoices match your filters.</td></tr>)}
                          {invoicesData.map((inv, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="p-4 text-xs font-mono text-zinc-500">{inv.id}</td>
                              <td className="p-4 text-sm font-bold text-zinc-900">{inv.billTo}</td>
                              <td className="p-4"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">{inv.type}</span></td>
                              <td className="p-4 text-sm text-zinc-600">{inv.dueDate}</td>
                              <td className={`p-4 text-sm font-bold text-right ${inv.amount < 0 ? 'text-rose-500' : 'text-zinc-900'}`}>{inv.amount < 0 ? '-' : ''}₹{Math.abs(inv.amount).toLocaleString('en-IN')}</td>
                              <td className="p-4 text-right">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${inv.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                    : inv.status === 'Partial' ? 'bg-amber-50 text-amber-600 border-amber-200'
                                      : inv.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border-rose-200'
                                        : inv.status === 'Issued' ? 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                          : 'bg-zinc-100 text-zinc-500 border-zinc-200'
                                  }`}>
                                  {inv.status === 'Paid' ? <CheckCircle2 size={12} /> : inv.status === 'Overdue' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                                  {inv.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"><Download size={12} /> PDF</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: ACCOUNTS PAYABLE                         */}
              {/* ============================================ */}
              {activeTab === 'payables' && (
                <motion.div key="payables" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: 'Total Payables', value: `₹${totalPayables.toLocaleString('en-IN')}`, sub: `${allPayables.length} vendor bills`, icon: <Truck size={16} />, theme: 'indigo' },
                      { label: 'Due This Week', value: `₹${dueThisWeek.reduce((s, b) => s + b.amount, 0).toLocaleString('en-IN')}`, sub: `${dueThisWeek.length} bills scheduled`, icon: <CalendarClock size={16} />, theme: 'amber' },
                      { label: 'Overdue Payables', value: `₹${overduePayables.reduce((s, b) => s + b.amount, 0).toLocaleString('en-IN')}`, sub: `${overduePayables.length} bill${overduePayables.length === 1 ? '' : 's'} past due`, icon: <AlertTriangle size={16} />, theme: 'rose' },
                      { label: 'Active Vendors', value: new Set(allPayables.map(b => b.vendor)).size, sub: 'With open balances', icon: <Building2 size={16} />, theme: 'emerald' },
                    ].map((kpi, i) => {
                      const t = { rose: { iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30', glow: 'rgba(225,29,72,0.3)' }, ...themeMap }[kpi.theme];
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                          whileHover={{ y: -5, scale: 1.015 }} className="relative overflow-hidden bg-white rounded-[1.75rem] p-5 border border-zinc-200/60"
                          style={{ boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px ${t.glow}` }}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${t.iconBg}`}>{kpi.icon}</div>
                          <p className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1.5 truncate">{kpi.value}</p>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="relative overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(99,102,241,0.2)] border border-zinc-200/60">
                      <div className="absolute -top-14 -left-14 w-40 h-40 rounded-full bg-indigo-200/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center gap-2 mb-5">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/30"><Truck size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Outstanding by Vendor</h3>
                      </div>
                      <div className="relative"><BarRankChart data={vendorLedger.map(v => ({ label: v.vendor, value: v.outstanding, color: v.color }))} /></div>
                    </motion.div>

                    <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                      className="relative overflow-hidden bg-gradient-to-br from-white via-white to-amber-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(217,119,6,0.2)] border border-zinc-200/60">
                      <div className="absolute -top-14 -right-14 w-40 h-40 rounded-full bg-amber-200/20 blur-3xl pointer-events-none" />
                      <div className="relative flex items-center gap-2 mb-4">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/30"><CalendarClock size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Upcoming Payment Schedule</h3>
                      </div>
                      <div className="relative flex flex-col gap-3">
                        {[...allPayables].filter(b => b.status !== 'Paid').sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map((b, i) => (
                          <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}
                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-zinc-100">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-900 truncate">{b.vendor}</p>
                              <p className="text-[10px] text-zinc-400">{b.category} · Due {b.dueDate}</p>
                            </div>
                            <span className={`text-xs font-black shrink-0 ml-3 ${b.status === 'Overdue' ? 'text-rose-600' : 'text-zinc-900'}`}>₹{b.amount.toLocaleString('en-IN')}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  </div>

                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 flex flex-col lg:flex-row gap-3 lg:items-center justify-between bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Truck size={16} className="text-indigo-600" /> Vendor Bills</h3>
                      <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                        <div className="relative w-full sm:w-56">
                          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input value={payableSearch} onChange={e => setPayableSearch(e.target.value)} placeholder="Search vendor or bill..." className="fd-input pl-9 py-2 text-xs" />
                        </div>
                        <select value={payableStatusFilter} onChange={e => setPayableStatusFilter(e.target.value)} className="fd-input py-2 text-xs bg-white appearance-none cursor-pointer w-full sm:w-40">
                          <option value="All">All Statuses</option>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Overdue">Overdue</option>
                          <option value="Paid">Paid</option>
                        </select>
                        <button onClick={() => setIsBillModalOpen(true)} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-indigo-600 transition-colors flex items-center justify-center gap-2 shrink-0">
                          <Plus size={13} /> Add Vendor Bill
                        </button>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                            <th className="p-4 font-bold">Bill #</th>
                            <th className="p-4 font-bold">Vendor</th>
                            <th className="p-4 font-bold">Category</th>
                            <th className="p-4 font-bold">Due Date</th>
                            <th className="p-4 font-bold text-right">Amount</th>
                            <th className="p-4 font-bold text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {payablesData.length === 0 && (<tr><td colSpan={6} className="p-8 text-center text-xs text-zinc-400">No vendor bills match your filters.</td></tr>)}
                          {payablesData.map((b, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="p-4 text-xs font-mono text-zinc-500">{b.id}</td>
                              <td className="p-4 text-sm font-bold text-zinc-900">{b.vendor}</td>
                              <td className="p-4"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">{b.category}</span></td>
                              <td className="p-4 text-sm text-zinc-600">{b.dueDate}</td>
                              <td className="p-4 text-sm font-bold text-zinc-900 text-right">₹{b.amount.toLocaleString('en-IN')}</td>
                              <td className="p-4 text-right">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${b.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : b.status === 'Overdue' ? 'bg-rose-50 text-rose-600 border-rose-200' : 'bg-amber-50 text-amber-600 border-amber-200'
                                  }`}>
                                  {b.status === 'Paid' ? <CheckCircle2 size={12} /> : b.status === 'Overdue' ? <AlertTriangle size={12} /> : <Clock size={12} />}
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: FINANCIAL STATEMENTS                     */}
              {/* ============================================ */}
              {activeTab === 'statements' && (
                <motion.div key="statements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="flex items-center gap-2 bg-white rounded-2xl p-1.5 border border-zinc-200/60 w-fit">
                    {[
                      { key: 'pnl', label: 'Profit & Loss', icon: <TrendingUp size={13} /> },
                      { key: 'balance', label: 'Balance Sheet', icon: <Scale size={13} /> },
                      { key: 'cashflow', label: 'Cash Flow', icon: <ArrowRightLeft size={13} /> },
                    ].map(v => (
                      <button key={v.key} onClick={() => setStatementView(v.key)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${statementView === v.key ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20' : 'text-zinc-500 hover:bg-zinc-50'
                          }`}>
                        {v.icon} {v.label}
                      </button>
                    ))}
                  </div>

                  {statementView === 'pnl' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        <div className="bg-white rounded-[1.5rem] p-5 border border-zinc-200/60" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px rgba(5,150,105,0.2)' }}>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Total Revenue</p>
                          <p className="text-2xl font-black text-emerald-600">₹{totalRevenuePnl.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="bg-white rounded-[1.5rem] p-5 border border-zinc-200/60" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px rgba(225,29,72,0.2)' }}>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Total Expenses</p>
                          <p className="text-2xl font-black text-rose-600">₹{totalPnlExpenses.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="bg-white rounded-[1.5rem] p-5 border border-zinc-200/60" style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px rgba(79,70,229,0.2)' }}>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Net Profit</p>
                          <p className="text-2xl font-black text-zinc-900">₹{netProfit.toLocaleString('en-IN')} <span className="text-xs font-bold text-emerald-600">({((netProfit / totalRevenuePnl) * 100).toFixed(1)}% margin)</span></p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                          className="relative overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(5,150,105,0.2)] border border-zinc-200/60">
                          <div className="relative flex items-center gap-2 mb-4">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30"><BedDouble size={14} className="text-white" /></div>
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Revenue by Department</h3>
                          </div>
                          <div className="relative flex flex-col sm:flex-row items-center justify-around gap-6">
                            <DonutChart data={revenueByDept} centerLabel="Revenue" />
                            <div className="grid grid-cols-1 gap-y-2.5">
                              {revenueByDept.map((d, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0 ring-2 ring-white shadow-sm" style={{ backgroundColor: d.color }} />
                                  <span className="text-[11px] text-zinc-500 font-semibold truncate max-w-[120px]">{d.label}</span>
                                  <span className="text-xs font-black text-zinc-900 ml-auto">₹{d.value.toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>

                        <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                          className="relative overflow-hidden bg-gradient-to-br from-white via-white to-rose-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(225,29,72,0.2)] border border-zinc-200/60">
                          <div className="relative flex items-center gap-2 mb-5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-md shadow-rose-500/30"><Wallet size={14} className="text-white" /></div>
                            <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Expenses Breakdown</h3>
                          </div>
                          <div className="relative"><BarRankChart data={pnlExpenses} /></div>
                        </motion.div>
                      </div>
                    </div>
                  )}

                  {statementView === 'balance' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="fd-dealdeck-card rounded-[2rem] p-6">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-4"><Landmark size={16} className="text-emerald-600" /> Assets</h3>
                        <div className="divide-y divide-zinc-100">
                          {balanceSheet.assets.map((a, i) => (
                            <div key={i} className="flex items-center justify-between py-3">
                              <span className="text-sm text-zinc-600">{a.label}</span>
                              <span className="text-sm font-bold text-zinc-900">₹{a.value.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-4 mt-2 border-t-2 border-zinc-900">
                          <span className="text-sm font-black uppercase tracking-wider text-zinc-900">Total Assets</span>
                          <span className="text-lg font-black text-emerald-600">₹{totalAssets.toLocaleString('en-IN')}</span>
                        </div>
                      </div>

                      <div className="fd-dealdeck-card rounded-[2rem] p-6">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-4"><Scale size={16} className="text-indigo-600" /> Liabilities &amp; Equity</h3>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Liabilities</p>
                        <div className="divide-y divide-zinc-100 mb-3">
                          {balanceSheet.liabilities.map((l, i) => (
                            <div key={i} className="flex items-center justify-between py-3">
                              <span className="text-sm text-zinc-600">{l.label}</span>
                              <span className="text-sm font-bold text-zinc-900">₹{l.value.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-1">Equity</p>
                        <div className="divide-y divide-zinc-100">
                          {balanceSheet.equity.map((e, i) => (
                            <div key={i} className="flex items-center justify-between py-3">
                              <span className="text-sm text-zinc-600">{e.label}</span>
                              <span className="text-sm font-bold text-zinc-900">₹{e.value.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                        <div className="flex items-center justify-between pt-4 mt-2 border-t-2 border-zinc-900">
                          <span className="text-sm font-black uppercase tracking-wider text-zinc-900">Total Liabilities + Equity</span>
                          <span className="text-lg font-black text-indigo-600">₹{(totalLiabilities + totalEquity).toLocaleString('en-IN')}</span>
                        </div>
                        <div className={`mt-4 flex items-center gap-2 text-[11px] font-bold px-3 py-2 rounded-xl ${totalAssets === (totalLiabilities + totalEquity) ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                          <CheckCircle2 size={14} /> Books balance: Assets = Liabilities + Equity
                        </div>
                      </div>
                    </div>
                  )}

                  {statementView === 'cashflow' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                        {[
                          { label: 'Operating', value: cfOperating, theme: 'emerald' },
                          { label: 'Investing', value: cfInvesting, theme: 'rose' },
                          { label: 'Financing', value: cfFinancing, theme: 'amber' },
                          { label: 'Net Cash Flow', value: netCashFlow, theme: 'indigo' },
                        ].map((c, i) => {
                          const t = { rose: { iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30', glow: 'rgba(225,29,72,0.3)' }, ...themeMap }[c.theme];
                          return (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                              className="bg-white rounded-[1.5rem] p-5 border border-zinc-200/60" style={{ boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px ${t.glow}` }}>
                              <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">{c.label}</p>
                              <p className={`text-xl font-black ${c.value < 0 ? 'text-rose-600' : 'text-zinc-900'}`}>{c.value < 0 ? '-' : ''}₹{Math.abs(c.value).toLocaleString('en-IN')}</p>
                            </motion.div>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[
                          { label: 'Operating Activities', items: cashFlow.operating, subtotal: cfOperating, icon: <RefreshCw size={14} /> },
                          { label: 'Investing Activities', items: cashFlow.investing, subtotal: cfInvesting, icon: <Building2 size={14} /> },
                          { label: 'Financing Activities', items: cashFlow.financing, subtotal: cfFinancing, icon: <Landmark size={14} /> },
                        ].map((section, si) => (
                          <div key={si} className="fd-dealdeck-card rounded-[2rem] p-6">
                            <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-4">{section.icon} {section.label}</h3>
                            <div className="divide-y divide-zinc-100">
                              {section.items.map((it, i) => (
                                <div key={i} className="flex items-center justify-between py-2.5">
                                  <span className="text-xs text-zinc-600">{it.label}</span>
                                  <span className={`text-xs font-bold ${it.value < 0 ? 'text-rose-500' : 'text-zinc-900'}`}>{it.value < 0 ? '-' : '+'}₹{Math.abs(it.value).toLocaleString('en-IN')}</span>
                                </div>
                              ))}
                            </div>
                            <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-200">
                              <span className="text-xs font-black uppercase tracking-wider text-zinc-900">Subtotal</span>
                              <span className={`text-sm font-black ${section.subtotal < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{section.subtotal < 0 ? '-' : ''}₹{Math.abs(section.subtotal).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: BUDGETING & FORECASTING                  */}
              {/* ============================================ */}
              {activeTab === 'budgeting' && (
                <motion.div key="budgeting" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: 'Total Budget', value: `₹${totalBudget.toLocaleString('en-IN')}`, sub: 'Across 6 departments', icon: <Target size={16} />, theme: 'indigo' },
                      { label: 'Actual Spend', value: `₹${totalActual.toLocaleString('en-IN')}`, sub: 'Month to date', icon: <Wallet size={16} />, theme: 'sky' },
                      { label: 'Variance', value: `${overallVariancePct > 0 ? '+' : ''}${overallVariancePct}%`, sub: overallVariancePct > 0 ? 'Over budget' : 'Under budget', icon: overallVariancePct > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />, theme: overallVariancePct > 0 ? 'amber' : 'emerald' },
                      { label: 'Projected Year-End', value: `₹${forecastTrend[forecastTrend.length - 1].value.toLocaleString('en-IN')}`, sub: 'Forward revenue projection', icon: <TrendingUp size={16} />, theme: 'emerald' },
                    ].map((kpi, i) => {
                      const t = themeMap[kpi.theme];
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                          whileHover={{ y: -5, scale: 1.015 }} className="relative overflow-hidden bg-white rounded-[1.75rem] p-5 border border-zinc-200/60"
                          style={{ boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px ${t.glow}` }}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${t.iconBg}`}>{kpi.icon}</div>
                          <p className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1.5 truncate">{kpi.value}</p>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.div whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="relative overflow-hidden bg-gradient-to-br from-white via-white to-emerald-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(5,150,105,0.2)] border border-zinc-200/60">
                    <div className="relative flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/30"><TrendingUp size={14} className="text-white" /></div>
                        <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">6-Month Revenue Projection</h3>
                      </div>
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">Forecast</span>
                    </div>
                    <div className="relative"><RevenueTrendLine data={forecastTrend} /></div>
                  </motion.div>

                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden p-6">
                    <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider mb-5"><Percent size={16} className="text-indigo-600" /> Budget vs Actual by Department</h3>
                    <div className="flex flex-col gap-5">
                      {budgetByDept.map((d, i) => {
                        const variancePct = (((d.actual - d.budget) / d.budget) * 100).toFixed(1);
                        const over = d.actual > d.budget;
                        const maxVal = Math.max(d.budget, d.actual);
                        return (
                          <div key={i}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-bold text-zinc-700">{d.dept}</span>
                              <span className={`text-[11px] font-black ${over ? 'text-rose-600' : 'text-emerald-600'}`}>{over ? '+' : ''}{variancePct}% vs budget</span>
                            </div>
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold uppercase text-zinc-400 w-14 shrink-0">Budget</span>
                                <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${(d.budget / maxVal) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.05 }} className="h-full rounded-full bg-zinc-300" />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-500 w-24 text-right shrink-0">₹{d.budget.toLocaleString('en-IN')}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[9px] font-bold uppercase text-zinc-400 w-14 shrink-0">Actual</span>
                                <div className="flex-1 h-2 rounded-full bg-zinc-100 overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${(d.actual / maxVal) * 100}%` }} transition={{ duration: 0.8, delay: i * 0.05 + 0.1 }} className={`h-full rounded-full ${over ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                                </div>
                                <span className="text-[10px] font-bold text-zinc-900 w-24 text-right shrink-0">₹{d.actual.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: PAYROLL & STAFF COSTS                    */}
              {/* ============================================ */}
              {activeTab === 'payroll' && (
                <motion.div key="payroll" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: 'Total Payroll', value: `₹${totalGrossPayroll.toLocaleString('en-IN')}`, sub: `${totalHeadcount} staff across 6 departments`, icon: <Users size={16} />, theme: 'indigo' },
                      { label: 'PF Liability', value: `₹${totalPfLiability.toLocaleString('en-IN')}`, sub: 'Employer + employee contribution', icon: <ShieldCheck size={16} />, theme: 'emerald' },
                      { label: 'ESI Liability', value: `₹${totalEsiLiability.toLocaleString('en-IN')}`, sub: 'Due with this cycle', icon: <FileText size={16} />, theme: 'amber' },
                      { label: 'Avg Cost / Employee', value: `₹${avgCostPerEmployee.toLocaleString('en-IN')}`, sub: 'Gross, per month', icon: <UserCheck size={16} />, theme: 'sky' },
                    ].map((kpi, i) => {
                      const t = themeMap[kpi.theme];
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                          whileHover={{ y: -5, scale: 1.015 }} className="relative overflow-hidden bg-white rounded-[1.75rem] p-5 border border-zinc-200/60"
                          style={{ boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px ${t.glow}` }}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${t.iconBg}`}>{kpi.icon}</div>
                          <p className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1.5 truncate">{kpi.value}</p>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <motion.div whileHover={{ y: -6, scale: 1.01 }} transition={{ type: "spring", stiffness: 350, damping: 22 }}
                    className="relative overflow-hidden bg-gradient-to-br from-white via-white to-indigo-50/40 rounded-[2rem] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_12px_28px_-18px_rgba(99,102,241,0.2)] border border-zinc-200/60">
                    <div className="relative flex items-center gap-2 mb-5">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-indigo-500/30"><Users size={14} className="text-white" /></div>
                      <h3 className="text-sm font-black text-zinc-900 uppercase tracking-wider">Labor Cost by Department</h3>
                    </div>
                    <div className="relative"><BarRankChart data={payrollByDept.map(d => ({ label: d.label, value: d.gross, color: d.color, icon: <Users size={13} /> }))} /></div>
                  </motion.div>

                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 flex justify-between items-center bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Users size={16} className="text-indigo-600" /> Payroll by Department</h3>
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Ties into Admin Dashboard · Staff Hub</span>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                            <th className="p-4 font-bold">Department</th>
                            <th className="p-4 font-bold text-right">Headcount</th>
                            <th className="p-4 font-bold text-right">Gross Salary</th>
                            <th className="p-4 font-bold text-right">PF</th>
                            <th className="p-4 font-bold text-right">ESI</th>
                            <th className="p-4 font-bold text-right">Net Payable</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {payrollByDept.map((d, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="p-4 text-sm font-bold text-zinc-900"><span className="inline-flex items-center gap-2"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} /> {d.label}</span></td>
                              <td className="p-4 text-sm text-zinc-600 text-right">{d.headcount}</td>
                              <td className="p-4 text-sm font-bold text-zinc-900 text-right">₹{d.gross.toLocaleString('en-IN')}</td>
                              <td className="p-4 text-sm text-zinc-600 text-right">₹{d.pf.toLocaleString('en-IN')}</td>
                              <td className="p-4 text-sm text-zinc-600 text-right">₹{d.esi.toLocaleString('en-IN')}</td>
                              <td className="p-4 text-sm font-black text-emerald-600 text-right">₹{(d.gross - d.pf - d.esi).toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-zinc-900">
                            <td className="p-4 text-xs font-black uppercase text-zinc-900">Total</td>
                            <td className="p-4 text-sm font-black text-zinc-900 text-right">{totalHeadcount}</td>
                            <td className="p-4 text-sm font-black text-zinc-900 text-right">₹{totalGrossPayroll.toLocaleString('en-IN')}</td>
                            <td className="p-4 text-sm font-black text-zinc-900 text-right">₹{totalPfLiability.toLocaleString('en-IN')}</td>
                            <td className="p-4 text-sm font-black text-zinc-900 text-right">₹{totalEsiLiability.toLocaleString('en-IN')}</td>
                            <td className="p-4 text-sm font-black text-emerald-600 text-right">₹{(totalGrossPayroll - totalPfLiability - totalEsiLiability).toLocaleString('en-IN')}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: GUEST DEPOSITS & ADVANCES                */}
              {/* ============================================ */}
              {activeTab === 'deposits' && (
                <motion.div key="deposits" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: 'Held in Escrow', value: `₹${totalHeldEscrow.toLocaleString('en-IN')}`, sub: 'Security deposits & advances', icon: <LockKeyhole size={16} />, theme: 'emerald' },
                      { label: 'Advance Bookings', value: `₹${totalAdvanceBookings.toLocaleString('en-IN')}`, sub: 'Held against future stays/events', icon: <CalendarClock size={16} />, theme: 'indigo' },
                      { label: 'Refunds Pending', value: refundsPendingCount, sub: 'Security deposits to release', icon: <Undo2 size={16} />, theme: 'amber' },
                      { label: 'Forfeited', value: `₹${totalForfeited.toLocaleString('en-IN')}`, sub: 'No-shows & cancellations', icon: <AlertTriangle size={16} />, theme: 'rose' },
                    ].map((kpi, i) => {
                      const t = { rose: { iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30', glow: 'rgba(225,29,72,0.3)' }, ...themeMap }[kpi.theme];
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                          whileHover={{ y: -5, scale: 1.015 }} className="relative overflow-hidden bg-white rounded-[1.75rem] p-5 border border-zinc-200/60"
                          style={{ boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px ${t.glow}` }}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${t.iconBg}`}>{kpi.icon}</div>
                          <p className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1.5 truncate">{kpi.value}</p>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><LockKeyhole size={16} className="text-emerald-600" /> Deposits &amp; Advances Ledger</h3>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-56">
                          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input value={depositSearch} onChange={e => setDepositSearch(e.target.value)} placeholder="Search guest or reference..." className="fd-input pl-9 py-2 text-xs" />
                        </div>
                        <select value={depositStatusFilter} onChange={e => setDepositStatusFilter(e.target.value)} className="fd-input py-2 text-xs bg-white appearance-none cursor-pointer w-full sm:w-44">
                          <option value="All">All Statuses</option>
                          <option value="Held">Held</option>
                          <option value="Refunded">Refunded</option>
                          <option value="Applied to Bill">Applied to Bill</option>
                          <option value="Forfeited">Forfeited</option>
                        </select>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                            <th className="p-4 font-bold">Ref ID</th>
                            <th className="p-4 font-bold">Guest / Entity</th>
                            <th className="p-4 font-bold">Booking Ref</th>
                            <th className="p-4 font-bold">Type</th>
                            <th className="p-4 font-bold">Date</th>
                            <th className="p-4 font-bold text-right">Amount</th>
                            <th className="p-4 font-bold text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {depositsData.length === 0 && (<tr><td colSpan={7} className="p-8 text-center text-xs text-zinc-400">No deposits match your filters.</td></tr>)}
                          {depositsData.map((d, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="p-4 text-xs font-mono text-zinc-500">{d.id}</td>
                              <td className="p-4 text-sm font-bold text-zinc-900">{d.guest}</td>
                              <td className="p-4 text-xs font-mono text-zinc-500">{d.ref}</td>
                              <td className="p-4"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">{d.type}</span></td>
                              <td className="p-4 text-sm text-zinc-600">{d.date}</td>
                              <td className="p-4 text-sm font-bold text-zinc-900 text-right">₹{d.amount.toLocaleString('en-IN')}</td>
                              <td className="p-4 text-right">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${d.status === 'Held' ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                                    : d.status === 'Refunded' ? 'bg-sky-50 text-sky-600 border-sky-200'
                                      : d.status === 'Forfeited' ? 'bg-rose-50 text-rose-600 border-rose-200'
                                        : 'bg-indigo-50 text-indigo-600 border-indigo-200'
                                  }`}>
                                  {d.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: AUDIT TRAIL / APPROVAL LOG                */}
              {/* ============================================ */}
              {activeTab === 'audit' && (
                <motion.div key="audit" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {[
                      { label: 'Entries Today', value: allAuditLog.filter(a => a.time.startsWith('Today')).length, sub: 'Posted, edited or approved', icon: <History size={16} />, theme: 'indigo' },
                      { label: 'Pending Approvals', value: pendingApprovalsCount, sub: 'Awaiting review or escalated', icon: <Clock size={16} />, theme: 'amber' },
                      { label: 'High-Value Flagged', value: flaggedHighValueCount, sub: 'Escalated to auditor', icon: <ShieldAlert size={16} />, theme: 'rose' },
                      { label: 'Active Approvers', value: new Set(allAuditLog.map(a => a.user)).size, sub: 'In the approval chain', icon: <UserCheck size={16} />, theme: 'emerald' },
                    ].map((kpi, i) => {
                      const t = { rose: { iconBg: 'bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30', glow: 'rgba(225,29,72,0.3)' }, ...themeMap }[kpi.theme];
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, type: 'spring', stiffness: 300, damping: 24 }}
                          whileHover={{ y: -5, scale: 1.015 }} className="relative overflow-hidden bg-white rounded-[1.75rem] p-5 border border-zinc-200/60"
                          style={{ boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px ${t.glow}` }}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${t.iconBg}`}>{kpi.icon}</div>
                          <p className="text-2xl font-black text-zinc-900 tracking-tight leading-none mb-1.5 truncate">{kpi.value}</p>
                          <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 leading-none">{kpi.label}</p>
                          <p className="text-[10px] text-zinc-400 mt-1">{kpi.sub}</p>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 flex flex-col sm:flex-row gap-3 sm:items-center justify-between bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><History size={16} className="text-indigo-600" /> Approval Log</h3>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-56">
                          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                          <input value={auditSearch} onChange={e => setAuditSearch(e.target.value)} placeholder="Search user or entry..." className="fd-input pl-9 py-2 text-xs" />
                        </div>
                        <select value={auditActionFilter} onChange={e => setAuditActionFilter(e.target.value)} className="fd-input py-2 text-xs bg-white appearance-none cursor-pointer w-full sm:w-48">
                          <option value="All">All Actions</option>
                          {auditActionTypes.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="divide-y divide-zinc-100">
                      {auditLog.length === 0 && (<div className="p-8 text-center text-xs text-zinc-400">No audit entries match your filters.</div>)}
                      {auditLog.map((a, idx) => (
                        <div key={idx} className="p-5 flex items-start gap-4 hover:bg-zinc-50/60 transition-colors">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.approval === 'Escalated' ? 'bg-rose-100 text-rose-600' : a.approval === 'Pending Review' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'
                            }`}>
                            {a.approval === 'Escalated' ? <ShieldAlert size={16} /> : a.approval === 'Pending Review' ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-zinc-900">{a.user}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-600">{a.action}</span>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">{a.target}</p>
                            <p className="text-[10px] text-zinc-400 mt-1">{a.time}</p>
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border shrink-0 ${a.approval === 'Escalated' ? 'bg-rose-50 text-rose-600 border-rose-200'
                              : a.approval === 'Pending Review' ? 'bg-amber-50 text-amber-600 border-amber-200'
                                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
                            }`}>{a.approval}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: BANK ACCOUNTS                            */}
              {/* ============================================ */}
              {activeTab === 'bank' && (
                <motion.div key="bank" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[
                      { label: 'Total Bank Balance', value: `₹${totalBankBalance.toLocaleString('en-IN')}`, sub: `Across ${bankAccounts.length} accounts`, icon: <Landmark size={16} />, theme: 'emerald' },
                      { label: 'Accounts', value: bankAccounts.length, sub: 'Current, savings, escrow & payroll', icon: <Building2 size={16} />, theme: 'indigo' },
                      { label: 'Pending Transfers', value: pendingTransfersCount, sub: 'Awaiting settlement', icon: <ArrowRightLeft size={16} />, theme: 'amber' },
                    ].map((kpi, i) => {
                      const t = themeMap[kpi.theme];
                      return (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                          className="bg-white rounded-[1.5rem] p-5 border border-zinc-200/60 flex items-center gap-4" style={{ boxShadow: `0 1px 2px rgba(0,0,0,0.04), 0 14px 30px -18px ${t.glow}` }}>
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${t.iconBg}`}>{kpi.icon}</div>
                          <div>
                            <p className="text-2xl font-black text-zinc-900 leading-none">{kpi.value}</p>
                            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 mt-1">{kpi.label}</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {bankAccounts.map((acc, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -5, scale: 1.015 }}
                        className="relative overflow-hidden rounded-[1.75rem] p-5 text-white"
                        style={{ background: `linear-gradient(135deg, ${acc.color}, ${acc.color}cc)`, boxShadow: `0 14px 30px -14px ${acc.color}88` }}>
                        <div className="absolute -bottom-8 -right-8 w-28 h-28 rounded-full bg-white/10 blur-2xl pointer-events-none" />
                        <div className="relative flex items-center justify-between mb-6">
                          <Landmark size={20} className="opacity-90" />
                          <span className="text-[9px] font-bold uppercase tracking-widest opacity-80">{acc.type}</span>
                        </div>
                        <p className="relative text-xl font-black tracking-tight mb-1">₹{acc.balance.toLocaleString('en-IN')}</p>
                        <p className="relative text-xs font-semibold opacity-80">{acc.name}</p>
                        <p className="relative text-[10px] font-mono opacity-60 mt-0.5">{acc.number}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                      <div className="p-5 border-b border-zinc-150 flex justify-between items-center bg-white/40">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><ArrowRightLeft size={16} className="text-emerald-600" /> Recent Transfers</h3>
                        <button onClick={() => setIsTransferModalOpen(true)} className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-600 transition-colors flex items-center gap-2">
                          <Plus size={13} /> New Transfer
                        </button>
                      </div>
                      <div className="divide-y divide-zinc-100">
                        {recentTransfers.map((t, idx) => (
                          <div key={idx} className="p-4 flex items-center justify-between hover:bg-zinc-50/60 transition-colors">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-900 truncate">{t.from} <ArrowRightLeft size={10} className="inline mx-1 text-zinc-400" /> {t.to}</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">{t.id} · {t.date}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-sm font-black text-zinc-900">₹{t.amount.toLocaleString('en-IN')}</p>
                              <span className={`text-[9px] font-bold uppercase tracking-wider ${t.status === 'Completed' ? 'text-emerald-600' : 'text-amber-600'}`}>{t.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                      <div className="p-5 border-b border-zinc-150 bg-white/40">
                        <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><CalendarClock size={16} className="text-indigo-600" /> Standing Instructions</h3>
                      </div>
                      <div className="divide-y divide-zinc-100">
                        {standingInstructions.map((s, idx) => (
                          <div key={idx} className="p-4 flex items-center justify-between hover:bg-zinc-50/60 transition-colors">
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-zinc-900 truncate">{s.label}</p>
                              <p className="text-[10px] text-zinc-400 mt-0.5">{s.frequency} · {s.account}</p>
                            </div>
                            <p className="text-sm font-black text-zinc-900 shrink-0 ml-3">₹{s.amount.toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ============================================ */}
              {/* TAB: CUSTOM REPORTS                           */}
              {/* ============================================ */}
              {activeTab === 'customReports' && (
                <motion.div key="customReports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {reportTemplates.map((r, i) => (
                      <motion.div key={r.key} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                        whileHover={{ y: -4 }}
                        className="fd-dealdeck-card rounded-[1.75rem] p-6 flex flex-col gap-4">
                        <div className="flex items-start justify-between">
                          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">{r.icon}</div>
                          <span className="text-[10px] text-zinc-400 font-semibold">Last generated {r.lastGenerated}</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-black text-zinc-900">{r.label}</h3>
                          <p className="text-xs text-zinc-500 mt-1">{r.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <button
                            onClick={() => handleGenerateReport(r.key)}
                            disabled={generatingReportKey === r.key}
                            className="flex-1 bg-zinc-900 text-white px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            {generatingReportKey === r.key ? <Loader2 size={13} className="animate-spin" /> : <FileBarChart2 size={13} />}
                            {generatingReportKey === r.key ? 'Generating...' : 'Generate'}
                          </button>
                          <button className="p-2.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-500 transition-all"><FileDown size={15} /></button>
                          <button className="p-2.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-500 transition-all"><Printer size={15} /></button>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <div className="fd-dealdeck-card rounded-[2rem] overflow-hidden">
                    <div className="p-5 border-b border-zinc-150 flex justify-between items-center bg-white/40">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><FileSpreadsheet size={16} className="text-emerald-600" /> Recently Generated</h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-zinc-50/50">
                            <th className="p-4 font-bold">Report</th>
                            <th className="p-4 font-bold">Generated On</th>
                            <th className="p-4 font-bold">Format</th>
                            <th className="p-4 font-bold text-right">Download</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {generatedReportsHistory.map((r, idx) => (
                            <tr key={idx} className="hover:bg-zinc-50/60 transition-colors">
                              <td className="p-4 text-sm font-bold text-zinc-900">{r.name}</td>
                              <td className="p-4 text-sm text-zinc-600">{r.generatedOn}</td>
                              <td className="p-4"><span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-zinc-100 text-zinc-600">{r.format}</span></td>
                              <td className="p-4 text-right">
                                <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1"><Download size={12} /> Download</button>
                              </td>
                            </tr>
                          ))}
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
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
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
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
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
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
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
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
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
      </AnimatePresence>
    </div>
  );
}

const modalVariants = {
  hidden: { opacity: 0, scale: 0.92, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', damping: 28, stiffness: 350 } },
  exit: { opacity: 0, scale: 0.92, y: 20, transition: { duration: 0.2 } }
};