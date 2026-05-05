import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Loader2, Globe, Shield, Clock, CreditCard, X } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import ConfirmationModal from '../../components/ConfirmationModal';
import api, { setAccessToken } from '../../api';
import { useAuth } from '../../AuthContext';

const Restaurants = () => {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [showDrawer, setShowDrawer] = useState(false);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false, storeId: null, currentStatus: null });

  // Form State
  const [formData, setFormData] = useState({
    name: '', 
    slug: '', 
    description: '',
    cuisineType: '',
    timezone: 'Asia/Kolkata', 
    avgWaitTime: '15-20 mins',
    logo: '',
    coverImage: '',
    razorpayKey: '',
    razorpaySecret: '',
    adminName: 'Primary Admin', 
    adminEmail: '', 
    adminPassword: ''
  });

  useEffect(() => {
    fetchStores();
  }, []);

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

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        cuisineType: formData.cuisineType,
        timezone: formData.timezone,
        avgWaitTime: formData.avgWaitTime,
        logo: formData.logo || undefined,
        coverImage: formData.coverImage || undefined,
        razorpay: {
          keyId: formData.razorpayKey || null,
          keySecret: formData.razorpaySecret || null
        },
        adminName: formData.adminName,
        adminEmail: formData.adminEmail,
        adminPassword: formData.adminPassword
      };

      await api.post('/stores', payload);
      setShowDrawer(false);
      resetForm();
      setLoading(true);
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create restaurant');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', slug: '', description: '', cuisineType: '', timezone: 'Asia/Kolkata', 
      avgWaitTime: '15-20 mins', logo: '', coverImage: '', razorpayKey: '', razorpaySecret: '',
      adminName: 'Primary Admin', adminEmail: '', adminPassword: ''
    });
  };

  const toggleStatus = async (id, currentStatus) => {
    if (currentStatus) {
      // If deactivating, show modal
      setModalConfig({ isOpen: true, storeId: id, currentStatus: true });
    } else {
      // If activating, do it directly
      try {
        await api.patch(`/stores/${id}/activate`);
        fetchStores();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const confirmDeactivation = async () => {
    try {
      await api.patch(`/stores/${modalConfig.storeId}/deactivate`);
      fetchStores();
    } catch (err) {
      console.error(err);
    }
  };

  const handleImpersonate = async (storeId) => {
    try {
      const response = await api.post('/auth/impersonate', { storeId });
      if (response.data.success) {
        setAccessToken(response.data.accessToken);
        setUser(response.data.user);
        navigate('/admin/dashboard');
      }
    } catch (err) {
      alert('Failed to impersonate admin: ' + (err.response?.data?.message || err.message));
    }
  };

  const filteredStores = stores.filter(store => 
    store.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    store.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { header: 'Restaurant Name', accessor: 'name', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-light-bg border border-border-light flex items-center justify-center overflow-hidden shadow-inner">
          {row.logo ? <img src={row.logo} alt="" className="w-full h-full object-cover" /> : <Globe className="w-5 h-5 text-text-muted" />}
        </div>
        <div>
          <div className="font-medium text-text-primary">{row.name}</div>
          <div className="text-xs text-text-muted">/{row.slug}</div>
        </div>
      </div>
    )},
    { header: 'Cuisine', accessor: 'cuisine', render: (row) => <span className="text-sm font-medium px-2 py-1 bg-light-bg rounded-md text-text-secondary">{row.cuisine}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Created', accessor: 'created' },
    { header: 'Actions', accessor: 'actions', render: (row) => (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate(`/superadmin/restaurants/${row.id}`)}
          className="p-1.5 text-xs font-bold rounded-lg text-info hover:bg-info/10 transition-colors"
        >
          View
        </button>
        <button 
          onClick={() => toggleStatus(row.id, row.rawStatus)}
          className={`p-1.5 text-xs font-bold rounded-lg transition-colors ${
            row.rawStatus 
              ? "text-error hover:bg-error/10"
              : "text-success hover:bg-success/10"
          }`}
        >
          {row.rawStatus ? 'Deactivate' : 'Activate'}
        </button>
        <button 
          onClick={() => handleImpersonate(row.id)}
          className="p-1.5 text-xs font-bold rounded-lg text-primary hover:bg-primary/10 transition-colors"
        >
          Impersonate
        </button>
      </div>
    )}
  ];

  const data = filteredStores.map(store => ({
    id: store._id,
    name: store.name,
    slug: store.slug,
    logo: store.logo,
    cuisine: store.cuisineType || 'General',
    rawStatus: store.isActive,
    status: store.isActive ? 'Active' : 'Inactive',
    created: new Date(store.createdAt).toLocaleDateString()
  }));

  return (
    <div className="h-full flex flex-col relative">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Restaurants</h2>
          <p className="text-sm text-text-secondary mt-1">Manage all tenant restaurants and their settings</p>
        </div>
        <button 
          onClick={() => setShowDrawer(true)}
          className="bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95"
        >
          <Plus className="w-5 h-5" /> Add Restaurant
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 mb-6">
        <div className="relative w-[340px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by name or slug..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-card-white shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 min-h-0 relative bg-card-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
         {loading ? (
           <div className="absolute inset-0 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
         ) : (
           <DataTable columns={columns} data={data} />
         )}
      </div>

      {/* Deactivation Confirmation Modal */}
      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={confirmDeactivation}
        title="Deactivate Restaurant"
        message="Are you sure you want to deactivate this restaurant? All associated admin and customer access will be suspended immediately."
        confirmText="Yes, Deactivate"
      />

      {/* Slide-over Drawer - Add Restaurant */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-dark-bg/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowDrawer(false)}></div>
          <div className="w-[580px] bg-card-white shadow-2xl h-full flex flex-col relative animate-in slide-in-from-right duration-300">
            <div className="px-8 py-5 border-b border-border-light flex justify-between items-center bg-light-bg/50">
              <div>
                <h3 className="font-bold text-xl text-text-primary">Add New Restaurant</h3>
                <p className="text-xs text-text-secondary mt-0.5">Provision a new store and admin account</p>
              </div>
              <button onClick={() => setShowDrawer(false)} className="p-2 hover:bg-border-light rounded-full transition-colors text-text-muted hover:text-text-primary">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleCreate} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-8 space-y-8">
                
                {/* Section: Basic Info */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <Globe className="w-4 h-4" />
                    <h4 className="text-sm font-bold uppercase tracking-wider">Basic Details</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Restaurant Name *</label>
                      <input 
                        type="text" required value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="e.g. Spice Garden" 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Unique Slug *</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">/</span>
                        <input 
                          type="text" required value={formData.slug}
                          onChange={(e) => setFormData({...formData, slug: e.target.value})}
                          className="w-full pl-6 pr-3 py-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                          placeholder="spice-garden" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Cuisine Type</label>
                      <input 
                        type="text" value={formData.cuisineType}
                        onChange={(e) => setFormData({...formData, cuisineType: e.target.value})}
                        className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="e.g. Italian, Indian" 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Short Description</label>
                      <textarea 
                        rows="2" value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none" 
                        placeholder="A brief overview of the restaurant..." 
                      />
                    </div>
                  </div>
                </section>

                {/* Section: Operations */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <Clock className="w-4 h-4" />
                    <h4 className="text-sm font-bold uppercase tracking-wider">Operations</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Timezone</label>
                      <select 
                        value={formData.timezone}
                        onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                        className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white transition-all cursor-pointer"
                      >
                        <option>Asia/Kolkata</option>
                        <option>UTC</option>
                        <option>Europe/London</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Avg Wait Time</label>
                      <input 
                        type="text" value={formData.avgWaitTime}
                        onChange={(e) => setFormData({...formData, avgWaitTime: e.target.value})}
                        className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="e.g. 15-20 mins" 
                      />
                    </div>
                  </div>
                </section>

                {/* Section: Payments */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <CreditCard className="w-4 h-4" />
                    <h4 className="text-sm font-bold uppercase tracking-wider">Payment Settings (Razorpay)</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Key ID</label>
                      <input 
                        type="text" value={formData.razorpayKey}
                        onChange={(e) => setFormData({...formData, razorpayKey: e.target.value})}
                        className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="rzp_live_..." 
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Key Secret</label>
                      <input 
                        type="password" value={formData.razorpaySecret}
                        onChange={(e) => setFormData({...formData, razorpaySecret: e.target.value})}
                        className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        placeholder="••••••••••••" 
                      />
                    </div>
                  </div>
                </section>

                {/* Section: Admin Account */}
                <section>
                  <div className="flex items-center gap-2 mb-4 text-primary">
                    <Shield className="w-4 h-4" />
                    <h4 className="text-sm font-bold uppercase tracking-wider">Primary Admin Account</h4>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Full Name *</label>
                      <input 
                        type="text" required value={formData.adminName}
                        onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                        className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Email Address *</label>
                        <input 
                          type="email" required value={formData.adminEmail}
                          onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                          className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Temp Password *</label>
                        <input 
                          type="password" required value={formData.adminPassword}
                          onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                          className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" 
                        />
                      </div>
                    </div>
                  </div>
                </section>

              </div>
              
              <div className="p-8 bg-light-bg/50 border-t border-border-light flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setShowDrawer(false)} 
                  className="flex-1 py-3 border border-border-light bg-white rounded-xl font-bold text-text-secondary hover:bg-light-bg transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                >
                  Create Restaurant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
