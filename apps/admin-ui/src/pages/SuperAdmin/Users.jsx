import React, { useState, useEffect } from 'react';
import { Search, Filter, LogOut, Shield, User, Loader2, MoreVertical, Ban, CheckCircle2 } from 'lucide-react';
import DataTable from '../../components/DataTable';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    try {
      const response = await api.get(`/users?role=${roleFilter}&search=${searchQuery}`);
      setUsers(response.data.data);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogout = async (userId) => {
    if (!window.confirm('Are you sure you want to force logout this user? All their active sessions will be invalidated.')) return;
    try {
      await api.post(`/users/${userId}/logout`);
      alert('User forced to logout successfully');
    } catch (err) {
      alert('Failed to force logout user');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/users/${userId}/status`);
      fetchUsers();
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const columns = [
    { header: 'User', accessor: 'name', render: (row) => (
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
          {row.name.charAt(0)}
        </div>
        <div>
          <div className="font-medium text-text-primary">{row.name}</div>
          <div className="text-xs text-text-muted">{row.email}</div>
        </div>
      </div>
    )},
    { header: 'Role', accessor: 'role', render: (row) => (
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
        row.role === 'superadmin' ? 'bg-error/10 text-error' : 
        row.role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
      }`}>
        {row.role}
      </span>
    )},
    { header: 'Store', accessor: 'store', render: (row) => row.storeId?.name || '-' },
    { header: 'Status', accessor: 'isActive', render: (row) => <StatusBadge status={row.isActive ? 'Active' : 'Inactive'} /> },
    { header: 'Last Login', accessor: 'lastLogin', render: (row) => row.lastLogin ? new Date(row.lastLogin).toLocaleDateString() : 'Never' },
    { header: 'Actions', accessor: 'actions', render: (row) => (
      <div className="flex items-center gap-2">
        <button 
          onClick={() => handleForceLogout(row.id)}
          title="Force Logout"
          className="p-1.5 text-text-muted hover:text-error hover:bg-error/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
        <button 
          onClick={() => handleToggleStatus(row.id)}
          title={row.isActive ? 'Deactivate' : 'Activate'}
          className={`p-1.5 rounded-lg transition-colors ${row.isActive ? 'text-text-muted hover:text-error hover:bg-error/10' : 'text-text-muted hover:text-success hover:bg-success/10'}`}
        >
          {row.isActive ? <Ban className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
        </button>
      </div>
    )}
  ];

  const tableData = users.map(user => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    storeId: user.storeId,
    isActive: user.isActive,
    lastLogin: user.lastLogin
  }));

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Platform Users</h2>
          <p className="text-sm text-text-secondary mt-1">Manage accounts and security for all roles</p>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none bg-card-white"
          />
        </div>
        <select 
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 text-sm border border-border-light rounded-xl outline-none bg-card-white cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="superadmin">Super Admins</option>
          <option value="admin">Store Admins</option>
          <option value="customer">Customers</option>
        </select>
      </div>

      <div className="flex-1 min-h-0 bg-card-white border border-border-light rounded-2xl shadow-sm overflow-hidden relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-[1px]">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <DataTable columns={columns} data={tableData} />
        )}
      </div>
    </div>
  );
};

export default Users;
