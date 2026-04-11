import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Store, Users, CreditCard, BarChart2, Shield, Settings } from 'lucide-react';
import SidebarLink from '../components/SidebarLink';
import TopHeader from '../components/TopHeader';

const SuperAdminLayout = () => {
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Platform Overview';
    if (path.includes('restaurants')) return 'Restaurants';
    if (path.includes('users')) return 'Users';
    if (path.includes('subscriptions')) return 'Subscriptions';
    if (path.includes('analytics')) return 'Analytics';
    if (path.includes('settings')) return 'Settings';
    return 'Super Admin';
  };

  return (
    <div className="flex h-screen bg-light-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] bg-dark-bg text-white flex-shrink-0 flex flex-col relative">
        <div className="h-[64px] flex flex-col justify-center px-6 border-b border-white/10 shrink-0">
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center justify-between">
            <span>RestaurantOS</span>
          </h1>
          <span className="text-[10px] text-error font-bold uppercase tracking-widest bg-error/20 inline-block px-1.5 py-0.5 rounded w-max mt-1">Super Admin Panel</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <SidebarLink to="/superadmin/dashboard" icon={LayoutDashboard}>Platform Overview</SidebarLink>
          <SidebarLink to="/superadmin/restaurants" icon={Store}>Restaurants</SidebarLink>
          <SidebarLink to="/superadmin/users" icon={Users}>Users</SidebarLink>
          <SidebarLink to="/superadmin/subscriptions" icon={CreditCard}>Subscriptions</SidebarLink>
          <SidebarLink to="/superadmin/analytics" icon={BarChart2}>Analytics</SidebarLink>
          
          <div className="my-2 ml-4 pl-4 border-l border-white/10 mt-auto pt-4">
             <SidebarLink to="/superadmin/security" icon={Shield}>Security Logs</SidebarLink>
             <SidebarLink to="/superadmin/settings" icon={Settings}>Settings</SidebarLink>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader breadcrumb={getBreadcrumb()} isSuperAdmin={true} />
        <main className="flex-1 overflow-y-auto p-6 bg-light-bg">
          <div className="max-w-[1280px] mx-auto w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminLayout;
