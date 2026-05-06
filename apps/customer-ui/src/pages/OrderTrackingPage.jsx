import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api';
import { 
  ChefHat, Check, CheckCircle2, Clock, 
  ArrowLeft, ShoppingBag, MapPin, Loader2,
  AlertCircle
} from 'lucide-react';
import { ORDER_STATUSES, SOCKET_EVENTS } from '@restaurant-saas/shared';

const STATUS_STEPS = [
  { status: ORDER_STATUSES.PENDING, label: 'Received', icon: Clock },
  { status: ORDER_STATUSES.CONFIRMED, label: 'Confirmed', icon: CheckCircle2 },
  { status: ORDER_STATUSES.PREPARING, label: 'Cooking', icon: ChefHat },
  { status: ORDER_STATUSES.READY, label: 'Ready', icon: ShoppingBag },
  { status: ORDER_STATUSES.COMPLETED, label: 'Served', icon: Check },
];

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  
  // Hooks must be at the top level
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFlash, setShowFlash] = useState(false);
  const [paying, setPaying] = useState(false);
  const [toast, setToast] = useState(null); // { type, message }
  const socketRef = useRef(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchOrder = async () => {
    try {
      const { data } = await api.get(`/orders/${orderId}`);
      setOrder(data.data);
    } catch (err) {
      console.error('Failed to fetch order', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    setPaying(true);
    try {
      await api.post(`/orders/${orderId}/pay`);
      // Update local state for paymentStatus only
      setOrder(prev => ({ ...prev, paymentStatus: 'PAID' }));
      showToast('success', 'Payment Successful!');
    } catch (err) {
      console.error('Payment failed', err);
      showToast('error', 'Payment failed. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => {
    fetchOrder();

    // Connect to /customer namespace
    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
    const socket = io(`${socketUrl}/customer`, {
      auth: { token: localStorage.getItem('token') },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('join:order', orderId);
      socket.emit('order:sync', orderId);
    });

    const handleStatusUpdate = (data) => {
      if (data.orderId === orderId) {
        setOrder(prev => {
          if (!prev) return null;
          
          if (prev.status !== ORDER_STATUSES.READY && data.status === ORDER_STATUSES.READY) {
            setShowFlash(true);
            setTimeout(() => setShowFlash(false), 2000);
            
            if (Notification.permission === 'granted') {
              new Notification('Order Ready!', { body: 'Your order is ready to be served.' });
            }
          }
          // Only update status and paymentStatus if provided
          return { 
            ...prev, 
            status: data.status || prev.status,
            paymentStatus: data.paymentStatus || prev.paymentStatus
          };
        });
      }
    };

    const handlePaymentSuccess = (data) => {
      if (data.orderId === orderId) {
        setOrder(prev => prev ? { ...prev, paymentStatus: 'PAID' } : null);
        showToast('success', 'Payment Received!');
      }
    };

    socket.on(SOCKET_EVENTS.ORDER_STATUS_CHANGED, handleStatusUpdate);
    socket.on(SOCKET_EVENTS.ORDER_READY, handleStatusUpdate);
    socket.on(SOCKET_EVENTS.ORDER_CANCELLED, handleStatusUpdate);
    socket.on('order:payment_success', handlePaymentSuccess);

    return () => {
      socket.disconnect();
    };
  }, [orderId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-slate-400 font-medium tracking-tight">Updating status...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50">
        <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-black text-slate-800 mb-2">Order Not Found</h1>
        <p className="text-slate-500 mb-8 max-w-xs">We couldn't find the order you're looking for. Please check the URL or try again.</p>
        <button 
          onClick={() => navigate('/menu')} 
          className="px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg"
        >
          Back to Menu
        </button>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.status === order.status);
  const isCancelled = order.status === ORDER_STATUSES.CANCELLED;
  const isReady = order.status === ORDER_STATUSES.READY;
  const isPending = order.status === ORDER_STATUSES.PENDING;
  const isPaid = order.paymentStatus === 'PAID';

  return (
    <div className="flex-1 bg-white flex flex-col relative overflow-hidden">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-top duration-300">
          <div className={`px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border-2 ${
            toast.type === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-700'
          }`}>
            <CheckCircle2 className="w-5 h-5" />
            <span className="font-black text-sm uppercase tracking-tight">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Green Flash Effect */}
      {showFlash && (
        <div className="fixed inset-0 z-[100] bg-green-500 animate-flash pointer-events-none"></div>
      )}

      {/* Header */}
      <div className="bg-white px-6 pt-6 pb-4">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-400 hover:text-slate-800">
          <ArrowLeft className="h-6 w-6" />
        </button>
      </div>

      {/* Payment Banner / Status Banner */}
      <div className="px-6 pb-8">
        {isCancelled ? (
          <div className="bg-red-50 border border-red-100 rounded-3xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-200">
              <AlertCircle className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-red-800 font-black text-lg">Order Rejected</h2>
              <p className="text-red-600 text-sm font-bold">Please contact staff for assistance.</p>
            </div>
          </div>
        ) : !isPaid ? (
          <div className="bg-orange-50 border border-orange-100 rounded-3xl p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-200">
                <Clock className="w-6 h-6 stroke-[3]" />
              </div>
              <div>
                <h2 className="text-orange-800 font-black text-lg">Awaiting Payment</h2>
                <p className="text-orange-600 text-sm font-bold">Please pay to confirm your order</p>
              </div>
            </div>
            <button 
              onClick={handlePayment}
              disabled={paying}
              className="w-full bg-orange-500 text-white py-4 rounded-2xl font-black shadow-lg shadow-orange-200 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {paying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'PAY NOW'}
            </button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-100 rounded-3xl p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-200">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <div>
              <h2 className="text-green-800 font-black text-lg">Payment Received</h2>
              <p className="text-green-600 text-sm font-bold">Thank you for your payment!</p>
            </div>
          </div>
        )}
      </div>

      {/* Status Center */}
      <div className="flex-1 px-6 pb-24">
        <div className="text-center mb-10">
          <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em] mb-2">Current Status</p>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-900 rounded-full text-white shadow-xl animate-in slide-in-from-bottom duration-500">
            {isReady && <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>}
            <span className="text-lg font-black">{order.status}</span>
          </div>
        </div>

        {/* Horizontal Stepper */}
        <div className="relative mb-12 mt-4 px-2">
          {/* Track */}
          <div className="absolute top-5 left-0 w-full h-1 bg-slate-100 rounded-full">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${(currentStepIndex / (STATUS_STEPS.length - 1)) * 100}%` }}
            ></div>
          </div>

          {/* Steps */}
          <div className="relative flex justify-between">
            {STATUS_STEPS.map((step, idx) => {
              const isPast = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;
              const Icon = step.icon;
              
              return (
                <div key={step.status} className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center z-10 transition-all duration-500 border-4 border-white
                    ${isPast || isCurrent ? 'bg-primary text-white shadow-lg' : 'bg-slate-100 text-slate-300'}`}>
                    <Icon className={`w-5 h-5 ${isCurrent ? 'animate-bounce-slow' : ''}`} />
                  </div>
                  <span className={`mt-3 text-[10px] font-black uppercase tracking-tighter transition-colors
                    ${isPast || isCurrent ? 'text-slate-800' : 'text-slate-300'}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-50 rounded-[32px] p-8 border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</p>
              <h3 className="text-lg font-black text-slate-800 font-mono">#{order.orderNumber || order._id.slice(-6).toUpperCase()}</h3>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total</p>
              <h3 className="text-xl font-black text-primary">₹{(order.total / 100).toFixed(2)}</h3>
            </div>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-200/60">
            {order.items?.map((item, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-400">
                    {item.quantity}
                  </span>
                  <span className="text-sm font-bold text-slate-600">{item.productId?.name || item.name || 'Item'}</span>
                </div>
                <span className="text-sm font-bold text-slate-400">₹{(item.subtotal / 100).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {isCancelled && (
          <div className="mt-8 p-6 bg-red-50 border border-red-100 rounded-[32px] text-center">
            <p className="text-red-800 font-black">Order Cancelled</p>
            <p className="text-red-600 text-sm font-medium mt-1">Please contact the restaurant staff for more info.</p>
          </div>
        )}
      </div>

      {/* Floating Action */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-white/80 backdrop-blur-md">
        <button 
          onClick={() => navigate('/menu')} 
          className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-lg shadow-xl active:scale-95 transition-all"
        >
          ORDER MORE
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes flash {
          0% { opacity: 0; }
          10% { opacity: 1; }
          100% { opacity: 0; }
        }
        .animate-flash {
          animation: flash 2s ease-out;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s infinite ease-in-out;
        }
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s infinite ease-in-out;
        }
      `}} />
    </div>
  );
}
