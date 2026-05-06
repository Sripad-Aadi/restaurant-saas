import React, { useState, useEffect } from 'react';
import Drawer from '../../../components/Drawer';
import api from '../../../api';
import { ROLES } from '@restaurant-saas/shared';

const UserDrawer = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.CUSTOMER,
    storeId: '',
    isActive: true,
  });
  const [stores, setStores] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        password: '', // Don't populate password
        role: user.role || ROLES.CUSTOMER,
        storeId: user.storeId?._id || user.storeId || '',
        isActive: user.isActive ?? true,
      });
    } else {
      setFormData({
        name: '',
        email: '',
        password: '',
        role: ROLES.CUSTOMER,
        storeId: '',
        isActive: true,
      });
    }
    setError('');
  }, [user, isOpen]);

  const fetchStores = async () => {
    try {
      const response = await api.get('/stores');
      setStores(response.data.data);
    } catch (err) {
      console.error('Failed to fetch stores', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Don't send empty password

      if (user) {
        await api.patch(`/users/${user._id}`, payload);
      } else {
        await api.post('/users', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={user ? 'Edit User' : 'Add New User'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 text-error text-sm rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
          <input
            type="email"
            required
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="john@example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">
            {user ? 'New Password (leave blank to keep current)' : 'Password'}
          </label>
          <input
            type="password"
            required={!user}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="********"
            minLength={8}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
            >
              <option value={ROLES.SUPER_ADMIN}>Super Admin</option>
              <option value={ROLES.ADMIN}>Store Admin</option>
              <option value={ROLES.CUSTOMER}>Customer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
            <select
              value={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
              className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>
        </div>

        {formData.role !== ROLES.SUPER_ADMIN && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Assign to Store</label>
            <select
              required={formData.role !== ROLES.SUPER_ADMIN}
              value={formData.storeId}
              onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
              className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
            >
              <option value="">Select a Store</option>
              {stores.map(store => (
                <option key={store._id} value={store._id}>{store.name} (/{store.slug})</option>
              ))}
            </select>
          </div>
        )}

        <div className="pt-4 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-border-light rounded-lg text-text-primary hover:bg-light-bg transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50"
          >
            {submitting ? 'Saving...' : user ? 'Update User' : 'Create User'}
          </button>
        </div>
      </form>
    </Drawer>
  );
};

export default UserDrawer;
