import React, { useState, useEffect } from 'react';
import { Store, Activity, ShoppingBag, IndianRupee, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api';

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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const response = await api.get('/stores');
        setStores(response.data.data);
      } catch (err) {
        console.error('Failed to fetch stores', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStores();
  }, []);

  const totalStores = stores.length;
  const activeStores = stores.filter(s => s.isActive).length;
  const activeRate = totalStores > 0 ? ((activeStores / totalStores) * 100).toFixed(1) : 0;

  const activityData = stores.map(store => ({
    name: store.name,
    slug: store.slug,
    status: store.isActive ? 'Active' : 'Inactive',
    orders: '-', // Not available yet
    rev: '-', // Not available yet
    active: new Date(store.createdAt).toLocaleDateString()
  }));

  const chartData = [
    { day: 'Mon', volume: 1200 }, { day: 'Tue', volume: 1540 }, { day: 'Wed', volume: 1420 },
    { day: 'Thu', volume: 1680 }, { day: 'Fri', volume: 2100 }, { day: 'Sat', volume: 2600 }, { day: 'Sun', volume: 2300 },
  ];

  if (loading) {
    return <div className="p-8 text-center text-text-muted">Loading dashboard data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Restaurants" value={totalStores} subtitle="total onboarded" icon={Store} color="primary" />
        <KPICard title="Active Restaurants" value={activeStores} subtitle={`${activeRate}% active rate`} icon={CheckCircle2} color="success" />
        <KPICard title="Today's Orders" value="-" subtitle="Across all stores (Beta)" icon={ShoppingBag} color="warning" />
        <KPICard title="Platform Revenue" value="-" subtitle="This month (Beta)" icon={IndianRupee} color="info" />
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Col - 60% */}
        <div className="xl:w-[60%] space-y-6">
          <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6 overflow-hidden flex flex-col h-full">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Restaurant Activity</h3>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border-light text-text-secondary">
                    <th className="pb-3 font-semibold">Restaurant</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Orders</th>
                    <th className="pb-3 font-semibold text-right">Revenue</th>
                    <th className="pb-3 font-semibold text-right">Joined On</th>
                  </tr>
                </thead>
                <tbody>
                  {activityData.length === 0 && (
                    <tr><td colSpan="5" className="py-4 text-center text-slate-400">No restaurants yet.</td></tr>
                  )}
                  {activityData.map((row, i) => (
                    <tr key={i} className="border-b border-border-light last:border-0 hover:bg-light-bg/50 cursor-pointer">
                      <td className="py-4">
                        <div className="font-medium text-text-primary">{row.name}</div>
                        <div className="text-xs text-text-muted">/{row.slug}</div>
                      </td>
                      <td className="py-4"><StatusBadge status={row.status} /></td>
                      <td className="py-4 text-right">{row.orders}</td>
                      <td className="py-4 text-right font-medium">{row.rev}</td>
                      <td className="py-4 text-right text-text-secondary text-xs">{row.active}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pt-4 border-t border-border-light text-center">
              <button className="text-sm text-primary font-medium hover:underline">View All Restaurants</button>
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
          <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6">
            <h3 className="text-sm font-semibold text-text-primary mb-4">Order Volume (7 Days)</h3>
            <div className="h-[140px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis dataKey="day" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Line type="monotone" dataKey="volume" stroke="#6366F1" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Action Feed placeholder */}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
