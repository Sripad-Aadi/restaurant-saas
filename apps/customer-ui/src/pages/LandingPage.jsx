import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../CustomerContext';
import api from '../api';
import { 
  Utensils, Clock, MapPin, Star, ArrowRight, 
  Wifi, Wind, AlertCircle, Loader2 
} from 'lucide-react';

export default function LandingPage() {
  const { storeSlug, tableId } = useParams();
  const navigate = useNavigate();
  const { setStoreSlug, setTableId, setStoreId } = useCustomer();
  
  const [store, setStore] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const response = await api.get(`/v1/menu/${storeSlug}`);
        const data = response.data.data;
        
        setStore(data.store);
        setStoreSlug(storeSlug);
        setTableId(tableId);
        setStoreId(data.store.id);

        // Always refresh guest token on landing to ensure validity for the current store context
        const authRes = await api.post('/auth/guest', { storeId: data.store.id });
        if (authRes.data.success) {
          localStorage.setItem('token', authRes.data.accessToken);
          localStorage.setItem('user', JSON.stringify(authRes.data.user));
        }
        
      } catch (err) {
        console.error(err);
        if (err.response?.status === 404) {
          setError('Restaurant not found. Please check the QR code.');
        } else {
          setError('This store is currently unavailable. Please contact staff.');
        }
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [storeSlug, tableId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white p-6">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-slate-400 font-medium animate-pulse">Initializing your dining experience...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50 text-center animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-red-100 rounded-3xl flex items-center justify-center mb-6 shadow-sm rotate-3">
          <AlertCircle className="h-10 w-10 text-red-500" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-3">Something's wrong!</h1>
        <p className="text-slate-500 font-medium mb-8 max-w-xs">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-8 py-3 bg-slate-800 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white relative overflow-hidden">
      {/* Hero Section */}
      <div className="relative h-[45vh] w-full overflow-hidden">
        {store.coverImage ? (
          <img 
            src={store.coverImage} 
            alt={store.name} 
            className="w-full h-full object-cover animate-in fade-in zoom-in duration-1000"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <Utensils className="w-20 h-20 text-white/10" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
        
        <div className="absolute bottom-0 left-0 w-full p-8 pb-12">
          {store.logo && (
            <img 
              src={store.logo} 
              alt="Logo" 
              className="w-20 h-20 rounded-2xl border-4 border-white shadow-2xl mb-4 animate-in slide-in-from-bottom duration-700"
            />
          )}
          <h1 className="text-4xl font-black text-white tracking-tight animate-in slide-in-from-bottom duration-700 delay-100">
            {store.name}
          </h1>
          <div className="flex flex-wrap gap-2 mt-3 animate-in slide-in-from-bottom duration-700 delay-200">
            {store.cuisineType && store.cuisineType.split(',').map((cuisine, i) => (
              <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur-md text-white rounded-full text-xs font-bold uppercase tracking-wider">
                {cuisine.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 bg-white rounded-t-[40px] -mt-8 relative z-10 px-8 pt-10 pb-20 shadow-2xl">
        <div className="flex justify-between items-start mb-8">
          <div className="space-y-4">
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                 <Clock className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Wait Time</p>
                 <p className="text-sm font-bold text-slate-800">{store.avgWaitTime || '15–20 mins'}</p>
               </div>
             </div>
             <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary">
                 <MapPin className="w-5 h-5" />
               </div>
               <div>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Your Location</p>
                 <p className="text-sm font-bold text-slate-800">Table {tableId || 'Queue'}</p>
               </div>
             </div>
          </div>
          
          <div className="flex gap-2">
            {store.amenities?.wifi && (
              <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400" title="Free Wifi">
                <Wifi className="w-5 h-5" />
              </div>
            )}
            {store.amenities?.ac && (
              <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400" title="Air Conditioned">
                <Wind className="w-5 h-5" />
              </div>
            )}
          </div>
        </div>

        <p className="text-slate-500 leading-relaxed font-medium mb-10">
          {store.description || `Welcome to ${store.name}! We're delighted to serve you. Please browse our digital menu to place your order.`}
        </p>

        <button 
          onClick={() => navigate('/menu')}
          className="w-full bg-primary text-white py-5 rounded-[22px] font-black text-xl shadow-2xl shadow-primary/30 flex items-center justify-center gap-4 active:scale-95 transition-all animate-in slide-in-from-bottom duration-700 delay-300"
        >
          VIEW MENU <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Decorative element */}
      <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
    </div>
  );
}
