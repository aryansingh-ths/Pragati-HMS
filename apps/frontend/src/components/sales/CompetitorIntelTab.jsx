import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Eye, Plus, CheckCircle, X, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}`
});

export default function CompetitorIntelTab({ leads }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    lead_id: '',
    competitor_name: '',
    offered_price: '',
    notes: ''
  });

  const { data: intel, isLoading } = useQuery({
    queryKey: ['sales', 'intel'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/sales/intel`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch intel');
      const json = await res.json();
      return json.data || [];
    }
  });

  const createIntelMutation = useMutation({
    mutationFn: async (newIntel) => {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${newIntel.lead_id}/intel`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newIntel)
      });
      if (!res.ok) throw new Error('Failed to log intel');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Competitor Intelligence logged!');
      queryClient.invalidateQueries({ queryKey: ['sales', 'intel'] });
      setShowModal(false);
      setForm({ lead_id: '', competitor_name: '', offered_price: '', notes: '' });
    },
    onError: () => toast.error('Failed to log intel.')
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Competitor & Market Intel</h2>
          <p className="text-stone-500">Track competitor pricing and offers per deal.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer">
          <Plus size={16} /> Log Intel
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-stone-400" size={32} /></div>
      ) : intel?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-400">
          <Eye size={64} className="mb-4 opacity-20" />
          <p className="text-lg font-medium text-stone-600">No Intelligence Logged</p>
          <p className="text-sm">Log competitor information to build a repository of market offers.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pr-2 pb-4">
          {intel.map(item => (
            <div key={item.id} className="p-5 border border-stone-200 rounded-2xl bg-stone-50">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={16} className="text-rose-500" />
                  <h3 className="font-bold text-stone-800">{item.competitor_name}</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">{new Date(item.created_at).toLocaleDateString()}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-stone-100 mb-3 text-sm">
                <p className="text-stone-500 text-[10px] font-bold uppercase tracking-wider mb-1">Deal Context</p>
                <p className="font-semibold text-stone-800">{item.company}</p>
                <p className="text-stone-500 text-xs">{item.deal_name}</p>
              </div>
              <p className="text-xs text-stone-600 italic mb-4">"{item.notes}"</p>
              <div className="flex justify-between items-center text-sm border-t border-stone-200 pt-3">
                <span className="text-stone-500 text-[10px] font-bold uppercase">Offered Price:</span>
                <span className="font-black text-rose-600">{formatCurrency(item.offered_price)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LOG INTEL MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl relative"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2"><Eye size={20} className="text-stone-400"/> Log Competitor Intel</h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors">
                  <X size={16} className="text-stone-500" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); createIntelMutation.mutate(form); }} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Select Lead</label>
                  <select
                    required
                    value={form.lead_id}
                    onChange={e => setForm({ ...form, lead_id: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400"
                  >
                    <option value="">-- Choose Lead --</option>
                    {leads?.filter(l => l.stage !== 'Lost').map(l => (
                      <option key={l.id} value={l.id}>{l.company} ({l.deal_name})</option>
                    ))}
                  </select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Competitor Name</label>
                    <input type="text" required value={form.competitor_name} onChange={e => setForm({ ...form, competitor_name: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400" placeholder="e.g. Grand Taj" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Offered Price (₹)</label>
                    <input type="number" min="0" required value={form.offered_price} onChange={e => setForm({ ...form, offered_price: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400" placeholder="0" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Insights / Notes</label>
                    <textarea value={form.notes} required onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400 min-h-[80px]" placeholder="What are they offering? (e.g. Free breakfast, comp room...)"></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createIntelMutation.isPending}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {createIntelMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {createIntelMutation.isPending ? 'Logging...' : 'Log Intel'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
