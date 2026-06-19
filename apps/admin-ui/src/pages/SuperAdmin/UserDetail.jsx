import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Shield, User as UserIcon, Mail, Calendar, 
  MapPin, Loader2, LogOut, Ban, CheckCircle2, 
  Trash2, Key, Edit2, Save, ShoppingBag, Globe
} from 'lucide-react';
import api from '../../api';
import StatusBadge from '../../components/StatusBadge';
import ConfirmationModal from '../../components/ConfirmationModal';
import { ROLES } from '@restaurant-saas/shared';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [submitting, setSubmitting] = useState(false);
  
  const [modalConfig, setModalConfig] = useState({ 
    isOpen: false, 
    type: null, // 'delete' or 'deactivate'
    title: '',
    message: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    storeId: '',
    isActive: true
  });

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await api.get(`/users/${id}`);
      const data = response.data.data;
      setUser(data);
      setFormData({
        name: data.name || '',
        email: data.email || '',
        role: data.role || ROLES.CUSTOMER,
        storeId: data.storeId?._id || data.storeId || '',
        isActive: data.isActive
      });
    } catch (err) {
      console.error('Failed to fetch user', err);
    } finally {
      setLoading(false);
    }
  };


  const handleUpdate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.patch(`/users/${id}`, formData);
      await fetchUser();
      alert('User updated successfully');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      await api.patch(`/users/${id}/status`);
      await fetchUser();
    } catch (err) {
      alert('Failed to update status',err);
    }
  };

  const handleForceLogout = async () => {
    try {
      await api.post(`/users/${id}/logout`);
      setModalConfig({ isOpen: false });
    } catch (err) {
      console.error('Failed to force logout', err);
    }
  };

  const handleResetPassword = async (newPassword) => {
    try {
      await api.patch(`/users/${id}`, { password: newPassword });
      alert('Password has been reset successfully.');
      return true;
    } catch (err) {
      alert('Failed to reset password: ' + (err.response?.data?.message || err.message));
      return false;
    }
  };



  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  if (!user) return <div className="p-8 text-center text-text-secondary">User not found</div>;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => navigate('/superadmin/users')} className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Users
        </button>
        
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-black shadow-sm border border-primary/20">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-text-primary">{user.name}</h1>
                <StatusBadge status={user.isActive ? 'Active' : 'Inactive'} />
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-text-secondary">
                <span className="flex items-center gap-1 font-medium"><Mail className="w-3.5 h-3.5" /> {user.email}</span>
                <span className="flex items-center gap-1 font-medium"><Shield className="w-3.5 h-3.5" /> {user.role}</span>
                <span className="flex items-center gap-1 font-medium"><Calendar className="w-3.5 h-3.5" /> Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setModalConfig({ 
                isOpen: true, 
                type: 'logout', 
                title: 'Force Logout All Sessions', 
                message: 'Are you sure you want to invalidate all active sessions for this user? They will be required to log in again on all devices.' 
              })}
              className="p-2.5 text-text-muted hover:text-error hover:bg-error/10 rounded-xl transition-all"
              title="Force Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-light-bg p-1 rounded-2xl w-fit mb-6 border border-border-light">
        {[
          { id: 'overview', label: 'Overview', icon: UserIcon },
          { id: 'edit', label: 'Edit Profile', icon: Edit2 },
          { id: 'security', label: 'Security', icon: Key },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === tab.id 
                ? 'bg-card-white text-primary shadow-sm' 
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-primary' : 'text-text-muted'}`} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 bg-card-white rounded-3xl border border-border-light shadow-sm overflow-y-auto p-8">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-text-primary">Account Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-light-bg/50 rounded-2xl border border-border-light">
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Assigned Role</p>
                   <p className="text-sm font-bold text-text-primary">{user.role}</p>
                </div>
                <div className="p-4 bg-light-bg/50 rounded-2xl border border-border-light">
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Linked Restaurant</p>
                   {user.storeId ? (
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-text-primary">{user.storeId.name}</span>
                        <button onClick={() => navigate(`/superadmin/restaurants/${user.storeId._id}`)} className="text-primary hover:underline text-xs font-bold">View Store</button>
                     </div>
                   ) : (
                     <p className="text-sm font-bold text-text-muted italic">No store assigned</p>
                   )}
                </div>
                <div className="p-4 bg-light-bg/50 rounded-2xl border border-border-light">
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-widest mb-1">Last Login</p>
                   <p className="text-sm font-bold text-text-primary">{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-3xl p-8 border border-primary/10 flex flex-col items-center justify-center text-center">
               <Shield className="w-12 h-12 text-primary mb-4 opacity-40" />
               <h4 className="text-lg font-bold text-text-primary mb-2">Platform Security</h4>
               <p className="text-sm text-text-secondary max-w-xs">
                 This user has <strong>{user.role}</strong> level access. 
                 Ensure you verify their identity before performing sensitive actions like password resets.
               </p>
            </div>
          </div>
        )}

        {activeTab === 'edit' && (
          <div className="max-w-2xl">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Full Name</label>
                  <input 
                    type="text" required value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Email Address</label>
                  <input 
                    type="email" required value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95 disabled:opacity-50"
              >
                <Save className="w-4 h-4" /> {submitting ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="max-w-2xl">
             <div className="space-y-8">
                <section>
                   <h3 className="text-lg font-bold text-text-primary mb-2 flex items-center gap-2">
                      <Key className="w-5 h-5 text-primary" /> Reset User Password
                   </h3>
                   <p className="text-sm text-text-secondary mb-6">
                      Assign a new password to this account. The user will be able to log in with this new password immediately.
                   </p>
                   
                   <form 
                     onSubmit={async (e) => {
                       e.preventDefault();
                       const pass = e.target.password.value;
                       const confirm = e.target.confirmPassword.value;
                       if (pass.length < 8) return alert('Password must be at least 8 characters');
                       if (pass !== confirm) return alert('Passwords do not match');
                       
                       const success = await handleResetPassword(pass);
                       if (success) e.target.reset();
                     }}
                     className="space-y-4 p-6 bg-light-bg/50 rounded-2xl border border-border-light"
                   >
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">New Password</label>
                          <input 
                            name="password" type="password" required minLength={8}
                            className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
                            placeholder="********"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-text-secondary uppercase mb-1.5">Confirm Password</label>
                          <input 
                            name="confirmPassword" type="password" required minLength={8}
                            className="w-full p-3 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/20 outline-none" 
                            placeholder="********"
                          />
                        </div>
                      </div>
                      <button 
                        type="submit"
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 active:scale-95"
                      >
                        Update Password
                      </button>
                   </form>
                </section>

                <section className="pt-8 border-t border-border-light">
                   <h3 className="text-lg font-bold text-error mb-2 flex items-center gap-2">
                      <LogOut className="w-5 h-5" /> Session Control
                   </h3>
                   <p className="text-sm text-text-secondary mb-6">
                      Invalidate all active sessions for this user. They will be required to log in again on all devices.
                   </p>
                   <button 
                     onClick={() => setModalConfig({ 
                       isOpen: true, 
                       type: 'logout', 
                       title: 'Force Logout All Sessions', 
                       message: 'Are you sure you want to invalidate all active sessions for this user? They will be required to log in again on all devices.' 
                     })}
                     className="px-6 py-3 bg-error text-white rounded-xl font-bold hover:bg-error/90 transition-all shadow-lg shadow-error/20 active:scale-95"
                   >
                     Force All Device Logout
                   </button>
                </section>
             </div>
          </div>
        )}
      </div>

      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={modalConfig.type === 'logout' ? handleForceLogout : handleToggleStatus}
        title={modalConfig.title}
        message={modalConfig.message}
        confirmText={modalConfig.type === 'logout' ? 'Force Logout' : 'Confirm'}
        type={modalConfig.type === 'logout' ? 'danger' : 'primary'}
      />
    </div>
  );
};

export default UserDetail;
