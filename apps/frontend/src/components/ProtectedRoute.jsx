import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ isAllowed, redirectPath = '/login' }) {
  // If no permission is granted (isAllowed is false or undefined)
  if (!isAllowed) {
    console.warn("🛡️ Access Denied: User role does not have authorization for this route.");
    return <Navigate to={redirectPath} replace />;
  }

  // If permission is confirmed, render the child route component
  return <Outlet />;
}