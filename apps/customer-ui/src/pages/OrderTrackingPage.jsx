import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { socket } from '../socket';
import api from '../api';
import { ChefHat, Check, CheckCircle2, Clock } from 'lucide-react';
import { ORDER_STATUSES } from '@restaurant-saas/shared';

const STATUS_STEPS = [
  { status: ORDER_STATUSES.PENDING, label: 'Received' },
  { status: ORDER_STATUSES.CONFIRMED, label: 'Confirmed' },
  { status: ORDER_STATUSES.PREPARING, label: 'Preparing' },
  { status: ORDER_STATUSES.READY, label: 'Ready to Serve' },
  { status: ORDER_STATUSES.COMPLETED, label: 'Completed' },
];

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const { data } = await api.get(`/orders/${orderId}`);
        setOrder(data.data);
      } catch (err) {
        console.error('Failed to fetch order', err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();

    socket.connect();
    socket.emit('joinOrder', orderId); // Make sure backend allows this or handle via API socketAuth

    socket.on('ORDER_STATUS_UPDATED', (payload) => {
      if (payload.orderId === orderId) {
        setOrder(prev => prev ? { ...prev, status: payload.status } : null);
      }
    });

    return () => {
      socket.off('ORDER_STATUS_UPDATED');
      socket.disconnect();
    };
  }, [orderId]);

  if (loading) {
    return <div className="flex-1 flex justify-center items-center"><div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></div></div>;
  }

  if (!order) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-slate-500 mb-4">Order not found.</p>
        <button onClick={() => navigate('/menu')} className="text-primary font-bold">Return to Menu</button>
      </div>
    );
  }

  const currentStepIndex = STATUS_STEPS.findIndex(s => s.status === order.status);
  const isCancelled = order.status === ORDER_STATUSES.CANCELLED;

  return (
    <div className="flex-1 bg-white flex flex-col p-6">
      <div className="text-center mt-8 mb-12">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 scale-in">
          {order.status === ORDER_STATUSES.COMPLETED ? (
            <CheckCircle2 className="w-10 h-10" />
          ) : (
            <ChefHat className="w-10 h-10" />
          )}
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
          {isCancelled ? 'Order Cancelled' : 'Order Received!'}
        </h1>
        <p className="text-slate-500 font-medium">Order #{order._id.slice(-6).toUpperCase()}</p>
      </div>

      <div className="bg-slate-50 rounded-3xl p-6 shadow-inner mb-8">
        {!isCancelled ? (
          <div className="space-y-6">
            {STATUS_STEPS.map((step, idx) => {
              const isPast = currentStepIndex > idx;
              const isCurrent = currentStepIndex === idx;
              return (
                <div key={step.status} className="flex flex-col relative">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 
                      ${isPast || isCurrent ? 'bg-primary text-white shadow-md' : 'bg-slate-200 text-slate-400'}`}>
                      {isPast ? <Check className="w-5 h-5" /> : <span className="text-sm font-bold">{idx + 1}</span>}
                    </div>
                    <div className={`font-semibold ${isPast || isCurrent ? 'text-slate-800' : 'text-slate-400'}`}>
                      {step.label}
                    </div>
                  </div>
                  {/* Line connector */}
                  {idx !== STATUS_STEPS.length - 1 && (
                    <div className={`absolute left-4 top-8 bottom-[-24px] w-0.5 -ml-[1px] 
                      ${currentStepIndex > idx ? 'bg-primary' : 'bg-slate-200'}`}></div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-red-500 font-medium p-4">
            This order has been cancelled by the restaurant.
          </div>
        )}
      </div>

      <div className="bg-white border text-center border-slate-100 rounded-2xl p-4 shadow-sm mb-4">
         <p className="text-slate-500 text-sm mb-2">Total Amount</p>
         <p className="text-3xl font-extrabold text-slate-900">₹{(order.totalAmount / 100).toFixed(2)}</p>
      </div>

      <button onClick={() => navigate('/menu')} className="mt-auto w-full border-2 border-slate-200 text-slate-700 font-bold py-4 rounded-xl hover:bg-slate-50 transition-colors">
        Order More Items
      </button>
    </div>
  );
}
