import React, { useState } from 'react';
import { Search, Plus, MoreHorizontal, Filter } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const Restaurants = () => {
  const [showDrawer, setShowDrawer] = useState(false);

  const columns = [
    { header: 'Restaurant Name', accessor: 'name', render: (row) => <span className="font-medium">{row.name}</span> },
    { header: 'Slug', accessor: 'slug', render: (row) => <span className="text-text-muted">/{row.slug}</span> },
    { header: 'Owner Email', accessor: 'email' },
    { header: 'Plan', accessor: 'plan' },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Created', accessor: 'created' },
    { header: '', accessor: 'actions', render: () => (
      <button className="p-1 hover:bg-light-bg rounded text-text-muted hover:text-text-primary"><MoreHorizontal className="w-5 h-5" /></button>
    )}
  ];

  const data = [
    { id: 1, name: 'Spice Route', slug: 'spice-route', email: 'admin@spiceroute.com', plan: 'Pro', status: 'Active', created: 'Oct 12, 2025' },
    { id: 2, name: 'Bistro 99', slug: 'bistro-99', email: 'hello@bistro99.com', plan: 'Basic', status: 'Active', created: 'Nov 05, 2025' },
    { id: 3, name: 'Sushi Zen', slug: 'sushi-zen', email: 'owner@sushizen.com', plan: 'Pro', status: 'Inactive', created: 'Dec 01, 2025' },
    { id: 4, name: 'Burger Joint', slug: 'burger-joint', email: 'admin@burgerjoint.net', plan: 'Basic', status: 'Active', created: 'Jan 15, 2026' },
  ];

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
            placeholder="Search name, slug, email..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-border-light rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-card-white shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-card-white border border-border-light rounded-lg text-sm text-text-secondary hover:bg-light-bg shadow-sm">
          <Filter className="w-4 h-4" /> Status: All
        </button>
      </div>

      <div className="flex-1 min-h-0">
         <DataTable columns={columns} data={data} onRowClick={(row) => console.log('Row clicked', row)} />
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
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Store Name *</label>
                <input type="text" className="w-full p-2 border border-border-light rounded focus:border-primary outline-none" placeholder="e.g. Spice Route" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Slug (auto-suggested)</label>
                <input type="text" className="w-full p-2 border border-border-light rounded bg-light-bg text-text-muted" placeholder="spice-route" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Timezone</label>
                <select className="w-full p-2 border border-border-light rounded focus:border-primary outline-none bg-white">
                  <option>Asia/Kolkata</option>
                  <option>UTC</option>
                </select>
              </div>
              
              <h4 className="font-medium text-text-primary pt-4 border-t border-border-light">Admin Details</h4>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Admin Email *</label>
                <input type="email" className="w-full p-2 border border-border-light rounded focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Temporary Password *</label>
                <input type="password" className="w-full p-2 border border-border-light rounded focus:border-primary outline-none" />
              </div>
            </div>
            
            <div className="p-6 bg-light-bg border-t border-border-light flex gap-3">
              <button onClick={() => setShowDrawer(false)} className="flex-1 py-2 border border-border-light bg-white rounded font-medium text-text-secondary hover:bg-light-bg">Cancel</button>
              <button className="flex-1 py-2 bg-primary text-white rounded font-medium hover:bg-primary/90">Create Restaurant</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Restaurants;
