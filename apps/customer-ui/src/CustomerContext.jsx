import React, { createContext, useContext, useState, useEffect } from 'react';

const CustomerContext = createContext();

export const CustomerProvider = ({ children }) => {
  // Initialize state from localStorage to persist across refreshes
  const [storeSlug, setStoreSlugState] = useState(() => localStorage.getItem('customer_storeSlug'));
  const [tableNumber, setTableNumberState] = useState(() => localStorage.getItem('customer_tableNumber'));
  const [tableId, setTableIdState] = useState(() => localStorage.getItem('customer_tableId'));
  const [storeId, setStoreIdState] = useState(() => localStorage.getItem('customer_storeId'));
  
  // Cart: Map of productId -> { product, quantity }
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('customer_cart');
    return saved ? JSON.parse(saved) : {};
  });

  // Sync state to localStorage
  useEffect(() => {
    if (storeSlug) localStorage.setItem('customer_storeSlug', storeSlug);
    if (tableNumber) localStorage.setItem('customer_tableNumber', tableNumber);
    if (tableId) localStorage.setItem('customer_tableId', tableId);
    if (storeId) localStorage.setItem('customer_storeId', storeId);
    localStorage.setItem('customer_cart', JSON.stringify(cart));
  }, [storeSlug, tableNumber, tableId, storeId, cart]);

  // Wrapper setters to ensure they update both state and immediate local storage if needed
  const setStoreSlug = (val) => setStoreSlugState(val);
  const setTableNumber = (val) => setTableNumberState(val);
  const setTableId = (val) => setTableIdState(val);
  const setStoreId = (val) => setStoreIdState(val);

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
