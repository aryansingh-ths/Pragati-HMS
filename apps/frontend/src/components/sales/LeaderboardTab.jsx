import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Trophy, ArrowUpCircle, Loader2, Medal } from 'lucide-react';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}`
});

export default function LeaderboardTab() {
  const { data: leaderboard, isLoading } = useQuery({
    queryKey: ['sales', 'leaderboard'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/sales/leaderboard`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch leaderboard');
      const json = await res.json();
      return json.data || [];
    }
  });

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col h-full relative">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-800">Sales Leaderboard</h2>
        <p className="text-stone-500">Track team performance and target vs achieved metrics.</p>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-stone-400" size={32} /></div>
      ) : leaderboard?.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-400">
          <Trophy size={64} className="mb-4 opacity-20 text-yellow-500" />
          <p className="text-lg font-medium text-stone-600">Leaderboard Empty</p>
          <p className="text-sm">Team metrics will appear here once deals are won.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 overflow-y-auto pr-2 pb-4">
          {leaderboard.map((user, idx) => {
            const isTop3 = idx < 3;
            const rankColors = ['text-yellow-500', 'text-stone-400', 'text-amber-700'];
            const rankColor = isTop3 ? rankColors[idx] : 'text-stone-300';
            
            return (
              <div key={user.id} className={`p-4 border rounded-2xl flex items-center justify-between transition-colors ${
                idx === 0 ? 'bg-amber-50/50 border-yellow-200' : 'bg-stone-50 border-stone-100 hover:bg-stone-100'
              }`}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 flex items-center justify-center font-black text-lg ${rankColor}`}>
                    {isTop3 ? <Medal size={28} /> : `#${idx + 1}`}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-stone-200 to-stone-300 flex items-center justify-center text-stone-600 font-bold text-lg shadow-inner">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-stone-900">{user.name}</h3>
                    <p className="text-xs text-stone-500">{user.deals_won} Deals Won</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">YTD Revenue</p>
                  <p className="text-xl font-black text-green-600">{formatCurrency(user.ytd_revenue)}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
