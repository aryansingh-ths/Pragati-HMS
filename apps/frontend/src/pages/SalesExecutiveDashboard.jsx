import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast, { Toaster } from 'react-hot-toast';
import QuotationsTab from '../components/sales/QuotationsTab';
import RatesTab from '../components/sales/RatesTab';
import CalendarTab from '../components/sales/CalendarTab';
import CompetitorIntelTab from '../components/sales/CompetitorIntelTab';
import LeaderboardTab from '../components/sales/LeaderboardTab';
import ReportsTab from '../components/sales/ReportsTab';
import AccountsTab from '../components/sales/AccountsTab';
import TemplatesTab from '../components/sales/TemplatesTab';
import AvailabilityTab from '../components/sales/AvailabilityTab';
import {
  Target, TrendingUp, Briefcase, Search, Plus, X, Loader2,
  CheckCircle2, Clock, PhoneCall, Mail, CheckSquare, ListTodo, 
  Activity, Globe, User, Building2, ArrowRight, LogOut,
  RefreshCw, Zap, MessageSquare, CalendarIcon, MoreVertical,
  ChevronRight, Ghost, FileText, Send, Trophy, AlertCircle,
  Bed, PartyPopper, Plane, BarChart, Building, Tag, Calendar, Eye
} from 'lucide-react';

// =============================================
// CENTRALIZED API CONFIG & CONSTANTS
// =============================================
const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';

