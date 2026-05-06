import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { createSocketConnection } from '../socket';
import api from '../api';
import { Clock, CheckCircle2, Loader2, Utensils, XCircle } from 'lucide-react';
import { ORDER_STATUSES, SOCKET_EVENTS } from '@restaurant-saas/shared';

const STATUS_COLORS = {
  [ORDER_STATUSES.PENDING]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [ORDER_STATUSES.CONFIRMED]: 'bg-blue-100 text-blue-800 border-blue-200',
  [ORDER_STATUSES.PREPARING]: 'bg-orange-100 text-orange-800 border-orange-200',
  [ORDER_STATUSES.READY]: 'bg-purple-100 text-purple-800 border-purple-200',
  [ORDER_STATUSES.COMPLETED]: 'bg-green-100 text-green-800 border-green-200',
  [ORDER_STATUSES.CANCELLED]: 'bg-red-100 text-red-800 border-red-200',
};

export default function LiveOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchActiveOrders() {
      try {
        const { data } = await api.get('/orders?status=active');
        setOrders(data.data || []);
      } catch (err) {
        console.error('Failure fetching orders', err);
      } finally {
        setLoading(false);
      }
    }
    fetchActiveOrders();

    // Use the /admin namespace as defined in the backend
    const socket = createSocketConnection('/admin', localStorage.getItem('token'));
    socket.connect();

    // Listen for new orders
    socket.on(SOCKET_EVENTS.ORDER_NEW, (payload) => {
      console.log('New order received via socket', payload);
      // Fetch the full order details since payload might be partial
      fetchActiveOrders();
    });

    // Listen for status changes
    socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, (payload) => {
      console.log('Order status updated via socket', payload);
      setOrders(prev => prev.map(o => 
        o._id === payload.orderId ? { ...o, status: payload.status } : o
      ));
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      // Socket will broadcast the update back to us
    } catch (err) {
      console.error('Failed to update status', err);
      alert('Failed to update status');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-primary" /></div>;
  }

  const activeOrders = orders.filter(o => o.status !== ORDER_STATUSES.COMPLETED && o.status !== ORDER_STATUSES.CANCELLED);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Live Queue</h1>
          <p className="text-slate-500 mt-1">Manage active orders for {user?.storeId || 'your restaurant'}</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
          <span className="font-semibold text-slate-700">Live</span>
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
          <Utensils className="w-16 h-16 text-slate-300 mb-4" />
          <p className="text-xl font-medium text-slate-500">No active orders</p>
          <p className="text-slate-400">New orders will appear here automatically</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {activeOrders.map(order => (
            <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Table {order.tableId?.label || 'External'}</h3>
                  <p className="text-sm text-slate-500 font-mono mt-1">#{order._id.slice(-6).toUpperCase()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wider ${STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
              </div>

              <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-xl">
                {order.items.map(item => (
                  <div key={item._id || item.productId} className="flex justify-between">
                    <span className="text-slate-700"><span className="font-bold mr-2">{item.quantity}x</span> {item.name}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 gap-2">
                {order.status === ORDER_STATUSES.PENDING && (
                  <button onClick={() => updateStatus(order._id, ORDER_STATUSES.CONFIRMED)} className="flex-1 bg-blue-50 text-blue-700 hover:bg-blue-100 py-2.5 rounded-xl font-semibold transition-colors">
                    Confirm Order
                  </button>
                )}
                {order.status === ORDER_STATUSES.CONFIRMED && (
                  <button onClick={() => updateStatus(order._id, ORDER_STATUSES.PREPARING)} className="flex-1 bg-orange-50 text-orange-700 hover:bg-orange-100 py-2.5 rounded-xl font-semibold transition-colors">
                    Start Preparing
                  </button>
                )}
                {order.status === ORDER_STATUSES.PREPARING && (
                  <button onClick={() => updateStatus(order._id, ORDER_STATUSES.READY)} className="flex-1 bg-purple-50 text-purple-700 hover:bg-purple-100 py-2.5 rounded-xl font-semibold transition-colors">
                    Mark Ready
                  </button>
                )}
                {order.status === ORDER_STATUSES.READY && (
                  <button onClick={() => updateStatus(order._id, ORDER_STATUSES.COMPLETED)} className="flex-1 bg-green-50 text-green-700 hover:bg-green-100 py-2.5 rounded-xl font-semibold transition-colors">
                    Complete
                  </button>
                )}
                <button onClick={() => updateStatus(order._id, ORDER_STATUSES.CANCELLED)} className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors" title="Cancel Order">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
