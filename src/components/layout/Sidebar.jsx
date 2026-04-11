import React from 'react';
import { useLeads } from '../../context/LeadContext';

export default function Sidebar({
  activeTab,
  onTabChange,
  todayCount,
  nextCount,
  onAddLead,
  onImport,
  onExport,
  onSettings,
  syncStatus,
}) {
  const { isConnected, isSyncing, lastSync } = syncStatus;

  const getTimeAgo = (date) => {
    if (!date) return '';
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  return (
    <aside className="sidebar" id="sidebar">
      {/* Branding */}
      <div className="sidebar-brand">
        <div className="sidebar-logo">🎯</div>
        <div>
          <div className="sidebar-brand-title">LeadFlow</div>
          <div className="sidebar-brand-sub">Lead Tracker</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Navigation</div>
        <button
          className={`sidebar-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => onTabChange('all')}
          id="sidebar-all"
        >
          <span className="sidebar-item-icon">📇</span>
          <span className="sidebar-item-text">All Leads</span>
        </button>
        <button
          className={`sidebar-item ${activeTab === 'today' ? 'active' : ''}`}
          onClick={() => onTabChange('today')}
          id="sidebar-today"
        >
          <span className="sidebar-item-icon">📅</span>
          <span className="sidebar-item-text">Today</span>
          {todayCount > 0 && <span className="sidebar-item-badge">{todayCount}</span>}
        </button>
        <button
          className={`sidebar-item ${activeTab === 'last7' ? 'active' : ''}`}
          onClick={() => onTabChange('last7')}
          id="sidebar-last7"
        >
          <span className="sidebar-item-icon">📋</span>
          <span className="sidebar-item-text">Last 7 Days</span>
        </button>
        <button
          className={`sidebar-item ${activeTab === 'next7' ? 'active' : ''}`}
          onClick={() => onTabChange('next7')}
          id="sidebar-next7"
        >
          <span className="sidebar-item-icon">📆</span>
          <span className="sidebar-item-text">Next 7 Days</span>
          {nextCount > 0 && <span className="sidebar-item-badge">{nextCount}</span>}
        </button>
        <button
          className={`sidebar-item ${activeTab === 'pipeline' ? 'active' : ''}`}
          onClick={() => onTabChange('pipeline')}
          id="sidebar-pipeline"
        >
          <span className="sidebar-item-icon">🗂️</span>
          <span className="sidebar-item-text">Pipeline</span>
        </button>
      </div>

      {/* Actions */}
      <div className="sidebar-section">
        <div className="sidebar-section-label">Actions</div>
        <button className="sidebar-item action" onClick={onAddLead} id="sidebar-add">
          <span className="sidebar-item-icon">➕</span>
          <span className="sidebar-item-text">Add Lead</span>
        </button>
        <button className="sidebar-item action" onClick={onImport} id="sidebar-import">
          <span className="sidebar-item-icon">📥</span>
          <span className="sidebar-item-text">Import Leads</span>
        </button>
        <button className="sidebar-item action" onClick={onExport} id="sidebar-export">
          <span className="sidebar-item-icon">📤</span>
          <span className="sidebar-item-text">Export Leads</span>
        </button>
      </div>

      {/* Sync Status + Settings */}
      <div className="sidebar-footer">
        <div className="sidebar-sync-status">
          <div className={`sync-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          <div className="sync-info">
            <span className="sync-label">
              {isSyncing ? 'Syncing...' : isConnected ? 'Connected' : 'Not Connected'}
            </span>
            {isConnected && lastSync && (
              <span className="sync-time">Last sync: {getTimeAgo(lastSync)}</span>
            )}
          </div>
        </div>
        <button className="sidebar-item settings" onClick={onSettings} id="sidebar-settings">
          <span className="sidebar-item-icon">⚙️</span>
          <span className="sidebar-item-text">Settings</span>
        </button>
      </div>
    </aside>
  );
}
