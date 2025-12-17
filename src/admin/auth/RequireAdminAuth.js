import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '../utils/adminAuth';

export default function RequireAdminAuth({ children }) {
  const location = useLocation();

  if (isAdminAuthenticated()) return children;

  return <Navigate to="/admin/login" replace state={{ from: location }} />;
}
