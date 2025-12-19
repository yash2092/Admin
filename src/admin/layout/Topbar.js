import React from 'react';
import '../styles/admin/layout/Topbar.css';

export default function Topbar({ onMenuClick }) {
  /**
   * WHY we keep this handler named:
   * - It makes JSX easier to scan.
   * - It prevents "anonymous inline functions everywhere" in the layout.
   */
  function handleMenuButtonClick() {
    if (typeof onMenuClick === 'function') {
      onMenuClick();
    }
  }

  return (
    <div className="topbar">
      <div className="topLeft">
        <button
          className="menuBtn"
          type="button"
          aria-label="Toggle menu"
          onClick={handleMenuButtonClick}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M4 12h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>
        <span>DASHBOARD</span>
      </div>
      <div className="topRight">
        <div className="topUser">ADMIN USER</div>
        <div className="avatar" aria-label="User avatar">
          A
        </div>
      </div>
    </div>
  );
}
