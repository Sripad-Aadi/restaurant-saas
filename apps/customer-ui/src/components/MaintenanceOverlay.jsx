import React from 'react';
import { Settings, Info, Lock } from 'lucide-react';
import { useConfig } from '../ConfigContext';

const MaintenanceOverlay = () => {
  const { config } = useConfig();

  if (!config.isMaintenanceMode) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-slate-50">
      <div className="absolute inset-0 bg-white/40 backdrop-blur-md"></div>
      
      <div className="relative w-full max-w-lg bg-white rounded-[40px] shadow-2xl border-4 border-orange-100 p-10 text-center overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-orange-500"></div>
        
        <div className="w-20 h-20 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
          <Settings className="w-10 h-10" />
        </div>
        
        <h1 className="text-3xl font-black text-slate-800 mb-4 tracking-tight uppercase">
          Under Maintenance
        </h1>
        <h2 className="text-lg font-bold text-slate-500 mb-8">
          We'll be back shortly!
        </h2>
        
        <div className="p-8 bg-orange-50/50 rounded-3xl border border-orange-100 mb-8">
          <div className="flex items-center gap-2 text-orange-500 mb-3 justify-center">
            <Info className="w-4 h-4" />
            <span className="font-bold uppercase tracking-widest text-[10px]">Important Notice</span>
          </div>
          <p className="text-slate-700 font-medium italic leading-relaxed text-sm">
            "{config.maintenanceMessage || "We are currently performing system updates to improve your experience."}"
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-300 text-[10px] font-black tracking-[0.2em] opacity-80">
          <Lock className="w-3.5 h-3.5" />
          <span>POWERED BY {config.platformName.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceOverlay;
