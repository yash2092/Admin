import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAdminAuthenticated } from '../utils/adminAuth';

export default function RequireAdminAuth({ children }) {
  const location = useLocation();

  const userHasAdminSession = isAdminAuthenticated();

  // WHY:
  // - We want to protect all admin routes behind one small gate.
  // - If the user is not authenticated, we redirect them to login AND remember
  //   the page they tried to visit so we can send them back after login.
  if (userHasAdminSession) {
    return children;
  }

  const loginRoute = '/admin/login';
  const navigationState = { from: location };

  return <Navigate to={loginRoute} replace state={navigationState} />;
}
