import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import '../styles/admin/layout/DashboardLayout.css';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Close mobile sidebar on navigation
    setSidebarOpen(false);
  }, [location.pathname]);

  function getShellClassName() {
    // WHY:
    // - We use a class toggle instead of conditionally rendering the sidebar itself.
    // - This keeps the DOM structure stable and makes CSS transitions easier.
    if (sidebarOpen) {
      return 'dashboardShell hasSidebarOpen';
    }
    return 'dashboardShell';
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function toggleSidebar() {
    // Use a functional update so the toggle is always based on the latest state.
    setSidebarOpen((previousValue) => !previousValue);
  }

  return (
    <div className={getShellClassName()}>
      {sidebarOpen ? (
        <button
          className="sidebarBackdrop"
          type="button"
          aria-label="Close menu"
          onClick={closeSidebar}
        />
      ) : null}
      <Sidebar onNavigate={closeSidebar} />
      <div className="main">
        <Topbar onMenuClick={toggleSidebar} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
