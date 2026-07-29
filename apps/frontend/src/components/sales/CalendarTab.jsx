import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Loader2, Clock } from 'lucide-react';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3000';
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${sessionStorage.getItem('hms_token')}`
});

export default function CalendarTab() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['sales', 'tasks'],
    queryFn: async () => {
      const res = await fetch(`${API_BASE_URL}/api/sales/tasks`, { headers: getHeaders() });
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const json = await res.json();
      return json.data || [];
    }
  });

  const calendarData = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startingDayOfWeek = firstDayOfMonth.getDay(); // 0 is Sunday
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days = [];
    
    // Add empty padding days for start of month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, date: null, events: [] });
    }
    
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      const dayTasks = (tasks || []).filter(t => {
        if (!t.deadline) return false;
        // Simple string match on YYYY-MM-DD
        return t.deadline.startsWith(dateString);
      });
      
      days.push({ day: i, date: dateString, events: dayTasks });
    }
    
    return days;
  }, [currentDate, tasks]);

  const changeMonth = (offset) => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Booking Calendar & Tasks</h2>
          <p className="text-stone-500">Track task deadlines, meetings, and follow-ups.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-stone-100 p-1.5 rounded-xl border border-stone-200">
          <button onClick={() => changeMonth(-1)} className="p-2 bg-white rounded-lg shadow-sm hover:bg-stone-50 transition-colors">
            <ChevronLeft size={16} />
          </button>
          <span className="font-bold text-stone-700 min-w-[120px] text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={() => changeMonth(1)} className="p-2 bg-white rounded-lg shadow-sm hover:bg-stone-50 transition-colors">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin text-stone-400" size={32} /></div>
      ) : (
        <div className="flex-1 flex flex-col">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs font-bold uppercase text-stone-400 tracking-wider py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2 flex-1 overflow-y-auto pr-2 pb-4">
            {calendarData.map((cell, idx) => {
              const isToday = cell.date === new Date().toISOString().split('T')[0];
              return (
                <div key={idx} className={`min-h-[100px] border rounded-xl p-2 flex flex-col ${
                  !cell.day ? 'bg-transparent border-transparent' : 
                  isToday ? 'bg-amber-50 border-yellow-200 shadow-sm' : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                }`}>
                  {cell.day && (
                    <>
                      <span className={`text-sm font-bold self-end mb-1 ${isToday ? 'text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md' : 'text-stone-400'}`}>
                        {cell.day}
                      </span>
                      <div className="flex-1 overflow-y-auto space-y-1 mt-1 scrollbar-hide">
                        {cell.events.map(event => (
                          <div key={event.id} className="text-[10px] bg-white border border-stone-200 p-1.5 rounded flex flex-col gap-1 shadow-sm" title={event.description}>
                            <span className="font-bold text-stone-700 truncate">{event.title}</span>
                            <span className="text-stone-400 font-medium flex items-center gap-1">
                              <Clock size={10} /> {new Date(event.deadline).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
