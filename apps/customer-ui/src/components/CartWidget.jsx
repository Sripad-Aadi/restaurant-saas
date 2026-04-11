import React from 'react';
import { ShoppingBag, ChevronRight, Minus, Plus } from 'lucide-react';
import { useCustomer } from '../CustomerContext';
import { useNavigate } from 'react-router-dom';

export default function CartWidget() {
  const { cart, updateQuantity } = useCustomer();
  const navigate = useNavigate();
  
  const items = Object.values(cart);
  const totalItems = items.reduce((sum, curr) => sum + curr.quantity, 0);
  const totalPrice = items.reduce((sum, curr) => sum + (curr.product.price * curr.quantity), 0);

  if (totalItems === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 z-50 bg-gradient-to-t from-white via-white/95 to-transparent pt-8">
      <div 
        className="max-w-md mx-auto bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between cursor-pointer hover:bg-slate-800 transition-colors"
        onClick={() => navigate('/checkout')}
      >
        <div className="flex items-center space-x-4">
          <div className="relative">
            <ShoppingBag className="h-6 w-6 text-orange-400" />
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
              {totalItems}
            </span>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">View Cart</p>
            <p className="font-bold text-lg">₹{(totalPrice / 100).toFixed(2)}</p>
          </div>
        </div>
        <ChevronRight className="h-6 w-6 text-slate-400" />
      </div>
    </div>
  );
}
