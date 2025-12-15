import React from 'react';

export default function Topbar() {
  return (
    <div className="topbar">
      <div className="topLeft">DASHBOARD</div>
      <div className="topRight">
        <div className="topUser">ADMIN USER</div>
        <div className="avatar" aria-label="User avatar">
          A
        </div>
      </div>
    </div>
  );
}
