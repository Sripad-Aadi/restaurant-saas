import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // includes role, storeId, etc

  const login = async (email, password, role) => {
    // Mock login
    if (!email || !password) throw new Error("Email and password required");
    setUser({ email, name: email.split('@')[0], role });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
