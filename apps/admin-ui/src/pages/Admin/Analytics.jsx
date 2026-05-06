import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, Users, ShoppingBag, BarChart2, Loader2, Download, PieChart as PieIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  LineChart, Line, CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend
} from 'recharts';
import api from '../../api';

const StatsCard = ({ title, value, icon: Icon, color, loading }) => (
  <div className="bg-card-white border border-border-light p-6 rounded-xl shadow-sm">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-lg bg-${color}/10 text-${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        {loading ? (
          <div className="h-7 w-24 bg-light-bg animate-pulse rounded mt-1"></div>
        ) : (
          <h3 className="text-xl font-bold text-text-primary mt-0.5">{value}</h3>
        )}
      </div>
    </div>
  </div>
);

const AdminAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  const today = new Date();
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [dates, setDates] = useState({
    startDate: thirtyDaysAgo.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0]
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/store/detailed', {
        params: {
          startDate: dates.startDate,
          endDate: dates.endDate
        }
      });
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dates]);

  const handleDateChange = (e) => {
    setDates(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleExportCSV = () => {
    if (!data) return;

    // Build CSV for Revenue Trend
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Type,Date/Label,Value,Count\n";
    
    data.revenueTrend.forEach(row => {
      csvContent += `Revenue Trend,${row._id},${row.revenue},${row.orders}\n`;
    });
    
    data.topItems.forEach(row => {
      csvContent += `Top Item,${row._id},${row.revenue},${row.count}\n`;
    });

    data.categoryBreakdown.forEach(row => {
      csvContent += `Category,${row._id},${row.revenue},${row.count}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_export_${dates.startDate}_to_${dates.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const analytics = data || {
    revenueTrend: [],
    peakHours: [],
    topItems: [],
    categoryBreakdown: []
  };

  const totalRevenue = analytics.revenueTrend.reduce((sum, day) => sum + day.revenue, 0);
  const totalOrders = analytics.revenueTrend.reduce((sum, day) => sum + day.orders, 0);
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Analytics</h2>
          <p className="text-sm text-text-secondary mt-1">Detailed performance insights for your store</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-card-white border border-border-light rounded-lg px-3 py-2 shadow-sm">
            <Calendar className="w-4 h-4 text-text-muted" />
            <input 
              type="date" 
              name="startDate"
              value={dates.startDate}
              onChange={handleDateChange}
              className="text-sm bg-transparent border-none focus:ring-0 text-text-primary cursor-pointer"
            />
            <span className="text-text-muted">to</span>
            <input 
              type="date" 
              name="endDate"
              value={dates.endDate}
              onChange={handleDateChange}
              className="text-sm bg-transparent border-none focus:ring-0 text-text-primary cursor-pointer"
            />
          </div>
          <button 
            onClick={handleExportCSV}
            disabled={loading || !data}
            className="flex items-center gap-2 px-4 py-2 bg-card-white border border-border-light rounded-lg text-sm font-medium text-text-primary hover:bg-light-bg transition-colors shadow-sm disabled:opacity-50"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Total Revenue" 
          value={`₹${(totalRevenue / 100).toLocaleString()}`} 
          icon={TrendingUp} 
          color="success" 
          loading={loading}
        />
        <StatsCard 
          title="Total Orders" 
          value={totalOrders} 
          icon={ShoppingBag} 
          color="primary" 
          loading={loading}
        />
        <StatsCard 
          title="Avg. Ticket Size" 
          value={`₹${(avgOrderValue / 100).toFixed(2)}`} 
          icon={BarChart2} 
          color="info" 
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Revenue Trend</h3>
            <div className="text-xs text-text-muted">Daily revenue over period</div>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="h-full w-full bg-light-bg animate-pulse rounded"></div>
            ) : analytics.revenueTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.revenueTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="_id" 
                    fontSize={11} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(val) => new Date(val).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val / 100).toLocaleString()}`} />
                  <Tooltip 
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => [`₹${(value / 100).toLocaleString()}`, 'Revenue']}
                    labelFormatter={(label) => new Date(label).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#6366F1" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted italic">No data available for this range</div>
            )}
          </div>
        </div>

        {/* Category Breakdown Chart */}
        <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Category Breakdown</h3>
            <div className="text-xs text-text-muted">Revenue by category</div>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="h-full w-full bg-light-bg animate-pulse rounded"></div>
            ) : analytics.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="revenue"
                    nameKey="_id"
                    label={({_id, percent}) => `${_id} ${(percent * 100).toFixed(0)}%`}
                  >
                    {analytics.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${(value / 100).toLocaleString()}`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted italic">No data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Peak Hours Chart */}
        <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-text-primary">Peak Ordering Hours</h3>
            <div className="text-xs text-text-muted">Orders by hour of day</div>
          </div>
          <div className="h-[300px] w-full">
            {loading ? (
              <div className="h-full w-full bg-light-bg animate-pulse rounded"></div>
            ) : analytics.peakHours.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.peakHours}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="hour" fontSize={10} tickLine={false} axisLine={false} interval={2} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}}
                    contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                    formatter={(value) => [value, 'Orders']}
                  />
                  <Bar dataKey="orders" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted italic">No data available</div>
            )}
          </div>
        </div>

        {/* Top Performing Items Table */}
        <div className="bg-card-white border border-border-light rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border-light flex justify-between items-center">
            <h3 className="text-lg font-semibold text-text-primary">Top Performing Items</h3>
            <span className="text-sm text-text-muted">By revenue generated</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-light-bg/50 text-text-muted text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Item Name</th>
                  <th className="px-6 py-4 font-semibold">Units Sold</th>
                  <th className="px-6 py-4 font-semibold text-right">Revenue</th>
                  <th className="px-6 py-4 font-semibold text-right">Contribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {loading ? (
                  [1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      <td className="px-6 py-4"><div className="h-4 w-32 bg-light-bg animate-pulse rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-12 bg-light-bg animate-pulse rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-4 w-16 bg-light-bg animate-pulse ml-auto rounded"></div></td>
                      <td className="px-6 py-4"><div className="h-2 w-full bg-light-bg animate-pulse rounded mt-1"></div></td>
                    </tr>
                  ))
                ) : analytics.topItems.length > 0 ? (
                  analytics.topItems.map((item, index) => (
                    <tr key={index} className="hover:bg-light-bg/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-text-primary">{item._id}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">{item.count}</td>
                      <td className="px-6 py-4 text-sm text-text-primary text-right font-semibold">₹{(item.revenue / 100).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="w-24 bg-light-bg rounded-full h-1.5 hidden sm:block">
                            <div 
                              className="bg-primary h-1.5 rounded-full" 
                              style={{ width: `${Math.min(100, (item.revenue / totalRevenue) * 100 * 5)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-text-muted w-10">
                            {totalRevenue > 0 ? Math.round((item.revenue / totalRevenue) * 100) : 0}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-text-muted italic">No sales recorded for this period</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;
