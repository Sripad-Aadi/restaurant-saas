import React from 'react';
import { Settings, Info, Lock } from 'lucide-react';
import { useConfig } from '../ConfigContext';
import { useAuth } from '../AuthContext';
import { ROLES } from '@restaurant-saas/shared';

const MaintenanceOverlay = () => {
  const { config } = useConfig();
  const { user } = useAuth();

  // If maintenance mode is off, show nothing
  if (!config.isMaintenanceMode) return null;

  // Allow SuperAdmins to bypass so they can fix settings
  if (user?.role === ROLES.SUPER_ADMIN) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999] animate-bounce">
        <div className="bg-warning text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-xs font-bold border-2 border-white/20">
          <Settings className="w-3.5 h-3.5 animate-spin-slow" />
          MAINTENANCE MODE ACTIVE (ADMIN BYPASS)
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-light-bg">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-md"></div>
      
      <div className="relative w-full max-w-lg bg-card-white rounded-[40px] shadow-2xl border-4 border-warning/10 p-12 text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-warning"></div>
        
        <div className="w-24 h-24 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <Settings className="w-12 h-12" />
        </div>
        
        <h1 className="text-4xl font-black text-text-primary mb-4 uppercase tracking-tighter">
          Maintenance in Progress
        </h1>
        <h2 className="text-xl font-bold text-text-secondary mb-8">
          Please wait, we'll be back shortly.
        </h2>
        
        <div className="p-8 bg-warning/5 rounded-3xl border border-warning/10 mb-8">
          <div className="flex items-center gap-2 text-warning mb-3 justify-center">
            <Info className="w-5 h-5" />
            <span className="font-bold uppercase tracking-widest text-xs">Official Message</span>
          </div>
          <p className="text-text-primary font-medium italic leading-relaxed">
            "{config.maintenanceMessage || "We are currently performing system updates to improve your experience."}"
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-text-muted text-sm font-bold opacity-60">
          <Lock className="w-4 h-4" />
          <span>SECURED BY {config.platformName}</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceOverlay;
