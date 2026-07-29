import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loader2, Building, MapPin, Globe, Phone, FileText } from 'lucide-react';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}`
});

export default function AccountsTab({ leads = [] }) {
  const { data: accounts, isLoading } = useQuery({
    queryKey: ['sales', 'accounts'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/sales/accounts`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch accounts');
      const json = await res.json();
      return json.data || [];
    }
  });

  // Calculate total active pipeline per account from leads array
  const accountsWithPipeline = useMemo(() => {
    if (!accounts) return [];
    return accounts.map(acc => {
      // Find all active leads associated with this company (using company name to link if account_id isn't directly on lead yet)
      const accLeads = leads.filter(l => l.company === acc.name && l.stage !== 'Lost');
      const totalPipeline = accLeads.reduce((sum, l) => sum + (Number(l.value) || 0), 0);
      const activeDeals = accLeads.length;
      return { ...acc, totalPipeline, activeDeals };
    });
  }, [accounts, leads]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col h-full relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-800">Key Accounts</h2>
        <p className="text-stone-500">Corporate partners and their active pipeline.</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-stone-400" size={32} /></div>
      ) : accountsWithPipeline.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-400">
          <Building size={64} className="mb-4 opacity-20" />
          <p className="text-lg font-medium text-stone-600">No Key Accounts</p>
          <p className="text-sm">Corporate accounts will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-4">
          {accountsWithPipeline.map(account => (
            <div key={account.id} className="p-5 border border-stone-200 rounded-2xl bg-stone-50 hover:shadow-md transition-shadow flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold">
                    {account.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900 leading-tight">{account.name}</h3>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500">{account.industry || 'Corporate'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6 text-sm flex-1">
                <div className="flex items-center gap-2 text-stone-600">
                  <Globe size={14} className="text-stone-400" />
                  <span className="truncate">{account.website || 'No website'}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-600">
                  <MapPin size={14} className="text-stone-400" />
                  <span className="truncate">{account.address || 'No address'}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-4 border-t border-stone-200">
                <div className="bg-white p-2 rounded-xl border border-stone-100 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Active Deals</p>
                  <p className="font-bold text-stone-800">{account.activeDeals}</p>
                </div>
                <div className="bg-white p-2 rounded-xl border border-stone-100 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 mb-1">Pipeline</p>
                  <p className="font-bold text-green-600">{formatCurrency(account.totalPipeline)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
