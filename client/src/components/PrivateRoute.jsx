import React from 'react';
import { Navigate } from 'react-router-dom';

function PrivateRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem('userInfo'));
  
  // Check for both authentication and valid role
  if (!user?.token || user.role !== role) {
    // Clear localStorage if token is invalid or role doesn't match
    localStorage.removeItem('userInfo');
    return <Navigate to="/auth" replace />;
  }

  return children;
}

export default PrivateRoute;