import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, Users, ShoppingBag, IndianRupee, Loader2, ArrowRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../api';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 30 days
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/analytics/superadmin/platform?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`);
      setStats(response.data.data);
    } catch (err) {
      console.error('Failed to fetch platform analytics', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (!stats) return;
    const headers = ['Date', 'Revenue (Rupees)', 'Orders'];
    const rows = stats.revenueTrend.map(day => [
      day._id,
      (day.revenue / 100).toFixed(2),
      day.orders
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `platform_analytics_${dateRange.startDate}_to_${dateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !stats) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Helper to get heat intensity
  const getIntensity = (dayIdx, hour) => {
    const entry = stats?.peakHours.find(p => p._id.dayOfWeek === dayIdx + 1 && p._id.hour === hour);
    if (!entry) return 0;
    const max = Math.max(...stats.peakHours.map(p => p.count));
    return entry.count / max;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Platform Analytics</h2>
          <p className="text-sm text-text-secondary mt-1">Detailed performance metrics across all tenants</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-card-white border border-border-light rounded-xl px-3 py-1.5 shadow-sm">
            <Calendar className="w-4 h-4 text-text-muted" />
            <input 
              type="date" 
              value={dateRange.startDate} 
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
              className="text-xs font-bold bg-transparent outline-none cursor-pointer"
            />
            <ArrowRight className="w-3 h-3 text-text-muted" />
            <input 
              type="date" 
              value={dateRange.endDate} 
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
              className="text-xs font-bold bg-transparent outline-none cursor-pointer"
            />
          </div>
          <button 
            onClick={fetchStats}
            className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
          >
            Update
          </button>
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-border-light rounded-xl text-sm font-bold hover:bg-light-bg transition-all"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-card-white border border-border-light rounded-2xl shadow-sm p-8">
        <h3 className="text-sm font-bold text-text-primary mb-8 uppercase tracking-wider">Gross Revenue Trend</h3>
        <div className="h-[340px] w-full" style={{ minHeight: '340px' }}>
          <ResponsiveContainer width="99%" height={340}>
            <AreaChart data={stats?.revenueTrend}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="_id" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
                tickFormatter={(val) => `₹${(val / 100).toLocaleString()}`} 
              />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                formatter={(value) => [`₹${(value / 100).toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Heatmap */}
        <div className="bg-card-white border border-border-light rounded-2xl shadow-sm p-8">
          <h3 className="text-sm font-bold text-text-primary mb-8 uppercase tracking-wider">Order Density (Peak Hours)</h3>
          <div className="space-y-1">
             <div className="flex gap-1">
                <div className="w-12"></div>
                {hours.filter(h => h % 3 === 0).map(h => (
                   <div key={h} className="flex-1 text-[10px] text-text-muted text-center">{h}:00</div>
                ))}
             </div>
             {days.map((day, dIdx) => (
               <div key={day} className="flex items-center gap-1 h-6">
                  <div className="w-12 text-[10px] font-bold text-text-secondary">{day}</div>
                  <div className="flex-1 flex gap-0.5 h-full">
                     {hours.map(h => {
                       const intensity = getIntensity(dIdx, h);
                       return (
                         <div 
                           key={h} 
                           className="flex-1 rounded-[2px] transition-all hover:ring-1 hover:ring-primary"
                           style={{ backgroundColor: intensity === 0 ? '#f8fafc' : `rgba(99, 102, 241, ${Math.max(0.1, intensity)})` }}
                           title={`${day} ${h}:00 - Intensity: ${(intensity * 100).toFixed(0)}%`}
                         ></div>
                       );
                     })}
                  </div>
               </div>
             ))}
          </div>
          <div className="mt-6 flex justify-between items-center px-12">
             <span className="text-[10px] text-text-muted">Less Busy</span>
             <div className="h-1.5 w-32 rounded-full bg-gradient-to-r from-[#f8fafc] to-[#6366F1]"></div>
             <span className="text-[10px] text-text-muted">Peak Hours</span>
          </div>
        </div>

        {/* Top Stores by Revenue */}
        <div className="bg-card-white border border-border-light rounded-2xl shadow-sm p-8">
          <h3 className="text-sm font-bold text-text-primary mb-8 uppercase tracking-wider">Top Performing Stores</h3>
          <div className="space-y-4">
             {stats?.storePerformance.slice(0, 5).map((store, idx) => (
                <div key={store._id} className="flex items-center gap-4">
                   <div className="w-8 h-8 rounded-lg bg-light-bg flex items-center justify-center font-bold text-text-secondary text-xs">{idx + 1}</div>
                   <div className="flex-1">
                      <p className="text-sm font-bold text-text-primary">{store.name}</p>
                      <p className="text-xs text-text-muted">/{store.slug}</p>
                   </div>
                   <div className="text-right">
                      <p className="text-sm font-bold text-text-primary">₹{(store.revenue / 100).toLocaleString()}</p>
                      <p className="text-[10px] text-text-muted font-bold uppercase">{store.orders} Orders</p>
                   </div>
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
