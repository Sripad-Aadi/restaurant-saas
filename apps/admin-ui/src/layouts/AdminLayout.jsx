import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Settings, BarChart2, Hash, Utensils } from 'lucide-react';
import SidebarLink from '../components/SidebarLink';
import TopHeader from '../components/TopHeader';

const AdminLayout = () => {
  const location = useLocation();

  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return 'Dashboard';
    if (path.includes('orders')) return 'Live Orders';
    if (path.includes('menu')) return 'Menu Management';
    if (path.includes('tables')) return 'Tables & QR';
    if (path.includes('analytics')) return 'Analytics';
    if (path.includes('settings')) return 'Settings';
    return 'Admin';
  };

  return (
    <div className="flex h-screen bg-light-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[240px] bg-dark-bg text-white flex-shrink-0 flex flex-col">
        <div className="h-[64px] flex flex-col justify-center px-6 border-b border-white/10 shrink-0">
          <h1 className="text-xl font-bold text-white tracking-tight">RestaurantOS</h1>
          <span className="text-xs text-text-muted font-mono uppercase tracking-wider">Admin Dashboard</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-3">
          <SidebarLink to="/admin/dashboard" icon={LayoutDashboard}>Dashboard</SidebarLink>
          <SidebarLink to="/admin/orders" icon={CheckSquare}>Live Orders</SidebarLink>
          <div className="my-2 ml-4 pl-4 border-l border-white/10">
             <SidebarLink to="/admin/menu" icon={Utensils}>Menu</SidebarLink>
          </div>
          <SidebarLink to="/admin/tables" icon={Hash}>Tables & QR</SidebarLink>
          <SidebarLink to="/admin/analytics" icon={BarChart2}>Analytics</SidebarLink>
          
          <div className="my-2 ml-4 pl-4 border-l border-white/10 mt-auto pt-4">
             <SidebarLink to="/admin/settings" icon={Settings}>Settings</SidebarLink>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader breadcrumb={getBreadcrumb()} isSuperAdmin={false} />
        <main className="flex-1 overflow-y-auto p-6 bg-light-bg">
          <div className="max-w-[1280px] mx-auto w-full h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
