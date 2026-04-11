import React from 'react';

const AdminAnalytics = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary">Analytics</h2>
          <p className="text-sm text-text-secondary mt-1">Store performance and metrics</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center text-text-muted border-2 border-dashed border-border-light rounded-xl bg-card-white/50">
        <h3 className="text-lg font-medium text-text-primary mb-2">Analytics Module</h3>
        <p className="text-sm">This functionality is coming soon. (Dummy functionality placeholder)</p>
      </div>
    </div>
  );
};

export default AdminAnalytics;
