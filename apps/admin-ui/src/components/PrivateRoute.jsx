import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-light-bg flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold text-text-primary">403 Forbidden</h1>
        <p className="text-text-muted mt-2">You do not have permission to view this page.</p>
        <button onClick={() => window.history.back()} className="mt-4 text-primary font-medium hover:underline">Go Back</button>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
