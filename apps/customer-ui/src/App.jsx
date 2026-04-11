import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CustomerProvider } from './CustomerContext';

import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderTrackingPage from './pages/OrderTrackingPage';

function App() {
  return (
    <CustomerProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col">
          <Routes>
            {/* Entry point from QR code */}
            <Route path="/table/:storeSlug/:tableId" element={<LandingPage />} />
            
            {/* Main customer flows */}
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:orderId" element={<OrderTrackingPage />} />
            
            <Route path="*" element={<div className="flex-1 flex items-center justify-center p-4 text-center"><h1>Oops, please scan your QR code again!</h1></div>} />
          </Routes>
        </div>
      </BrowserRouter>
    </CustomerProvider>
  );
}

export default App;
