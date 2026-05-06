import React, { useState, useEffect } from 'react';
import Drawer from '../../../components/Drawer';
import api from '../../../api';

const TableDrawer = ({ isOpen, onClose, table, onSave }) => {
  const [formData, setFormData] = useState({
    tableNumber: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (table) {
      setFormData({
        tableNumber: table.tableNumber || '',
        isActive: table.isActive ?? true,
      });
    } else {
      setFormData({
        tableNumber: '',
        isActive: true,
      });
    }
    setError('');
  }, [table, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        tableNumber: parseInt(formData.tableNumber, 10),
      };
      if (table) {
        await api.patch(`/tables/${table._id}`, { isActive: payload.isActive });
      } else {
        await api.post('/tables', { tableNumber: payload.tableNumber });
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save table:', err);
      const msg = err.response?.data?.errors 
        ? err.response.data.errors.map(e => `${e.field}: ${e.message}`).join(', ')
        : err.response?.data?.message || 'Failed to save table';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={table ? 'Edit Table' : 'Add New Table'}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 text-error text-sm rounded-lg font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Table Number</label>
          <input
            type="number"
            required
            min="1"
            value={formData.tableNumber}
            onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value === '' ? '' : parseInt(e.target.value, 10) })}
            className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="e.g. 5"
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-light-bg rounded-xl">
          <input
            type="checkbox"
            id="tableIsActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-primary rounded cursor-pointer"
          />
          <label htmlFor="tableIsActive" className="text-sm font-medium text-text-secondary cursor-pointer">Active for orders</label>
        </div>

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
            {submitting ? 'Saving...' : table ? 'Update Table' : 'Add Table'}
          </button>
        </div>
      </form>
    </Drawer>
  );
};

export default TableDrawer;
