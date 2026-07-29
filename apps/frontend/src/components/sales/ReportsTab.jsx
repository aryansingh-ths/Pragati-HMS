import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';

export default function ReportsTab({ leads = [] }) {
  // Aggregate data for Pipeline Funnel
  const funnelData = useMemo(() => {
    const stages = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost'];
    return stages.map(stage => ({
      name: stage,
      count: leads.filter(l => l.stage === stage).length,
      value: leads.filter(l => l.stage === stage).reduce((sum, l) => sum + (Number(l.value) || 0), 0)
    }));
  }, [leads]);

  // Aggregate data for Product Type Revenue (won deals)
  const productData = useMemo(() => {
    // In our simplified version, we might just look at all pipeline value by 'product_type' for demo, 
    // or just the 'Won' deals. Let's look at all active pipeline for better visuals.
    const activeLeads = leads.filter(l => l.stage !== 'Lost');
    const types = {};
    activeLeads.forEach(l => {
      const type = l.product_type || 'Unknown';
      if (!types[type]) types[type] = 0;
      types[type] += Number(l.value) || 0;
    });
    return Object.keys(types).map(key => ({ name: key, value: types[key] }));
  }, [leads]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];
  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 p-6 flex flex-col h-full relative overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-stone-800">Sales Reports</h2>
        <p className="text-stone-500">Pipeline analysis and revenue forecasts.</p>
      </div>

      {leads.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-stone-400">
          <TrendingUp size={64} className="mb-4 opacity-20" />
          <p className="text-lg font-medium text-stone-600">No Data Available</p>
          <p className="text-sm">Add leads to the pipeline to view reports.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-4">
          {/* Funnel Chart */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
            <h3 className="font-bold text-stone-800 mb-6">Pipeline by Stage (Count)</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
                  <Tooltip cursor={{fill: '#f5f5f4'}} />
                  <Bar dataKey="count" fill="#44403c" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Stage */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
            <h3 className="font-bold text-stone-800 mb-6">Pipeline Value by Stage</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60} />
                  <YAxis tickFormatter={(val) => `₹${(val/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value)} cursor={{fill: '#f5f5f4'}} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Product Type Breakdown */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 lg:col-span-2">
            <h3 className="font-bold text-stone-800 mb-6">Active Pipeline by Product Type</h3>
            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  >
                    {productData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
