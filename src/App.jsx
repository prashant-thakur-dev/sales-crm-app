import React, { useState, useMemo, useCallback } from 'react';
import { LeadProvider, useLeads } from './context/LeadContext';
import BottomNav from './components/BottomNav';
import Sidebar from './components/Sidebar';
import TodayView from './components/TodayView';
import Last7DaysView from './components/Last7DaysView';
import Next7DaysView from './components/Next7DaysView';
import AllLeadsView from './components/AllLeadsView';
import KanbanView from './components/KanbanView';
import LeadForm from './components/LeadForm';
import ImportModal from './components/ImportModal';
import SettingsModal from './components/SettingsModal';
import { STATUSES } from './utils/dummyData';
import { getTodayStr, isInRange } from './utils/dateUtils';
import * as XLSX from 'xlsx';

function AppContent() {
  const { leads, addLead, updateLead, deleteLead, toast, showToast, syncStatus, userName, setUserName } = useLeads();
  const [activeTab, setActiveTab] = useState('today');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showForm, setShowForm] = useState(false);
  const [editLead, setEditLead] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const todayStr = getTodayStr();
  const todayCount = useMemo(() => leads.filter(l => l.followUpDate === todayStr).length, [leads, todayStr]);
  const nextCount = useMemo(() => leads.filter(l => isInRange(l.followUpDate, 1, 7)).length, [leads]);

  const handleEdit = useCallback((lead) => {
    setEditLead(lead);
    setShowForm(true);
  }, []);

  const handleDelete = useCallback((id) => {
    setConfirmDelete(id);
  }, []);

  const confirmDeleteAction = useCallback(() => {
    if (confirmDelete) {
      deleteLead(confirmDelete);
      setConfirmDelete(null);
    }
  }, [confirmDelete, deleteLead]);

  const handleSave = useCallback((lead, isEdit) => {
    if (isEdit) {
      updateLead(lead.id, lead);
      showToast('Lead updated successfully');
    } else {
      addLead(lead);
    }
  }, [addLead, updateLead, showToast]);

  const handleExport = useCallback(() => {
    const data = leads.map(l => ({
      'Name': l.name,
      'Phone Number': l.phone,
      'Chat': l.chat,
      'Follow-up Date': l.followUpDate,
      'Follow-up Time': l.followUpTime,
      'YouTube Link': l.youtubeLink,
      'Remark': l.remark,
      'Status': l.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leads');
    XLSX.writeFile(wb, `leads_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    showToast('Exported successfully!');
  }, [leads, showToast]);

  const handleAddLead = useCallback(() => {
    setEditLead(null);
    setShowForm(true);
  }, []);

  const allStatuses = ['All', ...STATUSES];

  return (
    <div className="app-container">
      {/* Desktop Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        todayCount={todayCount}
        nextCount={nextCount}
        onAddLead={handleAddLead}
        onImport={() => setShowImport(true)}
        onExport={handleExport}
        onSettings={() => setShowSettings(true)}
        syncStatus={syncStatus}
      />

      {/* Main Area */}
      <div className="app-main">
        {/* Header */}
        <header className="app-header" id="app-header">
          <div className="header-top">
            <div>
              <h1 className="header-title">{userName ? `Welcome, ${userName} 👋` : 'LeadFlow'}</h1>
              <p className="header-subtitle">{leads.length} total leads</p>
            </div>
            <div className="header-actions">
              {/* Sync indicator for mobile */}
              {syncStatus.isConnected && (
                <button
                  className="header-btn sync-pulse"
                  onClick={() => setShowSettings(true)}
                  title="Google Sheet connected"
                  id="btn-sync-status"
                >
                  🟢
                </button>
              )}
              <button className="header-btn" onClick={() => setShowImport(true)} title="Import" id="btn-import">
                📥
              </button>
              <button className="header-btn" onClick={handleExport} title="Export" id="btn-export">
                📤
              </button>
              <button className="header-btn desktop-hide" onClick={() => setShowSettings(true)} title="Settings" id="btn-settings">
                ⚙️
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="search-bar" id="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search by name, phone, status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-input"
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>✕</button>
            )}
          </div>

          {/* Status filter chips */}
          <div className="status-filters" id="status-filters">
            {allStatuses.map(s => (
              <button
                key={s}
                className={`filter-chip ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}
                id={`filter-${s.replace(/\s+/g, '-').toLowerCase()}`}
              >
                {s}
              </button>
            ))}
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">
          {activeTab === 'pipeline' && (
            <KanbanView
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {activeTab === 'all' && (
            <AllLeadsView
              searchQuery={search}
              statusFilter={statusFilter}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {activeTab === 'today' && (
            <TodayView
              searchQuery={search}
              statusFilter={statusFilter}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {activeTab === 'last7' && (
            <Last7DaysView
              searchQuery={search}
              statusFilter={statusFilter}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
          {activeTab === 'next7' && (
            <Next7DaysView
              searchQuery={search}
              statusFilter={statusFilter}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </main>
      </div>

      {/* FAB (mobile only) */}
      <button
        className="fab"
        onClick={handleAddLead}
        id="fab-add"
        aria-label="Add new lead"
      >
        +
      </button>

      {/* Bottom Nav (mobile only) */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        todayCount={todayCount}
        nextCount={nextCount}
      />

      {/* Lead Form Modal */}
      {showForm && (
        <LeadForm
          lead={editLead}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditLead(null); }}
        />
      )}

      {/* Import Modal */}
      {showImport && (
        <ImportModal onClose={() => setShowImport(false)} />
      )}

      {/* Settings Modal */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          syncStatus={syncStatus}
          userName={userName}
          setUserName={setUserName}
        />
      )}

      {/* Delete Confirmation */}
      {confirmDelete && (
        <div className="confirm-dialog" id="confirm-delete">
          <div className="confirm-box">
            <h3 className="confirm-title">Delete Lead?</h3>
            <p className="confirm-message">
              This action cannot be undone. The lead will be permanently removed.
            </p>
            <div className="confirm-actions">
              <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDeleteAction} id="confirm-delete-yes">Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className="toast" id="toast">{toast}</div>}
    </div>
  );
}

export default function App() {
  return (
    <LeadProvider>
      <AppContent />
    </LeadProvider>
  );
}
