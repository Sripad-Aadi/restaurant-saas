import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, CheckCircle, XCircle, Loader2, DollarSign, Percent, Users, Calendar } from 'lucide-react';
import api from '../../api';

const Subscriptions = () => {
  const [activeTab, setActiveTab] = useState('plans');
  const [plans, setPlans] = useState([]);
  const [activeSubs, setActiveSubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    commissionRate: 5,
    billingCycle: 'monthly',
    features: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [plansRes, subsRes] = await Promise.all([
        api.get('/subscriptions/plans'),
        api.get('/subscriptions/active')
      ]);
      setPlans(plansRes.data.data);
      setActiveSubs(subsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch subscriptions', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        ...formData,
        price: parseFloat(formData.price) * 100, // to cents
        features: formData.features.split('\n').filter(f => f.trim())
      };

      if (editingPlan) {
        await api.patch(`/subscriptions/plans/${editingPlan._id}`, data);
      } else {
        await api.post('/subscriptions/plans', data);
      }
      
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save plan');
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price / 100,
      commissionRate: plan.commissionRate,
      billingCycle: plan.billingCycle,
      features: plan.features.join('\n')
    });
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      price: 0,
      commissionRate: 5,
      billingCycle: 'monthly',
      features: ''
    });
    setIsModalOpen(true);
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-black text-text-primary tracking-tight">SUBSCRIPTION MANAGEMENT</h2>
          <p className="text-text-secondary mt-1 font-medium italic">Manage pricing tiers, commission rates, and monitor platform revenue.</p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-black uppercase tracking-tighter shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
        >
          <Plus className="w-5 h-5" /> Add New Tier
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 bg-white/50 p-2 rounded-2xl self-start">
        <button 
          onClick={() => setActiveTab('plans')}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'plans' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-primary'}`}
        >
          Pricing Tiers
        </button>
        <button 
          onClick={() => setActiveTab('active')}
          className={`px-8 py-3 rounded-xl font-bold transition-all ${activeTab === 'active' ? 'bg-white text-primary shadow-sm' : 'text-text-muted hover:text-primary'}`}
        >
          Active Subscriptions
        </button>
      </div>

      {activeTab === 'plans' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div key={plan._id} className="bg-card-white border border-border-light rounded-[40px] p-8 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
              {!plan.isActive && <div className="absolute top-4 right-4 bg-error/10 text-error px-3 py-1 rounded-full text-[10px] font-black uppercase">Inactive</div>}
              
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-primary/10 rounded-3xl text-primary group-hover:scale-110 transition-transform">
                  <CreditCard className="w-8 h-8" />
                </div>
                <button 
                  onClick={() => openEditModal(plan)}
                  className="p-3 hover:bg-light-bg rounded-2xl text-text-muted hover:text-primary transition-colors"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-2xl font-black text-text-primary mb-2 uppercase tracking-tighter">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-text-primary">₹{(plan.price / 100).toLocaleString()}</span>
                <span className="text-text-muted font-bold text-sm">/{plan.billingCycle}</span>
              </div>

              <div className="space-y-4 mb-8 flex-1">
                <div className="flex items-center gap-3 p-4 bg-light-bg/50 rounded-2xl border border-border-light/50">
                  <div className="p-2 bg-success/10 rounded-xl text-success">
                    <Percent className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Platform Commission</p>
                    <p className="text-lg font-black text-text-primary leading-none">{plan.commissionRate}% <span className="text-xs font-medium text-text-secondary">per order</span></p>
                  </div>
                </div>

                <div className="pt-4">
                  <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mb-4">Included Features</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-medium text-text-secondary">
                        <CheckCircle className="w-4 h-4 text-success" /> {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-card-white border border-border-light rounded-[40px] shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-light-bg/50 border-b border-border-light">
                <th className="px-8 py-6 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Restaurant</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Plan Tier</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Renewal Date</th>
                <th className="px-8 py-6 text-left text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Commission</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {activeSubs.map((sub) => (
                <tr key={sub._id} className="hover:bg-light-bg/30 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary font-black uppercase tracking-tighter">
                        {sub.storeId.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-text-primary group-hover:text-primary transition-colors">{sub.storeId.name}</p>
                        <p className="text-xs text-text-muted font-medium">/{sub.storeId.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className="px-4 py-1.5 bg-card-white border border-border-light rounded-xl text-xs font-black uppercase tracking-widest text-text-primary shadow-sm">
                        {sub.planId.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className={`flex items-center gap-2 w-max px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                      sub.status === 'active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      {sub.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      {sub.status}
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2 text-text-secondary text-sm font-bold">
                      <Calendar className="w-4 h-4 opacity-50" />
                      {new Date(sub.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-8 py-6 font-black text-primary">
                    {sub.planId.commissionRate}%
                  </td>
                </tr>
              ))}
              {activeSubs.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Users className="w-12 h-12 mb-4" />
                      <p className="font-bold text-lg uppercase tracking-widest">No Active Subscriptions Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal for Add/Edit Plan */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-dark-bg/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-card-white w-full max-w-xl rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 border-b border-border-light flex justify-between items-center">
              <h3 className="text-2xl font-black text-text-primary uppercase tracking-tighter">
                {editingPlan ? 'Edit Pricing Tier' : 'Create New Pricing Tier'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-3xl text-text-muted hover:text-primary">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-widest">Plan Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})} 
                    required 
                    className="w-full p-4 bg-light-bg/30 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" 
                    placeholder="e.g. Professional"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-widest">Monthly Price (₹)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input 
                      type="number" 
                      value={formData.price} 
                      onChange={(e) => setFormData({...formData, price: e.target.value})} 
                      required 
                      className="w-full p-4 pl-12 bg-light-bg/30 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" 
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-widest">Commission Rate (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <input 
                      type="number" 
                      value={formData.commissionRate} 
                      onChange={(e) => setFormData({...formData, commissionRate: e.target.value})} 
                      required 
                      className="w-full p-4 pl-12 bg-light-bg/30 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" 
                      placeholder="5"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-widest">Features (one per line)</label>
                <textarea 
                  value={formData.features} 
                  onChange={(e) => setFormData({...formData, features: e.target.value})} 
                  rows="4"
                  className="w-full p-4 bg-light-bg/30 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium resize-none"
                  placeholder="Unlimited Orders&#10;Analytics Dashboard&#10;Custom Branding"
                ></textarea>
              </div>

              <div className="pt-4 flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-8 py-4 text-text-secondary font-black uppercase tracking-tighter"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={saving}
                  className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-tighter shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
