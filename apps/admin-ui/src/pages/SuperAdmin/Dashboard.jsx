import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { Store, Activity, ShoppingBag, IndianRupee, ArrowUpRight, CheckCircle2, Search, Loader2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import DataTable from '../../components/DataTable';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api, { setAccessToken } from '../../api';
import { useAuth } from '../../AuthContext';

const KPICard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
  <div className="bg-card-white border border-border-light p-6 rounded-xl shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <h3 className="text-2xl font-bold text-text-primary mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-lg bg-${color}/10 text-${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <div className="flex items-center gap-2">
      {trend && (
        <span className={`text-xs font-semibold flex items-center ${trend.isPositive ? 'text-success' : 'text-error'}`}>
          {trend.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : null}
          {trend.value}
        </span>
      )}
      <span className="text-xs text-text-muted">{subtitle}</span>
    </div>
  </div>
);

const SuperAdminDashboard = () => {
  const [stores, setStores] = useState([]);
  const [kpis, setKpis] = useState({ totalStores: '-', activeStores: '-', todaysOrders: '-', monthlyRevenue: '-' });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, []);

  const fetchData = async (signal) => {
    try {
      const [storesRes, kpisRes] = await Promise.all([
        api.get('/stores?stats=true', { signal }),
        api.get('/analytics/superadmin/kpis', { signal })
      ]);
      setStores(storesRes.data.data);
      if (kpisRes.data.success) {
        setKpis(kpisRes.data.data);
      }
    } catch (err) {
      if (err.name === 'CanceledError') return;
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    store.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeRate = kpis.totalStores && kpis.totalStores !== '-' ? ((kpis.activeStores / kpis.totalStores) * 100).toFixed(1) : 0;

  const columns = [
    { header: 'Restaurant', accessor: 'name', render: (row) => (
        <div>
          <div className="font-medium text-text-primary">{row.name}</div>
          <div className="text-xs text-text-muted">/{row.slug}</div>
        </div>
      )
    },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Orders', accessor: 'orderCount', render: (row) => <span className="font-semibold text-text-primary">{row.orderCount}</span> },
    { header: 'Revenue', accessor: 'revenue', render: (row) => <span className="font-bold text-success">₹{(row.revenue / 100).toLocaleString()}</span> }
  ];

  const tableData = filteredStores.map(store => ({
    id: store._id,
    name: store.name,
    slug: store.slug,
    rawStatus: store.isActive,
    status: store.isActive ? 'Active' : 'Inactive',
    orderCount: store.orderCount || 0,
    revenue: store.totalRevenue || 0
  }));

  const chartData = [
    { day: 'Mon', volume: 1200 }, { day: 'Tue', volume: 1540 }, { day: 'Wed', volume: 1420 },
    { day: 'Thu', volume: 1680 }, { day: 'Fri', volume: 2100 }, { day: 'Sat', volume: 2600 }, { day: 'Sun', volume: 2300 },
  ];

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Restaurants" value={kpis.totalStores} subtitle="total onboarded" icon={Store} color="primary" />
        <KPICard title="Active Restaurants" value={kpis.activeStores} subtitle={`${activeRate}% active rate`} icon={CheckCircle2} color="success" />
        <KPICard title="Today's Orders" value={kpis.todaysOrders} subtitle="Across all stores" icon={ShoppingBag} color="warning" />
        <KPICard title="Platform Revenue" value={kpis.monthlyRevenue !== '-' ? `₹${(kpis.monthlyRevenue / 100).toLocaleString()}` : '-'} subtitle="This month" icon={IndianRupee} color="info" />
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Col - 60% */}
        <div className="xl:w-[60%] space-y-6">
          <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6 overflow-hidden flex flex-col h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Restaurant Activity</h3>
              <div className="relative w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search restaurants..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm border border-border-light rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto flex-1">
              <DataTable columns={columns} data={tableData} />
            </div>
            <div className="pt-4 border-t border-border-light text-center mt-4">
              <Link to="/superadmin/restaurants">
                <button className="text-sm text-primary font-medium hover:underline">View All Restaurants</button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Col - 40% */}
        <div className="xl:w-[40%] space-y-6">
          {/* Platform Health */}
          <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6 grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <h3 className="text-lg font-semibold text-text-primary">Platform Health</h3>
            </div>
            <div className="bg-light-bg p-4 rounded-lg border border-border-light">
              <p className="text-xs text-text-secondary mb-1">API Response</p>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold text-success">42ms</span>
                <span className="text-[10px] text-text-muted mb-1 flex items-center"><Activity className="w-3 h-3 mr-1"/> Avg</span>
              </div>
            </div>
            <div className="bg-light-bg p-4 rounded-lg border border-border-light">
              <p className="text-xs text-text-secondary mb-1">Active Sockets</p>
              <div className="flex items-end gap-2">
                <span className="text-xl font-bold text-primary">1,402</span>
              </div>
            </div>
          </div>

          {/* Volume Chart */}
          <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6 flex flex-col">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Order Volume (7 Days)</h3>
            <div className="h-[200px] w-full" style={{ minHeight: '200px' }}>
              <ResponsiveContainer width="99%" height={200}>
                <LineChart data={chartData}>
                  <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="volume" stroke="#6366F1" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
