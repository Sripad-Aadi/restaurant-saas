import React, { useState, useEffect } from 'react';
import { Store, User, Lock, Bell, Loader2, Save } from 'lucide-react';
import api from '../../api';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('store');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [storeData, setStoreData] = useState({
    name: '',
    logo: '',
    description: '',
    cuisineType: '',
    timezone: '',
    avgWaitTime: ''
  });

  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = useState({
    emailAlerts: true,
    orderAlerts: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storeRes, authRes] = await Promise.all([
          api.get('/stores/me'),
          api.get('/auth/me')
        ]);
        const store = storeRes.data.data;
        const user = authRes.data.user;

        setStoreData({
          name: store.name || '',
          logo: store.logo || '',
          description: store.description || '',
          cuisineType: store.cuisineType || '',
          timezone: store.timezone || '',
          avgWaitTime: store.avgWaitTime || ''
        });

        setProfileData({
          name: user.name || '',
          email: user.email || ''
        });

        if (user.notifications) {
          setNotifications(user.notifications);
        }
      } catch (err) {
        setError('Failed to load settings data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveStore = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.patch('/stores/me', storeData);
      setSuccess('Store info updated successfully. Menu cache has been invalidated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update store info');
    } finally {
      setSaving(false);
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

  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess('');
    try {
      await api.patch('/auth/notifications', { notifications });
      setSuccess('Notification preferences updated');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update notifications');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'store', label: 'Store Info', icon: Store },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'password', label: 'Password', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ];

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-full flex flex-col">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Settings</h2>
        <p className="text-sm text-text-secondary mt-1">Manage store configuration and personal preferences</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-error/10 border border-error/20 text-error rounded-xl font-medium flex justify-between items-center animate-in fade-in">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-xl opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-success/10 border border-success/20 text-success rounded-xl font-medium flex justify-between items-center animate-in fade-in">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-xl opacity-60 hover:opacity-100">&times;</button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 flex-1">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(''); setSuccess(''); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-left ${
                  isActive 
                    ? 'bg-primary text-white shadow-md shadow-primary/20' 
                    : 'bg-transparent text-text-secondary hover:bg-light-bg hover:text-text-primary'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 bg-card-white border border-border-light rounded-2xl shadow-sm overflow-hidden flex flex-col">
          {/* Store Info Tab */}
          {activeTab === 'store' && (
            <form onSubmit={handleSaveStore} className="p-6 md:p-8 flex flex-col h-full">
              <div className="mb-6 border-b border-border-light pb-4">
                <h3 className="text-lg font-bold text-text-primary">Store Information</h3>
                <p className="text-sm text-text-secondary">Update your restaurant's public details.</p>
              </div>
              <div className="space-y-5 flex-1">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Store Name</label>
                  <input type="text" value={storeData.name} onChange={(e) => setStoreData({...storeData, name: e.target.value})} required className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                  <textarea rows="3" value={storeData.description} onChange={(e) => setStoreData({...storeData, description: e.target.value})} className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Cuisine Type</label>
                    <input type="text" placeholder="e.g. Italian, Indian" value={storeData.cuisineType} onChange={(e) => setStoreData({...storeData, cuisineType: e.target.value})} className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-1">Average Wait Time</label>
                    <input type="text" placeholder="e.g. 15-20 mins" value={storeData.avgWaitTime} onChange={(e) => setStoreData({...storeData, avgWaitTime: e.target.value})} className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Logo URL</label>
                  <input type="url" value={storeData.logo} onChange={(e) => setStoreData({...storeData, logo: e.target.value})} className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Timezone</label>
                  <input type="text" value={storeData.timezone} onChange={(e) => setStoreData({...storeData, timezone: e.target.value})} className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
              <div className="pt-6 border-t border-border-light mt-6 flex justify-end">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Changes
                </button>
              </div>
            </form>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="p-6 md:p-8 flex flex-col h-full">
              <div className="mb-6 border-b border-border-light pb-4">
                <h3 className="text-lg font-bold text-text-primary">Personal Profile</h3>
                <p className="text-sm text-text-secondary">Update your admin account details.</p>
              </div>
              <div className="space-y-5 flex-1">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                  <input type="text" value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} required className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                  <input type="email" value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} required className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
              <div className="pt-6 border-t border-border-light mt-6 flex justify-end">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Profile
                </button>
              </div>
            </form>
          )}

          {/* Password Tab */}
          {activeTab === 'password' && (
            <form onSubmit={handleSavePassword} className="p-6 md:p-8 flex flex-col h-full">
              <div className="mb-6 border-b border-border-light pb-4">
                <h3 className="text-lg font-bold text-text-primary">Change Password</h3>
                <p className="text-sm text-text-secondary">Update your account password securely.</p>
              </div>
              <div className="space-y-5 flex-1">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Current Password</label>
                  <input type="password" value={passwordData.currentPassword} onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} required className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">New Password</label>
                  <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} required minLength="8" className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Confirm New Password</label>
                  <input type="password" value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} required minLength="8" className="w-full px-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" />
                </div>
              </div>
              <div className="pt-6 border-t border-border-light mt-6 flex justify-end">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Update Password
                </button>
              </div>
            </form>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <form onSubmit={handleSaveNotifications} className="p-6 md:p-8 flex flex-col h-full">
              <div className="mb-6 border-b border-border-light pb-4">
                <h3 className="text-lg font-bold text-text-primary">Notification Preferences</h3>
                <p className="text-sm text-text-secondary">Choose how and when you want to be notified.</p>
              </div>
              <div className="space-y-6 flex-1">
                <label className="flex items-center justify-between p-4 border border-border-light rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-text-primary">Email Alerts</h4>
                    <p className="text-sm text-text-secondary mt-1">Receive daily summaries and critical alerts via email.</p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications.emailAlerts} onChange={(e) => setNotifications({...notifications, emailAlerts: e.target.checked})} />
                    <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
                
                <label className="flex items-center justify-between p-4 border border-border-light rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                  <div>
                    <h4 className="font-medium text-text-primary">New Order Alerts</h4>
                    <p className="text-sm text-text-secondary mt-1">Play a sound and show notification when a new order arrives.</p>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={notifications.orderAlerts} onChange={(e) => setNotifications({...notifications, orderAlerts: e.target.checked})} />
                    <div className="w-11 h-6 bg-border-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
              </div>
              <div className="pt-6 border-t border-border-light mt-6 flex justify-end">
                <button type="submit" disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl hover:bg-primary/90 font-medium disabled:opacity-50">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Preferences
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
