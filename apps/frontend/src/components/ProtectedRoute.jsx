import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ isAllowed, redirectPath = '/login' }) {
  // If the user does not have permission, bounce them to the login page
  if (!isAllowed) {
    console.warn("🛡️ Protected Route Blocked: User does not have the required role.");
    return <Navigate to={redirectPath} replace />;
  }

  // If they are allowed, render the nested route (the Dashboard)
  return <Outlet />;
}