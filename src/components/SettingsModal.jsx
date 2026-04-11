import React, { useState } from 'react';

export default function SettingsModal({ onClose, syncStatus, userName, setUserName }) {
  const {
    isConnected,
    isSyncing,
    sheetUrl,
    lastSync,
    connect,
    disconnect,
    pullFromSheet,
    pushToSheet,
  } = syncStatus;

  const [url, setUrl] = useState(sheetUrl || '');
  const [showHelp, setShowHelp] = useState(false);

  const handleConnect = async () => {
    if (!url.trim()) return;
    await connect(url.trim());
  };

  const getTimeAgo = (date) => {
    if (!date) return 'never';
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return `${Math.floor(diff / 3600)} hours ago`;
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} id="settings-overlay">
      <div className="modal-drawer" id="settings-drawer">
        <div className="modal-drawer-handle" />
        <div className="modal-header">
          <h2 className="modal-title">⚙️ Settings</h2>
          <button className="modal-close" onClick={onClose} id="settings-close">✕</button>
        </div>

        <div className="modal-body">
          {/* Personalization Section */}
          <div className="settings-section">
            <h3 className="settings-section-title">
              <span>👤</span> Personalization
            </h3>
            <div className="form-group">
              <label className="form-label" htmlFor="user-name">Your Name</label>
              <input
                id="user-name"
                className="form-input"
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="e.g. Prashant"
              />
            </div>
          </div>

          {/* Google Sheet Sync Section */}
          <div className="settings-section">
            <h3 className="settings-section-title">
              <span>📊</span> Google Sheets Sync
            </h3>
            <p className="settings-desc">
              Connect to a Google Sheet for two-way sync. Changes in the app sync to the sheet and vice versa.
            </p>

            {/* Connection Status */}
            <div className={`sync-status-card ${isConnected ? 'connected' : ''}`}>
              <div className="sync-status-row">
                <div className={`sync-dot-lg ${isConnected ? 'connected' : 'disconnected'}`} />
                <div>
                  <div className="sync-status-text">
                    {isSyncing ? 'Syncing...' : isConnected ? 'Connected & Syncing' : 'Not Connected'}
                  </div>
                  {isConnected && (
                    <div className="sync-status-time">Last sync: {getTimeAgo(lastSync)}</div>
                  )}
                </div>
              </div>
            </div>

            {/* URL Input */}
            <div className="form-group">
              <label className="form-label" htmlFor="sheet-url">Google Apps Script Web App URL</label>
              <input
                id="sheet-url"
                className="form-input"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://script.google.com/macros/s/.../exec"
                disabled={isConnected}
              />
            </div>

            {/* Action Buttons */}
            <div className="settings-actions">
              {!isConnected ? (
                <button
                  className="btn btn-primary btn-full"
                  onClick={handleConnect}
                  disabled={!url.trim() || isSyncing}
                  id="btn-connect"
                >
                  {isSyncing ? '⏳ Connecting...' : '🔗 Connect to Google Sheet'}
                </button>
              ) : (
                <>
                  <button
                    className="btn btn-secondary"
                    onClick={pullFromSheet}
                    disabled={isSyncing}
                    id="btn-pull"
                  >
                    ⬇️ Pull from Sheet
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={pushToSheet}
                    disabled={isSyncing}
                    id="btn-push"
                  >
                    ⬆️ Push to Sheet
                  </button>
                  <button
                    className="btn btn-outline"
                    onClick={disconnect}
                    id="btn-disconnect"
                    style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                  >
                    Disconnect
                  </button>
                </>
              )}
            </div>

            {/* Setup Help */}
            <button
              className="settings-help-toggle"
              onClick={() => setShowHelp(!showHelp)}
            >
              {showHelp ? '▼' : '▶'} How to set up Google Sheets sync
            </button>

            {showHelp && (
              <div className="settings-help">
                <ol>
                  <li>
                    <strong>Create a Google Spreadsheet</strong>
                    <br />Go to <a href="https://sheets.google.com" target="_blank" rel="noopener noreferrer">sheets.google.com</a> and create a new blank spreadsheet
                  </li>
                  <li>
                    <strong>Open Apps Script</strong>
                    <br />Go to <em>Extensions → Apps Script</em>
                  </li>
                  <li>
                    <strong>Paste the script</strong>
                    <br />Delete any existing code and paste the script from the <code>google-apps-script.js</code> file in your project folder
                  </li>
                  <li>
                    <strong>Run setup</strong>
                    <br />Select the <code>setup</code> function from the dropdown and click ▶ Run. Grant permissions when asked.
                  </li>
                  <li>
                    <strong>Deploy as Web App</strong>
                    <br />Click <em>Deploy → New deployment</em>
                    <br />Type: <em>Web app</em>
                    <br />Execute as: <em>Me</em>
                    <br />Who has access: <em>Anyone</em>
                    <br />Click <em>Deploy</em>
                  </li>
                  <li>
                    <strong>Copy the URL</strong>
                    <br />Copy the Web App URL and paste it above
                  </li>
                </ol>
                <div className="settings-help-note">
                  ⚠️ After any script change, create a <strong>New deployment</strong> (don't edit the old one). The URL changes each time.
                </div>
              </div>
            )}
          </div>

          {/* Data Management */}
          <div className="settings-section" style={{ marginTop: 24 }}>
            <h3 className="settings-section-title">
              <span>💾</span> Data Management
            </h3>
            <p className="settings-desc">
              Your leads are always saved locally in your browser. Google Sheets sync is an additional backup and collaboration layer.
            </p>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary btn-full" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}
