import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    platformName: 'DineFlow',
    isMaintenanceMode: false,
    maintenanceMessage: '',
    supportEmail: '',
    supportPhone: '',
    loading: true
  });

  const fetchConfig = async () => {
    try {
      const response = await api.get('/system/public/settings');
      if (response.data.success) {
        setConfig(prev => ({
          ...prev,
          ...response.data.data,
          loading: false
        }));
      }
    } catch (err) {
      console.error('Failed to fetch system config', err);
      setConfig(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchConfig();
    // Poll every 5 minutes to check for maintenance updates
    const interval = setInterval(fetchConfig, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ConfigContext.Provider value={{ config, setConfig, refreshConfig: fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
