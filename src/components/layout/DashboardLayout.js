import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Close mobile sidebar on navigation
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className={sidebarOpen ? 'dashboardShell hasSidebarOpen' : 'dashboardShell'}>
      {sidebarOpen ? (
        <button
          className="sidebarBackdrop"
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <Sidebar onNavigate={() => setSidebarOpen(false)} />
      <div className="main">
        <Topbar onMenuClick={() => setSidebarOpen((v) => !v)} />
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
