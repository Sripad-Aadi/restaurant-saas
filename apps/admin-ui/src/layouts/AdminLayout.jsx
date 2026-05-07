import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, Settings, BarChart2, Hash, Utensils } from 'lucide-react';
import SidebarLink from '../components/SidebarLink';
import TopHeader from '../components/TopHeader';
import { useConfig } from '../ConfigContext';
import { Mail, Phone, Info } from 'lucide-react';

const AdminLayout = () => {
  const location = useLocation();
  const { config } = useConfig();

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
        <div className="h-[72px] flex flex-col justify-center px-6 border-b border-white/10 shrink-0 bg-white/[0.02]">
          <h1 className="text-xl font-black text-white tracking-tighter">{config.platformName}</h1>
          <div className="flex items-center gap-1.5 opacity-50">
            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
            <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Admin Dashboard</span>
          </div>
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

        {/* Support Footer */}
        {(config.supportEmail || config.supportPhone) && (
          <div className="p-4 mx-3 mb-6 bg-white/[0.03] border border-white/5 rounded-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-primary/20 rounded-lg text-primary">
                <Info className="w-3 h-3" />
              </div>
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-widest">System Support</span>
            </div>
            <div className="space-y-2">
              {config.supportEmail && (
                <a href={`mailto:${config.supportEmail}`} className="flex items-center gap-2 text-[11px] text-white/60 hover:text-white transition-colors">
                  <Mail className="w-3 h-3" /> {config.supportEmail}
                </a>
              )}
              {config.supportPhone && (
                <a href={`tel:${config.supportPhone}`} className="flex items-center gap-2 text-[11px] text-white/60 hover:text-white transition-colors">
                  <Phone className="w-3 h-3" /> {config.supportPhone}
                </a>
              )}
            </div>
          </div>
        )}
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
