import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ROLES } from '@restaurant-saas/shared';

import Login from './pages/Login';
import LiveOrders from './pages/LiveOrders';
import Stores from './pages/SuperAdmin/Stores';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-slate-800">403 Forbidden</h1>
        <p className="text-slate-500">You do not have permission to view this page.</p>
      </div>
    );
  }

  return children;
};

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (user?.role === ROLES.SUPER_ADMIN) return <Navigate to="/superadmin/stores" replace />;
  return <Navigate to="/live-orders" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><DashboardRedirect /></ProtectedRoute>} />

          <Route path="/live-orders" element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <LiveOrders />
            </ProtectedRoute>
          } />

          <Route path="/superadmin/stores" element={
            <ProtectedRoute allowedRoles={[ROLES.SUPER_ADMIN]}>
              <Stores />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
