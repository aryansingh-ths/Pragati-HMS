import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Clock, CalendarDays, CheckCircle, XCircle, Search, DollarSign } from 'lucide-react';

export default function DepartmentHRModule({ departmentName }) {
  const [activeTab, setActiveTab] = useState('ROSTER');
  const [staff, setStaff] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);

  const TABS = [
    { id: 'ROSTER', label: 'Staff Roster', icon: Users },
    { id: 'ATTENDANCE', label: 'Attendance & Shifts', icon: Clock },
    { id: 'LEAVES', label: 'Leave Management', icon: CalendarDays },
    { id: 'PAYROLL', label: 'Payroll & Compensation', icon: DollarSign }
  ];

  const fetchHRData = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('hms_token');
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [staffRes, attRes, leavesRes] = await Promise.all([
        fetch(`http://localhost:3000/api/hr/department/${departmentName}/staff`, { headers }),
        fetch(`http://localhost:3000/api/hr/department/${departmentName}/attendance`, { headers }),
        fetch(`http://localhost:3000/api/hr/department/${departmentName}/leaves`, { headers })
      ]);
      
      if (staffRes.ok) setStaff(await staffRes.json());
      if (attRes.ok) setAttendance(await attRes.json());
      if (leavesRes.ok) setLeaves(await leavesRes.json());
    } catch (err) {
      console.error("HR fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHRData();
  }, [departmentName]);

  const handleLeaveAction = async (id, status) => {
    try {
      const token = sessionStorage.getItem('hms_token');
      const res = await fetch(`http://localhost:3000/api/hr/leaves/${id}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchHRData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#F8F1E3] p-6 lg:p-8 overflow-y-auto w-full">
      
      <div className="mb-8">
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight">{departmentName.replace('_', ' ')} HR HUB</h2>
        <p className="text-sm text-zinc-500 font-medium mt-1">Manage your team's roster, shifts, leaves, and payroll.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 bg-white/60 p-2 rounded-2xl border border-zinc-200/50 w-fit">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${
                isActive ? 'text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="hr-active-tab"
                  className="absolute inset-0 bg-white shadow-sm border border-zinc-200/50 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2"><Icon size={16}/> {tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-[500px]">
        {loading ? (
          <div className="flex justify-center items-center h-64"><div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'ROSTER' && (
              <motion.div key="roster" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-lg text-zinc-800">Department Roster</h3>
                  <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
                    <Search size={16} className="text-zinc-400" />
                    <input type="text" placeholder="Search staff..." className="bg-transparent border-none text-sm outline-none w-48 text-zinc-700" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400 text-xs uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Employee</th>
                        <th className="pb-3 font-semibold">Sub Role</th>
                        <th className="pb-3 font-semibold">Phone</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map(s => (
                        <tr key={s.id} className="border-b border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                          <td className="py-4">
                            <div className="font-bold text-zinc-900">{s.name}</div>
                            <div className="text-xs text-zinc-500">{s.email}</div>
                          </td>
                          <td className="py-4 font-medium text-zinc-700">{s.sub_role || 'General Staff'}</td>
                          <td className="py-4 text-zinc-600">{s.phone || 'N/A'}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase rounded-lg border border-emerald-100">{s.status}</span>
                          </td>
                        </tr>
                      ))}
                      {staff.length === 0 && <tr><td colSpan="4" className="py-8 text-center text-zinc-400">No staff members found in this department.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'ATTENDANCE' && (
              <motion.div key="attendance" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
                 <h3 className="font-bold text-lg text-zinc-800 mb-6">Recent Shifts & Punches</h3>
                 <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400 text-xs uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Date</th>
                        <th className="pb-3 font-semibold">Employee</th>
                        <th className="pb-3 font-semibold">Punch In</th>
                        <th className="pb-3 font-semibold">Punch Out</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendance.map(a => (
                        <tr key={a.id} className="border-b border-zinc-50">
                          <td className="py-4 font-medium text-zinc-800">{new Date(a.date).toLocaleDateString()}</td>
                          <td className="py-4 font-bold text-zinc-700">{a.name}</td>
                          <td className="py-4 text-emerald-600 font-medium">{a.punch_in ? new Date(a.punch_in).toLocaleTimeString() : '--'}</td>
                          <td className="py-4 text-rose-600 font-medium">{a.punch_out ? new Date(a.punch_out).toLocaleTimeString() : '--'}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-lg border border-blue-100">{a.status}</span>
                          </td>
                        </tr>
                      ))}
                      {attendance.length === 0 && <tr><td colSpan="5" className="py-8 text-center text-zinc-400">No attendance logs available.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'LEAVES' && (
              <motion.div key="leaves" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
                 <h3 className="font-bold text-lg text-zinc-800 mb-6">Pending Leave Requests</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {leaves.map(l => (
                      <div key={l.id} className="border border-zinc-100 bg-zinc-50/50 rounded-2xl p-5 relative overflow-hidden">
                        {l.status === 'PENDING' && <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-bl-full -mr-8 -mt-8" />}
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="font-bold text-zinc-900">{l.name}</h4>
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">{new Date(l.start_date).toLocaleDateString()} - {new Date(l.end_date).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-1 text-[9px] font-black uppercase rounded-lg border ${
                            l.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                            l.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>{l.status}</span>
                        </div>
                        <p className="text-sm text-zinc-700 italic mb-6">"{l.reason}"</p>
                        {l.status === 'PENDING' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleLeaveAction(l.id, 'APPROVED')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors"><CheckCircle size={14}/> Approve</button>
                            <button onClick={() => handleLeaveAction(l.id, 'REJECTED')} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors"><XCircle size={14}/> Reject</button>
                          </div>
                        )}
                      </div>
                    ))}
                    {leaves.length === 0 && <div className="col-span-full py-8 text-center text-zinc-400 text-sm">No leave requests pending.</div>}
                 </div>
              </motion.div>
            )}

            {activeTab === 'PAYROLL' && (
              <motion.div key="payroll" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm">
                 <h3 className="font-bold text-lg text-zinc-800 mb-6">Payroll Overview</h3>
                 <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-zinc-100 text-zinc-400 text-xs uppercase tracking-wider">
                        <th className="pb-3 font-semibold">Employee</th>
                        <th className="pb-3 font-semibold">Base Salary</th>
                        <th className="pb-3 font-semibold">Net Payable (MTD)</th>
                        <th className="pb-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staff.map(s => (
                        <tr key={s.id} className="border-b border-zinc-50">
                          <td className="py-4 font-bold text-zinc-900">{s.name}</td>
                          <td className="py-4 text-zinc-600">₹{parseFloat(s.base_salary).toLocaleString()}</td>
                          <td className="py-4 text-emerald-600 font-bold">₹{parseFloat(s.base_salary).toLocaleString()}</td>
                          <td className="py-4">
                            <span className="px-2 py-1 bg-zinc-100 text-zinc-600 text-[10px] font-bold uppercase rounded-lg border border-zinc-200">Pending</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
