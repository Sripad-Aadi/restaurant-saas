import React, { useState, useEffect } from 'react';
import { User, Lock, Globe, Loader2, Save, ShieldCheck, Mail, Info } from 'lucide-react';
import api from '../../api';

const SuperAdminSettings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [platformData, setPlatformData] = useState({
    platformName: 'DineFlow',
    supportEmail: 'support@dineflow.com',
    supportPhone: '',
    isMaintenanceMode: false,
    maintenanceMessage: 'We are currently performing scheduled maintenance to improve our services. Please check back shortly.'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [authRes, systemRes] = await Promise.all([
        api.get('/auth/me'),
        api.get('/system/settings').catch(() => ({ data: { data: {} } }))
      ]);

      const user = authRes.data.user;
      setProfileData({
        name: user.name || '',
        email: user.email || ''
      });

      if (systemRes.data.success && Object.keys(systemRes.data.data).length > 0) {
        setPlatformData(prev => ({
          ...prev,
          ...systemRes.data.data
        }));
      }
    } catch (err) {
      setError('Failed to load settings data');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.patch('/auth/profile', profileData);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setError('New passwords do not match');
    }
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.patch('/auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSaving(false);
    }
  };

  const handleSavePlatform = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.patch('/system/settings', platformData);
      setSuccess('Platform configuration saved successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update platform settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'password', label: 'Security', icon: Lock },
    { id: 'platform', label: 'Platform Config', icon: Globe },
  ];

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-text-primary">Settings</h2>
        <p className="text-text-secondary mt-1 font-medium">Manage platform configuration and your super-admin account</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-2xl font-bold flex justify-between items-center animate-in slide-in-from-top duration-300">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-2xl opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 text-success rounded-2xl font-bold flex justify-between items-center animate-in slide-in-from-top duration-300">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-2xl opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8 flex-1">
        {/* Sidebar */}
        <div className="lg:w-72 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all text-left ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/30' 
                    : 'bg-transparent text-text-secondary hover:bg-white hover:text-primary'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-text-muted'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 bg-card-white border border-border-light rounded-3xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="p-8 flex flex-col h-full">
              <div className="mb-8 border-b border-border-light pb-6 flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Super Admin Profile</h3>
                  <p className="text-sm text-text-secondary font-medium">Update your administrative contact details.</p>
                </div>
              </div>
              <div className="space-y-6 flex-1 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-widest">Full Name</label>
                  <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} required className="w-full p-4 bg-light-bg/30 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-widest">Email Address</label>
                  <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} required className="w-full p-4 bg-light-bg/30 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" />
                </div>
              </div>
              <div className="pt-8 mt-auto flex justify-end">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 font-black uppercase tracking-tighter shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Profile
                </button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handleSavePassword} className="p-8 flex flex-col h-full">
              <div className="mb-8 border-b border-border-light pb-6 flex items-center gap-4">
                <div className="p-3 bg-error/10 rounded-2xl text-error">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Security & Credentials</h3>
                  <p className="text-sm text-text-secondary font-medium">Keep your platform access secure by updating your password regularly.</p>
                </div>
              </div>
              <div className="space-y-6 flex-1 max-w-xl">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-widest">Current Password</label>
                  <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required className="w-full p-4 bg-light-bg/30 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-widest">New Password</label>
                  <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required minLength="8" className="w-full p-4 bg-light-bg/30 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-widest">Confirm New Password</label>
                  <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required minLength="8" className="w-full p-4 bg-light-bg/30 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" />
                </div>
              </div>
              <div className="pt-8 mt-auto flex justify-end">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-4 bg-error text-white rounded-2xl hover:bg-error/90 font-black uppercase tracking-tighter shadow-lg shadow-error/20 transition-all active:scale-95 disabled:opacity-50">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />} Update Security
                </button>
              </div>
            </form>
          )}

          {/* Platform Tab */}
          {activeTab === 'platform' && (
            <form onSubmit={handleSavePlatform} className="p-8 flex flex-col h-full">
              <div className="mb-8 border-b border-border-light pb-6 flex items-center gap-4">
                <div className="p-3 bg-info/10 rounded-2xl text-info">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-text-primary uppercase tracking-tight">Platform Configuration</h3>
                  <p className="text-sm text-text-secondary font-medium">Global settings that affect all tenants and users.</p>
                </div>
              </div>
              <div className="space-y-6 flex-1 overflow-y-auto pr-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-widest">Platform Display Name</label>
                    <input type="text" value={platformData.platformName} onChange={(e) => setPlatformData({...platformData, platformName: e.target.value})} className="w-full p-4 bg-light-bg/30 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-widest">Global Support Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input type="email" value={platformData.supportEmail} onChange={(e) => setPlatformData({...platformData, supportEmail: e.target.value})} className="w-full p-4 pl-12 bg-light-bg/30 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-widest">Emergency Support Phone</label>
                    <div className="relative">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                      <input type="text" value={platformData.supportPhone} onChange={(e) => setPlatformData({...platformData, supportPhone: e.target.value})} className="w-full p-4 pl-12 bg-light-bg/30 border border-border-light rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none font-medium" />
                    </div>
                  </div>
                </div>

                <div className="bg-warning/5 border border-warning/20 p-6 rounded-2xl flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-warning/10 rounded-xl text-warning">
                      <Info className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-text-primary mb-1">Maintenance Mode</h4>
                      <p className="text-xs text-text-secondary leading-relaxed mb-4">
                        Activating maintenance mode will block access to all restaurant dashboards and customer storefronts.
                      </p>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={platformData.isMaintenanceMode} onChange={(e) => setPlatformData({...platformData, isMaintenanceMode: e.target.checked})} />
                        <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-warning"></div>
                        <span className="ml-3 text-sm font-bold text-text-primary">{platformData.isMaintenanceMode ? 'Enabled' : 'Disabled'}</span>
                      </label>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase mb-2 tracking-widest">Maintenance Message</label>
                    <textarea 
                      value={platformData.maintenanceMessage} 
                      onChange={(e) => setPlatformData({...platformData, maintenanceMessage: e.target.value})}
                      rows="3"
                      className="w-full p-4 bg-white border border-border-light rounded-2xl focus:ring-2 focus:ring-warning/20 outline-none font-medium resize-none text-sm"
                      placeholder="Enter the message to show during maintenance..."
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="pt-8 mt-6 border-t border-border-light flex justify-end">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-4 bg-primary text-white rounded-2xl hover:bg-primary/90 font-black uppercase tracking-tighter shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50">
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Save Configuration
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminSettings;
