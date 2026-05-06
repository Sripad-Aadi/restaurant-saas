import React, { useState } from 'react';
import { useCustomer } from '../CustomerContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2, Info } from 'lucide-react';
import api from '../api';

export default function CheckoutPage() {
  const { cart, tableId, clearCart, updateQuantity } = useCustomer();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const items = Object.values(cart);
  const totalPrice = items.reduce((sum, curr) => sum + (curr.product.price * curr.quantity), 0);
  const sgst = Math.floor(totalPrice * 0.025);
  const cgst = Math.floor(totalPrice * 0.025);
  const finalTotal = totalPrice + sgst + cgst;

  if (items.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gray-50">
        <p className="text-slate-500 mb-4">Your cart is empty.</p>
        <button onClick={() => navigate('/menu')} className="text-primary font-bold">Return to Menu</button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!tableId) {
      setError('Missing Table Information. Please scan the QR code again.');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const orderPayload = {
        tableId,
        items: items.map(i => ({
          productId: i.product._id,
          quantity: i.quantity
        })),
        idempotencyKey: crypto.randomUUID()
      };

      const { data } = await api.post('/orders', orderPayload);
      
      // Setup mock Razorpay integration since it's development phase
      // Normally here you'd load Razorpay SDK and open checkout.
      clearCart();
      navigate(`/order/${data.data._id}`);
      
    } catch (err) {
      console.error(err);
      setError('Failed to place order. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 pb-24 bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-20 bg-white shadow-sm border-b border-gray-100 p-4 flex items-center">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-slate-800 ml-2">Checkout</h1>
      </div>

      <div className="p-4 space-y-6">
        {error && (
          <div className="p-4 bg-red-50 text-red-600 rounded-xl flex items-start gap-2">
            <Info className="h-5 w-5 shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
          <h2 className="font-bold text-slate-800 mb-4">Order Summary</h2>
          <div className="space-y-4">
            {items.map(({ product, quantity }) => (
              <div key={product._id} className="flex justify-between items-center py-2">
                <div className="flex-1 pr-4">
                  <p className="font-bold text-slate-800 text-sm">{product.name}</p>
                  <p className="text-slate-500 text-xs font-medium">₹{(product.price / 100).toFixed(2)} / unit</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl p-1">
                    <button 
                      onClick={() => updateQuantity(product._id, -1)}
                      className="w-7 h-7 flex items-center justify-center bg-white text-slate-900 rounded-lg shadow-sm border border-slate-200 active:scale-90 transition-transform"
                    >
                      <span className="font-bold text-xs">−</span>
                    </button>
                    <span className="font-black text-slate-900 w-5 text-center text-xs">{quantity}</span>
                    <button 
                      onClick={() => updateQuantity(product._id, 1)}
                      className="w-7 h-7 flex items-center justify-center bg-white text-slate-900 rounded-lg shadow-sm border border-slate-200 active:scale-90 transition-transform"
                    >
                      <span className="font-bold text-xs">+</span>
                    </button>
                  </div>
                  
                  <div className="w-20 text-right font-black text-slate-900 text-sm">
                    ₹{((product.price * quantity) / 100).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 space-y-3">
          <div className="flex justify-between text-slate-600 text-sm">
            <span>Item Total</span>
            <span>₹{(totalPrice / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600 text-sm">
            <span>SGST (2.5%)</span>
            <span>₹{(sgst / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-slate-600 text-sm border-b border-gray-100 pb-3">
            <span>CGST (2.5%)</span>
            <span>₹{(cgst / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-extrabold text-lg text-slate-900 pt-1">
            <span>Grand Total</span>
            <span>₹{(finalTotal / 100).toFixed(2)}</span>
          </div>
        </div>
        
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm flex gap-2">
            <Info className="w-5 h-5 shrink-0" />
            <p><strong>Note:</strong> Since we are in development mode, this order will be processed without actual payment capture.</p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button
          onClick={handlePlaceOrder}
          disabled={loading}
          className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl flex items-center justify-center space-x-2 hover:bg-slate-800 disabled:opacity-70 transition-colors"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Placing Order...</span>
            </>
          ) : (
            <span>Confirm & Pay ₹{(finalTotal / 100).toFixed(2)}</span>
          )}
        </button>
      </div>
    </div>
  );
}
