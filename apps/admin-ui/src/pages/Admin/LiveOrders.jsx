import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Wifi, Search, MoreHorizontal, ChefHat, Check, X, Clock, 
  MapPin, Receipt, Trash2, ArrowRight, Loader2, ShoppingBag,
  Printer, Bell
} from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';
import api from '../../api';
import { createSocketConnection } from '../../socket';
import { SOCKET_EVENTS, ORDER_STATUSES, ALLOWED_TRANSITIONS } from '@restaurant-saas/shared';
import { useAuth } from '../../AuthContext';

const LiveOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Active');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  
  const tabs = ['Active', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'];

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await api.get('/orders', {
        params: { limit: 100 } // Get more for the live dashboard
      });
      setOrders(response.data.data);
    } catch (err) {
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    if (user?.storeId) {
      const token = localStorage.getItem('token');
      // Updated to /admin namespace as per Phase 4.2
      socketRef.current = createSocketConnection('/admin', token);
      
      socketRef.current.on('connect', () => {
        console.log('Connected to admin socket');
        // Joining store room is handled automatically in our admin namespace implementation,
        // but let's keep it explicit if needed or just listen
      });

      socketRef.current.on(SOCKET_EVENTS.ORDER_NEW, (newOrder) => {
        setOrders(prev => [newOrder, ...prev]);
        // Play notification sound
        new Audio('/notification.mp3').play().catch(() => {});
      });

      // Updated event name from Phase 4.2
      socketRef.current.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, (data) => {
        setOrders(prev => prev.map(order => 
          order._id === data.orderId ? { ...order, status: data.status } : order
        ));
        
        if (selectedOrder?._id === data.orderId) {
          // Re-fetch or update selected order to get full history if needed
          // For now just update status
          setSelectedOrder(prev => ({ ...prev, status: data.status }));
        }
      });

      socketRef.current.connect();
    }

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user?.storeId]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      // UI will update via socket event
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const counts = useMemo(() => {
    const c = {};
    tabs.forEach(t => c[t] = 0);
    orders.forEach(o => {
      if (c[o.status] !== undefined) c[o.status]++;
      if (o.status !== 'COMPLETED' && o.status !== 'CANCELLED') c['Active']++;
    });
    return c;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;
    
    if (activeTab === 'Active') {
      filtered = orders.filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED');
    } else {
      filtered = orders.filter(o => o.status === activeTab);
    }

    if (searchTerm) {
      filtered = filtered.filter(o => 
        o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (o.tableNumber && o.tableNumber.toString().includes(searchTerm))
      );
    }

    return filtered;
  }, [orders, activeTab, searchTerm]);

  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${order.orderNumber}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 20px; width: 300px; }
            h2 { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
            .total { font-weight: bold; font-size: 1.2em; display: flex; justify-content: space-between; }
            .center { text-align: center; }
          </style>
        </head>
        <body>
          <h2>RESTAURANT</h2>
          <div class="center">Order: ${order.orderNumber}</div>
          <div class="center">Table: ${order.tableNumber || 'Takeaway'}</div>
          <div class="center">${new Date(order.createdAt).toLocaleString()}</div>
          <div class="divider"></div>
          ${order.items.map(i => `
            <div class="item">
              <span>${i.name} x${i.quantity}</span>
              <span>₹${(i.subtotal / 100).toFixed(2)}</span>
            </div>
          `).join('')}
          <div class="divider"></div>
          <div class="total">
            <span>TOTAL</span>
            <span>₹${(order.total / 100).toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <div class="center">Thank you!</div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Live Orders</h2>
          <p className="text-sm text-text-secondary mt-1">Real-time order management and tracking</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input 
              type="text" 
              placeholder="Search by ID or Table..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-card-white border border-border-light rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 bg-success/10 text-success px-4 py-2 rounded-xl text-sm font-bold border border-success/20 shadow-sm">
            <Wifi className="w-4 h-4 animate-pulse" />
            LIVE
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 mb-6 no-scrollbar border-b border-border-light">
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition-all border-b-4 flex items-center gap-2 ${
              activeTab === tab 
                ? 'border-primary text-primary bg-primary/5' 
                : 'border-transparent text-text-secondary hover:text-text-primary hover:bg-light-bg'
            }`}
          >
            {tab === 'Active' && <Clock className="w-4 h-4" />}
            {tab}
            {counts[tab] > 0 && (
              <span className={`ml-1 text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab ? 'bg-primary text-white' : 'bg-light-bg text-text-secondary border border-border-light'
              }`}>
                {counts[tab]}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pr-2 custom-scrollbar pb-10">
          {filteredOrders.length > 0 ? (
            filteredOrders.map(order => (
              <div 
                key={order._id} 
                onClick={() => setSelectedOrder(order)}
                className="bg-card-white border border-border-light p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-primary/40 transition-all cursor-pointer flex flex-col group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-light-bg border border-border-light rounded-2xl flex items-center justify-center font-black text-xl text-primary shadow-inner group-hover:bg-primary/5 transition-colors">
                      {order.tableNumber || 'Q'}
                    </div>
                    <div>
                      <h4 className="font-mono font-black text-text-primary tracking-tighter">{order.orderNumber}</h4>
                      <div className="flex items-center gap-1 text-[10px] text-text-muted font-bold uppercase mt-0.5">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={order.status} className="shadow-sm" />
                </div>
                
                <div className="text-sm text-text-secondary mb-6 flex-1 bg-light-bg/50 p-3 rounded-xl border border-border-light/50 line-clamp-3">
                  {order.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between items-center mb-1 last:mb-0">
                      <span className="font-medium truncate mr-2">{i.name}</span>
                      <span className="font-bold text-xs bg-white px-1.5 rounded border border-border-light">×{i.quantity}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-dashed border-border-light">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Total</span>
                    <span className="font-black text-lg text-text-primary">₹{(order.total / 100).toLocaleString()}</span>
                  </div>
                  <div className="bg-primary/10 text-primary p-2 rounded-xl group-hover:bg-primary group-hover:text-white transition-all transform group-hover:scale-110">
                    <ArrowRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-24 text-center text-text-muted border-4 border-dashed border-border-light rounded-[2.5rem] bg-light-bg/20">
              <div className="w-24 h-24 bg-card-white border border-border-light rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <ChefHat className="w-12 h-12 text-text-muted opacity-20" />
              </div>
              <p className="font-black text-xl text-text-primary">No orders found</p>
              <p className="text-sm mt-2 font-medium">New orders will appear here in real-time as they come in.</p>
            </div>
          )}
        </div>
      )}

      {/* Detail Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-dark-bg/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedOrder(null)}></div>
          <div className="w-full max-w-[520px] bg-card-white shadow-2xl h-full flex flex-col relative animate-in slide-in-from-right duration-500 border-l border-border-light">
            
            {/* Header */}
            <div className="px-8 py-6 border-b border-border-light flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-primary/5 border-2 border-primary/20 rounded-[22px] flex items-center justify-center font-black text-2xl text-primary shadow-sm">
                  {selectedOrder.tableNumber || 'Q'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-mono font-black text-2xl text-text-primary tracking-tighter">{selectedOrder.orderNumber}</h3>
                    <StatusBadge status={selectedOrder.status} />
                  </div>
                  <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mt-1">
                    {selectedOrder.tableNumber ? `Table ${selectedOrder.tableNumber}` : 'Online/Queue Order'} • {new Date(selectedOrder.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-3 hover:bg-light-bg rounded-2xl text-text-muted hover:text-text-primary transition-all active:scale-90">
                <X className="w-7 h-7" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar">
               
               {/* Timeline Stepper */}
               <div className="space-y-6">
                 <div className="flex items-center gap-2 mb-2">
                   <Clock className="w-4 h-4 text-primary" />
                   <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">Order Progress</h4>
                 </div>
                 <div className="relative pl-8 space-y-8 before:absolute before:left-[13px] before:top-2 before:bottom-2 before:w-[3px] before:bg-light-bg">
                   {['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED'].map((status, idx) => {
                     const isDone = selectedOrder.statusHistory?.some(h => h.status === status);
                     const isCurrent = selectedOrder.status === status;
                     const historyItem = selectedOrder.statusHistory?.find(h => h.status === status);
                     
                     return (
                       <div key={status} className="relative">
                         <div className={`absolute -left-[35px] w-7 h-7 rounded-full border-4 flex items-center justify-center z-10 transition-all duration-500 ${
                           isDone ? 'bg-success border-success text-white shadow-lg shadow-success/20' : 
                           isCurrent ? 'bg-white border-primary text-primary shadow-lg shadow-primary/20 scale-110' : 'bg-white border-light-bg text-text-muted'
                         }`}>
                           {isDone ? <Check className="w-3 h-3" strokeWidth={4} /> : <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-primary animate-pulse' : 'bg-transparent'}`}></div>}
                         </div>
                         <div className={`transition-opacity duration-500 ${isDone || isCurrent ? 'opacity-100' : 'opacity-40'}`}>
                           <p className={`text-sm font-black tracking-tight ${isCurrent ? 'text-primary' : 'text-text-primary'}`}>{status}</p>
                           {historyItem && (
                             <p className="text-[10px] text-text-muted font-bold mt-0.5">{new Date(historyItem.changedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                           )}
                         </div>
                       </div>
                     );
                   })}
                 </div>
               </div>
               
               <div className="space-y-6">
                 <div className="flex justify-between items-center border-b-2 border-border-light pb-3">
                   <div className="flex items-center gap-2">
                     <ShoppingBag className="w-4 h-4 text-primary" />
                     <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">Items Detail</h4>
                   </div>
                   <span className="text-xs font-black bg-light-bg text-text-secondary px-3 py-1 rounded-full border border-border-light">{selectedOrder.items.length} Items</span>
                 </div>
                 <div className="space-y-5">
                   {selectedOrder.items.map((item, i) => (
                     <div key={i} className="flex justify-between items-start group">
                       <div className="flex gap-4">
                         <div className="w-12 h-12 bg-light-bg rounded-2xl flex items-center justify-center font-black text-primary text-sm border border-border-light group-hover:bg-primary/5 group-hover:border-primary/20 transition-all">
                           {item.quantity}
                         </div>
                         <div>
                           <p className="text-base font-black text-text-primary tracking-tight">{item.name}</p>
                           <p className="text-xs text-text-muted font-medium">Unit Price: ₹{(item.price / 100).toFixed(2)}</p>
                         </div>
                       </div>
                       <div className="text-right">
                         <span className="text-base font-black text-text-primary">₹{(item.subtotal / 100).toLocaleString()}</span>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
               
               {selectedOrder.specialInstructions && (
                 <div className="bg-amber-50 border-2 border-amber-100 p-5 rounded-[22px] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-100/50 rounded-bl-[60px] flex items-start justify-end p-3 text-amber-500/20">
                      <Bell className="w-8 h-8" />
                    </div>
                    <h4 className="text-[10px] font-black text-amber-600 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                      <Receipt className="w-3 h-3" /> Chef Note
                    </h4>
                    <p className="text-sm text-amber-900 font-bold italic leading-relaxed">"{selectedOrder.specialInstructions}"</p>
                 </div>
               )}
               
               <div className="pt-8 border-t-4 border-double border-border-light space-y-4">
                 <div className="flex justify-between items-center text-sm font-bold text-text-secondary">
                   <span>Subtotal</span><span>₹{(selectedOrder.subtotal / 100).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm font-bold text-text-secondary">
                   <span>Taxes & Charges</span><span>₹{(selectedOrder.tax / 100).toLocaleString()}</span>
                 </div>
                 <div className="flex justify-between items-center font-black text-2xl text-text-primary pt-4 bg-light-bg/30 -mx-4 px-4 py-3 rounded-2xl border border-border-light/50">
                   <span className="text-sm uppercase tracking-widest">Total Amount</span>
                   <span className="text-primary font-mono font-black text-3xl">₹{(selectedOrder.total / 100).toLocaleString()}</span>
                 </div>
               </div>
            </div>
            
            {/* Footer Actions */}
            <div className="p-8 bg-white border-t-2 border-border-light shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
              <div className="flex flex-col gap-4">
                {selectedOrder.status === 'PENDING' && (
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <button 
                      onClick={() => handleStatusUpdate(selectedOrder._id, 'CONFIRMED')}
                      className="flex-1 bg-primary text-white py-4 rounded-2xl font-black text-base hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 active:scale-95"
                    >
                      CONFIRM ORDER
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(selectedOrder._id, 'CANCELLED')}
                      className="flex-1 bg-white border-2 border-error/20 text-error py-4 rounded-2xl font-black text-base hover:bg-error/5 transition-all active:scale-95"
                    >
                      REJECT
                    </button>
                  </div>
                )}
                {selectedOrder.status === 'CONFIRMED' && (
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder._id, 'PREPARING')}
                    className="w-full bg-amber-500 text-white py-5 rounded-[22px] font-black text-xl hover:bg-amber-600 transition-all shadow-2xl shadow-amber-500/30 flex items-center justify-center gap-4 active:scale-[0.98]"
                  >
                    <ChefHat className="w-7 h-7" /> START PREPARING
                  </button>
                )}
                {selectedOrder.status === 'PREPARING' && (
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder._id, 'READY')}
                    className="w-full bg-blue-500 text-white py-5 rounded-[22px] font-black text-xl hover:bg-blue-600 transition-all shadow-2xl shadow-blue-500/30 flex items-center justify-center gap-4 active:scale-[0.98]"
                  >
                    <Check className="w-8 h-8" strokeWidth={4} /> MARK READY
                  </button>
                )}
                 {selectedOrder.status === 'READY' && (
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder._id, 'COMPLETED')}
                    className="w-full bg-success text-white py-5 rounded-[22px] font-black text-xl hover:bg-success/90 transition-all shadow-2xl shadow-success/30 flex items-center justify-center gap-4 active:scale-[0.98]"
                  >
                    <ShoppingBag className="w-7 h-7" /> MARK COMPLETED
                  </button>
                )}
                
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <button 
                    onClick={() => handlePrint(selectedOrder)}
                    className="flex items-center justify-center gap-3 bg-white border-2 border-border-light text-text-primary py-3.5 rounded-2xl font-black text-xs hover:bg-light-bg transition-all active:scale-95 shadow-sm"
                  >
                    <Printer className="w-4 h-4" /> PRINT RECEIPT
                  </button>
                  <button 
                    onClick={() => {
                      if(window.confirm('Are you sure you want to cancel this order? This will initiate a refund if paid.')) {
                        handleStatusUpdate(selectedOrder._id, 'CANCELLED');
                      }
                    }}
                    className="flex items-center justify-center gap-3 bg-white border-2 border-error/10 text-error/40 py-3.5 rounded-2xl font-black text-xs hover:bg-error/5 transition-all active:scale-95"
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
