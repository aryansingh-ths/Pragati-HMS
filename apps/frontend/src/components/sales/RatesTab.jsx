import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Tag, Calendar, FileText, Plus, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}`
});

export default function RatesTab() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    type: 'Corporate',
    name: '',
    description: '',
    valid_from: '',
    valid_until: ''
  });

  const { data: rates, isLoading } = useQuery({
    queryKey: ['sales', 'rates'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/sales/rates`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch rates');
      const json = await res.json();
      return json.data || [];
    }
  });

  const createRateMutation = useMutation({
    mutationFn: async (newRate) => {
      const res = await fetch(`${API_BASE_URL}/api/sales/rates`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newRate)
      });
      if (!res.ok) throw new Error('Failed to create rate card');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Rate Card added successfully!');
      queryClient.invalidateQueries({ queryKey: ['sales', 'rates'] });
      setShowModal(false);
      setForm({ type: 'Corporate', name: '', description: '', valid_from: '', valid_until: '' });
    },
    onError: () => toast.error('Failed to create rate card. You might not have Admin access.')
  });

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Contracted Rates & Rate Cards</h2>
          <p className="text-stone-500">Negotiated corporate rates, seasonal slabs, and group pricing.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer">
          <Plus size={16} /> New Rate Card
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-stone-400" size={32} /></div>
      ) : rates?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-stone-400">
          <Tag size={64} className="mb-4 opacity-20" />
          <p className="text-lg font-medium text-stone-600">No active rate cards.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
          {rates.map(rate => (
            <div key={rate.id} className="p-5 border border-stone-200 rounded-2xl bg-stone-50 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-blue-500" />
                  <h3 className="font-bold text-stone-800">{rate.name}</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white border border-stone-200 px-2 py-1 rounded-md text-stone-500">{rate.type}</span>
              </div>
              <p className="text-xs text-stone-500 mb-5 min-h-[40px]">{rate.description}</p>
              <div className="flex flex-col gap-2 pt-4 border-t border-stone-200">
                <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
                  <Calendar size={14} className="text-stone-400" /> 
                  Valid From: {rate.valid_from ? new Date(rate.valid_from).toLocaleDateString() : 'Immediately'}
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-stone-600">
                  <Calendar size={14} className="text-stone-400" /> 
                  Valid Until: {rate.valid_until ? new Date(rate.valid_until).toLocaleDateString() : 'Indefinite'}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW RATE CARD MODAL */}
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
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2"><Tag size={20} className="text-stone-400"/> New Rate Card</h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors">
                  <X size={16} className="text-stone-500" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); createRateMutation.mutate(form); }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Name</label>
                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400" placeholder="e.g. Summer Corporate Slab" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Type</label>
                    <select required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400">
                      <option value="Corporate">Corporate</option>
                      <option value="Group / MICE">Group / MICE</option>
                      <option value="Seasonal">Seasonal</option>
                      <option value="Promotional">Promotional</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Valid From</label>
                    <input type="date" value={form.valid_from} onChange={e => setForm({ ...form, valid_from: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Valid Until</label>
                    <input type="date" value={form.valid_until} onChange={e => setForm({ ...form, valid_until: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Description</label>
                    <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400 min-h-[80px]" placeholder="Terms, conditions, specific inclusions..."></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createRateMutation.isPending}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {createRateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {createRateMutation.isPending ? 'Saving...' : 'Save Rate Card'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
