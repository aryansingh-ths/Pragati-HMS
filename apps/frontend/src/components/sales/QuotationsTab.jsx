import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Plus, FileText, CheckCircle, X, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}`
});

export default function QuotationsTab({ leads }) {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    lead_id: '',
    room_block_amount: '',
    fb_amount: '',
    banquet_amount: '',
    notes: '',
    status: 'Draft'
  });

  const { data: quotes, isLoading } = useQuery({
    queryKey: ['sales', 'quotes'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/sales/quotes`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch quotes');
      const json = await res.json();
      return json.data || [];
    }
  });

  const createQuoteMutation = useMutation({
    mutationFn: async (newQuote) => {
      const res = await fetch(`${API_BASE_URL}/api/sales/leads/${newQuote.lead_id}/quotes`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newQuote)
      });
      if (!res.ok) throw new Error('Failed to create quote');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Proposal generated successfully!');
      queryClient.invalidateQueries({ queryKey: ['sales', 'quotes'] });
      setShowModal(false);
      setForm({ lead_id: '', room_block_amount: '', fb_amount: '', banquet_amount: '', notes: '', status: 'Draft' });
    },
    onError: () => toast.error('Failed to create proposal.')
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Quotations & Proposals</h2>
          <p className="text-stone-500">Generate rate-based quotes and track acceptance.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer">
          <Plus size={16} /> New Proposal
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-stone-400" size={32} /></div>
      ) : quotes?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-400">
          <FileText size={64} className="mb-4 opacity-20" />
          <p className="text-lg font-medium text-stone-600">No proposals generated yet.</p>
          <p className="text-sm">Create a new proposal to build a room block and banquet quote.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
          {quotes.map(quote => (
            <div key={quote.id} className="p-4 border border-stone-200 rounded-2xl bg-stone-50 hover:border-stone-300 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-stone-800 truncate" title={quote.company}>{quote.company}</h3>
                  <p className="text-[10px] uppercase font-bold text-stone-500 tracking-wider">v{quote.version} • {quote.deal_name}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${
                  quote.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' :
                  quote.status === 'Rejected' ? 'bg-rose-100 text-rose-700' : 'bg-stone-200 text-stone-700'
                }`}>
                  {quote.status}
                </span>
              </div>
              
              <div className="space-y-1 my-4">
                <div className="flex justify-between text-xs text-stone-600"><span>Room Block:</span> <span className="font-semibold">{formatCurrency(quote.room_block_amount)}</span></div>
                <div className="flex justify-between text-xs text-stone-600"><span>F&B:</span> <span className="font-semibold">{formatCurrency(quote.fb_amount)}</span></div>
                <div className="flex justify-between text-xs text-stone-600"><span>Banquet:</span> <span className="font-semibold">{formatCurrency(quote.banquet_amount)}</span></div>
                <div className="flex justify-between text-sm font-bold text-stone-900 border-t border-stone-200 pt-1 mt-1">
                  <span>Total:</span> <span>{formatCurrency(quote.total_amount)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-stone-200">
                <span className="text-[10px] text-stone-500 font-medium">{new Date(quote.created_at).toLocaleDateString()}</span>
                <button className="text-stone-500 hover:text-stone-900 p-1.5 bg-stone-200 hover:bg-stone-300 rounded-lg transition-colors" title="Download PDF">
                  <Download size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* NEW PROPOSAL MODAL */}
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
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2"><FileText size={20} className="text-stone-400"/> Create Proposal</h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors">
                  <X size={16} className="text-stone-500" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); createQuoteMutation.mutate(form); }} className="space-y-4">
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
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Room Block (₹)</label>
                    <input type="number" min="0" required value={form.room_block_amount} onChange={e => setForm({ ...form, room_block_amount: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">F&B Amount (₹)</label>
                    <input type="number" min="0" required value={form.fb_amount} onChange={e => setForm({ ...form, fb_amount: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Banquet (₹)</label>
                    <input type="number" min="0" required value={form.banquet_amount} onChange={e => setForm({ ...form, banquet_amount: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Status</label>
                    <select required value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400">
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Additional Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400 min-h-[80px]" placeholder="Terms, special requests..."></textarea>
                </div>

                <button
                  type="submit"
                  disabled={createQuoteMutation.isPending}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  {createQuoteMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {createQuoteMutation.isPending ? 'Generating...' : 'Generate Proposal'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
