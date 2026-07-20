import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, FileText, CreditCard, 
  ArrowUpRight, ArrowDownRight, Download, 
  CheckCircle2, Clock, Building2, Zap, X
} from 'lucide-react';

const API_BASE = 'http://localhost:3000';

const COMMON_STYLES = `
  .fd-app-bg {
    background: linear-gradient(135deg, #DDDDDD 100%) !important;
    background-attachment: fixed;
  }
  .fd-card-style {
    position: relative;
    isolation: isolate;
    background:
      radial-gradient(130% 160% at 100% 0%, rgba(99, 102, 241, 0.08) 0%, rgba(99, 102, 241, 0) 65%),
      radial-gradient(120% 100% at 0% 100%, rgba(99, 102, 241, 0.04) 0%, rgba(99, 102, 241, 0) 55%),
      #f7f5e9ff !important;
    border: 1px solid rgba(228, 228, 231, 0.6) !important;
    border-radius: 1.25rem !important;
    box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.05), 0 2px 6px -2px rgba(0, 0, 0, 0.02) !important;
    transition: border-color 0.35s ease, box-shadow 0.35s ease, transform 0.35s ease;
  }
  .fd-card-style:hover {
    border-color: rgba(99, 102, 241, 0.5) !important;
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.1), 0 4px 12px -4px rgba(0, 0, 0, 0.04) !important;
  }
  .fd-card-glow {
    animation: fd-card-glow 6s ease-in-out infinite;
  }
  @keyframes fd-card-glow {
    0%, 100% {
      box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.05), 0 2px 6px -2px rgba(0, 0, 0, 0.02);
      border-color: rgba(228, 228, 231, 0.6);
    }
    50% {
      box-shadow: 0 16px 28px -10px rgba(0, 0, 0, 0.09), 0 6px 16px -4px rgba(0, 0, 0, 0.04);
      border-color: rgba(99, 102, 241, 0.35);
    }
  }
`;

