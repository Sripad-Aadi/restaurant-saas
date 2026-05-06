import React, { useState, useEffect } from 'react';
import Drawer from '../../../components/Drawer';
import ImageUpload from '../../../components/ImageUpload';
import api from '../../../api';

const ProductDrawer = ({ isOpen, onClose, product, categoryId, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    categoryId: categoryId || '',
    isAvailable: true,
    foodType: 'veg',
    allergens: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: (product.price / 100).toString() || '',
        image: product.image || '',
        categoryId: product.categoryId?._id || product.categoryId || categoryId || '',
        isAvailable: product.isAvailable ?? true,
        foodType: product.foodType || 'veg',
        allergens: product.allergens?.join(', ') || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        image: '',
        categoryId: categoryId || '',
        isAvailable: true,
        foodType: 'veg',
        allergens: '',
      });
    }
    setError('');
  }, [product, categoryId, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        ...formData,
        price: Math.round(parseFloat(formData.price) * 100), // Convert to paise
        allergens: formData.allergens.split(',').map(s => s.trim()).filter(Boolean),
      };

      if (product) {
        await api.patch(`/products/${product._id}`, payload);
      } else {
        await api.post('/products', payload);
      }
      onSave();
      onClose();
    } catch (err) {
      console.error('Failed to save product:', err);
      const msg = err.response?.data?.errors 
        ? err.response.data.errors.map(e => `${e.field}: ${e.message}`).join(', ')
        : err.response?.data?.message || 'Failed to save product';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Edit Product' : 'Add New Product'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6 pb-20">
        {error && (
          <div className="p-3 bg-error/10 border border-error/20 text-error text-sm rounded-lg">
            {error}
          </div>
        )}
        <ImageUpload
          value={formData.image}
          onChange={(url) => setFormData({ ...formData, image: url })}
          label="Product Image"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-text-secondary mb-1">Product Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="e.g. Paneer Tikka"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Food Type</label>
            <select
              value={formData.foodType}
              onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
              className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none bg-white"
            >
              <option value="veg">Veg</option>
              <option value="non-veg">Non-Veg</option>
              <option value="egg">Contains Egg</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Price (₹)</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none h-24 resize-none text-sm"
            placeholder="Describe the item..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-text-secondary mb-1">Allergens (comma separated)</label>
          <input
            type="text"
            value={formData.allergens}
            onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
            className="w-full px-4 py-2 border border-border-light rounded-lg focus:ring-2 focus:ring-primary/20 outline-none"
            placeholder="e.g. nuts, dairy, gluten"
          />
        </div>

        <div className="flex items-center gap-2 p-3 bg-light-bg rounded-xl">
          <input
            type="checkbox"
            id="isAvailable"
            checked={formData.isAvailable}
            onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
            className="w-4 h-4 text-primary rounded cursor-pointer"
          />
          <label htmlFor="isAvailable" className="text-sm font-medium text-text-secondary cursor-pointer">Available for orders</label>
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
            {submitting ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
          </button>
        </div>
      </form>
    </Drawer>
  );
};

export default ProductDrawer;
