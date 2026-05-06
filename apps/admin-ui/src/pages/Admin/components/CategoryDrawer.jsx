import React, { useState, useEffect } from 'react';
import Drawer from '../../../components/Drawer';
import ImageUpload from '../../../components/ImageUpload';
import api from '../../../api';

const CategoryDrawer = ({ isOpen, onClose, category, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name || '',
        description: category.description || '',
        image: category.image || '',
        isActive: category.isActive ?? true,
      });
    } else {
      setFormData({
        name: '',
        description: '',
        image: '',
        isActive: true,
      });
    }
    setError('');
  }, [category, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (category) {
        await api.patch(`/categories/${category._id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save category:', err);
      const msg = err.response?.data?.errors 
        ? err.response.data.errors.map(e => `${e.field}: ${e.message}`).join(', ')
        : err.response?.data?.message || 'Failed to save category';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={category ? 'Edit Category' : 'Add New Category'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 text-error text-sm rounded-lg">
            {error}
          </div>
        )}

        <ImageUpload
          value={formData.image}
          onChange={(url) => setFormData({ ...formData, image: url })}
          label="Category Image"
        />

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Category Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="e.g. Starters"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none text-sm"
            placeholder="Briefly describe this category..."
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-light-bg rounded-xl">
          <input
            type="checkbox"
            id="catIsActive"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="w-4 h-4 text-primary rounded cursor-pointer"
          />
          <label htmlFor="catIsActive" className="text-sm font-medium text-text-secondary cursor-pointer">Active</label>
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
            {submitting ? 'Saving...' : category ? 'Update Category' : 'Add Category'}
          </button>
        </div>
      </form>
    </Drawer>
  );
};

export default CategoryDrawer;
