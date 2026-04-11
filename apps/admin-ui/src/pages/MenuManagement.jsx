import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import api from '../api';
import { Plus, Edit2, Trash2, Check, X, Loader2 } from 'lucide-react';

export default function MenuManagement() {
  const { user } = useAuth();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // New Category State
  const [newCatName, setNewCatName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [catsRes, prodsRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products')
      ]);
      setCategories(catsRes.data.data.results || []);
      setProducts(prodsRes.data.data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      await api.post('/categories', { name: newCatName });
      setNewCatName('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategory = async (id) => {
    try {
      await api.delete(`/categories/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Menu Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Categories Panel */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col h-fit">
          <h2 className="text-lg font-bold text-slate-800 mb-4">Categories</h2>
          
          <form onSubmit={createCategory} className="flex gap-2 mb-6">
            <input 
              type="text" 
              placeholder="New category..." 
              value={newCatName}
              onChange={e => setNewCatName(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
            />
            <button type="submit" className="bg-primary text-white p-2.5 rounded-xl hover:bg-blue-600 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="space-y-2">
            {categories.map(cat => (
              <div key={cat._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                <span className="font-medium text-slate-700">{cat.name}</span>
                <button onClick={() => deleteCategory(cat._id)} className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {categories.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No categories yet</p>}
          </div>
        </div>

        {/* Products Panel */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-lg font-bold text-slate-800">Products</h2>
             <button className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-800">
               <Plus className="w-4 h-4" /> Add Product
             </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Price</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map(prod => (
                  <tr key={prod._id} className="hover:bg-slate-50/50">
                    <td className="py-4">
                      <div className="font-medium text-slate-800">{prod.name}</div>
                    </td>
                    <td className="py-4 text-sm text-slate-500">
                      {categories.find(c => c._id === prod.categoryId)?.name || 'Unknown'}
                    </td>
                    <td className="py-4 font-semibold text-slate-900">
                       ₹{(prod.price / 100).toFixed(2)}
                    </td>
                    <td className="py-4">
                      {prod.isAvailable ? (
                        <span className="bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full text-xs font-bold">Active</span>
                      ) : (
                        <span className="bg-slate-100 text-slate-500 px-2.5 py-0.5 rounded-full text-xs font-bold">Sold Out</span>
                      )}
                    </td>
                    <td className="py-4 text-right">
                       <button className="p-2 text-slate-400 hover:text-primary transition-colors"><Edit2 className="w-4 h-4" /></button>
                       <button className="p-2 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <div className="text-center py-12 text-slate-400">No products configured. Create some to show them on the menu.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
