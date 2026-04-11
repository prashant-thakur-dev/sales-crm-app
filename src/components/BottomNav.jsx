import React from 'react';

export default function BottomNav({ activeTab, onTabChange, todayCount, nextCount }) {
  return (
    <nav className="bottom-nav" id="bottom-nav">
      <div className="bottom-nav-inner">
        <button
          className={`nav-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => onTabChange('all')}
          id="nav-all"
        >
          <span className="nav-icon">📇</span>
          <span>All Leads</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => onTabChange('today')}
          id="nav-today"
        >
          <span className="nav-icon">📅</span>
          <span>Today{todayCount > 0 ? ` (${todayCount})` : ''}</span>
          {todayCount > 0 && <span className="nav-badge">{todayCount}</span>}
        </button>
        <button
          className={`nav-item ${activeTab === 'last7' ? 'active' : ''}`}
          onClick={() => onTabChange('last7')}
          id="nav-last7"
        >
          <span className="nav-icon">📋</span>
          <span>Last 7 Days</span>
        </button>
        <button
          className={`nav-item ${activeTab === 'next7' ? 'active' : ''}`}
          onClick={() => onTabChange('next7')}
          id="nav-next7"
        >
          <span className="nav-icon">📆</span>
          <span>Next 7 Days{nextCount > 0 ? ` (${nextCount})` : ''}</span>
        </button>
      </div>
    </nav>
  );
}
