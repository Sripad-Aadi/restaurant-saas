export const SOCKET_EVENTS = {
  // Admin events
  ORDER_NEW:            'order:new',
  ORDER_STATUS_CHANGED: 'order:status_changed',
  TABLE_OCCUPIED:       'table:occupied',
  TABLE_FREED:          'table:freed',
  ANALYTICS_UPDATE:     'analytics:update',
  
  // Customer events
  ORDER_READY:          'order:ready',
  ORDER_CANCELLED:      'order:cancelled',
  
  // Legacy / Other (if needed, but keeping it clean for now)
  TABLE_STATUS_UPDATED: 'table:status_updated', // keeping for compatibility until updated
};