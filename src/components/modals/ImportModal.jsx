import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { autoMapColumns, parseExcelDate, parseExcelTime, CRM_FIELDS } from '../../utils/importUtils';
import { STATUSES } from '../../utils/dummyData';
import { useLeads } from '../../context/LeadContext';

const STEPS = {
  UPLOAD: 'upload',
  MAPPING: 'mapping',
  DUPLICATES: 'duplicates',
  SUMMARY: 'summary',
};

export default function ImportModal({ onClose }) {
  const { leads, addLead, updateLead, bulkAddLeads, bulkUpdateLeads, findByPhone, showToast } = useLeads();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(STEPS.UPLOAD);
  const [headers, setHeaders] = useState([]);
  const [rows, setRows] = useState([]);
  const [mapping, setMapping] = useState({});
  const [duplicateAction, setDuplicateAction] = useState('skip'); // skip | update | duplicate
  const [summary, setSummary] = useState({ added: 0, updated: 0, skipped: 0 });
  const [fileName, setFileName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processFile = useCallback((file) => {
    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        if (json.length < 2) {
          showToast('File has no data rows');
          setIsProcessing(false);
          return;
        }

        const fileHeaders = json[0].map(h => String(h || '').trim()).filter(Boolean);
        const fileRows = json.slice(1).filter(row => row.some(cell => cell != null && cell !== ''));

        setHeaders(fileHeaders);
        setRows(fileRows);
        setMapping(autoMapColumns(fileHeaders));
        setStep(STEPS.MAPPING);
      } catch (err) {
        console.error(err);
        showToast('Failed to parse file. Please check the format.');
      }
      setIsProcessing(false);
    };
    reader.readAsArrayBuffer(file);
  }, [showToast]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleMappingChange = (field, header) => {
    setMapping(prev => ({ ...prev, [field]: header === '' ? undefined : header }));
  };

  const proceedFromMapping = () => {
    // Check if at least name or phone is mapped
    if (!mapping.name && !mapping.phone) {
      showToast('Please map at least Name or Phone');
      return;
    }
    setStep(STEPS.DUPLICATES);
  };

  const doImport = () => {
    setIsProcessing(true);

    // Process in chunks to avoid UI freeze
    setTimeout(() => {
      const headerIndexMap = {};
      for (const [field, header] of Object.entries(mapping)) {
        if (header) {
          headerIndexMap[field] = headers.indexOf(header);
        }
      }

      let added = 0, updated = 0, skipped = 0;
      const toAdd = [];
      const toUpdate = [];

      for (const row of rows) {
        const getValue = (field) => {
          const idx = headerIndexMap[field];
          if (idx === undefined || idx < 0) return '';
          return row[idx] != null ? String(row[idx]).trim() : '';
        };

        const leadData = {
          name: getValue('name'),
          phone: getValue('phone').replace(/\D/g, ''),
          chat: getValue('chat'),
          followUpDate: parseExcelDate(headerIndexMap.followUpDate !== undefined ? row[headerIndexMap.followUpDate] : ''),
          followUpTime: parseExcelTime(headerIndexMap.followUpTime !== undefined ? row[headerIndexMap.followUpTime] : ''),
          youtubeLink: getValue('youtubeLink'),
          remark: getValue('remark'),
          status: getValue('status'),
        };

        // Validate status
        if (!STATUSES.includes(leadData.status)) {
          leadData.status = 'Follow Up';
        }

        // Skip empty rows
        if (!leadData.name && !leadData.phone) continue;

        // Check duplicate
        const existing = leadData.phone ? findByPhone(leadData.phone) : null;

        if (existing) {
          if (duplicateAction === 'skip') {
            skipped++;
          } else if (duplicateAction === 'update') {
            toUpdate.push({ ...leadData, id: existing.id, completed: existing.completed });
            updated++;
          } else {
            // duplicate
            toAdd.push({ ...leadData, id: uuidv4(), completed: false });
            added++;
          }
        } else {
          toAdd.push({ ...leadData, id: uuidv4(), completed: false });
          added++;
        }
      }

      if (toAdd.length) bulkAddLeads(toAdd);
      if (toUpdate.length) bulkUpdateLeads(toUpdate);

      setSummary({ added, updated, skipped });
      setStep(STEPS.SUMMARY);
      setIsProcessing(false);
    }, 50);
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} id="import-overlay">
      <div className="modal-drawer" id="import-drawer">
        <div className="modal-drawer-handle" />
        <div className="modal-header">
          <h2 className="modal-title">
            {step === STEPS.UPLOAD && 'Import Leads'}
            {step === STEPS.MAPPING && 'Map Columns'}
            {step === STEPS.DUPLICATES && 'Handle Duplicates'}
            {step === STEPS.SUMMARY && 'Import Complete'}
          </h2>
          <button className="modal-close" onClick={onClose} id="import-close">✕</button>
        </div>

        <div className="modal-body">
          {/* STEP 1: UPLOAD */}
          {step === STEPS.UPLOAD && (
            <>
              <div
                className="import-zone"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                id="import-drop-zone"
              >
                <div className="import-zone-icon">📁</div>
                <div className="import-zone-text">
                  {isProcessing ? 'Processing...' : 'Tap to select file or drag & drop'}
                </div>
                <div className="import-zone-hint">
                  Supports .xlsx, .csv files
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="import-file-input"
              />

              <div style={{ marginTop: 24, padding: '16px', background: 'var(--bg-input)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontWeight: 600, marginBottom: 8, fontSize: 'var(--font-sm)' }}>💡 Tips</div>
                <ul style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', paddingLeft: 16, listStyle: 'disc', lineHeight: 1.8 }}>
                  <li>First row should be column headers</li>
                  <li>Column names are auto-detected (e.g. "Phone", "Mobile", "Contact")</li>
                  <li>You can re-map columns in the next step</li>
                  <li>For Google Sheets: File → Download as CSV</li>
                </ul>
              </div>
            </>
          )}

          {/* STEP 2: COLUMN MAPPING */}
          {step === STEPS.MAPPING && (
            <>
              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 16 }}>
                📄 <strong>{fileName}</strong> — {rows.length} rows found
              </div>

              <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-secondary)', marginBottom: 20 }}>
                Verify column mapping below. We've auto-detected what we can.
              </div>

              {CRM_FIELDS.map(({ key, label, required }) => (
                <div className="mapping-row" key={key}>
                  <div className="mapping-source">
                    {label}{required ? ' *' : ''}
                  </div>
                  <span className="mapping-arrow">→</span>
                  <div className="mapping-target">
                    <select
                      value={mapping[key] || ''}
                      onChange={(e) => handleMappingChange(key, e.target.value)}
                      id={`mapping-${key}`}
                    >
                      <option value="">— Skip —</option>
                      {headers.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </>
          )}

          {/* STEP 3: DUPLICATE HANDLING */}
          {step === STEPS.DUPLICATES && (
            <>
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
                <div style={{ fontSize: 'var(--font-md)', fontWeight: 600, marginBottom: 8 }}>
                  How should we handle duplicates?
                </div>
                <div style={{ fontSize: 'var(--font-sm)', color: 'var(--text-muted)', marginBottom: 24 }}>
                  If a phone number already exists in your leads:
                </div>
              </div>

              <div className="duplicate-options">
                <button
                  className={`duplicate-option ${duplicateAction === 'skip' ? 'active' : ''}`}
                  onClick={() => setDuplicateAction('skip')}
                  id="dup-skip"
                >
                  ⏭ Skip
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 400 }}>Keep existing</div>
                </button>
                <button
                  className={`duplicate-option ${duplicateAction === 'update' ? 'active' : ''}`}
                  onClick={() => setDuplicateAction('update')}
                  id="dup-update"
                >
                  🔄 Update
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 400 }}>Overwrite data</div>
                </button>
                <button
                  className={`duplicate-option ${duplicateAction === 'duplicate' ? 'active' : ''}`}
                  onClick={() => setDuplicateAction('duplicate')}
                  id="dup-duplicate"
                >
                  📋 Duplicate
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, fontWeight: 400 }}>Add anyway</div>
                </button>
              </div>
            </>
          )}

          {/* STEP 4: SUMMARY */}
          {step === STEPS.SUMMARY && (
            <div className="import-summary">
              <div className="import-summary-icon">✅</div>
              <div className="import-summary-title">Import Complete!</div>
              <div className="import-stat">
                <span className="import-stat-label">Leads Added</span>
                <span className="import-stat-value" style={{ color: 'var(--success)' }}>{summary.added}</span>
              </div>
              <div className="import-stat">
                <span className="import-stat-label">Leads Updated</span>
                <span className="import-stat-value" style={{ color: 'var(--accent)' }}>{summary.updated}</span>
              </div>
              <div className="import-stat">
                <span className="import-stat-label">Leads Skipped</span>
                <span className="import-stat-value" style={{ color: 'var(--text-muted)' }}>{summary.skipped}</span>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step === STEPS.UPLOAD && (
            <button className="btn btn-secondary btn-full" onClick={onClose}>Cancel</button>
          )}
          {step === STEPS.MAPPING && (
            <>
              <button className="btn btn-secondary" onClick={() => setStep(STEPS.UPLOAD)}>Back</button>
              <button className="btn btn-primary" onClick={proceedFromMapping} id="mapping-next">
                Next →
              </button>
            </>
          )}
          {step === STEPS.DUPLICATES && (
            <>
              <button className="btn btn-secondary" onClick={() => setStep(STEPS.MAPPING)}>Back</button>
              <button
                className="btn btn-primary"
                onClick={doImport}
                disabled={isProcessing}
                id="import-execute"
              >
                {isProcessing ? 'Importing...' : `Import ${rows.length} Leads`}
              </button>
            </>
          )}
          {step === STEPS.SUMMARY && (
            <button className="btn btn-primary btn-full" onClick={onClose} id="import-done">
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
