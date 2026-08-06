import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, User, Building2, Briefcase, Mail, Phone, ChevronRight, Edit2, Trash2, X, Loader2 } from 'lucide-react';

export default function StaffDirectoryModule() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('All');
  const [editingUser, setEditingUser] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const token = sessionStorage.getItem('hms_token');
  const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const isSuperAdmin = payload?.accessLevel === 'SUPER_ADMIN';

  const fetchDirectory = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('hms_token');
      const res = await fetch('http://localhost:3000/api/directory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStaff(data.data?.staff || []);
      }
    } catch (err) {
      console.error("Directory fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`http://localhost:3000/api/super-admin/users/${editingUser.id}/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editingUser.name,
          email: editingUser.email,
          contact_number: editingUser.contact_number,
          designation: editingUser.designation
        })
      });
      if (res.ok) {
        setEditingUser(null);
        fetchDirectory();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) return;
    
    try {
      const res = await fetch(`http://localhost:3000/api/super-admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        fetchDirectory();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      alert('Error deleting user');
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

  const uniqueProperties = ['All', ...new Set(staff.map(s => s.hotel_name || 'All Properties'))].filter(p => p !== 'All Properties' || staff.some(s => !s.hotel_name));

  const filteredStaff = staff.filter(member => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (
      member.name?.toLowerCase().includes(term) ||
      member.email?.toLowerCase().includes(term) ||
      member.role?.toLowerCase().includes(term) ||
      member.designation?.toLowerCase().includes(term) ||
      member.hotel_name?.toLowerCase().includes(term)
    );
    const matchesProperty = propertyFilter === 'All' || (member.hotel_name || 'All Properties') === propertyFilter;
    return matchesSearch && matchesProperty;
  }).sort((a, b) => {
    const weights = { 'SUPER_ADMIN': 1, 'ADMIN': 2, 'MANAGER': 3, 'EXECUTIVE': 4 };
    const getLevel = (u) => u.access_level || (u.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : u.role === 'ADMIN' ? 'ADMIN' : 'EXECUTIVE');
    const weightA = weights[getLevel(a)] || 5;
    const weightB = weights[getLevel(b)] || 5;
    
    if (weightA !== weightB) return weightA - weightB;
    return (a.name || '').localeCompare(b.name || '');
  });

  return (
    <div className="flex flex-col h-full bg-[#F8F1E3] p-6 lg:p-8 overflow-y-auto w-full">
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Staff Info Directory</h2>
          <p className="text-sm text-zinc-500 font-medium mt-1">Globally accessible contact book for all staff members.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {uniqueProperties.length > 1 && (
            <select
              value={propertyFilter}
              onChange={(e) => setPropertyFilter(e.target.value)}
              className="w-full sm:w-48 px-4 py-2.5 rounded-xl border border-zinc-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 text-sm font-medium text-zinc-700"
            >
              {uniqueProperties.map(prop => (
                <option key={prop} value={prop}>{prop === 'All' ? 'All Properties' : prop}</option>
              ))}
            </select>
          )}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, role, or hotel..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]/50 text-sm font-medium"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-[#D4A373] border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white/50 rounded-3xl border border-zinc-100">
          <User className="text-zinc-300 mb-2" size={48} />
          <p className="text-zinc-500 font-medium">No staff members found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 pb-8">
          {filteredStaff.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-white rounded-2xl p-5 border border-zinc-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4 group"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 border border-zinc-200/50 flex items-center justify-center shrink-0">
                <span className="text-lg font-black text-zinc-500">{member.name.charAt(0).toUpperCase()}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-zinc-900 truncate">{member.name}</h3>
                <p className="text-[11px] font-bold text-[#D4A373] uppercase tracking-wider truncate mb-2">
                  {member.designation || member.role.replace('_', ' ')}
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Mail size={12} /> <span className="truncate">{member.email}</span>
                  </div>
                  {member.contact_number && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Phone size={12} /> <span className="truncate">{member.contact_number}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Building2 size={12} /> <span className="truncate">{member.hotel_name || 'All Properties'}</span>
                  </div>
                  {member.department && member.department.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                      <Briefcase size={12} /> <span className="truncate">{member.department.join(', ').replace(/_/g, ' ')}</span>
                    </div>
                  )}
                </div>
              </div>
              {isSuperAdmin ? (
                <div className="flex items-center gap-1 self-center">
                  <button 
                    onClick={() => setEditingUser(member)}
                    className="text-zinc-300 group-hover:text-indigo-600 transition-colors p-2 rounded-full hover:bg-indigo-50"
                    title="Edit Profile"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteUser(member.id, member.name)}
                    className="text-zinc-300 group-hover:text-rose-600 transition-colors p-2 rounded-full hover:bg-rose-50"
                    title="Delete User"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <button className="text-zinc-300 group-hover:text-[#D4A373] transition-colors self-center p-2 rounded-full hover:bg-zinc-50">
                  <ChevronRight size={18} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button
                onClick={() => setEditingUser(null)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <User size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-zinc-900">Edit Profile</h3>
                  <p className="text-sm text-zinc-500 font-medium">{editingUser.email}</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editingUser.name}
                    onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Email</label>
                  <input
                    type="email"
                    value={editingUser.email}
                    onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Designation</label>
                  <input
                    type="text"
                    value={editingUser.designation || ''}
                    onChange={(e) => setEditingUser({...editingUser, designation: e.target.value})}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="e.g. Senior Sales Manager"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Contact Number</label>
                  <input
                    type="tel"
                    value={editingUser.contact_number || ''}
                    onChange={(e) => setEditingUser({...editingUser, contact_number: e.target.value})}
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                    placeholder="+1 234 567 8900"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={18} /> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
