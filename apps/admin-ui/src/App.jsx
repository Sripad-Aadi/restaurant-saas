import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { ROLES } from '@restaurant-saas/shared';

// Layouts
import AdminLayout from './layouts/AdminLayout';
import SuperAdminLayout from './layouts/SuperAdminLayout';

// Auth
import Login from './pages/Auth/Login';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import LiveOrders from './pages/Admin/LiveOrders';
import MenuManagement from './pages/Admin/MenuManagement';
import Tables from './pages/Admin/Tables';
import AdminAnalytics from './pages/Admin/Analytics';
import AdminSettings from './pages/Admin/Settings';

// SuperAdmin Pages
import SuperAdminDashboard from './pages/SuperAdmin/Dashboard';
import Restaurants from './pages/SuperAdmin/Restaurants';
import RestaurantDetail from './pages/SuperAdmin/RestaurantDetail';
import SuperAdminAnalytics from './pages/SuperAdmin/Analytics';
import SuperAdminSettings from './pages/SuperAdmin/Settings';
import Users from './pages/SuperAdmin/Users';

import PrivateRoute from './components/PrivateRoute';

const DashboardRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === ROLES.SUPER_ADMIN || user.role === 'superadmin') return <Navigate to="/superadmin/dashboard" replace />;
  return <Navigate to="/admin/dashboard" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<DashboardRedirect />} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={[ROLES.ADMIN, 'admin']}>
              <AdminLayout />
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="orders" element={<LiveOrders />} />
            <Route path="menu" element={<MenuManagement />} />
            <Route path="tables" element={<Tables />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          {/* Super Admin Routes */}
          <Route path="/superadmin" element={
            <PrivateRoute allowedRoles={[ROLES.SUPER_ADMIN, 'superadmin']}>
              <SuperAdminLayout />
            </PrivateRoute>
          }>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="restaurants" element={<Restaurants />} />
            <Route path="restaurants/:id" element={<RestaurantDetail />} />
            <Route path="subscriptions" element={<div className="p-8">Subscriptions Module (Coming Soon)</div>} />
            <Route path="users" element={<Users />} />
            <Route path="analytics" element={<SuperAdminAnalytics />} />
            <Route path="security" element={<div className="p-8">Security Logs (Coming Soon)</div>} />
            <Route path="settings" element={<SuperAdminSettings />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
