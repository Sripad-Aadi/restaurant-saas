import React from 'react';
import { Bell, User } from 'lucide-react';
import { useAuth } from '../AuthContext';

const TopHeader = ({ breadcrumb, isSuperAdmin = false }) => {
  const { user, logout } = useAuth();
  
  return (
    <header className="h-[64px] bg-card-white border-b border-border-light flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      <div className="flex items-center gap-4">
        {isSuperAdmin && (
          <span className="bg-error text-white text-xs font-bold px-2 py-1 rounded truncate">SUPER ADMIN</span>
        )}
        <h2 className="text-text-primary font-semibold text-lg">{breadcrumb}</h2>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-text-secondary hover:text-primary transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full"></span>
        </button>
        
        <div className="h-8 w-px bg-border-light"></div>
        
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end">
            <span className="text-sm font-semibold text-text-primary">{user?.name || 'Administrator'}</span>
            <span className="text-xs text-text-muted cursor-pointer hover:text-error" onClick={logout}>Logout</span>
          </div>
          <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopHeader;
