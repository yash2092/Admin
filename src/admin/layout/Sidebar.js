import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconBook, IconBuilding, IconList, IconPlus } from '../ui/Icons';
import '../styles/admin/layout/Sidebar.css';

function getSideLinkClassName({ isActive }) {
  // WHY: We want exactly one highlighted item, driven by the URL.
  // React Router tells us whether a link matches the current route via `isActive`.
  if (isActive) return 'sideItem sideItemActive';
  return 'sideItem';
}

function SideLink({ to, icon, children, onNavigate, end = false }) {
  // `end` means "match exactly".
  //
  // WHY:
  // - Without `end`, a link like "/institutes" is also considered active for
  //   "/institutes/create" because the URL starts with "/institutes".
  // - Our UI requirement is: highlight ONLY the currently active menu item.
  function handleClick() {
    // WHY:
    // - On mobile, navigation should close the sidebar so the user can see the page.
    if (typeof onNavigate === 'function') {
      onNavigate();
    }
  }

  return (
    <NavLink
      to={to}
      end={end}
      className={getSideLinkClassName}
      onClick={handleClick}
    >
      <span className="sideIcon">{icon}</span>
      <span>{children}</span>
    </NavLink>
  );
}

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brandMark" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 12c3-6 13-8 16-8-2 3-2 12-2 16-4 0-12-2-14-8z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 13c2-3 6-4 9-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <span className="brandName">rootvestors</span>
      </div>

      <div className="sideSectionTitle">Institute Portfolio</div>
      <nav className="sideNav">
        {/* WHY `end`: "/institutes" should not remain active on "/institutes/create". */}
        <SideLink to="/institutes" end icon={<IconBuilding size={18} />} onNavigate={onNavigate}>
          Institute List
        </SideLink>
        {/* WHY no step in the sidebar URL:
           The Create page already redirects /create -> /create/1.
           Keeping the sidebar link stable makes the active highlight predictable. */}
        <SideLink to="/institutes/create" icon={<IconPlus size={18} />} onNavigate={onNavigate}>
          Create Institute
        </SideLink>
      </nav>

      <div className="sideDivider" />

      <div className="sideSectionTitle">Courses</div>
      <nav className="sideNav">
        {/* WHY `end`: "/courses" should not remain active on "/courses/create". */}
        <SideLink to="/courses" end icon={<IconList size={18} />} onNavigate={onNavigate}>
          Course List
        </SideLink>
        {/* Same idea as institutes: stable URL for consistent active highlighting. */}
        <SideLink to="/courses/create" icon={<IconBook size={18} />} onNavigate={onNavigate}>
          Create Course
        </SideLink>
      </nav>
    </aside>
  );
}
