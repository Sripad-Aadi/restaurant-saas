import React, { useState } from 'react';
import { Wifi, Search, MoreHorizontal, ChefHat, Check, X } from 'lucide-react';
import StatusBadge from '../../components/StatusBadge';

const LiveOrders = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const tabs = ['All', 'Pending', 'Confirmed', 'Preparing', 'Ready', 'Completed', 'Cancelled'];
  
  // Dummy data
  const orders = [
    { id: 'ORD-0421', table: '7', items: [{ name: 'Paneer Tikka', qty: 2, price: 260 }, { name: 'Lassi', qty: 1, price: 160 }], total: 680, status: 'Preparing', time: '2 min ago', date: '21 Apr, 14:30' },
    { id: 'ORD-0420', table: '3', items: [{ name: 'Biryani', qty: 1, price: 320 }, { name: 'Raita', qty: 1, price: 100 }], total: 420, status: 'Confirmed', time: '5 min ago', date: '21 Apr, 14:27' },
    { id: 'ORD-0419', table: '12', items: [{ name: 'Butter Chicken', qty: 2, price: 720 }, { name: 'Naan', qty: 2, price: 240 }], total: 960, status: 'Ready', time: '12 min ago', date: '21 Apr, 14:20' },
    { id: 'ORD-0418', table: '5', items: [{ name: 'Masala Chai', qty: 2, price: 120 }], total: 120, status: 'Completed', time: '24 min ago', date: '21 Apr, 14:08' },
    { id: 'ORD-0417', table: '8', items: [{ name: 'Dal Makhani', qty: 1, price: 280 }], total: 280, status: 'Pending', time: 'Just now', date: '21 Apr, 14:32' },
  ];

  const filteredOrders = activeTab === 'All' ? orders : orders.filter(o => o.status === activeTab);

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map(order => (
            <div 
              key={order.id} 
              onClick={() => setSelectedOrder(order)}
              className="bg-card-white border border-border-light p-5 rounded-xl shadow-sm hover:shadow-md hover:border-primary/50 transition-all cursor-pointer flex flex-col"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-light-bg border border-border-light rounded flex items-center justify-center font-bold text-lg font-mono">
                    {order.table}
                  </div>
                  <div>
                    <h4 className="font-mono font-semibold text-text-primary">{order.id}</h4>
                    <span className="text-xs text-text-muted">{order.time}</span>
                  </div>
                </div>
                <StatusBadge status={order.status} />
              </div>
              
              <div className="text-sm text-text-secondary mb-4 flex-1">
                {order.items.map(i => `${i.name} ×${i.qty}`).join(', ')}
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-border-light">
                <span className="font-bold text-text-primary">₹{order.total}</span>
                <button className="text-primary text-sm font-medium hover:underline">View details</button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-text-muted border-2 border-dashed border-border-light rounded-xl">
            <ChefHat className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No orders found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Slide-over Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-dark-bg/40 backdrop-blur-sm" onClick={() => setSelectedOrder(null)}></div>
          <div className="w-[480px] bg-card-white shadow-2xl h-full flex flex-col relative animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-light flex justify-between items-center bg-light-bg">
              <div>
                <h3 className="font-mono font-bold text-lg">{selectedOrder.id}</h3>
                <p className="text-sm text-text-secondary">Table {selectedOrder.table} • {selectedOrder.date}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-border-light rounded-full text-text-secondary">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <div className="flex justify-between items-center">
                 <StatusBadge status={selectedOrder.status} className="text-sm px-3 py-1" />
                 <span className="text-sm font-medium text-info bg-info/10 px-2 py-1 rounded">Paid via UPI</span>
               </div>
               
               {/* Timeline Stepper Placeholder */}
               <div className="border border-border-light rounded-lg p-4">
                 <h4 className="text-sm font-medium text-text-secondary mb-3">Order Status</h4>
                 <div className="flex justify-between items-center text-xs">
                   <div className="flex flex-col items-center gap-1 text-success"><CheckCircleIcon /> Pending</div>
                   <div className="h-0.5 w-10 bg-success"></div>
                   <div className="flex flex-col items-center gap-1 text-success"><CheckCircleIcon /> Confirmed</div>
                   <div className={`h-0.5 w-10 ${['Preparing','Ready','Completed'].includes(selectedOrder.status) ? 'bg-success' : 'bg-border-light'}`}></div>
                   <div className={`flex flex-col items-center gap-1 ${['Preparing','Ready','Completed'].includes(selectedOrder.status) ? 'text-warning font-bold' : 'text-text-muted'}`}>
                     <div className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center">?</div> Preparing
                   </div>
                   <div className={`h-0.5 w-10 ${['Ready','Completed'].includes(selectedOrder.status) ? 'bg-success' : 'bg-border-light'}`}></div>
                   <div className={`flex flex-col items-center gap-1 ${['Ready','Completed'].includes(selectedOrder.status) ? 'text-text-primary' : 'text-text-muted'}`}>
                     <div className="w-5 h-5 rounded-full border-2 border-current"></div> Ready
                   </div>
                 </div>
               </div>
               
               <div>
                 <h4 className="font-semibold text-text-primary pb-2 mb-3 border-b border-border-light">Items</h4>
                 <div className="space-y-3">
                   {selectedOrder.items.map((item, i) => (
                     <div key={i} className="flex justify-between items-center text-sm">
                       <div>
                         <span className="font-medium">{item.name}</span>
                         <span className="text-text-muted ml-2">×{item.qty}</span>
                       </div>
                       <span className="text-text-secondary">₹{item.price}</span>
                     </div>
                   ))}
                 </div>
               </div>
               
               <div className="pt-4 border-t border-border-light">
                 <div className="flex justify-between items-center text-sm mb-2 text-text-secondary">
                   <span>Subtotal</span><span>₹{selectedOrder.total}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm mb-4 text-text-secondary">
                   <span>Taxes (5%)</span><span>₹{(selectedOrder.total*0.05).toFixed(0)}</span>
                 </div>
                 <div className="flex justify-between items-center font-bold text-lg text-text-primary">
                   <span>Grand Total</span><span>₹{selectedOrder.total + parseInt(selectedOrder.total*0.05)}</span>
                 </div>
               </div>
            </div>
            
            {/* Footer Actions */}
            <div className="p-6 bg-light-bg border-t border-border-light space-y-3">
              {selectedOrder.status === 'Pending' && (
                <div className="flex gap-3">
                  <button className="flex-1 bg-info hover:bg-info/90 text-white py-2.5 rounded-lg font-medium transition-colors">Confirm Order</button>
                  <button className="flex-1 bg-white border border-error text-error py-2.5 rounded-lg font-medium hover:bg-error/5 transition-colors">Cancel</button>
                </div>
              )}
              {selectedOrder.status === 'Confirmed' && (
                <button className="w-full bg-warning hover:bg-warning/90 text-white py-2.5 rounded-lg font-medium transition-colors">Start Preparing</button>
              )}
              {selectedOrder.status === 'Preparing' && (
                <button className="w-full bg-info hover:bg-info/90 text-white py-2.5 rounded-lg font-medium transition-colors">Mark Ready</button>
              )}
               {selectedOrder.status === 'Ready' && (
                <button className="w-full bg-success hover:bg-success/90 text-white py-2.5 rounded-lg font-medium transition-colors">Mark Completed</button>
              )}
              <button className="w-full flex items-center justify-center gap-2 bg-white border border-border-light text-text-secondary py-2.5 rounded-lg font-medium hover:bg-light-bg transition-colors">
                 Print Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CheckCircleIcon = () => <CheckCircle className="w-4 h-4" />;

export default LiveOrders;
