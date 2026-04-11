import React from 'react';
import { ArrowUpRight, ArrowDownRight, Clock, Receipt, CheckCircle } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const KPICard = ({ title, value, trend, subtitle, icon: Icon, color }) => (
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
          {trend.isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
          {trend.value}
        </span>
      )}
      <span className="text-xs text-text-muted">{subtitle}</span>
    </div>
  </div>
);

const AdminDashboard = () => {
  // Dummy Data
  const recentOrders = [
    { id: 'ORD-0421', table: 'Table 7', items: 'Paneer Tikka ×2, Lassi ×1', amount: '₹680', status: 'Preparing', time: '2 min ago' },
    { id: 'ORD-0420', table: 'Table 3', items: 'Biryani ×1, Raita ×1', amount: '₹420', status: 'Confirmed', time: '5 min ago' },
    { id: 'ORD-0419', table: 'Table 12', items: 'Butter Chicken ×2, Naan ×2', amount: '₹960', status: 'Ready', time: '12 min ago' },
    { id: 'ORD-0418', table: 'Table 5', items: 'Masala Chai ×2', amount: '₹120', status: 'Completed', time: '24 min ago' },
  ];

  const revenueData = [
    { name: 'Mon', value: 12000 },
    { name: 'Tue', value: 14000 },
    { name: 'Wed', value: 13500 },
    { name: 'Thu', value: 15200 },
    { name: 'Fri', value: 18000 },
    { name: 'Sat', value: 24000 },
    { name: 'Sun', value: 21000 },
  ];

  const statusData = [
    { name: 'Completed', value: 65 },
    { name: 'In-Progress', value: 25 },
    { name: 'Cancelled', value: 10 },
  ];

  const COLORS = ['#10B981', '#3B82F6', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Today's Orders" value="38" trend={{ isPositive: true, value: '31%' }} subtitle="vs yesterday" icon={Receipt} color="primary" />
        <KPICard title="Today's Revenue" value="₹14,250" trend={{ isPositive: true, value: '8.4%' }} subtitle="vs last week" icon={ArrowUpRight} color="success" />
        <KPICard title="Live Orders" value="6" subtitle="Active right now" icon={Clock} color="warning" />
        <KPICard title="Avg Order Value" value="₹375" subtitle="Last 30 days" icon={CheckCircle} color="info" />
      </div>

      <div className="flex flex-col xl:flex-row gap-6">
        {/* Left Column - 65% */}
        <div className="xl:w-[65%] space-y-6">
          <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-text-primary">Live Order Feed</h3>
              <a href="/admin/orders" className="text-sm text-primary hover:underline font-medium">View All</a>
            </div>
            
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex justify-between items-center p-4 border border-border-light rounded-lg hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-light-bg rounded flex items-center justify-center font-mono font-bold text-text-secondary text-lg border border-border-light">
                      {order.table.split(' ')[1]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-text-primary font-semibold">{order.id}</span>
                        <span className="text-xs text-text-muted flex items-center"><Clock className="w-3 h-3 mr-1" /> {order.time}</span>
                      </div>
                      <p className="text-sm text-text-secondary">{order.items}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-semibold text-text-primary">{order.amount}</span>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - 35% */}
        <div className="xl:w-[35%] space-y-6">
          {/* Revenue Chart */}
          <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-6">Recent Revenue</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} textAnchor="middle" />
                  <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Bar dataKey="value" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Top Items Today</h3>
            <div className="space-y-4">
              {[
                { name: 'Butter Chicken', count: 24, max: 30 },
                { name: 'Garlic Naan', count: 18, max: 30 },
                { name: 'Paneer Tikka', count: 12, max: 30 },
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-text-primary font-medium">{item.name}</span>
                    <span className="text-text-secondary">{item.count} orders</span>
                  </div>
                  <div className="w-full bg-light-bg rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: `${(item.count/item.max)*100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Status Breakdown */}
          <div className="bg-card-white border border-border-light rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Order Status</h3>
            <div className="flex items-center">
              <div className="w-[120px] h-[120px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusData} innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="ml-6 space-y-2">
                {statusData.map((entry, index) => (
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
