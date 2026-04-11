import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useAuth } from '../../AuthContext';
import { Building, Plus, CheckCircle, XCircle, Loader2, LogOut } from 'lucide-react';

export default function Stores() {
  const { logout } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', slug: '', adminName: '', adminEmail: '', adminPassword: ''
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
      setShowModal(false);
      fetchStores();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to onboard store');
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col mx-auto p-8 lg:px-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            <Building className="w-8 h-8 text-indigo-600" /> Platform Tenants
          </h1>
          <p className="text-slate-500 mt-1">Super Admin global view of all SaaS client restaurants.</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setShowModal(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 transition">
            <Plus className="w-5 h-5" /> Onboard New Restaurant
          </button>
          <button onClick={logout} className="text-slate-500 hover:text-slate-800 p-2 bg-white rounded-xl shadow-sm border border-slate-200">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wide">
                <th className="p-4 font-semibold">Store Name</th>
                <th className="p-4 font-semibold">Slug (URL)</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {stores.length === 0 && (
                <tr><td colSpan="4" className="p-8 text-center text-slate-400">No client stores found. Create the first one!</td></tr>
              )}
              {stores.map(store => (
                <tr key={store._id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">{store.name}</td>
                  <td className="p-4 text-indigo-600 font-mono text-sm">{store.slug}</td>
                  <td className="p-4">
                    {store.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold ring-1 ring-green-200 ring-inset">
                        <CheckCircle className="w-3.5 h-3.5" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold ring-1 ring-slate-200 ring-inset">
                        <XCircle className="w-3.5 h-3.5" /> Suspended
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => toggleStatus(store._id, store.isActive)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-bold ${store.isActive ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'}`}
                    >
                      {store.isActive ? 'Suspend Access' : 'Activate Store'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white max-w-xl w-full rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-indigo-50/50">
              <h2 className="text-xl font-bold text-slate-800">Onboard Tenant Restaurant</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6" /></button>
            </div>
            
            <form onSubmit={handleCreate} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Restaurant Name</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" placeholder="Joe's Pizza" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">URL Slug</label>
                  <input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 outline-none" placeholder="joes-pizza" />
                </div>
              </div>
              
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2"><div className="w-2 h-2 bg-indigo-500 rounded-full" /> Primary Admin Credentials</h3>
                <div className="grid grid-cols-1 gap-4">
                   <input required value={formData.adminName} onChange={e => setFormData({...formData, adminName: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none" placeholder="Owner Name" />
                   <input required type="email" value={formData.adminEmail} onChange={e => setFormData({...formData, adminEmail: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none" placeholder="admin@joespizza.com" />
                   <input required type="password" value={formData.adminPassword} onChange={e => setFormData({...formData, adminPassword: e.target.value})} className="w-full p-2.5 bg-white border border-slate-200 rounded-xl outline-none" placeholder="Temporary Password" />
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all">
                Provision SaaS Tenant
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
