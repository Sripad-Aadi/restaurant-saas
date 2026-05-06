import React, { useState, useEffect } from 'react';
import { useCustomer } from '../CustomerContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, ShoppingBag, Receipt, ChevronRight, Loader2, Info } from 'lucide-react';
import api from '../api';
import StatusBadge from '../components/StatusBadge';

export default function CustomerOrdersPage() {
  const { storeId } = useCustomer();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/orders/my');
        setOrders(data.data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="flex-1 pb-24 bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-100 p-4 flex items-center">
        <button onClick={() => navigate('/menu')} className="p-2 -ml-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 ml-2">My Orders</h1>
      </div>

      <div className="p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : orders.length > 0 ? (
          orders.map((order) => (
            <div 
              key={order._id} 
              onClick={() => navigate(`/order/${order._id}`)}
              className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-800 font-mono tracking-tighter">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={order.status} />
                  {order.paymentStatus === 'PAID' && (
                    <span className="text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
                       <ShoppingBag className="w-3 h-3" /> PAID
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-slate-50/50 rounded-xl p-3 border border-slate-100/50 mb-4">
                <p className="text-xs text-slate-500 line-clamp-1 italic font-medium">
                  {order.items.map(i => `${i.name} x${i.quantity}`).join(', ')}
                </p>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Amount</span>
                  <span className="font-black text-lg text-slate-800">₹{(order.total / 100).toFixed(2)}</span>
                </div>
                <div className="flex items-center gap-1 text-primary font-black text-xs uppercase tracking-widest">
                  View Track <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingBag className="w-10 h-10 text-slate-300" />
            </div>
            <h2 className="text-xl font-black text-slate-800 mb-2">No orders yet</h2>
            <p className="text-slate-500 mb-8 max-w-[200px]">Looks like you haven't placed any orders yet. Go to the menu to start!</p>
            <button 
              onClick={() => navigate('/menu')}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-black shadow-lg shadow-slate-200 active:scale-95 transition-all"
            >
              BROWSE MENU
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