export default function FinanceDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

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

  useEffect(() => {
    // Dynamically apply background to App wrapper and body
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

  // Simulated financial data
  const metrics = [
    { label: "Today's Revenue", value: "₹1,42,500", trend: "+12.5%", isPositive: true },
    { label: "Pending Receivables", value: "₹34,200", trend: "-2.4%", isPositive: false },
    { label: "Tax Collected (GST)", value: "₹25,650", trend: "+12.5%", isPositive: true },
    { label: "Cash Register", value: "₹18,400", trend: "Balanced", isPositive: true }
  ];

  const recentTransactions = [
    { id: 'TXN-8821', guest: 'Aryan Singh', room: '204', amount: '₹12,500', method: 'Credit Card', status: 'Settled', date: 'Today, 10:45 AM' },
    { id: 'TXN-8822', guest: 'Corporate Account', room: 'Multiple', amount: '₹45,000', method: 'Bank Transfer', status: 'Pending Recon', date: 'Today, 09:30 AM' },
    { id: 'TXN-8823', guest: 'Rohan Desai', room: '108', amount: '₹4,200', method: 'Cash', status: 'Settled', date: 'Yesterday, 08:15 PM' },
  ];

  return (
    <div className="min-h-[calc(100vh-6rem)] relative fd-app-bg flex flex-col md:flex-row">
      <style>{COMMON_STYLES}</style>
      
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-white/70 backdrop-blur-md border-r border-zinc-200/80 p-6 flex flex-col gap-2 relative z-10">
        <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 px-2">Accounts & Finance</h2>
        
        <button 
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-orange-50 text-orange-600' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
        >
          <Building2 size={18} /> Financial Overview
        </button>
        <button 
          onClick={() => setActiveTab('reconciliation')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'reconciliation' ? 'bg-orange-50 text-orange-600' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
        >
          <CreditCard size={18} /> Reconciliation
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTab === 'reports' ? 'bg-orange-50 text-orange-600' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'}`}
        >
          <FileText size={18} /> Tax & Ledgers
        </button>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto relative z-10 flex flex-col gap-6">
        
        {/* BROADCAST BANNER */}
        <AnimatePresence>
          {broadcasts.filter(b => !dismissedBroadcasts.includes(b.id) && (!b.expires_at || new Date(b.expires_at) > new Date())).map((broadcast) => (
            <motion.div
              key={broadcast.id}
              initial={{ opacity: 0, y: -20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative overflow-hidden rounded-[1.5rem] bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 p-[2px] shadow-lg shadow-rose-500/20 w-full mb-4 min-h-[72px] shrink-0"
            >
              <div className="absolute inset-0 bg-white/20 opacity-30" />
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
          
          {/* TAB 1: FINANCIAL OVERVIEW */}
          {activeTab === 'overview' && (
            <motion.div 
              key="overview"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="max-w-6xl mx-auto space-y-8"
            >
              <div className="flex justify-between items-end mb-2">
                <div>
                  <h1 className="text-2xl font-serif font-bold text-zinc-900 tracking-tight">Financial Overview</h1>
                  <p className="text-sm text-zinc-500 mt-1">Real-time ledger and revenue metrics.</p>
                </div>
                <button className="bg-zinc-900 text-white px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-orange-500 transition-colors flex items-center gap-2 shadow-sm">
                  <Download size={14} /> Export Day End
                </button>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metrics.map((metric, idx) => (
                  <div 
                    key={idx} 
                    style={{ animationDelay: `${idx * 150}ms` }}
                    className="fd-card-style fd-card-glow p-5 flex flex-col"
                  >
                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{metric.label}</p>
                    <p className="text-2xl font-bold text-zinc-900 mb-3">{metric.value}</p>
                    <div className={`flex items-center gap-1 text-xs font-bold ${metric.isPositive ? 'text-emerald-600' : 'text-red-500'}`}>
                      {metric.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                      <span>{metric.trend} vs yesterday</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* General Ledger Snippet */}
              <div className="fd-card-style fd-card-glow overflow-hidden">
                <div className="p-5 border-b border-zinc-150 flex justify-between items-center bg-white/30 backdrop-blur-xs">
                  <h3 className="font-bold text-zinc-900 flex items-center gap-2"><DollarSign size={18} className="text-orange-500"/> Recent Transactions</h3>
                  <button className="text-xs font-semibold text-orange-600 hover:text-orange-700">View Full Ledger</button>
                </div>
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-150 text-[10px] uppercase tracking-wider text-zinc-400 bg-white/20">
                      <th className="p-4 font-bold">Ref ID</th>
                      <th className="p-4 font-bold">Guest / Entity</th>
                      <th className="p-4 font-bold">Method</th>
                      <th className="p-4 font-bold">Date & Time</th>
                      <th className="p-4 font-bold text-right">Amount</th>
                      <th className="p-4 font-bold text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200/50">
                    {recentTransactions.map((txn, idx) => (
                      <tr key={idx} className="hover:bg-white/35 transition-colors">
                        <td className="p-4 text-xs font-mono text-zinc-500">{txn.id}</td>
                        <td className="p-4 text-sm font-bold text-zinc-900">{txn.guest} <span className="block text-xs font-normal text-zinc-400">Room {txn.room}</span></td>
                        <td className="p-4 text-sm text-zinc-600">{txn.method}</td>
                        <td className="p-4 text-sm text-zinc-600">{txn.date}</td>
                        <td className="p-4 text-sm font-bold text-zinc-900 text-right">{txn.amount}</td>
                        <td className="p-4 text-right">
                           <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border inline-flex items-center gap-1 ${
                             txn.status === 'Settled' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-orange-50 text-orange-600 border-orange-200'
                           }`}>
                             {txn.status === 'Settled' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                             {txn.status}
                           </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 2 & 3 Placeholders (Reconciliation & Reports) */}
          {activeTab !== 'overview' && (
            <motion.div 
              key="others"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="max-w-6xl mx-auto text-center py-20"
            >
              <FileText size={48} className="mx-auto mb-4 text-zinc-200" />
              <h2 className="text-xl font-bold text-zinc-900 mb-2">Module Loading</h2>
              <p className="text-zinc-500 text-sm max-w-md mx-auto">
                Detailed {activeTab} interfaces will populate here, including direct payment gateway integrations and automated tax report generation.
              </p>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}