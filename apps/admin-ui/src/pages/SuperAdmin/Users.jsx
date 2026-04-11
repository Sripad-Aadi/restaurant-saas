import React from 'react';
import { Search, Plus, Filter, MoreHorizontal } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';

const Users = () => {
  const columns = [
    { header: 'Name', accessor: 'name', render: (row) => <span className="font-medium text-text-primary">{row.name}</span> },
    { header: 'Email', accessor: 'email', render: (row) => <span className="text-text-secondary">{row.email}</span> },
    { header: 'Role', accessor: 'role', render: (row) => (
      <span className={`px-2 py-1 rounded text-xs font-semibold uppercase ${row.role === 'Super Admin' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
        {row.role}
      </span>
    )},
    { header: 'Linked Store', accessor: 'store', render: (row) => <span className="text-text-muted">{row.store || '—'}</span> },
    { header: 'Status', accessor: 'status', render: (row) => <StatusBadge status={row.status} /> },
    { header: 'Last Login', accessor: 'lastLogin', render: (row) => <span className="text-sm text-text-muted">{row.lastLogin}</span> },
    { header: '', accessor: 'actions', render: () => (
      <button className="p-1 hover:bg-light-bg rounded text-text-muted hover:text-text-primary"><MoreHorizontal className="w-5 h-5" /></button>
    )}
  ];

  const data = [
    { id: 1, name: 'Sripad Aadi', email: 'sripad@restaurantos.com', role: 'Super Admin', store: '', status: 'Active', lastLogin: 'Today, 10:24 AM' },
    { id: 2, name: 'Restaurant Owner', email: 'admin@spiceroute.com', role: 'Admin', store: 'Spice Route', status: 'Active', lastLogin: 'Yesterday, 08:30 PM' },
    { id: 3, name: 'John Doe', email: 'john@bistro99.com', role: 'Admin', store: 'Bistro 99', status: 'Active', lastLogin: 'Oct 24, 2025' },
    { id: 4, name: 'Jane Smith', email: 'jane@sushizen.com', role: 'Admin', store: 'Sushi Zen', status: 'Inactive', lastLogin: 'Dec 05, 2025' },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Users</h2>
          <p className="text-sm text-text-secondary mt-1">Manage global users, admins and platform super-admins</p>
        </div>
        <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <Plus className="w-4 h-4" /> Create User
        </button>
      </div>

      <div className="flex gap-4 mb-4">
        <div className="relative w-[300px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            className="w-full pl-9 pr-4 py-2 text-sm border border-border-light rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none bg-card-white shadow-sm"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-card-white border border-border-light rounded-lg text-sm text-text-secondary hover:bg-light-bg shadow-sm">
          <Filter className="w-4 h-4" /> Role: All
        </button>
      </div>

      <div className="flex-1 min-h-0">
         <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
};

export default Users;
