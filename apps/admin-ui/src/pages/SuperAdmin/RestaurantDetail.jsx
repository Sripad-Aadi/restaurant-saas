import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Globe, ShoppingBag, LayoutGrid, BarChart3, Settings, 
  Loader2, ExternalLink, Calendar, MapPin, Phone, Mail, ShieldAlert,
  ArrowUpRight, TrendingUp
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api';

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabData, setTabData] = useState({ orders: [], products: [], analytics: [], settings: {} });
  const [tabLoading, setTabLoading] = useState(false);

  useEffect(() => {
    fetchStore();
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    if (store) fetchTabData(activeTab, controller.signal);
    return () => controller.abort();
  }, [activeTab, store]);

  const fetchStore = async () => {
    try {
      const response = await api.get(`/stores/${id}`);
      setStore(response.data.data);
    } catch (err) {
      console.error('Failed to fetch store', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTabData = async (tab, signal) => {
    setTabLoading(true);
    try {
      if (tab === 'orders' && tabData.orders.length === 0) {
        const res = await api.get(`/stores/${id}/orders`, { signal });
        setTabData(prev => ({ ...prev, orders: res.data.data }));
      } else if (tab === 'menu' && tabData.products.length === 0) {
        const res = await api.get(`/stores/${id}/products`, { signal });
        setTabData(prev => ({ ...prev, products: res.data.data }));
      } else if (tab === 'analytics' && tabData.analytics.length === 0) {
        const res = await api.get(`/stores/${id}/analytics`, { signal });
        setTabData(prev => ({ ...prev, analytics: res.data.data }));
      }
    } catch (err) {
      if (err.name === 'CanceledError') return;
      console.error(`Failed to fetch ${tab} data`, err);
    } finally {
      setTabLoading(false);
    }
  };

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    // Implementation for updating store settings
    alert('Store update logic goes here');
  };

  const handleResetPassword = async () => {
    const newPass = prompt('Enter new temporary password (min 6 chars):');
    if (newPass && newPass.length >= 6) {
      try {
        await api.post(`/stores/${id}/reset-password`, { password: newPass });
        alert('Admin password has been reset successfully.');
      } catch (err) {
        alert('Failed to reset password: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (!store) return <div className="p-8 text-center">Store not found</div>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutGrid },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'menu', label: 'Menu', icon: Globe },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Restaurants
        </button>
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-border-light flex items-center justify-center overflow-hidden shadow-sm">
              {store.logo ? <img src={store.logo} alt="" className="w-full h-full object-cover" /> : <Globe className="w-8 h-8 text-text-muted" />}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-text-primary">{store.name}</h1>
                <StatusBadge status={store.isActive ? 'Active' : 'Inactive'} />
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {store.timezone}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Created {new Date(store.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
             {/* Action buttons removed as per request */}
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex gap-1 bg-light-bg p-1 rounded-2xl w-fit mb-6 border border-border-light">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-card-white text-primary shadow-sm' 
                : 'text-text-secondary hover:text-text-primary hover:bg-white/50'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : 'text-text-muted'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0 bg-card-white rounded-3xl border border-border-light shadow-sm overflow-hidden flex flex-col relative">
        {tabLoading && activeTab !== 'overview' && (
          <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === 'overview' && (
             <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                   <div className="bg-light-bg/50 rounded-2xl p-6 border border-border-light">
                      <h3 className="font-bold text-text-primary mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" /> Store Performance
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                         <div className="bg-card-white p-4 rounded-xl border border-border-light shadow-sm">
                            <p className="text-xs text-text-secondary mb-1 font-bold uppercase tracking-wider">Total Orders</p>
                            <p className="text-2xl font-black text-text-primary">1,284</p>
                            <p className="text-xs text-success mt-1 flex items-center gap-1 font-bold">
                               <ArrowUpRight className="w-3 h-3" /> +12%
                            </p>
                         </div>
                         <div className="bg-card-white p-4 rounded-xl border border-border-light shadow-sm">
                            <p className="text-xs text-text-secondary mb-1 font-bold uppercase tracking-wider">Gross Revenue</p>
                            <p className="text-2xl font-black text-text-primary">₹{(42500 / 100).toLocaleString()}</p>
                            <p className="text-xs text-success mt-1 flex items-center gap-1 font-bold">
                               <ArrowUpRight className="w-3 h-3" /> +8.4%
                            </p>
                         </div>
                         <div className="bg-card-white p-4 rounded-xl border border-border-light shadow-sm">
                            <p className="text-xs text-text-secondary mb-1 font-bold uppercase tracking-wider">Active Menu Items</p>
                            <p className="text-2xl font-black text-text-primary">24</p>
                         </div>
                      </div>
                   </div>

                   <div className="bg-light-bg/50 rounded-2xl p-6 border border-border-light">
                      <h3 className="font-bold text-text-primary mb-4">About Restaurant</h3>
                      <p className="text-text-secondary leading-relaxed mb-6 italic">"{store.description || 'No description provided.'}"</p>
                      
                      <div className="grid grid-cols-2 gap-y-4 text-sm">
                         <div>
                            <span className="text-text-muted font-medium mr-2">Cuisine:</span>
                            <span className="text-text-primary font-bold">{store.cuisineType || 'General'}</span>
                         </div>
                         <div>
                            <span className="text-text-muted font-medium mr-2">Wait Time:</span>
                            <span className="text-text-primary font-bold">{store.avgWaitTime || 'N/A'}</span>
                         </div>
                         <div>
                            <span className="text-text-muted font-medium mr-2">Slug:</span>
                            <span className="text-text-primary font-bold">/{store.slug}</span>
                         </div>
                         <div>
                            <span className="text-text-muted font-medium mr-2">Timezone:</span>
                            <span className="text-text-primary font-bold">{store.timezone}</span>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="bg-light-bg/50 rounded-2xl p-6 border border-border-light">
                      <h3 className="font-bold text-text-primary mb-4">Payment Setup</h3>
                      <div className="space-y-4">
                         <div className="flex items-center justify-between p-3 bg-card-white rounded-xl border border-border-light shadow-sm">
                            <div className="flex items-center gap-2">
                               <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                  <ShieldAlert className="w-4 h-4" />
                               </div>
                               <span className="text-xs font-bold text-text-primary">Razorpay Live</span>
                            </div>
                            <span className={store.razorpay?.keyId ? "text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-bold" : "text-[10px] bg-error/10 text-error px-2 py-0.5 rounded-full font-bold"}>
                               {store.razorpay?.keyId ? "CONNECTED" : "MISSING"}
                            </span>
                         </div>
                         <p className="text-[10px] text-text-muted px-1">SuperAdmins can view and update these credentials in the Settings tab if required for support.</p>
                      </div>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-text-primary">Recent Orders (Read-Only)</h3>
                 <p className="text-xs text-text-muted">Viewing latest 100 orders for auditing</p>
              </div>
              <DataTable 
                columns={[
                  { header: 'Order ID', accessor: 'orderNumber', render: (row) => <span className="font-mono font-bold text-primary">{row.orderNumber}</span> },
                  { header: 'Date', accessor: 'created', render: (row) => new Date(row.createdAt).toLocaleDateString() },
                  { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
                  { header: 'Total', accessor: 'total', render: (row) => <span className="font-bold text-text-primary">₹{(row.total / 100).toFixed(2)}</span> }
                ]} 
                data={tabData.orders} 
              />
            </div>
          )}

          {activeTab === 'menu' && (
            <div>
               <div className="flex justify-between items-center mb-6">
                 <h3 className="text-lg font-bold text-text-primary">Store Menu (Read-Only)</h3>
                 <p className="text-xs text-text-muted">Active products currently visible to customers</p>
              </div>
              <DataTable 
                columns={[
                  { header: 'Item Name', accessor: 'name', render: (row) => (
                    <div className="flex items-center gap-3">
                       <div className="w-8 h-8 rounded bg-light-bg flex items-center justify-center text-[10px] text-text-muted">IMG</div>
                       <span className="font-medium text-text-primary">{row.name}</span>
                    </div>
                  )},
                  { header: 'Price', accessor: 'price', render: (row) => <span className="font-bold text-text-primary">₹{(row.price / 100).toFixed(2)}</span> },
                  { header: 'Availability', accessor: 'isAvailable', render: (row) => row.isAvailable ? <span className="text-xs text-success font-bold">AVAILABLE</span> : <span className="text-xs text-error font-bold">OUT OF STOCK</span> }
                ]} 
                data={tabData.products} 
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-8">
               <div className="bg-light-bg/30 p-6 rounded-2xl border border-border-light">
                  <h3 className="text-sm font-bold text-text-primary mb-6 uppercase tracking-wider">Revenue Trend (Last 7 Days)</h3>
                  <div className="h-[300px] w-full" style={{ minHeight: '300px' }}>
                    <ResponsiveContainer width="99%" height={300}>
                      <LineChart data={tabData.analytics}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="_id" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${(val / 100).toFixed(0)}`} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                          labelStyle={{ fontWeight: 'bold', marginBottom: '4px' }}
                          formatter={(value) => [`₹${(value / 100).toFixed(2)}`, 'Revenue']}
                        />
                        <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
               </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-2xl">
               <form onSubmit={handleUpdateStore} className="space-y-6 mb-12">
                  <h3 className="text-lg font-bold text-text-primary mb-4">Edit Store Information</h3>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="col-span-2">
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Restaurant Name</label>
                        <input type="text" defaultValue={store.name} className="w-full p-3 border border-border-light rounded-xl focus:border-primary outline-none" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Cuisine Type</label>
                        <input type="text" defaultValue={store.cuisineType} className="w-full p-3 border border-border-light rounded-xl focus:border-primary outline-none" />
                     </div>
                     <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Avg Wait Time</label>
                        <input type="text" defaultValue={store.avgWaitTime} className="w-full p-3 border border-border-light rounded-xl focus:border-primary outline-none" />
                     </div>
                  </div>
                  <button type="submit" className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">Update Store</button>
               </form>

               <div className="pt-8 border-t border-border-light">
                  <h3 className="text-lg font-bold text-error mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5" /> Danger Zone
                  </h3>
                  <div className="bg-error/5 border border-error/20 p-6 rounded-2xl flex justify-between items-center">
                     <div>
                        <p className="font-bold text-text-primary">Reset Admin Password</p>
                        <p className="text-sm text-text-secondary">Reset the primary administrator's password for this restaurant.</p>
                     </div>
                     <button onClick={handleResetPassword} className="px-6 py-2.5 bg-error text-white rounded-xl font-bold hover:bg-error/90 transition-all">Reset Password</button>
                  </div>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantDetail;