const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}`
});

const STAGES = ['New', 'Contacted', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
const STAGE_COLORS = { 
  'New': '#94a3b8', 
  'Contacted': '#0ea5e9', 
  'Proposal Sent': '#f59e0b', 
  'Negotiation': '#8b5cf6', 
  'Won': '#10b981', 
  'Lost': '#f43f5e' 
};

// Formatter for Indian Rupees
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

// =============================================
// MAIN COMPONENT - EXECUTIVE LEAD CRM
// =============================================
export default function SalesExecutiveDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  
  // ─── Filter & Search States ───────────────────────────
  const [leadSearch, setLeadSearch] = useState('');
  const [filterSource, setFilterSource] = useState('All');
  const [filterProductType, setFilterProductType] = useState('All');
  const [sortOrder, setSortOrder] = useState('desc'); 

  // ─── Interaction & Modal States ───────────────────────────────
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddLeadModal, setShowAddLeadModal] = useState(false);
  const [newLeadForm, setNewLeadForm] = useState({
    company: '', deal_name: '', value: '', stage: 'New', source: 'Hotel Website', product_type: 'Rooms',
    contact_name: '', contact_email: '', contact_phone: '', next_follow_up: ''
  });
  
  // Feature states
  const [showLostReasonModal, setShowLostReasonModal] = useState(false);
  const [pendingLostLeadId, setPendingLostLeadId] = useState(null);
  const [lostReasonText, setLostReasonText] = useState('');
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [taskView, setTaskView] = useState('list'); // 'list' | 'agenda'
  const [visibleLimits, setVisibleLimits] = useState(
    STAGES.reduce((acc, stage) => ({ ...acc, [stage]: 20 }), {})
  );
  
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityForm, setActivityForm] = useState({ activity_type: 'Call', notes: '' });

  // ─── Data Fetching (React Query) ────────────────────────
  const queryClient = useQueryClient();

  const { data: currentUserData, isLoading: isLoadingUser } = useQuery({
    queryKey: ['sales', 'me'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/sales/me`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch user');
      const data = await res.json();
      return data.data;
    },
    initialData: { initials: 'PP', name: 'Priya Patel', role: 'Sales Executive', target: 1500000, achieved: 850000, baseIncentiveRate: 0.025 }
  });
  const currentUser = { ...currentUserData, initials: currentUserData?.name?.substring(0,2).toUpperCase() || 'PP' };

  const { data: myLeads = [], isLoading: isLoadingLeads, isError: isErrorLeads } = useQuery({
    queryKey: ['sales', 'leads'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = await res.json();
      return data.data;
    }
  });

  const { data: myTasks = [], isLoading: isLoadingTasks, isError: isErrorTasks } = useQuery({
    queryKey: ['sales', 'tasks'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/sales/tasks`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      return data.data;
    }
  });

  const isLoading = isLoadingUser || isLoadingLeads || isLoadingTasks;

  const addLeadMutation = useMutation({
    mutationFn: async (newLead) => {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ...newLead, value: parseFloat(newLead.value) || 0 })
      });
      if (!res.ok) throw new Error('Failed to add lead');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Lead added successfully!');
      setNewLeadForm({ company: '', deal_name: '', value: '', stage: 'New', source: 'Hotel Website', product_type: 'Rooms', contact_name: '', contact_email: '', contact_phone: '' });
      setShowAddLeadModal(false);
      queryClient.invalidateQueries({ queryKey: ['sales', 'leads'] });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    }
  });

  const handleAddLead = (e) => {
    e.preventDefault();
    addLeadMutation.mutate(newLeadForm);
  };

  const { data: leadActivities = [], isLoading: isLoadingActivities } = useQuery({
    queryKey: ['sales', 'leads', selectedLead?.id, 'activities'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${selectedLead.id}/activities`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch activities');
      const data = await res.json();
      return data.data;
    },
    enabled: !!selectedLead
  });

  const addActivityMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${selectedLead.id}/activities`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload)
      });
      if (!res.ok) throw new Error('Failed to log activity');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Activity logged successfully!');
      setActivityForm({ activity_type: 'Call', notes: '' });
      setShowActivityModal(false);
      queryClient.invalidateQueries({ queryKey: ['sales', 'leads', selectedLead.id, 'activities'] });
    },
    onError: (error) => toast.error(error.message)
  });
  
  const handleLogActivity = (e) => {
    e.preventDefault();
    addActivityMutation.mutate(activityForm);
  };

  // ─── Drag and Drop Handlers ────────────────────────────
  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.effectAllowed = "move";
    setTimeout(() => {
      e.target.classList.add('opacity-50');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-50');
    setDraggedLeadId(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const moveLeadMutation = useMutation({
    mutationFn: async ({ leadId, targetStage, lost_reason }) => {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ stage: targetStage, lost_reason })
      });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onMutate: async ({ leadId, targetStage }) => {
      await queryClient.cancelQueries({ queryKey: ['sales', 'leads'] });
      const previousLeads = queryClient.getQueryData(['sales', 'leads']);
      
      queryClient.setQueryData(['sales', 'leads'], old => 
        old ? old.map(l => l.id === leadId ? { ...l, stage: targetStage } : l) : []
      );
      toast.success(`Moved to ${targetStage}`);
      
      return { previousLeads };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['sales', 'leads'], context.previousLeads);
      toast.error('Failed to move lead. Reverting...');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', 'leads'] });
    }
  });

  const handleDrop = (e, targetStage) => {
    e.preventDefault();
    if (!draggedLeadId) return;

    const leadToMove = myLeads.find(l => l.id === draggedLeadId);
    if (leadToMove?.stage === targetStage) return;

    if (targetStage === 'Lost') {
      setPendingLostLeadId(draggedLeadId);
      setShowLostReasonModal(true);
      return;
    }

    moveLeadMutation.mutate({ leadId: draggedLeadId, targetStage });
  };

  const handleLostReasonSubmit = () => {
    if (!pendingLostLeadId) return;
    moveLeadMutation.mutate({ leadId: pendingLostLeadId, targetStage: 'Lost', lost_reason: lostReasonText });
    setShowLostReasonModal(false);
    setPendingLostLeadId(null);
    setLostReasonText('');
  };

  const toggleLeadSelection = (leadId) => {
    setSelectedLeadIds(prev => prev.includes(leadId) ? prev.filter(id => id !== leadId) : [...prev, leadId]);
  };

  const handleBulkMove = (stage) => {
    if (stage === 'Lost') {
      toast.error('Bulk move to Lost is not supported due to required reasons.');
      return;
    }
    selectedLeadIds.forEach(id => {
      moveLeadMutation.mutate({ leadId: id, targetStage: stage });
    });
    setSelectedLeadIds([]);
    setBulkSelectMode(false);
  };

  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }) => {
      const res = await fetch(`${API_BASE_URL}/api/sales/tasks/${taskId}/status`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ status })
      });
      if (!res.ok) throw new Error('Update failed');
      return res.json();
    },
    onMutate: async ({ taskId, status }) => {
      await queryClient.cancelQueries({ queryKey: ['sales', 'tasks'] });
      const previousTasks = queryClient.getQueryData(['sales', 'tasks']);
      
      queryClient.setQueryData(['sales', 'tasks'], old => 
        old ? old.map(t => t.id === taskId ? { ...t, status } : t) : []
      );
      
      return { previousTasks };
    },
    onError: (err, variables, context) => {
      queryClient.setQueryData(['sales', 'tasks'], context.previousTasks);
      toast.error('Failed to update task. Reverting...');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', 'tasks'] });
    }
  });

  const updateTaskStatus = (taskId, newStatus) => {
    updateTaskMutation.mutate({ taskId, status: newStatus });
  };

  const openAddLeadModal = (defaultStage = 'New') => {
      setNewLeadForm(prev => ({ ...prev, stage: defaultStage }));
      setShowAddLeadModal(true);
  };

  // ─── Derived Data ──────────────────────────────────────
  const filteredLeads = myLeads
    .filter(l => (l.company + l.deal_name + l.contact_name).toLowerCase().includes(leadSearch.toLowerCase()))
    .filter(l => filterSource === 'All' ? true : l.source === filterSource)
    .filter(l => filterProductType === 'All' ? true : l.product_type === filterProductType)
    .sort((a, b) => sortOrder === 'desc' ? b.value - a.value : a.value - b.value);

  const activePipelineValue = myLeads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost').reduce((s, l) => s + Number(l.value), 0);
  const pendingTasksCount = myTasks.filter(t => t.status !== 'Completed').length;

  const navGroups = [
    { heading: 'Dashboard', items: [{ key: 'overview', label: 'Daily Briefing', icon: <TrendingUp size={15} /> }, { key: 'availability', label: 'Availability', icon: <CheckCircle2 size={15} /> }, { key: 'reports', label: 'Reports & Analytics', icon: <BarChart size={15} /> }] },
    { heading: 'My CRM', items: [{ key: 'pipeline', label: 'Pipeline Board', icon: <Target size={15} /> }, { key: 'tasks', label: 'Tasks & Calls', icon: <ListTodo size={15} /> }, { key: 'accounts', label: 'Client Accounts', icon: <Building size={15} /> }] },
    { heading: 'Sales Tools', items: [{ key: 'quotes', label: 'Quotations', icon: <FileText size={15} /> }, { key: 'rates', label: 'Rate Cards', icon: <Tag size={15} /> }, { key: 'calendar', label: 'Group Calendar', icon: <Calendar size={15} /> }, { key: 'intel', label: 'Competitor Intel', icon: <Eye size={15} /> }, { key: 'leaderboard', label: 'Leaderboard', icon: <Trophy size={15} /> }, { key: 'templates', label: 'Templates', icon: <MessageSquare size={15} /> }] }
  ];
  const navItems = navGroups.flatMap(g => g.items);

  return (
    <div className="min-h-[calc(100vh-6rem)] relative bg-[#F8F1E3] p-6 flex flex-col lg:flex-row gap-6">
      <Toaster position="top-right" toastOptions={{ className: 'text-sm font-bold shadow-lg rounded-2xl' }} />
      <style>{`
        .crm-scrollbar { scrollbar-width: thin; scrollbar-color: rgba(161,161,170,0.4) transparent; }
        .crm-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .crm-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .crm-scrollbar::-webkit-scrollbar-thumb { background: rgba(161, 161, 170, 0.45); border-radius: 999px; }
        .crm-input { width: 100%; padding: 0.75rem 1.1rem; background: #F4F7FE; border: 1px solid #E2E8F0; border-radius: 1rem; font-size: 0.875rem; font-weight: 500; outline: none; transition: border-color 0.2s; }
        .crm-input:focus { border-color: #D4A373; box-shadow: 0 0 0 3px rgba(212,163,115,0.2); }
      `}</style>

      {/* LEFT SIDEBAR */}
      <div className="w-full lg:w-72 shrink-0 rounded-[2rem] bg-white border border-zinc-200/80 shadow-[14px_17px_40px_4px_rgba(112,144,176,0.08)] p-6 flex flex-col gap-6 lg:fixed lg:top-[7.5rem] lg:left-6 z-30 lg:h-[calc(100vh-7.8rem)]">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-xs shrink-0">
            <Briefcase size={19} className="text-[#D4A373]" />
          </div>
          <div>
            <h1 className="font-serif font-black text-[23px] text-zinc-600 leading-none">CRM</h1>
            <span className="text-[9px] font-bold text-[#D4A373] uppercase tracking-widest mt-1 block">Sales Executive</span>
          </div>
        </div>

        <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto pr-1">
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
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0 lg:ml-[21rem]">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-serif font-black text-zinc-900 capitalize">
              {navItems.find(i => i.key === activeTab)?.label || 'Dashboard'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">Manage your active deals, log calls, and hit your monthly quota.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button onClick={() => queryClient.invalidateQueries({ queryKey: ['sales'] })} className={`p-2.5 rounded-xl border border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-500 transition-all ${isLoading ? 'animate-spin' : ''}`}>
              <RefreshCw size={15} />
            </button>
            <button onClick={() => openAddLeadModal('New')} className="bg-zinc-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#D4A373] transition-colors flex items-center gap-2 shadow-sm">
              <Plus size={14} /> New Lead
            </button>

            <motion.button whileHover={{ y: -2 }} whileTap={{ scale: 0.95 }} onClick={() => { localStorage.clear(); window.location.href = '/login'; }} className="group flex items-center gap-3 bg-white pl-3 pr-4 py-1.5 rounded-2xl border border-zinc-200/60 shadow-xs hover:shadow-md hover:border-rose-200 hover:bg-rose-50 transition-all cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">{currentUser.initials}</div>
              <div className="hidden sm:block text-left leading-none pr-1">
                <span className="text-xs font-bold text-zinc-900 group-hover:text-rose-600 block">{currentUser.name}</span>
              </div>
              <LogOut size={16} className="text-zinc-400 group-hover:text-rose-500 ml-1" />
            </motion.button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-96 flex flex-col items-center justify-center text-zinc-400">
              <Loader2 className="animate-spin mb-2" size={32} />
              <p className="text-xs font-medium uppercase tracking-wider">Loading your CRM...</p>
            </motion.div>
          ) : (
            <div className="space-y-6">
              
              {(isErrorLeads || isErrorTasks) && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <AlertCircle size={18} />
                    <p className="text-sm font-bold">Failed to load CRM data. Please try again.</p>
                  </div>
                  <button onClick={() => queryClient.invalidateQueries()} className="text-xs font-bold uppercase tracking-wider hover:underline">Retry</button>
                </div>
              )}

              {/* =========================================
                  TAB: DAILY BRIEFING (OVERVIEW)
              ========================================= */}
              {activeTab === 'overview' && (
                <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                  
                  {/* Top KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Pending Tasks', value: pendingTasksCount, sub: 'Needs attention today', icon: <AlertCircle size={16} />, theme: 'rose' },
                      { label: 'Active Pipeline', value: formatCurrency(activePipelineValue), sub: 'Across open deals', icon: <Activity size={16} />, theme: 'amber' },
                      { label: 'Target Achieved', value: formatCurrency(currentUser.achieved), sub: `${Math.round((currentUser.achieved / currentUser.target) * 100)}% to goal`, icon: <TrendingUp size={16} />, theme: 'emerald' },
                      { label: 'Est. Incentive', value: formatCurrency(currentUser.achieved * currentUser.baseIncentiveRate), sub: 'Earned this month', icon: <Trophy size={16} />, theme: 'indigo' },
                    ].map((kpi, i) => {
                      const themes = {
                        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
                        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
                        amber: { bg: 'bg-amber-50', text: 'text-amber-600' },
                        rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
                      };
                      const t = themes[kpi.theme];
                      
                      return (
                        <div key={i} className="bg-white rounded-[2rem] p-5 border border-zinc-200/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center mb-3 ${t.bg} ${t.text}`}>
                            {kpi.icon}
                          </div>
                          <p className="text-xl font-black text-zinc-900 tracking-tight leading-none mb-1">{kpi.value}</p>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mb-0.5">{kpi.label}</p>
                          <p className="text-[9px] text-zinc-400">{kpi.sub}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Tasks & Pipeline Split */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Tasks Snippet */}
                    <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
                            <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><ListTodo size={16} className="text-[#D4A373]" /> Priority Tasks</h3>
                            <button onClick={() => setActiveTab('tasks')} className="text-[10px] font-bold text-indigo-600 hover:underline">View All</button>
                        </div>
                        <div className="flex flex-col gap-3">
                          {myTasks.filter(t => t.status !== 'Completed').slice(0,4).map((task) => {
                             const isOverdue = new Date(task.deadline) < new Date();
                             return (
                               <div key={task.id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                                  <div>
                                      <p className="text-xs font-bold text-zinc-900">{task.title}</p>
                                      <p className="text-[10px] text-zinc-500">{task.client} • <span className={isOverdue ? 'text-rose-500' : 'text-amber-500'}>{isOverdue ? 'Overdue' : 'Due Today'}</span></p>
                                  </div>
                                  <button onClick={() => updateTaskStatus(task.id, 'Completed')} className="w-6 h-6 rounded-full border border-zinc-300 hover:bg-emerald-500 hover:border-emerald-500 hover:text-white flex items-center justify-center transition-colors text-transparent">
                                      <CheckCircle2 size={14} />
                                  </button>
                               </div>
                             );
                          })}
                          {pendingTasksCount === 0 && <p className="text-xs text-zinc-400 italic">No pending tasks for today!</p>}
                        </div>
                    </div>

                    {/* Funnel Snippet */}
                    <div className="bg-white rounded-[2rem] p-6 border border-zinc-200/80 shadow-sm">
                       <div className="flex items-center gap-2 mb-6 border-b border-zinc-100 pb-4">
                          <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Activity size={16} className="text-sky-500"/> Pipeline Conversion</h3>
                       </div>
                       <div className="flex flex-col gap-4">
                          {STAGES.filter(s => s !== 'Lost').map((stage, idx) => {
                            const count = myLeads.filter(l => l.stage === stage).length;
                            const maxCount = Math.max(...STAGES.map(s => myLeads.filter(l => l.stage === s).length), 1);
                            const widthPct = (count / maxCount) * 100;
                            return (
                              <div key={stage} className="flex items-center gap-4 group">
                                <div className="w-24 text-right">
                                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">{stage}</span>
                                </div>
                                <div className="flex-1 h-5 bg-zinc-100 rounded-r-lg overflow-hidden flex items-center">
                                  <motion.div 
                                    initial={{ width: 0 }} animate={{ width: `${widthPct}%` }} transition={{ duration: 1, delay: idx * 0.1 }}
                                    className="h-full rounded-r-lg flex items-center justify-end pr-2 transition-colors"
                                    style={{ backgroundColor: STAGE_COLORS[stage] }}
                                  >
                                    <span className="text-[9px] font-black text-white mix-blend-overlay">{count}</span>
                                  </motion.div>
                                </div>
                              </div>
                            )
                          })}
                       </div>
                    </div>
                  </div>

                  {/* Leads Going Cold Snippet */}
                  <div className="grid grid-cols-1 mt-6">
                    <div className="bg-white border border-zinc-200/60 rounded-[2rem] p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-4 pb-2 border-b border-zinc-100">
                            <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><Ghost size={16} className="text-zinc-400" /> Leads Going Cold</h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {myLeads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost' && new Date(l.updated_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length === 0 ? (
                            <p className="text-xs text-zinc-400 italic col-span-full">No cold leads! Great follow-up.</p>
                          ) : (
                            myLeads.filter(l => l.stage !== 'Won' && l.stage !== 'Lost' && new Date(l.updated_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).slice(0, 3).map(lead => (
                              <div key={lead.id} className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl flex flex-col justify-between hover:border-[#D4A373] transition-colors cursor-pointer" onClick={() => setSelectedLead(lead)}>
                                <div>
                                  <p className="font-bold text-zinc-900 text-sm">{lead.company}</p>
                                  <p className="text-[10px] text-zinc-500 mb-2">Stage: {lead.stage}</p>
                                </div>
                                <div className="flex justify-between items-end">
                                  <p className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded">Inactive 7+ days</p>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                    </div>
                  </div>

                </motion.div>
              )}

              {/* =========================================
                  TAB: DRAG & DROP PIPELINE BOARD 
              ========================================= */}
              {activeTab === 'pipeline' && (
                <motion.div key="pipeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col h-[calc(100vh-14rem)]">
                  
                  {/* Enhanced Filter & Search Bar */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6 shrink-0 w-full items-center justify-between">
                    <div className="relative w-full sm:w-96">
                      <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input 
                        value={leadSearch} 
                        onChange={e => setLeadSearch(e.target.value)} 
                        placeholder="Search company, deal, or contact..." 
                        className="crm-input pl-9 py-2.5 text-xs bg-white shadow-sm" 
                      />
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                      <select 
                        value={filterSource} 
                        onChange={(e) => setFilterSource(e.target.value)}
                        className="crm-input py-2.5 text-xs bg-white shadow-sm font-bold text-zinc-600"
                      >
                        <option value="All">All Sources</option>
                        <option value="Hotel Website">Hotel Website</option>
                        <option value="Corporate Tie-up">Corporate Tie-up</option>
                        <option value="Different Websites">OTA / Third Party (B2B)</option>
                        <option value="Call Enquiry">Call Enquiry</option>
                        <option value="Walk In Enquiry">Walk In Enquiry</option>
                      </select>

                      <select 
                        value={filterProductType} 
                        onChange={(e) => setFilterProductType(e.target.value)}
                        className="crm-input py-2.5 text-xs bg-white shadow-sm font-bold text-zinc-600"
                      >
                        <option value="All">All Products</option>
                        <option value="Rooms">Rooms</option>
                        <option value="Event Spaces">Event Spaces</option>
                        <option value="Travel Packages">Travel Packages</option>
                      </select>

                      <button 
                        onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                        className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-600 shadow-sm flex items-center gap-2"
                      >
                        <Activity size={14} />
                        Sort: {sortOrder === 'desc' ? 'High to Low' : 'Low to High'}
                      </button>

                      <button 
                        onClick={() => {
                          setBulkSelectMode(!bulkSelectMode);
                          if (bulkSelectMode) setSelectedLeadIds([]);
                        }}
                        className={`px-4 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 ${bulkSelectMode ? 'bg-[#D4A373] text-white' : 'border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-600'}`}
                      >
                        <CheckSquare size={14} />
                        Bulk Select
                      </button>
                    </div>
                  </div>

                  {/* Bulk Action Bar */}
                  <AnimatePresence>
                    {bulkSelectMode && selectedLeadIds.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="mb-4 bg-zinc-900 text-white p-3 rounded-2xl flex items-center justify-between">
                        <span className="text-sm font-bold ml-2">{selectedLeadIds.length} Leads Selected</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-zinc-400 mr-2">Move to:</span>
                          {STAGES.filter(s => s !== 'Lost').map(stage => (
                            <button key={stage} onClick={() => handleBulkMove(stage)} className="bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                              {stage}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Kanban Board Container */}
                  <div className="flex gap-4 overflow-x-auto overflow-y-hidden pb-4 crm-scrollbar flex-1 items-start snap-x">
                    {STAGES.map(stage => {
                      const stageLeads = filteredLeads.filter(l => l.stage === stage);
                      const stageValue = stageLeads.reduce((sum, l) => sum + parseFloat(l.value || 0), 0);

                      return (
                        <div 
                          key={stage} 
                          className={`w-[300px] shrink-0 flex flex-col h-full snap-start rounded-2xl transition-colors border-2 ${draggedLeadId && stage !== myLeads.find(l=>l.id===draggedLeadId)?.stage ? 'border-dashed border-zinc-300/80 bg-zinc-50/50' : 'border-transparent'}`}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, stage)}
                        >
                          {/* Column Header */}
                          <div className="flex items-center justify-between px-2 mb-3 shrink-0">
                            <div className="flex items-center gap-2">
                              <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ background: STAGE_COLORS[stage] }} />
                              <span className="text-sm font-black text-zinc-800 uppercase tracking-wider">{stage}</span>
                              <span className="text-[10px] font-bold text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded-full shadow-sm">{stageLeads.length}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-zinc-400">{formatCurrency(stageValue)}</span>
                                <button onClick={() => openAddLeadModal(stage)} className="w-5 h-5 rounded-md bg-zinc-200 hover:bg-zinc-300 flex items-center justify-center text-zinc-600 transition-colors" title={`Add to ${stage}`}>
                                    <Plus size={12}/>
                                </button>
                            </div>
                          </div>

                          {/* Column Cards Container */}
                          <div className="flex flex-col gap-3 overflow-y-auto crm-scrollbar pr-2 flex-1 pb-4">
                            {stageLeads.slice(0, visibleLimits[stage]).map((lead) => {
                                const isUrgent = lead.last_contact && lead.last_contact.includes('days');

                                return (
                                <motion.div 
                                    key={lead.id} 
                                    layoutId={lead.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, lead.id)}
                                    onDragEnd={handleDragEnd}
                                    onClick={() => bulkSelectMode ? toggleLeadSelection(lead.id) : setSelectedLead(lead)}
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className={`bg-white rounded-2xl p-4 border shadow-sm relative overflow-hidden flex flex-col shrink-0 transition-all group cursor-grab active:cursor-grabbing ${bulkSelectMode && selectedLeadIds.includes(lead.id) ? 'border-[#D4A373] ring-1 ring-[#D4A373]' : 'border-zinc-200/80 hover:border-zinc-300 hover:shadow-md'}`}
                                >
                                    <div className="absolute top-0 left-0 w-1.5 h-full" style={{ background: STAGE_COLORS[stage] }} />
                                    
                                    <div className="pl-3">
                                        <div className="flex items-start justify-between mb-1">
                                            <p className="text-sm font-bold text-zinc-900 leading-snug truncate pr-2">{lead.company}</p>
                                            {bulkSelectMode && (
                                              <div className="shrink-0 flex items-center justify-center">
                                                {selectedLeadIds.includes(lead.id) ? <CheckCircle2 size={16} className="text-[#D4A373]"/> : <div className="w-4 h-4 border-2 border-zinc-300 rounded-md"/>}
                                              </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1.5 mb-2">
                                            {lead.product_type === 'Rooms' && <span className="bg-blue-50 text-blue-600 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><Bed size={10}/> Rooms</span>}
                                            {lead.product_type === 'Event Spaces' && <span className="bg-purple-50 text-purple-600 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><PartyPopper size={10}/> Events</span>}
                                            {lead.product_type === 'Travel Packages' && <span className="bg-emerald-50 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1"><Plane size={10}/> Travel</span>}
                                        </div>
                                        <p className="text-[11px] text-zinc-500 font-semibold mb-3">{lead.deal_name} <span className="mx-1">•</span> <span className="text-[#D4A373] font-black tracking-wide">{formatCurrency(lead.value)}</span></p>

                                        {/* Inline Actions */}
                                        <div className="flex items-center gap-2 mb-4">
                                            <button onClick={(e) => e.stopPropagation()} className="flex-1 py-1.5 px-2 bg-zinc-50 hover:bg-sky-50 border border-zinc-100 hover:border-sky-200 rounded-lg text-zinc-600 hover:text-sky-700 flex items-center justify-center gap-1.5 transition-colors text-[10px] font-bold">
                                                <PhoneCall size={12}/> Call
                                            </button>
                                            <button onClick={(e) => e.stopPropagation()} className="flex-1 py-1.5 px-2 bg-zinc-50 hover:bg-amber-50 border border-zinc-100 hover:border-amber-200 rounded-lg text-zinc-600 hover:text-amber-700 flex items-center justify-center gap-1.5 transition-colors text-[10px] font-bold">
                                                <Mail size={12}/> Email
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-zinc-100/80">
                                            <span className={`text-[9px] font-bold uppercase flex items-center gap-1 ${isUrgent ? 'text-rose-500' : 'text-zinc-400'}`}>
                                            <Clock size={10}/> {lead.last_contact || 'Just Now'}
                                            </span>
                                            <div className="flex items-center gap-1">
                                                <User size={10} className="text-zinc-400"/>
                                                <span className="text-[9px] font-bold text-zinc-500 truncate max-w-[80px]">{lead.contact_name}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                              )
                            })}
                            {stageLeads.length === 0 && (
                              <div className="rounded-[1.5rem] border-2 border-dashed border-zinc-200/60 p-6 flex flex-col items-center justify-center text-center opacity-70 mt-2">
                                <Ghost size={24} className="text-zinc-300 mb-2"/>
                                <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Drop Leads Here</span>
                              </div>
                            )}
                            {stageLeads.length > visibleLimits[stage] && (
                              <button 
                                onClick={() => setVisibleLimits(prev => ({ ...prev, [stage]: prev[stage] + 20 }))} 
                                className="w-full py-2 mt-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-colors border border-zinc-200"
                              >
                                Load More ({stageLeads.length - visibleLimits[stage]} hidden)
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* =========================================
                  TAB: MY TASKS & CALLS 
              ========================================= */}
              {activeTab === 'tasks' && (
                <motion.div key="tasks" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="max-w-4xl mx-auto space-y-6">
                  <div className="bg-white border border-zinc-200/60 rounded-[2rem] overflow-hidden p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="flex items-center justify-between mb-6 border-b border-zinc-100 pb-4">
                      <h3 className="font-bold text-zinc-900 flex items-center gap-2 text-sm uppercase tracking-wider"><ListTodo size={16} className="text-[#D4A373]" /> Task Management</h3>
                      <div className="flex gap-2">
                        <button onClick={() => setTaskView('list')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${taskView === 'list' ? 'bg-[#D4A373] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>List</button>
                        <button onClick={() => setTaskView('agenda')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${taskView === 'agenda' ? 'bg-[#D4A373] text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}>Agenda</button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      {myTasks.length === 0 && <div className="text-center text-zinc-400 text-xs py-8">You're all caught up!</div>}
                      
                      {taskView === 'agenda' ? (
                        <div className="space-y-6">
                          {Object.entries(myTasks.reduce((acc, task) => {
                            const date = new Date(task.deadline).toLocaleDateString();
                            if (!acc[date]) acc[date] = [];
                            acc[date].push(task);
                            return acc;
                          }, {})).map(([date, dateTasks]) => (
                            <div key={date}>
                              <h4 className="font-bold text-zinc-800 mb-3">{date}</h4>
                              <div className="space-y-3">
                                {dateTasks.map(task => (
                                  <div key={task.id} className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold">{task.title}</span>
                                      {task.recurring_rule && <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded w-max mt-1">Recurring: {task.recurring_rule}</span>}
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-200 text-zinc-700'}`}>{task.status}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        myTasks.map((task, i) => {
                        const isCall = task.type === 'Call';
                        const isEmail = task.type === 'Email';
                        const isOverdue = new Date(task.deadline) < new Date() && task.status !== 'Completed';

                        return (
                          <motion.div key={task.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                            className={`border rounded-[1.25rem] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                              isOverdue ? 'bg-rose-50 border-rose-200' : 'bg-zinc-50 border-zinc-100 hover:border-zinc-300'
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                                isCall ? 'bg-amber-100 text-amber-600' : isEmail ? 'bg-sky-100 text-sky-600' : 'bg-indigo-100 text-indigo-600'
                              }`}>
                                {isCall ? <PhoneCall size={18}/> : isEmail ? <Mail size={18}/> : <FileText size={18}/>}
                              </div>
                              <div>
                                <p className={`text-sm font-bold text-zinc-900 mb-1 ${task.status === 'Completed' ? 'line-through opacity-50' : ''}`}>{task.title}</p>
                                <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold">
                                  <span className="text-zinc-500 bg-white border border-zinc-200 px-2 py-0.5 rounded flex items-center gap-1"><Building2 size={10}/> {task.client}</span>
                                  {isOverdue && (
                                    <span className="text-rose-600 bg-rose-100 px-2 py-0.5 rounded flex items-center gap-1">
                                      <AlertCircle size={10}/> Overdue
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                               <select
                                value={task.status}
                                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                className={`text-[10px] font-bold uppercase tracking-wider border-none rounded-lg py-1.5 px-3 cursor-pointer outline-none shadow-sm ${
                                  task.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' : 
                                  task.status === 'In Progress' ? 'bg-amber-100 text-amber-700' : 'bg-white text-zinc-600 border border-zinc-200'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                          </motion.div>
                        )
                      }))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'reports' && (
                <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                  <ReportsTab />
                </motion.div>
              )}
              {activeTab === 'accounts' && (
                <motion.div key="accounts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                  <AccountsTab leads={myLeads} />
                </motion.div>
              )}
              {activeTab === 'quotes' && (
                <motion.div key="quotes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                  <QuotationsTab leads={myLeads} />
                </motion.div>
              )}
              {activeTab === 'rates' && (
                <motion.div key="rates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                  <RatesTab />
                </motion.div>
              )}
              {activeTab === 'calendar' && (
                <motion.div key="calendar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                  <CalendarTab />
                </motion.div>
              )}
              {activeTab === 'intel' && (
                <motion.div key="intel" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                  <CompetitorIntelTab />
                </motion.div>
              )}
              {activeTab === 'leaderboard' && (
                <motion.div key="leaderboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                  <LeaderboardTab />
                </motion.div>
              )}
              {activeTab === 'templates' && (
                <motion.div key="templates" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                  <TemplatesTab />
                </motion.div>
              )}
              {activeTab === 'availability' && (
                <motion.div key="availability" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="h-full">
                  <AvailabilityTab />
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4"
            onClick={() => setShowAddLeadModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-lg bg-white rounded-3xl p-7 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6 border-b border-zinc-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#D4A373]/10 text-[#D4A373] flex items-center justify-center">
                    <Target size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-serif font-black text-zinc-900">Add New Lead</h2>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-400">Expand your pipeline</p>
                  </div>
                </div>
                <button onClick={() => setShowAddLeadModal(false)} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-all">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleAddLead} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Company Name</label>
                    <input
                      type="text" required placeholder="e.g. Reliance Retreat"
                      value={newLeadForm.company}
                      onChange={e => setNewLeadForm({ ...newLeadForm, company: e.target.value })}
                      className="crm-input"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Initial Stage</label>
                    <select
                      value={newLeadForm.stage}
                      onChange={e => setNewLeadForm({ ...newLeadForm, stage: e.target.value })}
                      className="crm-input cursor-pointer bg-zinc-50 border-zinc-300 font-bold"
                    >
                      {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Est. Revenue (₹)</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
                        <input
                        type="number" required min="0" placeholder="120000"
                        value={newLeadForm.value}
                        onChange={e => setNewLeadForm({ ...newLeadForm, value: e.target.value })}
                        className="crm-input pl-7"
                        />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Deal Summary</label>
                    <input
                      type="text" required placeholder="e.g. 10 Rooms"
                      value={newLeadForm.deal_name}
                      onChange={e => setNewLeadForm({ ...newLeadForm, deal_name: e.target.value })}
                      className="crm-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Lead Source</label>
                    <select
                      value={newLeadForm.source}
                      onChange={e => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                      className="crm-input cursor-pointer bg-zinc-50 border-zinc-300 font-bold"
                    >
                      <option value="Hotel Website">Hotel Website</option>
                      <option value="Corporate Tie-up">Corporate Tie-up</option>
                      <option value="Different Websites">OTA / Third Party (B2B)</option>
                      <option value="Call Enquiry">Call Enquiry</option>
                      <option value="Walk In Enquiry">Walk In Enquiry</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Product Type</label>
                    <select
                      value={newLeadForm.product_type}
                      onChange={e => setNewLeadForm({ ...newLeadForm, product_type: e.target.value })}
                      className="crm-input cursor-pointer bg-zinc-50 border-zinc-300 font-bold"
                    >
                      <option value="Rooms">Rooms</option>
                      <option value="Event Spaces">Event Spaces</option>
                      <option value="Travel Packages">Travel Packages</option>
                    </select>
                  </div>
                </div>

                <hr className="border-zinc-100 my-4" />
                <h3 className="text-[10px] font-black uppercase tracking-wider text-zinc-400 mb-3">Primary Contact</h3>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Contact Name</label>
                  <input
                    type="text" required placeholder="Name"
                    value={newLeadForm.contact_name}
                    onChange={e => setNewLeadForm({ ...newLeadForm, contact_name: e.target.value })}
                    className="crm-input"
                  />
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={addLeadMutation.isPending}
                  className="w-full mt-6 bg-zinc-900 hover:bg-[#D4A373] text-white font-bold text-sm py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {addLeadMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                  {addLeadMutation.isPending ? 'Saving...' : 'Add Lead to Board'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}

        {/* =============================================
            LEAD DETAILS SIDE PANEL
        ============================================= */}
        {selectedLead && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-zinc-900/20 backdrop-blur-sm"
              onClick={() => setSelectedLead(null)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 right-0 z-50 w-full max-w-md h-full bg-white shadow-2xl border-l border-zinc-200 p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-black text-zinc-900">{selectedLead.company}</h2>
                <button onClick={() => setSelectedLead(null)} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
                  <X size={16} className="text-zinc-500" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div className="p-4 bg-[#F8F1E3] rounded-2xl border border-[#D4A373]/30">
                  <p className="text-[10px] font-bold uppercase text-[#D4A373] tracking-wider">Deal Value</p>
                  <p className="text-3xl font-black text-zinc-900">{formatCurrency(selectedLead.value)}</p>
                  <p className="text-sm font-semibold text-zinc-600 mt-1">{selectedLead.deal_name}</p>
                </div>

                <div>
                  <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-3">Contact Info</h3>
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-3">
                    <div className="flex items-center gap-3 text-sm font-semibold text-zinc-700">
                      <User size={16} className="text-zinc-400" /> {selectedLead.contact_name}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-zinc-700">
                      <Mail size={16} className="text-zinc-400" /> {selectedLead.contact_email || 'No Email Provided'}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-zinc-700">
                      <PhoneCall size={16} className="text-zinc-400" /> {selectedLead.contact_phone || 'No Phone Provided'}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-semibold text-zinc-700 mt-2 pt-2 border-t border-zinc-200">
                      <Clock size={16} className="text-[#D4A373]" /> Next Follow-up: {selectedLead.next_follow_up ? new Date(selectedLead.next_follow_up).toLocaleDateString() : 'Not scheduled'}
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-3">Attachments</h3>
                  <div className="border-2 border-dashed border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center text-zinc-400 hover:border-[#D4A373] hover:text-[#D4A373] transition-colors cursor-pointer bg-zinc-50">
                    <Plus size={20} className="mb-1" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Upload File</span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between p-2 bg-zinc-50 rounded-lg border border-zinc-100">
                      <div className="flex items-center gap-2">
                        <FileText size={14} className="text-zinc-400" />
                        <span className="text-xs font-semibold text-zinc-700">initial_proposal.pdf</span>
                      </div>
                      <span className="text-[9px] text-zinc-400">1.2 MB</span>
                    </div>
                  </div>
                </div>
                
                <button onClick={() => setShowActivityModal(true)} className="w-full py-3 bg-zinc-900 hover:bg-[#D4A373] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md">
                  <MessageSquare size={16} /> Log an Activity
                </button>

                <div className="mt-6">
                  <h3 className="text-xs font-bold uppercase text-zinc-400 tracking-wider mb-3">Activity History</h3>
                  <div className="space-y-3">
                    {isLoadingActivities ? (
                       <div className="flex justify-center p-4"><Loader2 className="animate-spin text-zinc-400" size={20} /></div>
                    ) : leadActivities.length === 0 ? (
                       <p className="text-xs text-zinc-500 italic text-center p-4 bg-zinc-50 rounded-xl">No activities logged yet.</p>
                    ) : (
                       leadActivities.map(activity => (
                         <div key={activity.id} className="bg-zinc-50 p-3 rounded-xl border border-zinc-100 flex flex-col gap-1">
                           <div className="flex items-center justify-between">
                             <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                               activity.activity_type === 'Call' ? 'bg-amber-100 text-amber-700' :
                               activity.activity_type === 'Email' ? 'bg-sky-100 text-sky-700' : 'bg-purple-100 text-purple-700'
                             }`}>
                               {activity.activity_type}
                             </span>
                             <span className="text-[9px] text-zinc-400 font-bold">{new Date(activity.created_at).toLocaleString()}</span>
                           </div>
                           <p className="text-sm font-medium text-zinc-700 mt-1 whitespace-pre-wrap">{activity.notes}</p>
                           <p className="text-[10px] text-zinc-400 mt-1">By: {activity.user_name}</p>
                         </div>
                       ))
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* =============================================
          LOG ACTIVITY MODAL
      ============================================= */}
      <AnimatePresence>
        {showActivityModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-zinc-900/40 backdrop-blur-sm p-4"
            onClick={() => setShowActivityModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-sm bg-white rounded-3xl p-7 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-black text-zinc-900">Log Activity</h2>
                <button onClick={() => setShowActivityModal(false)} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
                  <X size={16} className="text-zinc-500" />
                </button>
              </div>
              <form onSubmit={handleLogActivity} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Activity Type</label>
                  <select
                    value={activityForm.activity_type}
                    onChange={e => setActivityForm({ ...activityForm, activity_type: e.target.value })}
                    className="crm-input bg-zinc-50 border-zinc-300 font-bold"
                  >
                    <option value="Call">Call</option>
                    <option value="Email">Email</option>
                    <option value="Meeting">Meeting</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Notes</label>
                  <textarea
                    required rows="4" placeholder="What happened?"
                    value={activityForm.notes}
                    onChange={e => setActivityForm({ ...activityForm, notes: e.target.value })}
                    className="crm-input resize-none"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  type="submit" disabled={addActivityMutation.isPending}
                  className="w-full bg-zinc-900 hover:bg-[#D4A373] text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {addActivityMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Save Activity
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =============================================
          LOST REASON MODAL
      ============================================= */}
      <AnimatePresence>
        {showLostReasonModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] shadow-2xl p-8 max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
                  <AlertCircle size={20} className="text-rose-500" />
                  Reason for Loss
                </h3>
                <button onClick={() => { setShowLostReasonModal(false); setPendingLostLeadId(null); }} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors">
                  <X size={16} className="text-zinc-500" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-zinc-500 tracking-wider mb-1.5">Why was this deal lost?</label>
                  <textarea
                    required rows="4" placeholder="e.g. Price too high, chose competitor..."
                    value={lostReasonText}
                    onChange={e => setLostReasonText(e.target.value)}
                    className="crm-input resize-none"
                  />
                </div>
                <motion.button
                  onClick={handleLostReasonSubmit}
                  whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  disabled={moveLeadMutation.isPending || !lostReasonText.trim()}
                  className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                >
                  {moveLeadMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Confirm Lost
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}