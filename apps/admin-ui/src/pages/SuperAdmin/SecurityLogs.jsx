import React, { useState, useEffect } from 'react';
import { Shield, Search, Filter, Loader2, User, Globe, Clock, Info, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../../api';

const SecurityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [filters, setFilters] = useState({ action: '', user: '' });
  
  const [actions, setActions] = useState([
    'USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTER', 'SETTINGS_UPDATED', 
    'STORE_DEACTIVATED', 'STORE_ACTIVATED', 'PASSWORD_RESET', 'FORCE_LOGOUT'
  ]);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/system/logs', {
        params: {
          page: pagination.page,
          action: filters.action,
          user: filters.user
        }
      });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to fetch logs', err);
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action) => {
    if (action.includes('LOGIN')) return 'text-success bg-success/10';
    if (action.includes('LOGOUT')) return 'text-text-muted bg-light-bg';
    if (action.includes('UPDATED')) return 'text-info bg-info/10';
    if (action.includes('DEACTIVATED')) return 'text-error bg-error/10';
    return 'text-primary bg-primary/10';
  };

  const formatDetails = (details) => {
    if (!details) return '-';
    if (typeof details === 'string') return details;
    return JSON.stringify(details).substring(0, 50) + '...';
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-text-primary tracking-tight">SECURITY AUDIT LOGS</h2>
        <p className="text-text-secondary mt-1 font-medium italic">Track platform-wide administrative actions and security events.</p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 bg-card-white p-6 rounded-[32px] border border-border-light shadow-sm">
        <div className="relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <select 
            value={filters.action} 
            onChange={(e) => setFilters({...filters, action: e.target.value, page: 1})}
            className="w-full pl-12 pr-4 py-3 bg-light-bg/50 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm appearance-none"
          >
            <option value="">All Action Types</option>
            {actions.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        
        <div className="relative col-span-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by User ID..."
            value={filters.user}
            onChange={(e) => setFilters({...filters, user: e.target.value, page: 1})}
            className="w-full pl-12 pr-4 py-3 bg-light-bg/50 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-bold text-sm"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="flex-1 bg-card-white border border-border-light rounded-[40px] shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead>
              <tr className="bg-light-bg/50 border-b border-border-light">
                <th className="px-8 py-6 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Action</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Performed By</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">IP Address</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center text-text-muted font-bold uppercase tracking-widest italic">
                    No logs found matching your criteria
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-light-bg/30 transition-colors group">
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-light-bg rounded-xl flex items-center justify-center text-text-muted">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">{log.user?.name || 'System'}</p>
                          <p className="text-[10px] text-text-muted font-medium">{log.user?.email || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-text-secondary text-sm font-bold">
                        <Clock className="w-4 h-4 opacity-40" />
                        {new Date(log.createdAt).toLocaleString('en-IN', { 
                          day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' 
                        })}
                      </div>
                    </td>
                    <td className="px-8 py-6 font-mono text-[11px] text-text-muted">
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 opacity-30" />
                        {log.ipAddress || 'unknown'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
                        <Info className="w-3.5 h-3.5 text-primary opacity-50" />
                        {formatDetails(log.details)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-border-light flex items-center justify-between">
          <p className="text-xs font-bold text-text-muted uppercase tracking-widest">
            Showing page {pagination.page} of {pagination.pages}
          </p>
          <div className="flex gap-2">
            <button 
              disabled={pagination.page === 1}
              onClick={() => setPagination({...pagination, page: pagination.page - 1})}
              className="p-3 bg-light-bg rounded-2xl text-text-muted hover:text-primary disabled:opacity-30 transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              disabled={pagination.page === pagination.pages}
              onClick={() => setPagination({...pagination, page: pagination.page + 1})}
              className="p-3 bg-light-bg rounded-2xl text-text-muted hover:text-primary disabled:opacity-30 transition-all active:scale-95"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityLogs;
