import React, { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, Receipt, CheckCircle, Loader2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../api';

const KPICard = ({ title, value, trend, subtitle, icon: Icon, color, loading }) => (
  <div className="bg-card-white border border-border-light p-6 rounded-xl shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-light-bg animate-pulse rounded mt-1"></div>
        ) : (
          <h3 className="text-2xl font-bold text-text-primary mt-1">{value}</h3>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-${color}/10 text-${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      {trend && !loading && (
        <span className={`text-xs font-semibold flex items-center ${trend.isPositive ? 'text-success' : 'text-error'}`}>
          {trend.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {trend.value}
        </span>
      )}
      <span className="text-xs text-text-muted">{subtitle}</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/analytics/store/kpis');
        if (response.data.success) {
          setData(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const COLORS = ['#10B981', '#3B82F6', '#EF4444'];

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center text-error bg-card-white border border-border-light rounded-xl">
        <p className="text-lg font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  const kpis = data || {
    todayOrders: 0,
    todayRevenue: 0,
    liveOrders: 0,
    avgOrderValue: 0,
    recentOrders: [],
    revenueData: [],
    statusData: [],
    topItems: []
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Today's Orders" 
          value={kpis.todayOrders} 
          subtitle="Orders placed today" 
          icon={Receipt} 
          color="primary" 
          loading={loading}
        />
        <KPICard 
          title="Today's Revenue" 
          value={`₹${(kpis.todayRevenue / 100).toLocaleString()}`} 
          subtitle="Completed sales today" 
          icon={ArrowUpRight} 
          color="success" 
          loading={loading}
        />
        <KPICard 
          title="Live Orders" 
          value={kpis.liveOrders} 
          subtitle="Active right now" 
          icon={Clock} 
          color="warning" 
          loading={loading}
        />
        <KPICard 
          title="Avg Order Value" 
          value={`₹${(kpis.avgOrderValue / 100).toFixed(2)}`} 
          subtitle="Last 30 days" 
          icon={CheckCircle} 
          color="info" 
          loading={loading}
        />
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Column - 65% */}
        <div className="xl:w-[65%] space-y-6">
          <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Recent Orders</h3>
              <a href="/admin/orders" className="text-sm text-primary hover:underline font-medium">View All</a>
            </div>
            
            <div className="space-y-4">
              {loading ? (
                [1, 2, 3, 4].map(i => (
                  <div key={i} className="h-20 bg-light-bg animate-pulse rounded-lg"></div>
                ))
              ) : kpis.recentOrders.length > 0 ? (
                kpis.recentOrders.map((order) => (
                  <div key={order.id} className="flex justify-between items-center p-4 border border-border-light rounded-lg hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-light-bg rounded flex items-center justify-center font-mono font-bold text-text-secondary text-lg border border-border-light">
                        {order.table.includes('Table') ? order.table.split(' ')[1] : 'Q'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-sm text-text-primary font-semibold">{order.id}</span>
                          <span className="text-xs text-text-muted flex items-center"><Clock className="w-3 h-3 mr-1" /> {order.time}</span>
                        </div>
                        <p className="text-sm text-text-secondary truncate max-w-[300px]">{order.items}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="font-semibold text-text-primary">₹{(order.amount / 100).toLocaleString()}</span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-40 flex items-center justify-center text-text-muted">
                  No orders found today
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - 35% */}
        <div className="xl:w-[35%] space-y-6">
          {/* Revenue Chart */}
          <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Weekly Revenue</h3>
            <div className="h-[200px] w-full">
              {loading ? (
                <div className="h-full w-full bg-light-bg animate-pulse rounded"></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={kpis.revenueData}>
                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} textAnchor="middle" />
                    <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} formatter={(value) => `₹${(value / 100).toLocaleString()}`} />
                    <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Top Items Today</h3>
            <div className="space-y-4">
              {loading ? (
                [1, 2, 3].map(i => (
                  <div key={i} className="space-y-2">
                    <div className="h-4 w-1/2 bg-light-bg animate-pulse rounded"></div>
                    <div className="h-2 w-full bg-light-bg animate-pulse rounded"></div>
                  </div>
                ))
              ) : kpis.topItems.length > 0 ? (
                kpis.topItems.map((item, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-primary font-medium">{item.name}</span>
                      <span className="text-text-secondary">{item.count} orders</span>
                    </div>
                    <div className="w-full bg-light-bg rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: `${(item.count/item.max)*100}%` }}></div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-text-muted italic">No items sold yet today</p>
              )}
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Order Status (%)</h3>
            <div className="flex items-center">
              <div className="w-[120px] h-[120px]">
                {loading ? (
                  <div className="w-full h-full bg-light-bg animate-pulse rounded-full"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={kpis.statusData} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                        {kpis.statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="ml-6 space-y-2 flex-1">
                {kpis.statusData.map((entry, index) => (
                  <div key={index} className="flex items-center text-sm">
                    <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index] }}></div>
                    <span className="text-text-secondary mr-2">{entry.name}</span>
                    <span className="font-semibold text-text-primary ml-auto">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
