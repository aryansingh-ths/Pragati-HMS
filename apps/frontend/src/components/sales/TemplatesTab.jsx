import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Mail, Plus, X, CheckCircle, FileText, Copy, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}`
});

export default function TemplatesTab() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    type: 'Email',
    subject: '',
    body: ''
  });

  const { data: templates, isLoading } = useQuery({
    queryKey: ['sales', 'templates'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/sales/templates`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch templates');
      const json = await res.json();
      return json.data || [];
    }
  });

  const createTemplateMutation = useMutation({
    mutationFn: async (newTemplate) => {
      const res = await fetch(`${API_BASE_URL}/api/sales/templates`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(newTemplate)
      });
      if (!res.ok) throw new Error('Failed to create template');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Template saved successfully!');
      queryClient.invalidateQueries({ queryKey: ['sales', 'templates'] });
      setShowModal(false);
      setForm({ name: '', type: 'Email', subject: '', body: '' });
    },
    onError: () => toast.error('Failed to create template.')
  });

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Sales Templates</h2>
          <p className="text-stone-500">Standardized emails, WhatsApp messages, and proposals.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-stone-900 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer">
          <Plus size={16} /> New Template
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-stone-400" size={32} /></div>
      ) : templates?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-400">
          <FileText size={64} className="mb-4 opacity-20" />
          <p className="text-lg font-medium text-stone-600">No Templates Found</p>
          <p className="text-sm">Create standard message templates to speed up your outreach.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
          {templates.map(template => (
            <div key={template.id} className="p-5 border border-stone-200 rounded-2xl bg-stone-50 hover:shadow-md transition-shadow flex flex-col group">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-blue-500" />
                  <h3 className="font-bold text-stone-800 truncate" title={template.name}>{template.name}</h3>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-white border border-stone-200 px-2 py-1 rounded-md text-stone-500">{template.type}</span>
              </div>
              <div className="mb-4">
                <p className="text-xs font-bold text-stone-500 mb-1">Subject</p>
                <p className="text-sm text-stone-800 font-medium truncate">{template.subject || 'N/A'}</p>
              </div>
              <div className="flex-1 bg-white border border-stone-200 rounded-xl p-3 relative">
                <p className="text-xs text-stone-600 line-clamp-4 whitespace-pre-wrap">{template.body}</p>
                
                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl">
                  <button onClick={() => copyToClipboard(template.body)} className="bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-stone-800 transition-colors shadow-lg">
                    <Copy size={14} /> Copy Content
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* NEW TEMPLATE MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-stone-900/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg bg-white rounded-3xl p-7 shadow-2xl relative flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center mb-6 shrink-0">
                <h2 className="text-xl font-bold text-stone-900 flex items-center gap-2"><Edit2 size={20} className="text-stone-400"/> Create Template</h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200 transition-colors">
                  <X size={16} className="text-stone-500" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); createTemplateMutation.mutate(form); }} className="space-y-4 flex-1 overflow-y-auto pr-2 pb-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Template Name</label>
                    <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400" placeholder="e.g. Initial Follow-up" />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Type</label>
                    <select required value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400">
                      <option value="Email">Email</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Proposal">Proposal Intro</option>
                      <option value="Contract">Contract Clause</option>
                    </select>
                  </div>
                  {form.type === 'Email' && (
                    <div className="col-span-2">
                      <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1">Subject Line</label>
                      <input type="text" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400" placeholder="Following up on your event inquiry" />
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="block text-xs font-bold uppercase text-stone-500 tracking-wider mb-1 flex justify-between">
                      <span>Message Body</span>
                      <span className="text-stone-400 lowercase font-normal italic">Supports placeholders like [Client Name]</span>
                    </label>
                    <textarea required value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} className="w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-stone-400 min-h-[200px]" placeholder={`Hi [Client Name],\n\nThank you for reaching out...`}></textarea>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={createTemplateMutation.isPending}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-white font-bold text-sm py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {createTemplateMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                  {createTemplateMutation.isPending ? 'Saving...' : 'Save Template'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
