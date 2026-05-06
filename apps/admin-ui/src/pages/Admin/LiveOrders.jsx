import React, { useState, useEffect, useRef } from 'react';
import { Wifi, Search, MoreHorizontal, ChefHat, Check, X, Clock, MapPin, Receipt, Trash2, ArrowRight, Loader2, ShoppingBag } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api';
import { createSocketConnection } from '../../socket';
import { SOCKET_EVENTS, ORDER_STATUSES, ALLOWED_TRANSITIONS } from '@restaurant-saas/shared';
import { useAuth } from '../../AuthContext';

const LiveOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  
  const tabs = ['All', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

  useEffect(() => {
    fetchOrders();

    if (user?.storeId) {
      const token = localStorage.getItem('token');
      socketRef.current = createSocketConnection('/orders', token);
      
      socketRef.current.on('connect', () => {
        socketRef.current.emit('join', `store:${user.storeId}`);
      });

      socketRef.current.on(SOCKET_EVENTS.ORDER_NEW, (newOrder) => {
        setOrders(prev => [newOrder, ...prev]);
      });

      socketRef.current.on(SOCKET_EVENTS.ORDER_STATUS_UPDATED, (data) => {
        setOrders(prev => prev.map(order => 
          order._id === data.orderId ? { ...order, status: data.status } : order
        ));
        if (selectedOrder?._id === data.orderId) {
          setSelectedOrder(prev => ({ ...prev, status: data.status }));
        }
      });

      socketRef.current.connect();
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user?.storeId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      // Get orders for current day/recent
      const response = await api.get('/orders', {
        params: { limit: 50 }
      });
      setOrders(response.data.data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      // The socket event will handle the UI update
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const filteredOrders = activeTab === 'All' 
    ? orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED')
    : orders.filter(o => o.status === activeTab);

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Live Orders</h2>
          <p className="text-sm text-text-secondary mt-1">Manage current restaurant orders in real-time</p>
        </div>
        <div className="flex items-center gap-2 bg-success/10 text-success px-3 py-1.5 rounded-full text-sm font-medium border border-success/20">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse"></span>
          Connected
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6 hide-scrollbar border-b border-border-light">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {tab}
            {tab === 'Pending' && <span className="ml-2 bg-error text-white text-xs px-1.5 py-0.5 rounded-full">1</span>}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div 
                key={order._id} 
                onClick={() => setSelectedOrder(order)}
                className="bg-card-white border border-border-light p-5 rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex flex-col group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-light-bg border border-border-light rounded-lg flex items-center justify-center font-bold text-lg text-text-primary shadow-inner">
                      {order.tableNumber || '?'}
                    </div>
                    <div>
                      <h4 className="font-mono font-bold text-text-primary">{order.orderNumber}</h4>
                      <span className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <StatusBadge status={order.status} />
                </div>
                
                <div className="text-sm text-text-secondary mb-4 flex-1 line-clamp-2">
                  {order.items.map(i => `${i.name} ×${i.quantity}`).join(', ')}
                </div>
                
                <div className="flex justify-between items-center pt-3 border-t border-border-light">
                  <span className="font-bold text-text-primary">₹{(order.total / 100).toLocaleString()}</span>
                  <div className="flex items-center text-primary text-xs font-bold gap-1 group-hover:translate-x-1 transition-transform">
                    DETAILS <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-text-muted border-2 border-dashed border-border-light rounded-2xl bg-light-bg/30">
              <ChefHat className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="font-medium">No live orders found</p>
              <p className="text-xs mt-1">New orders will appear here automatically</p>
            </div>
          )}
        </div>
      )}

      {/* Slide-over Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-dark-bg/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedOrder(null)}></div>
          <div className="w-full max-w-[480px] bg-card-white shadow-2xl h-full flex flex-col relative animate-in slide-in-from-right duration-300 border-l border-border-light">
            {/* Header */}
            <div className="px-6 py-5 border-b border-border-light flex justify-between items-center bg-light-bg/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white border border-border-light rounded-xl flex items-center justify-center font-bold text-xl text-primary shadow-sm">
                  {selectedOrder.tableNumber || '?'}
                </div>
                <div>
                  <h3 className="font-mono font-black text-xl text-text-primary">{selectedOrder.orderNumber}</h3>
                  <p className="text-xs text-text-secondary font-medium">Table {selectedOrder.tableNumber} • {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-border-light rounded-xl text-text-muted hover:text-text-primary transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
               <div className="flex justify-between items-center bg-light-bg p-4 rounded-2xl border border-border-light shadow-inner">
                 <div>
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Current Status</p>
                   <StatusBadge status={selectedOrder.status} className="text-sm px-3 py-1 font-bold" />
                 </div>
                 <div className="text-right">
                   <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-1">Payment</p>
                   <span className="text-xs font-bold text-success bg-success/10 px-2 py-1 rounded-lg border border-success/20 flex items-center gap-1">
                     <Check className="w-3 h-3" /> PAID
                   </span>
                 </div>
               </div>
               
               {/* Timeline Stepper */}
               <div className="space-y-4">
                 <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest px-1">Order Progress</h4>
                 <div className="relative pl-8 space-y-6 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border-light">
                   {['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'].map((status, idx) => {
                     const isDone = selectedOrder.statusHistory.some(h => h.status === status);
                     const isCurrent = selectedOrder.status === status;
                     const historyItem = selectedOrder.statusHistory.find(h => h.status === status);
                     
                     return (
                       <div key={status} className="relative">
                         <div className={`absolute -left-8 w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 transition-colors ${
                           isDone ? 'bg-success border-success text-white' : 
                           isCurrent ? 'bg-white border-primary text-primary' : 'bg-white border-border-light text-text-muted'
                         }`}>
                           {isDone ? <Check className="w-3 h-3" strokeWidth={3} /> : <div className={`w-1.5 h-1.5 rounded-full ${isCurrent ? 'bg-primary' : 'bg-transparent'}`}></div>}
                         </div>
                         <div>
                           <p className={`text-sm font-bold ${isCurrent ? 'text-text-primary' : 'text-text-secondary'}`}>{status}</p>
                           {historyItem && (
                             <p className="text-[10px] text-text-muted font-medium">{new Date(historyItem.changedAt).toLocaleTimeString()}</p>
                           )}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
               
               <div className="space-y-4">
                 <div className="flex justify-between items-center border-b border-border-light pb-2">
                   <h4 className="text-xs font-bold text-text-muted uppercase tracking-widest">Items</h4>
                   <span className="text-[10px] font-bold text-text-secondary">{selectedOrder.items.length} Items total</span>
                 </div>
                 <div className="space-y-4">
                   {selectedOrder.items.map((item, i) => (
                     <div key={i} className="flex justify-between items-start group">
                       <div className="flex gap-3">
                         <div className="w-10 h-10 bg-light-bg rounded-lg flex items-center justify-center font-bold text-text-muted text-xs border border-border-light group-hover:border-primary/30 transition-colors">
                           {item.quantity}x
                         </div>
                         <div>
                           <p className="text-sm font-bold text-text-primary">{item.name}</p>
                           <p className="text-xs text-text-muted">₹{(item.price / 100).toFixed(2)} per unit</p>
                         </div>
                       </div>
                       <span className="text-sm font-bold text-text-primary">₹{(item.subtotal / 100).toLocaleString()}</span>
                     </div>
                   ))}
                 </div>
               </div>
               
               {selectedOrder.specialInstructions && (
                 <div className="bg-warning/5 border border-warning/20 p-4 rounded-xl">
                   <h4 className="text-xs font-bold text-warning uppercase tracking-widest mb-1 flex items-center gap-1">
                     <Receipt className="w-3 h-3" /> Special Instructions
                   </h4>
                   <p className="text-sm text-text-primary font-medium italic">"{selectedOrder.specialInstructions}"</p>
                 </div>
               )}
               
               <div className="pt-6 border-t-2 border-dashed border-border-light space-y-3">
                 <div className="flex justify-between items-center text-sm font-medium text-text-secondary">
                   <span>Subtotal</span><span>₹{(selectedOrder.subtotal / 100).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-medium text-text-secondary">
                   <span>Taxes & Charges</span><span>₹{(selectedOrder.tax / 100).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center font-black text-xl text-text-primary pt-2">
                   <span>Total Amount</span><span className="text-primary font-mono font-black text-2xl">₹{(selectedOrder.total / 100).toLocaleString()}</span>
                 </div>
               </div>
            </div>
            
            {/* Footer Actions */}
            <div className="p-6 bg-light-bg/80 border-t border-border-light backdrop-blur-md">
              <div className="flex flex-col gap-3">
                {selectedOrder.status === 'PENDING' && (
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <button 
                      onClick={() => handleStatusUpdate(selectedOrder._id, 'CONFIRMED')}
                      className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                    >
                      Confirm Order
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedOrder._id, 'CANCELLED')}
                      className="flex-1 bg-white border border-error text-error py-3 rounded-xl font-bold hover:bg-error/5 transition-all"
                    >
                      Reject
                    </button>
                  </div>
                )}
                {selectedOrder.status === 'CONFIRMED' && (
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder._id, 'PREPARING')}
                    className="w-full bg-warning text-white py-4 rounded-xl font-black text-lg hover:bg-warning/90 transition-all shadow-xl shadow-warning/20 flex items-center justify-center gap-3"
                  >
                    <ChefHat className="w-6 h-6" /> START PREPARING
                  </button>
                )}
                {selectedOrder.status === 'PREPARING' && (
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder._id, 'READY')}
                    className="w-full bg-info text-white py-4 rounded-xl font-black text-lg hover:bg-info/90 transition-all shadow-xl shadow-info/20 flex items-center justify-center gap-3"
                  >
                    <Check className="w-6 h-6" /> MARK READY FOR PICKUP
                  </button>
                )}
                 {selectedOrder.status === 'READY' && (
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder._id, 'COMPLETED')}
                    className="w-full bg-success text-white py-4 rounded-xl font-black text-lg hover:bg-success/90 transition-all shadow-xl shadow-success/20 flex items-center justify-center gap-3"
                  >
                    <ShoppingBag className="w-6 h-6" /> MARK AS COMPLETED
                  </button>
                )}
                
                <div className="grid grid-cols-2 gap-3 mt-1">
                  <button className="flex items-center justify-center gap-2 bg-white border border-border-light text-text-secondary py-2.5 rounded-xl font-bold text-xs hover:bg-light-bg transition-colors">
                    <Receipt className="w-4 h-4" /> REPRINT BILL
                  </button>
                  <button 
                    onClick={() => {
                      if(window.confirm('Are you sure you want to cancel this order? This will initiate a refund if paid.')) {
                        handleStatusUpdate(selectedOrder._id, 'CANCELLED');
                      }
                    }}
                    className="flex items-center justify-center gap-2 bg-white border border-error/20 text-error/60 py-2.5 rounded-xl font-bold text-xs hover:bg-error/5 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> CANCEL ORDER
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveOrders;
