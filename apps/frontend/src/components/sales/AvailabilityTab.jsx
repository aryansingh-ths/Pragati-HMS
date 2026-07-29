import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar, BedDouble, PartyPopper, Car, CheckCircle2, XCircle, Search } from 'lucide-react';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';

export default function AvailabilityTab() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: availability, isLoading, isError, refetch } = useQuery({
    queryKey: ['salesAvailability', selectedDate],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/sales/availability?date=${selectedDate}`, {
        headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sessionStorage.getItem('hms_token')}` 
        }
      });
      if (!res.ok) throw new Error('Failed to fetch availability');
      const data = await res.json();
      return data.data;
    }
  });

  const renderSection = (title, icon, data) => {
    if (!data) return null;
    const total = data.vacant.length + data.occupied.length;
    const vacantCount = data.vacant.length;
    const occupancyRate = total > 0 ? Math.round((data.occupied.length / total) * 100) : 0;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden mb-6">
        <div className="border-b border-stone-100 bg-stone-50/50 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-white rounded-lg shadow-sm text-stone-600 border border-stone-100">
              {icon}
            </div>
            <div>
              <h3 className="font-bold text-stone-800">{title}</h3>
              <p className="text-xs text-stone-500">{vacantCount} of {total} available</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Occupancy</div>
              <div className="text-lg font-bold text-stone-800">{occupancyRate}%</div>
            </div>
            <div className="h-10 w-10 rounded-full border-4 border-stone-100 flex items-center justify-center relative">
              <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                <circle cx="20" cy="20" r="16" fill="transparent" stroke="currentColor" strokeWidth="4" className="text-stone-100" />
                <circle cx="20" cy="20" r="16" fill="transparent" stroke="currentColor" strokeWidth="4" strokeDasharray="100" strokeDashoffset={100 - occupancyRate} className={occupancyRate > 80 ? 'text-rose-500' : occupancyRate > 50 ? 'text-amber-500' : 'text-emerald-500'} />
              </svg>
            </div>
          </div>
        </div>
        <div className="p-4">
          {total === 0 ? (
            <div className="text-center py-8 text-stone-400 text-sm">No inventory found for this category.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {data.vacant.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-emerald-100 bg-emerald-50/30">
                  <div>
                    <div className="font-semibold text-stone-800">{item.room_number || item.model}</div>
                    <div className="text-xs text-stone-500">{item.type || item.registration_number}</div>
                  </div>
                  <CheckCircle2 size={18} className="text-emerald-500" />
                </div>
              ))}
              {data.occupied.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border border-rose-100 bg-rose-50/30">
                  <div>
                    <div className="font-semibold text-stone-800">{item.room_number || item.model}</div>
                    <div className="text-xs text-stone-500">{item.type || item.registration_number}</div>
                  </div>
                  <XCircle size={18} className="text-rose-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 tracking-tight">Inventory Availability</h1>
          <p className="text-stone-500 text-sm mt-1">Check real-time occupancy for rooms, event spaces, and vehicles.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-stone-200">
          <div className="flex items-center gap-2 px-3 text-stone-500">
            <Calendar size={18} />
            <span className="text-sm font-medium">Date</span>
          </div>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border-none bg-stone-50 rounded-lg px-4 py-2 text-sm font-semibold text-stone-700 focus:ring-0 focus:outline-none cursor-pointer"
          />
          <button 
            onClick={() => refetch()}
            className="p-2 bg-stone-800 text-white rounded-lg hover:bg-stone-700 transition-colors"
          >
            <Search size={18} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800"></div>
        </div>
      ) : isError ? (
        <div className="bg-rose-50 text-rose-600 p-4 rounded-xl border border-rose-100 flex items-center gap-3">
          <XCircle size={20} />
          <span className="font-medium">Failed to load availability data. Please try again.</span>
        </div>
      ) : (
        <div className="space-y-2">
          {renderSection("Rooms", <BedDouble size={20} />, availability?.rooms)}
          {renderSection("Event Spaces", <PartyPopper size={20} />, availability?.event_spaces)}
          {renderSection("Vehicles", <Car size={20} />, availability?.vehicles)}
        </div>
      )}
    </div>
  );
}
