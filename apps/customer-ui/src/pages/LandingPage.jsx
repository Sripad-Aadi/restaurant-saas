import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCustomer } from '../CustomerContext';
import api from '../api';
import { Utensils } from 'lucide-react';

export default function LandingPage() {
  const { storeSlug, tableId } = useParams();
  const navigate = useNavigate();
  const { setStoreSlug, setTableId, setStoreId } = useCustomer();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkStoreAndTable() {
      try {
        setLoading(true);
        // We fetch public menu to get storeId and verify slug
        const response = await api.get(`/menu/${storeSlug}`);
        const storeId = response.data.data.storeId;
        
        setStoreSlug(storeSlug);
        setTableId(tableId);
        setStoreId(storeId);
        
        // Slight delay for animation/splash screen effect
        setTimeout(() => {
          navigate('/menu');
        }, 1500);
      } catch (err) {
        console.error(err);
        setError('Unable to find this restaurant or table. Please try scanning the QR code again.');
      } finally {
        setLoading(false);
      }
    }
    checkStoreAndTable();
  }, [storeSlug, tableId]);

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-red-50 text-center animate-in fade-in duration-500">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
          <Utensils className="h-8 w-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Oops!</h1>
        <p className="text-slate-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-6">
      <div className="relative animate-bounce">
        <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center border-4 border-orange-500/20">
            <Utensils className="h-12 w-12 text-primary drop-shadow-md" />
        </div>
      </div>
      <h1 className="mt-8 text-3xl font-extrabold text-slate-800 tracking-tight text-center">
        Welcome to {storeSlug}
      </h1>
      <p className="mt-2 text-slate-500 font-medium">Preparing your digital menu...</p>
      
      <div className="mt-8 flex space-x-2">
        <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-2.5 h-2.5 bg-primary/60 rounded-full animate-bounce"></div>
      </div>
    </div>
  );
}
