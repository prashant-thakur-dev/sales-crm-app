import React, { useState } from 'react';
import { useLeads } from '../../context/LeadContext';

export default function SettingsModal({ onClose, syncStatus, userName, setUserName }) {
  const {
    syncConfig,
    connectSheet,
    pushToSheet,
    pullFromSheet,
    isSyncing
  } = useLeads();

  const [urlInput, setUrlInput] = useState(syncConfig.url || '');
  const [nameInput, setNameInput] = useState(userName || '');

  const handleConnect = async () => {
    if (!urlInput) return;
    await connectSheet(urlInput);
  };

  const handleSaveSettings = () => {
    setUserName(nameInput);
    if (!syncConfig.connected && urlInput) {
      handleConnect();
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} id="settings-overlay">
      <div className="modal-drawer">
        <div className="modal-header">
          <h2 className="modal-title">System Settings</h2>
          <button className="modal-close" onClick={onClose} id="settings-close">✕</button>
        </div>

        <div className="modal-body">
          <div className="settings-section" data-label="USER IDENTIFICATION">
            <div className="form-group">
              <label className="form-label" htmlFor="user-name-input">Operator Name</label>
              <input
                id="user-name-input"
                className="form-input"
                type="text"
                placeholder="Enter your name..."
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              <p style={{ fontFamily: 'Courier New', fontSize: '9px', color: '#666', marginTop: '4px' }}>
                Used for greeting and tracking actions.
              </p>
            </div>
          </div>

          <div className="settings-section" data-label="CLOUD UPLINK">
            <div className="settings-status-badge">
              <div className={`status-dot ${syncStatus.isConnected ? 'green' : 'red'}`} />
              <span style={{ color: syncStatus.isConnected ? '#00FF88' : '#FF1A1A' }}>
                {syncStatus.isConnected ? 'CONNECTED' : 'DISCONNECTED'}
              </span>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="sheet-url">Google Web App URL</label>
              <div className="settings-input-row">
                <input
                  id="sheet-url"
                  className="form-input"
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={handleConnect}
                  disabled={isSyncing}
                  id="btn-connect-sheet"
                >
                  {isSyncing ? 'CONNECTING...' : 'LINK'}
                </button>
              </div>
            </div>

            {syncStatus.isConnected && (
              <div className="settings-input-row" style={{ marginTop: '8px' }}>
                <button className="btn btn-secondary" onClick={pullFromSheet} disabled={isSyncing} style={{ flex: 1 }}>
                  ↓ PULL
                </button>
                <button className="btn btn-secondary" onClick={pushToSheet} disabled={isSyncing} style={{ flex: 1 }}>
                  ↑ PUSH
                </button>
              </div>
            )}
          </div>

          <div className="settings-section" data-label="DIAGNOSTICS">
            <button className="btn btn-danger" onClick={() => {
              if (window.confirm("CRITICAL WARNING: This will purge all local data. Proceed?")) {
                localStorage.clear();
                window.location.reload();
              }
            }}>
              [ PURGE LOCAL DATABASE ]
            </button>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Close</button>
          <button className="btn btn-primary" onClick={handleSaveSettings}>Apply Configuration</button>
        </div>
      </div>
    </div>
  );
}
