import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, Users, DollarSign, Activity, Plus, 
  MapPin, LogIn, ChevronDown, ShieldCheck, 
  Loader2, X, RefreshCw, Trash2, Globe, Command, ArrowRight, UserCog
} from 'lucide-react';

const API_BASE = 'http://localhost:3000';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] rounded-3xl overflow-hidden ${className}`}>
    {children}
  </div>
);

const StatCard = ({ icon: Icon, label, value, colorClass, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: 'easeOut' }}
    className="bg-white/80 backdrop-blur-md p-6 rounded-3xl border border-white/60 shadow-sm flex items-center gap-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${colorClass} opacity-10 rounded-full blur-3xl group-hover:opacity-20 transition-opacity`} />
    <div className={`p-4 rounded-2xl bg-gradient-to-br ${colorClass} text-white shadow-lg`}>
      <Icon size={24} className="drop-shadow-sm" />
    </div>
    <div className="z-10">
      <p className="text-sm text-zinc-500 font-semibold tracking-wide uppercase">{label}</p>
      <h3 className="text-3xl font-black text-zinc-900 mt-1 tracking-tight">{value}</h3>
    </div>
  </motion.div>
);

export default function PortfolioOverview() {
  const navigate = useNavigate();

  // ─── Data States ───────────────────────────────────────────
  const [stats, setStats] = useState({ hotelsCount: 0, occupancyRate: 0, totalRevenue: 0, staffCount: 0 });
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  
  // ─── UI States ─────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview | properties | administrators
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ─── Modal States ──────────────────────────────────────────
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [hotelForm, setHotelForm] = useState({ name: '', location: '' });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'ADMIN', hotel_id: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [propertySelectorOpen, setPropertySelectorOpen] = useState(false);

  // Use Memo for current super admin identity
  const currentUserId = useMemo(() => {
    const token = sessionStorage.getItem('hms_token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return null;
    }
  }, []);

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
      if (res.status === 401 || res.status === 403) { navigate('/login'); return null; }
      return res;
    } catch (err) {
      console.error('Network error:', err);
      return null;
    }
  }, [navigate]);

  const loadData = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    else setIsRefreshing(true);

    try {
      const [overviewRes, hotelsRes, usersRes] = await Promise.all([
        fetchWithAuth(`${API_BASE}/api/super-admin/overview`),
        fetchWithAuth(`${API_BASE}/api/super-admin/hotels`),
        fetchWithAuth(`${API_BASE}/api/super-admin/users`)
      ]);

      if (overviewRes?.ok) {
        const overviewData = await overviewRes.json();
        setStats(overviewData.data);
      }
      if (hotelsRes?.ok) {
        const hotelsData = await hotelsRes.json();
        setHotels(hotelsData.data.hotels);
      }
      if (usersRes?.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.data.users);
      }
    } catch (err) {
      console.error('Failed to fetch super admin data', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateHotel = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/super-admin/hotels`, {
        method: 'POST',
        body: JSON.stringify(hotelForm)
      });
      if (res?.ok) {
        setHotelForm({ name: '', location: '' });
        setIsHotelModalOpen(false);
        loadData(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/super-admin/users`, {
        method: 'POST',
        body: JSON.stringify(userForm)
      });
      if (res?.ok) {
        setUserForm({ name: '', email: '', password: '', role: 'ADMIN', hotel_id: '' });
        setIsUserModalOpen(false);
        loadData(false);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm("Are you sure you want to permanently remove this admin?")) return;
    
    try {
      const res = await fetchWithAuth(`${API_BASE}/api/super-admin/users/${userId}`, {
        method: 'DELETE'
      });
      if (res?.ok) {
        loadData(false);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to remove user");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleManageProperty = (hotelId) => {
    if (!hotelId) return;
    sessionStorage.setItem('hms_selected_hotel_id', hotelId);
    window.location.href = '/dashboard/Admin'; // Jump into the specific admin dashboard context
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-28 bg-gradient-to-br from-zinc-50 to-zinc-100">
        <Loader2 className="animate-spin text-zinc-900 mb-6" size={48} />
        <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Initializing Command Center</h2>
        <p className="text-zinc-500 font-medium mt-2">Loading portfolio metrics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] relative pt-24 pb-12 overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none" />
      <div className="absolute -top-48 -right-48 w-96 h-96 bg-purple-200/40 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-48 -left-48 w-96 h-96 bg-blue-200/40 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* TOP LEVEL NAVIGATION & PROPERTY SELECTOR */}
        <div className="flex flex-col md:flex-row justify-between items-center bg-white/60 backdrop-blur-xl border border-white p-4 rounded-3xl shadow-sm mb-10 gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
              <Globe size={24} />
            </div>
            <div>
              <h1 className="text-xl font-black text-zinc-900 tracking-tight leading-none">Global Portfolio</h1>
              <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider mt-1">Super Admin Authority</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Context Switcher Toggle */}
            <div className="relative flex-1 md:w-72">
              <button 
                onClick={() => setPropertySelectorOpen(!propertySelectorOpen)}
                className="w-full bg-white border border-zinc-200/80 hover:border-indigo-300 hover:shadow-md transition-all rounded-2xl px-5 py-3.5 flex items-center justify-between text-left group"
              >
                <div className="flex items-center gap-3">
                  <Building2 size={18} className="text-indigo-500 group-hover:scale-110 transition-transform" />
                  <span className="font-bold text-zinc-800 text-sm">
                    {hotels.length === 1 ? hotels[0].name : "Switch Property Context..."}
                  </span>
                </div>
                <ChevronDown size={18} className={`text-zinc-400 transition-transform duration-300 ${propertySelectorOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {propertySelectorOpen && (
                  <motion.div initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }} transition={{ duration: 0.15 }}>
                    <div className="absolute top-full mt-2 w-full bg-white/90 backdrop-blur-xl border border-zinc-200/80 rounded-2xl shadow-xl overflow-hidden z-50">
                      <div className="p-2">
                        {hotels.length === 0 ? (
                          <div className="p-4 text-center text-sm text-zinc-500 font-medium">No properties available</div>
                        ) : (
                          hotels.map(h => (
                            <button 
                              key={h.id}
                              onClick={() => { setPropertySelectorOpen(false); handleManageProperty(h.id); }}
                              className="w-full text-left px-4 py-3 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex items-center justify-between group/item"
                            >
                              <span className="font-bold text-sm text-zinc-800 group-hover/item:text-indigo-900">{h.name}</span>
                              <ArrowRight size={14} className="opacity-0 group-hover/item:opacity-100 group-hover/item:translate-x-1 transition-all text-indigo-500" />
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button 
              whileHover={{ scale: 1.05, rotate: 180 }} 
              whileTap={{ scale: 0.95 }} 
              onClick={() => loadData(false)} 
              className={`p-3.5 rounded-2xl border border-zinc-200/80 bg-white hover:bg-zinc-50 text-zinc-600 shadow-sm transition-all ${isRefreshing ? 'animate-spin text-indigo-500 border-indigo-200' : ''}`}
            >
              <RefreshCw size={18} />
            </motion.button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white/60 backdrop-blur-md p-1.5 rounded-2xl border border-white shadow-sm">
            {[
              { id: 'overview', icon: Activity, label: 'Performance' },
              { id: 'properties', icon: Building2, label: 'Properties' },
              { id: 'administrators', icon: Users, label: 'Access Control' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold capitalize transition-all duration-300 ${
                  activeTab === tab.id 
                    ? 'bg-zinc-900 text-white shadow-md' 
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-white/50'
                }`}
              >
                <tab.icon size={16} className={activeTab === tab.id ? 'text-indigo-400' : ''} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* OVERVIEW TAB */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              
              <div className="mb-8">
                <h2 className="text-2xl font-black text-zinc-900 mb-2">Cumulative Performance</h2>
                <p className="text-zinc-500 font-medium text-sm">Aggregated metrics across your entire global portfolio.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <StatCard icon={Building2} label="Total Properties" value={stats.hotelsCount} colorClass="from-blue-500 to-indigo-600" delay={0.1} />
                <StatCard icon={Users} label="Chain Occupancy" value={`${stats.occupancyRate}%`} colorClass="from-emerald-400 to-teal-500" delay={0.2} />
                <StatCard icon={DollarSign} label="Total Revenue (YTD)" value={`$${stats.totalRevenue.toLocaleString()}`} colorClass="from-amber-400 to-orange-500" delay={0.3} />
                <StatCard icon={Activity} label="Active Users" value={stats.staffCount} colorClass="from-purple-500 to-pink-600" delay={0.4} />
              </div>

              <GlassCard className="p-10 flex flex-col md:flex-row items-center gap-8 bg-gradient-to-br from-indigo-900 to-zinc-900 text-white border-none shadow-2xl relative overflow-hidden">
                {/* Decorative background elements inside the card */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full blur-[100px] opacity-20 pointer-events-none" />

                <div className="p-6 bg-white/10 rounded-3xl backdrop-blur-md border border-white/10 shrink-0">
                  <ShieldCheck size={56} className="text-indigo-300 drop-shadow-lg" />
                </div>
                <div>
                  <h2 className="text-3xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 to-white">Absolute Command Over Your Chain</h2>
                  <p className="text-indigo-100/80 text-lg font-medium max-w-2xl leading-relaxed">
                    You hold maximum clearance level. Seamlessly switch between any property's operational dashboard using the top selector, provision new physical locations, and grant or revoke access to high-level administrators globally.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* PROPERTIES TAB */}
          {activeTab === 'properties' && (
            <motion.div key="properties" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 mb-2">Property Portfolio</h2>
                  <p className="text-zinc-500 font-medium text-sm">Manage existing locations or initialize new ones.</p>
                </div>
                <button onClick={() => setIsHotelModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
                  <Plus size={18} /> Deploy Property
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {hotels.map((hotel, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }}
                    key={hotel.id} 
                    className="bg-white/80 backdrop-blur-xl p-6 rounded-3xl border border-white/60 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                          <Building2 size={24} />
                        </div>
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Active
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-zinc-900 mb-1">{hotel.name}</h3>
                      <p className="text-zinc-500 flex items-center gap-1.5 text-sm font-medium"><MapPin size={14}/> {hotel.location}</p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-zinc-100 flex items-center justify-between">
                      <div className="flex gap-4">
                        <div className="flex flex-col">
                          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Rooms</span>
                          <span className="text-zinc-900 font-black">{hotel.room_count}</span>
                        </div>
                        <div className="w-px h-8 bg-zinc-200" />
                        <div className="flex flex-col">
                          <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Admins</span>
                          <span className="text-zinc-900 font-black">{hotel.admin_count}</span>
                        </div>
                      </div>
                      <button onClick={() => handleManageProperty(hotel.id)} className="flex items-center gap-2 bg-zinc-900 text-white hover:bg-indigo-600 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm">
                        <Command size={16} /> Enter Dashboard
                      </button>
                    </div>
                  </motion.div>
                ))}
                {hotels.length === 0 && (
                  <div className="col-span-full py-20 flex flex-col items-center justify-center text-center bg-white/50 rounded-3xl border border-dashed border-zinc-300">
                    <Building2 size={48} className="text-zinc-300 mb-4" />
                    <h3 className="text-lg font-bold text-zinc-900">No Properties Found</h3>
                    <p className="text-zinc-500 text-sm mt-1">Deploy your first property to begin operations.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ADMINISTRATORS TAB */}
          {activeTab === 'administrators' && (
            <motion.div key="administrators" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}>
              <div className="flex justify-between items-end mb-6">
                <div>
                  <h2 className="text-2xl font-black text-zinc-900 mb-2">Access Control</h2>
                  <p className="text-zinc-500 font-medium text-sm">Provision, manage, or revoke access for property administrators.</p>
                </div>
                <button onClick={() => setIsUserModalOpen(true)} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
                  <UserCog size={18} /> Provision Access
                </button>
              </div>

              <GlassCard>
                <div className="overflow-x-auto">
                  <table className="w-full text-left whitespace-nowrap">
                    <thead className="bg-zinc-50/80 backdrop-blur-md text-zinc-500 text-xs uppercase tracking-wider font-bold border-b border-zinc-100">
                      <tr>
                        <th className="px-6 py-5">Personnel</th>
                        <th className="px-6 py-5">Security Level</th>
                        <th className="px-6 py-5">Assigned Sector</th>
                        <th className="px-6 py-5 text-right">Directives</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100/50">
                      {users.map((user, idx) => {
                        const isSelf = user.id === currentUserId;
                        return (
                          <motion.tr initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }} key={user.id} className="hover:bg-zinc-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black shadow-sm ${user.role === 'SUPER_ADMIN' ? 'bg-gradient-to-br from-purple-500 to-indigo-600' : 'bg-gradient-to-br from-emerald-400 to-teal-500'}`}>
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <div className="font-bold text-zinc-900 flex items-center gap-2">
                                    {user.name} 
                                    {isSelf && <span className="text-[10px] bg-zinc-200 text-zinc-600 px-1.5 py-0.5 rounded-md font-bold uppercase">You</span>}
                                  </div>
                                  <div className="text-zinc-500 text-xs font-medium">{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-sm border ${user.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-zinc-50 text-zinc-600 border-zinc-200'}`}>
                                {user.role.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              {user.hotel_name ? (
                                <span className="flex items-center gap-1.5 text-zinc-700 font-bold text-sm bg-white border border-zinc-200 px-3 py-1.5 rounded-xl w-max shadow-sm"><Building2 size={14} className="text-indigo-500"/> {user.hotel_name}</span>
                              ) : (
                                <span className="text-zinc-400 italic font-medium flex items-center gap-1.5 text-sm"><Globe size={14} /> Global Clearance</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                              {user.hotel_id && (
                                <button onClick={() => handleManageProperty(user.hotel_id)} className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm">
                                  <LogIn size={14} /> Take Control
                                </button>
                              )}
                              {!isSelf && (
                                <button onClick={() => handleRemoveUser(user.id)} className="opacity-0 group-hover:opacity-100 flex items-center gap-1.5 text-rose-600 hover:text-white bg-rose-50 hover:bg-rose-500 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm">
                                  <Trash2 size={14} /> Terminate
                                </button>
                              )}
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* ADD PROPERTY MODAL */}
      <AnimatePresence>
        {isHotelModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
              <div className="p-8 border-b border-zinc-100/50 flex justify-between items-center bg-gradient-to-r from-zinc-50 to-white">
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Deploy Property</h3>
                <button onClick={() => setIsHotelModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 bg-white hover:bg-zinc-100 p-2 rounded-full transition-all shadow-sm border border-zinc-200"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreateHotel} className="p-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Designation</label>
                    <input type="text" required value={hotelForm.name} onChange={(e) => setHotelForm({...hotelForm, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold text-zinc-900 placeholder:text-zinc-400 shadow-inner" placeholder="e.g. Grand Plaza Resort" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Coordinates</label>
                    <input type="text" required value={hotelForm.location} onChange={(e) => setHotelForm({...hotelForm, location: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold text-zinc-900 placeholder:text-zinc-400 shadow-inner" placeholder="e.g. New York, NY" />
                  </div>
                </div>
                <div className="mt-10 flex gap-4">
                  <button type="button" onClick={() => setIsHotelModalOpen(false)} className="flex-1 px-5 py-3.5 rounded-2xl bg-white border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-colors shadow-sm">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Initialize'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD USER MODAL */}
      <AnimatePresence>
        {isUserModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-md">
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden border border-white/20">
              <div className="p-8 border-b border-zinc-100/50 flex justify-between items-center bg-gradient-to-r from-zinc-50 to-white">
                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">Provision User</h3>
                <button onClick={() => setIsUserModalOpen(false)} className="text-zinc-400 hover:text-zinc-600 bg-white hover:bg-zinc-100 p-2 rounded-full transition-all shadow-sm border border-zinc-200"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreateUser} className="p-8">
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Identity</label>
                    <input type="text" required value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold text-zinc-900 shadow-inner" placeholder="Full Name" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Comms Channel (Email)</label>
                    <input type="email" required value={userForm.email} onChange={(e) => setUserForm({...userForm, email: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold text-zinc-900 shadow-inner" placeholder="admin@network.com" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Initial Keyphrase</label>
                    <input type="password" required minLength="6" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold text-zinc-900 shadow-inner" placeholder="••••••••" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Clearance</label>
                      <div className="relative">
                        <select required value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold text-zinc-900 appearance-none shadow-inner">
                          <option value="ADMIN">Property Admin</option>
                          <option value="FRONT_DESK">Front Desk</option>
                          <option value="HOUSEKEEPING">Housekeeping</option>
                          <option value="FINANCE">Finance</option>
                          <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Assignment</label>
                      <div className="relative">
                        <select 
                          required={userForm.role !== 'SUPER_ADMIN'} 
                          disabled={userForm.role === 'SUPER_ADMIN'} 
                          value={userForm.hotel_id} 
                          onChange={(e) => setUserForm({...userForm, hotel_id: e.target.value})} 
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-bold text-zinc-900 appearance-none disabled:opacity-50 shadow-inner"
                        >
                          <option value="" disabled>Select Sector</option>
                          {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                        </select>
                        <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-10 flex gap-4">
                  <button type="button" onClick={() => setIsUserModalOpen(false)} className="flex-1 px-5 py-3.5 rounded-2xl bg-white border border-zinc-200 text-zinc-600 font-bold hover:bg-zinc-50 transition-colors shadow-sm">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="flex-1 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/30 transition-all flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Grant Access'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
