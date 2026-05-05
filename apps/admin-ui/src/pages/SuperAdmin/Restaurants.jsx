import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, Filter, Loader2 } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api';

const Restaurants = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    name: '', slug: '', timezone: 'Asia/Kolkata', adminName: 'Primary Admin', adminEmail: '', adminPassword: ''
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
      await api.post('/stores', formData);
      setShowDrawer(false);
      setFormData({ name: '', slug: '', timezone: 'Asia/Kolkata', adminName: 'Primary Admin', adminEmail: '', adminPassword: '' });
      setLoading(true);
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create restaurant');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      if (currentStatus) {
        await api.patch(`/stores/${id}/deactivate`);
      } else {
        await api.patch(`/stores/${id}/activate`);
      }
      fetchStores();
    } catch (err) {
      console.error(err);
    }
  };

  const columns = [
    { header: 'Restaurant Name', accessor: 'name', render: (row) => <span className="font-medium">{row.name}</span> },
    { header: 'Slug', accessor: 'slug', render: (row) => <span className="text-text-muted">/{row.slug}</span> },
    { header: 'Timezone', accessor: 'timezone' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Created', accessor: 'created' },
    { header: '', accessor: 'actions', render: (row) => (
      <button 
        onClick={(e) => { e.stopPropagation(); toggleStatus(row.id, row.rawStatus); }}
        className={`p-2 text-xs font-medium rounded text-text-secondary hover:text-text-primary ${
         row.rawStatus 
            ? "bg-red-100 text-red-600 hover:bg-red-200"
            : "bg-green-100 text-green-600 hover:bg-green-200"
        }`}
      >
        {row.rawStatus ? 'Suspend' : 'Activate'}
      </button>
    )}
  ];

  const data = stores.map(store => ({
    id: store._id,
    name: store.name,
    slug: store.slug,
    timezone: store.timezone || 'N/A',
    rawStatus: store.isActive,
    status: store.isActive ? 'Active' : 'Inactive',
    created: new Date(store.createdAt).toLocaleDateString()
  }));

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Restaurants</h2>
          <p className="text-sm text-text-secondary mt-1">Manage all tenant restaurants on the platform</p>
        </div>
        <button 
          onClick={() => setShowDrawer(true)}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Restaurant
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex gap-4 mb-4">
        <div className="relative w-[300px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search name, slug..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-border-light rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-card-white shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-card-white border border-border-light rounded-lg text-sm text-text-secondary hover:bg-light-bg shadow-sm">
          <Filter className="w-4 h-4" /> Status: All
        </button>
      </div>

      <div className="flex-1 min-h-0 relative">
         {loading ? (
           <div className="absolute inset-0 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
         ) : (
           <DataTable columns={columns} data={data} onRowClick={(row) => console.log('Row clicked', row)} />
         )}
      </div>

      {/* Slide-over Drawer - Add Restaurant */}
      {showDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-dark-bg/40 backdrop-blur-sm" onClick={() => setShowDrawer(false)}></div>
          <div className="w-[480px] bg-card-white shadow-2xl h-full flex flex-col relative animate-in slide-in-from-right duration-200">
            <div className="px-6 py-4 border-b border-border-light flex justify-between items-center bg-light-bg">
              <h3 className="font-semibold text-lg">Add New Restaurant</h3>
              <button onClick={() => setShowDrawer(false)} className="text-2xl text-text-muted hover:text-text-primary">&times;</button>
            </div>
            
            <form onSubmit={handleCreate} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Store Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-2 border border-border-light rounded focus:border-primary outline-none" 
                    placeholder="e.g. Spice Route" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Slug *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full p-2 border border-border-light rounded focus:border-primary outline-none" 
                    placeholder="spice-route" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Timezone</label>
                  <select 
                    value={formData.timezone}
                    onChange={(e) => setFormData({...formData, timezone: e.target.value})}
                    className="w-full p-2 border border-border-light rounded focus:border-primary outline-none bg-white"
                  >
                    <option>Asia/Kolkata</option>
                    <option>UTC</option>
                  </select>
                </div>
                
                <h4 className="font-medium text-text-primary pt-4 border-t border-border-light">Primary Admin Credentials</h4>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Admin Name *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.adminName}
                    onChange={(e) => setFormData({...formData, adminName: e.target.value})}
                    className="w-full p-2 border border-border-light rounded focus:border-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Admin Email *</label>
                  <input 
                    type="email" 
                    required
                    value={formData.adminEmail}
                    onChange={(e) => setFormData({...formData, adminEmail: e.target.value})}
                    className="w-full p-2 border border-border-light rounded focus:border-primary outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Temporary Password *</label>
                  <input 
                    type="password" 
                    required
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({...formData, adminPassword: e.target.value})}
                    className="w-full p-2 border border-border-light rounded focus:border-primary outline-none" 
                  />
                </div>
              </div>
              
              <div className="p-6 bg-light-bg border-t border-border-light flex gap-3">
                <button type="button" onClick={() => setShowDrawer(false)} className="flex-1 py-2 border border-border-light bg-white rounded font-medium text-text-secondary hover:bg-light-bg">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90">Create Restaurant</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
