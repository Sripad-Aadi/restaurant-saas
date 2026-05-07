import React, { createContext, useContext, useState, useEffect } from 'react';
import api from './api';

const ConfigContext = createContext();

export const ConfigProvider = ({ children }) => {
  const [config, setConfig] = useState({
    platformName: 'Antigravity Restaurants',
    isMaintenanceMode: false,
    maintenanceMessage: '',
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
    const interval = setInterval(fetchConfig, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ConfigContext.Provider value={{ config, refreshConfig: fetchConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => useContext(ConfigContext);
