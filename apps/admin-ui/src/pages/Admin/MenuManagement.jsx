import React, { useState } from 'react';
import { GripVertical, Plus, Edit2, Trash2, Search } from 'lucide-react';

const MenuManagement = () => {
  const [activeCategory, setActiveCategory] = useState(1);
  
  const categories = [
    { id: 1, name: 'Starters', count: 12, active: true },
    { id: 2, name: 'Main Course', count: 24, active: true },
    { id: 3, name: 'Breads', count: 8, active: true },
    { id: 4, name: 'Desserts', count: 6, active: true },
    { id: 5, name: 'Beverages', count: 15, active: false },
  ];

  const products = [
    { id: 101, categoryId: 1, name: 'Paneer Tikka', price: 260, image: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=300&q=80', active: true },
    { id: 102, categoryId: 1, name: 'Chicken Achari Tikka', price: 320, image: 'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&w=300&q=80', active: true },
    { id: 103, categoryId: 1, name: 'Hara Bhara Kebab', price: 220, image: 'https://images.unsplash.com/photo-1544025162-83145af15156?auto=format&fit=crop&w=300&q=80', active: false },
  ].filter(p => p.categoryId === activeCategory);

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Menu Management</h2>
          <p className="text-sm text-text-secondary mt-1">Manage categories and menu items</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Categories Panel - 30% */}
        <div className="lg:w-[30%] bg-card-white border border-border-light rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border-light flex justify-between items-center bg-light-bg">
            <h3 className="font-semibold text-text-primary">Categories</h3>
            <button className="text-primary p-1 hover:bg-primary/10 rounded transition-colors" title="Add Category">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {categories.map(cat => (
              <div 
                key={cat.id} 
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center group cursor-pointer p-3 rounded-lg transition-colors ${activeCategory === cat.id ? 'bg-primary/10 border border-primary/20' : 'hover:bg-light-bg border border-transparent'}`}
              >
                <GripVertical className="w-4 h-4 text-text-muted mr-3 cursor-grab opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex-1">
                  <h4 className={`font-medium ${activeCategory === cat.id ? 'text-primary' : 'text-text-primary'}`}>{cat.name}</h4>
                  <p className="text-xs text-text-secondary">{cat.count} items</p>
                </div>
                <div className="flex items-center gap-3">
                  {/* Toggle placeholder */}
                  <div className={`w-8 h-4 rounded-full relative cursor-pointer ${cat.active ? 'bg-success' : 'bg-border-light'}`}>
                    <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${cat.active ? 'left-4.5 right-0.5' : 'left-0.5'}`}></div>
                  </div>
                  <div className="flex opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <button className="text-text-muted hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Panel - 70% */}
        <div className="lg:w-[70%] bg-card-white border border-border-light rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-border-light flex justify-between items-center bg-light-bg flex-wrap gap-4">
            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search products..." 
                className="w-full pl-9 pr-4 py-2 text-sm border border-border-light rounded-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none text-text-primary"
              />
            </div>
            <button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-light-bg/50">
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map(product => (
                  <div key={product.id} className="bg-card-white rounded-xl overflow-hidden border border-border-light shadow-sm hover:shadow-md transition-shadow group">
                    <div className="h-40 w-full bg-border-light relative">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      {!product.active && (
                        <div className="absolute inset-0 bg-dark-bg/60 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="bg-white px-3 py-1 rounded text-xs font-bold text-text-primary uppercase tracking-wider">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-text-primary leading-tight">{product.name}</h4>
                        <span className="font-mono font-bold text-text-secondary">₹{product.price}</span>
                      </div>
                      <div className="flex justify-between items-center mt-4 pt-4 border-t border-border-light">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <div className={`w-8 h-4 rounded-full relative ${product.active ? 'bg-success' : 'bg-border-light'}`}>
                            <div className={`w-3 h-3 bg-white rounded-full absolute top-0.5 transition-all ${product.active ? 'left-[18px]' : 'left-0.5'}`}></div>
                          </div>
                          <span className="text-xs font-medium text-text-secondary">{product.active ? 'Available' : 'Unavailable'}</span>
                        </label>
                        <div className="flex gap-2 text-text-muted">
                          <button className="hover:text-primary transition-colors p-1"><Edit2 className="w-4 h-4" /></button>
                          <button className="hover:text-error transition-colors p-1"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-muted">
                <div className="w-16 h-16 bg-card-white border-2 border-dashed border-border-light rounded-full flex items-center justify-center mb-4">
                  <Plus className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-lg font-medium text-text-primary mb-1">No products found</h3>
                <p className="text-sm">Add your first product to this category</p>
                <button className="mt-4 text-primary font-medium hover:underline">Add Product</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
