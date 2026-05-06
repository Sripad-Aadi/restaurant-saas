import React, { useState, useEffect } from 'react';
import { 
  Plus, Edit2, Trash2, Search, Loader2, 
  ChevronRight, MoreVertical, Package
} from 'lucide-react';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import api from '../../api';
import SortableCategory from './components/SortableCategory';
import ProductDrawer from './components/ProductDrawer';
import CategoryDrawer from './components/CategoryDrawer';
import ConfirmationModal from '../../components/ConfirmationModal';

const MenuManagement = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCatDrawerOpen, setIsCatDrawerOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);

  // Modal State
  const [modalConfig, setModalConfig] = useState({ isOpen: false, type: '', id: null, title: '', message: '' });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    setError('');
    try {
      const [catRes, prodRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products')
      ]);
      setCategories(catRes.data.data);
      setProducts(prodRes.data.data);
      if (catRes.data.data.length > 0 && !activeCategoryId) {
        setActiveCategoryId(catRes.data.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to fetch menu data:', err);
      setError('Failed to load menu data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setCategories((items) => {
        const oldIndex = items.findIndex((i) => i._id === active.id);
        const newIndex = items.findIndex((i) => i._id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Prepare bulk update
        const bulkData = newItems.map((item, index) => ({
          id: item._id,
          sortOrder: index
        }));
        
        // Call API in background
        api.post('/categories/bulk-reorder', { items: bulkData })
          .catch(err => {
            console.error('Failed to save reorder:', err);
            setError('Failed to save category order.');
          });
          
        return newItems;
      });
    }
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsDrawerOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsDrawerOpen(true);
  };

  const handleDeleteProductClick = (id) => {
    setModalConfig({
      isOpen: true,
      type: 'product',
      id,
      title: 'Delete Product',
      message: 'Are you sure you want to delete this product?'
    });
  };

  const confirmDelete = async () => {
    setError('');
    try {
      if (modalConfig.type === 'product') {
        await api.delete(`/products/${modalConfig.id}`);
        setProducts(products.filter(p => p._id !== modalConfig.id));
      } else if (modalConfig.type === 'category') {
        await api.delete(`/categories/${modalConfig.id}`);
        const newCats = categories.filter(c => c._id !== modalConfig.id);
        setCategories(newCats);
        if (activeCategoryId === modalConfig.id) {
          setActiveCategoryId(newCats[0]?._id || null);
        }
      }
    } catch (err) {
      setError(`Failed to delete ${modalConfig.type}`);
    }
  };

  const handleToggleProduct = async (product) => {
    setError('');
    try {
      const response = await api.patch(`/products/${product._id}/toggle-availability`);
      setProducts(products.map(p => p._id === product._id ? response.data.data : p));
    } catch (err) {
      setError('Failed to toggle product status');
    }
  };

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsCatDrawerOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsCatDrawerOpen(true);
  };

  const handleDeleteCategoryClick = (id) => {
    setModalConfig({
      isOpen: true,
      type: 'category',
      id,
      title: 'Delete Category',
      message: 'Delete this category? Products will become uncategorized but not deleted.'
    });
  };

  const filteredProducts = products.filter(p => 
    (activeCategoryId === 'all' || p.categoryId?._id === activeCategoryId || p.categoryId === activeCategoryId) &&
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Menu Management</h2>
          <p className="text-sm text-text-secondary mt-1">Organize your restaurant's digital menu</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-error/10 border border-error/20 text-error text-sm rounded-lg font-medium flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-error/60 hover:text-error transition-colors text-lg">&times;</button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
        {/* Left Panel - Categories */}
        <div className="lg:w-[320px] flex flex-col bg-card-white border border-border-light rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border-light flex justify-between items-center bg-light-bg/50">
            <h3 className="font-bold text-text-primary uppercase text-xs tracking-widest">Categories</h3>
            <button 
              onClick={handleAddCategory}
              className="p-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={categories.map(c => c._id)}
                strategy={verticalListSortingStrategy}
              >
                {categories.map((cat) => (
                  <SortableCategory 
                    key={cat._id}
                    category={cat}
                    isActive={activeCategoryId === cat._id}
                    onClick={() => setActiveCategoryId(cat._id)}
                    onEdit={handleEditCategory}
                    onDelete={handleDeleteCategoryClick}
                  />
                ))}
              </SortableContext>
            </DndContext>
            
            {categories.length === 0 && (
              <div className="p-8 text-center text-text-muted">
                <p className="text-sm">No categories yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Products */}
        <div className="flex-1 flex flex-col bg-card-white border border-border-light rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border-light flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border-light rounded-xl focus:ring-2 focus:ring-primary/10 outline-none text-sm"
              />
            </div>
            <button 
              onClick={handleAddProduct}
              className="bg-primary text-white px-5 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4" /> Add Product
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 bg-light-bg/20">
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredProducts.map(product => (
                  <div key={product._id} className="group bg-card-white rounded-2xl border border-border-light shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
                    <div className="h-44 w-full relative overflow-hidden bg-slate-100">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Package className="w-12 h-12" />
                        </div>
                      )}
                      {!product.isAvailable && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter text-slate-900">Unavailable</span>
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2 bg-white text-text-primary rounded-lg shadow-lg hover:text-primary transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProductClick(product._id)}
                          className="p-2 bg-white text-text-primary rounded-lg shadow-lg hover:text-error transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-text-primary truncate flex-1 pr-2" title={product.name}>
                          {product.name}
                        </h4>
                        <span className="font-black text-primary">₹{(product.price / 100).toFixed(2)}</span>
                      </div>
                      <p className="text-xs text-text-secondary line-clamp-2 h-8 mb-4">
                        {product.description || 'No description provided.'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border-light">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handleToggleProduct(product)}
                            className={`w-10 h-5 rounded-full relative transition-colors ${product.isAvailable ? 'bg-success' : 'bg-slate-200'}`}
                          >
                            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${product.isAvailable ? 'left-6' : 'left-1'}`} />
                          </button>
                          <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">
                            {product.isAvailable ? 'Active' : 'Hidden'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-muted py-20">
                <div className="w-20 h-20 bg-light-bg rounded-full flex items-center justify-center mb-4">
                  <Package className="w-10 h-10 opacity-20" />
                </div>
                <h3 className="text-xl font-bold text-text-primary">No items found</h3>
                <p className="mt-1 text-sm">Start adding products to this category.</p>
                <button 
                  onClick={handleAddProduct}
                  className="mt-6 text-primary font-bold hover:underline"
                >
                  Add Your First Product
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProductDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        product={editingProduct}
        categoryId={activeCategoryId}
        onSave={fetchInitialData}
      />

      <CategoryDrawer
        isOpen={isCatDrawerOpen}
        onClose={() => setIsCatDrawerOpen(false)}
        category={editingCategory}
        onSave={fetchInitialData}
      />

      <ConfirmationModal 
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={confirmDelete}
        title={modalConfig.title}
        message={modalConfig.message}
      />
    </div>
  );
};

export default MenuManagement;
