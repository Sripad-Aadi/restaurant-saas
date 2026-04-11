import React, { createContext, useContext, useState } from 'react';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  const [storeSlug, setStoreSlug] = useState(null);
  const [tableNumber, setTableNumber] = useState(null);
  const [tableId, setTableId] = useState(null);
  const [storeId, setStoreId] = useState(null);
  
  // Cart: Map of productId -> { product, quantity }
  const [cart, setCart] = useState({});

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev[product._id];
      return {
        ...prev,
        [product._id]: {
          product,
          quantity: existing ? existing.quantity + 1 : 1,
        },
      };
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[productId];
      return next;
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart((prev) => {
      const existing = prev[productId];
      if (!existing) return prev;
      const newQuantity = existing.quantity + delta;
      if (newQuantity <= 0) {
        const next = { ...prev };
        delete next[productId];
        return next;
      }
      return {
        ...prev,
        [productId]: { ...existing, quantity: newQuantity },
      };
    });
  };

  const clearCart = () => setCart({});

  return (
    <CustomerContext.Provider
      value={{
        storeSlug, setStoreSlug,
        tableNumber, setTableNumber,
        tableId, setTableId,
        storeId, setStoreId,
        cart, setCart,
        addToCart, removeFromCart, updateQuantity, clearCart,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => useContext(CustomerContext);
