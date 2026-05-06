import React, { useEffect, useState } from 'react';
import { useCustomer } from '../CustomerContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { ShoppingBag } from 'lucide-react';
import CartWidget from '../components/CartWidget';

export default function MenuPage() {
  const { storeSlug, cart, addToCart, updateQuantity } = useCustomer();
  const navigate = useNavigate();
  const [store, setStore] = useState(null);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!storeSlug) {
      navigate('/');
      return;
    }

    async function fetchMenu() {
      try {
        const { data } = await api.get(`/menu/${storeSlug}`);
        setStore(data.data.store);
        const menuArray = data.data.menu || [];
        
        // Transform backend grouped format into flat frontend arrays
        const cats = menuArray.map(m => ({ _id: m.category.id, name: m.category.name }));
        const prods = menuArray.flatMap(m => m.products.map(p => ({
          ...p,
          _id: p.id,
          categoryId: m.category.id,
        })));

        setCategories(cats);
        setProducts(prods);
        if (cats.length > 0) {
          setActiveCategory(cats[0]._id);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMenu();
  }, [storeSlug, navigate]);

  if (loading) {
    return <div className="flex-1 flex justify-center items-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
  }

  const activeProducts = products.filter(p => p.categoryId === activeCategory);
  
  const cartItemCount = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex-1 pb-24 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
        <div className="p-4 flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">{store?.name || 'Our Menu'}</h1>
              {store?.description && <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-1">{store.description}</p>}
            </div>
            <button 
              onClick={() => navigate('/orders')}
              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black shadow-lg shadow-slate-200 flex items-center gap-2 active:scale-95 transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" /> MY ORDERS
            </button>
        </div>
        
        {/* Categories Tab */}
        <div className="flex overflow-x-auto hide-scrollbar px-4 pb-3 space-x-3">
          {categories.map((cat) => (
            <button
              key={cat._id}
              onClick={() => setActiveCategory(cat._id)}
              className={`whitespace-nowrap px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeCategory === cat._id
                  ? 'bg-primary text-white shadow-lg shadow-primary/30 transform scale-[1.02]'
                  : 'bg-white text-slate-400 hover:bg-slate-50 border border-slate-200'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeProducts.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No items available in this category.
          </div>
        ) : (
          activeProducts.map((product) => (
            <div key={product._id} className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-100 overflow-hidden flex flex-col group">
              {product.image ? (
                <div className="h-48 w-full bg-gray-100 overflow-hidden">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              ) : (
                <div className="h-32 w-full bg-slate-50 flex items-center justify-center text-slate-300">
                  No Image
                </div>
              )}
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="text-lg font-bold text-slate-800">{product.name}</h3>
                {product.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{product.description}</p>}
                
                <div className="mt-auto pt-4 flex items-center justify-between">
                  <p className="text-lg font-extrabold text-slate-900">
                    ₹{(product.price / 100).toFixed(2)}
                  </p>
                  {cart[product._id] ? (
                    <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 animate-in zoom-in duration-200">
                      <button 
                        onClick={() => updateQuantity(product._id, -1)}
                        className="w-8 h-8 flex items-center justify-center bg-white text-slate-900 rounded-lg shadow-sm hover:bg-slate-50 active:scale-90 transition-all"
                      >
                        <span className="font-black">−</span>
                      </button>
                      <span className="font-black text-slate-900 w-8 text-center text-sm">{cart[product._id].quantity}</span>
                      <button 
                        onClick={() => updateQuantity(product._id, 1)}
                        className="w-8 h-8 flex items-center justify-center bg-white text-slate-900 rounded-lg shadow-sm hover:bg-slate-50 active:scale-90 transition-all"
                      >
                        <span className="font-black">+</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(product)}
                      disabled={!product.isAvailable}
                      className={`px-6 py-2 rounded-xl text-sm font-black transition-all shadow-sm
                        ${product.isAvailable 
                          ? 'bg-primary text-white hover:bg-orange-600 active:scale-95' 
                          : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                    >
                      {product.isAvailable ? 'Add +' : 'Sold Out'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cartItemCount > 0 && <CartWidget />}
    </div>
  );
}
