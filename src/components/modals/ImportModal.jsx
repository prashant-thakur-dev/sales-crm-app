import React, { useState, useRef, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { v4 as uuidv4 } from 'uuid';
import { autoMapColumns, parseExcelDate, parseExcelTime, CRM_FIELDS } from '../../utils/importUtils';
import { STATUSES } from '../../utils/dummyData';
import { useLeads } from '../../context/LeadContext';

const STEPS = {
  UPLOAD: 'upload',
  MAP: 'map',
  PREVIEW: 'preview',
  SUCCESS: 'success'
};

export default function ImportModal({ onClose }) {
  const { addLead } = useLeads();
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [file, setFile] = useState(null);
  const [rawData, setRawData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [mapping, setMapping] = useState({});
  const [previewData, setPreviewData] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (jsonData.length < 2) {
          alert('Not enough data in sheet');
          return;
        }

        const extractedHeaders = jsonData[0].map(h => h ? String(h).trim() : '');
        const rows = jsonData.slice(1).filter(row => row.length > 0 && row.some(cell => cell !== undefined && cell !== null && cell !== ''));

        setHeaders(extractedHeaders);
        setRawData(rows);

        const initialMapping = autoMapColumns(extractedHeaders);
        setMapping(initialMapping);
        setStep(STEPS.MAP);
      } catch (err) {
        console.error('Error parsing file:', err);
        alert('Failed to parse file. Please ensure it is a valid Excel or CSV file.');
      }
    };
    reader.readAsArrayBuffer(selectedFile);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleMappingChange = (crmKey, headerIndex) => {
    setMapping(prev => ({
      ...prev,
      [crmKey]: headerIndex !== '' ? parseInt(headerIndex, 10) : null
    }));
  };

  const generatePreview = () => {
    const preview = rawData.slice(0, 5).map(row => {
      const getValue = (key) => mapping[key] !== null && mapping[key] !== undefined ? row[mapping[key]] : '';
      return {
        name: getValue('name') || 'Unknown',
        phone: getValue('phone') || '',
        chat: getValue('chat') || '',
        followUpDate: parseExcelDate(getValue('followUpDate')),
        followUpTime: parseExcelTime(getValue('followUpTime')),
        youtubeLink: getValue('youtubeLink') || '',
        remark: getValue('remark') || '',
        status: getValue('status') || 'Follow Up',
      };
    });
    setPreviewData(preview);
    setStep(STEPS.PREVIEW);
  };

  const importData = () => {
    const allLeads = rawData.map(row => {
      const getValue = (key) => mapping[key] !== null && mapping[key] !== undefined ? row[mapping[key]] : '';
      let status = getValue('status');
      if (!STATUSES.includes(status)) status = 'Follow Up';

      return {
        id: uuidv4(),
        name: getValue('name') ? String(getValue('name')) : 'Unknown',
        phone: getValue('phone') ? String(getValue('phone')) : '',
        chat: getValue('chat') ? String(getValue('chat')) : '',
        followUpDate: parseExcelDate(getValue('followUpDate')),
        followUpTime: parseExcelTime(getValue('followUpTime')),
        youtubeLink: getValue('youtubeLink') ? String(getValue('youtubeLink')) : '',
        remark: getValue('remark') ? String(getValue('remark')) : '',
        status: status,
        completed: false
      };
    });

    const validLeads = allLeads.filter(l => l.name !== 'Unknown' || l.phone);

    validLeads.forEach(lead => {
      addLead(lead);
    });

    setStep(STEPS.SUCCESS);
  };

  return (
    <div className="modal-overlay" onClick={e => { if(e.target === e.currentTarget) onClose(); }}>
      <div className="modal-drawer">
        <div className="modal-header">
          <h2 className="modal-title">System Import</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {step === STEPS.UPLOAD && (
            <div
              className={`import-dropzone ${isDragging ? 'drag-active' : ''}`}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="import-dropzone-icon">📥</div>
              <div className="import-dropzone-text">
                [ DRAG & DROP FILE OR CLICK TO BROWSE ]<br/>
                <span style={{opacity: 0.5}}>(.csv, .xlsx, .xls)</span>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={e => processFile(e.target.files[0])}
                accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                style={{ display: 'none' }}
              />
            </div>
          )}

          {step === STEPS.MAP && (
            <div>
              <div className="import-step-header">Data Mapping Protocol</div>
              <div className="import-file-info" style={{marginBottom: '16px'}}>
                <span>📄</span>
                <span>{file?.name} ({rawData.length} rows detected)</span>
              </div>
              <div style={{ padding: '8px', background: '#111', border: '1px solid #2a2a2a', marginBottom: '16px' }}>
                <div style={{fontFamily: 'Courier New', fontSize: '9px', color: '#FF1A1A', letterSpacing: '2px', marginBottom: '8px'}}>[ SYSTEM MAPPING REQUIRED ]</div>
                {CRM_FIELDS.map(field => (
                  <div key={field.key} className="mapping-row">
                    <div className="mapping-label">{field.label}{field.required && ' *'}</div>
                    <select
                      className="form-input"
                      value={mapping[field.key] !== null ? mapping[field.key] : ''}
                      onChange={(e) => handleMappingChange(field.key, e.target.value)}
                    >
                      <option value="">-- Ignored --</option>
                      {headers.map((h, i) => (
                        <option key={i} value={i}>{h || `Column ${i+1}`}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === STEPS.PREVIEW && (
            <div>
              <div className="import-step-header">Preview Extraction</div>
              <div style={{ overflowX: 'auto', border: '1px solid #2a2a2a' }}>
                <table className="import-preview-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i}>
                        <td>{row.name}</td>
                        <td>{row.phone}</td>
                        <td>{row.status}</td>
                        <td>{row.followUpDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p style={{ fontFamily: 'Courier New', fontSize: '10px', color: '#666', marginTop: '8px' }}>
                Displaying first 5 rows of {rawData.length} total.
              </p>
            </div>
          )}

          {step === STEPS.SUCCESS && (
            <div className="empty-state" style={{border: 'none'}}>
              <div style={{ fontSize: '48px', color: '#00FF88', marginBottom: '16px' }}>✓</div>
              <h3>Import Complete</h3>
              <p className="empty-sub">Successfully imported {rawData.length} leads into the database.</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          {step !== STEPS.SUCCESS && <button className="btn btn-secondary" onClick={onClose}>Cancel</button>}

          {step === STEPS.MAP && (
            <button className="btn btn-primary" onClick={generatePreview}>Preview Data</button>
          )}

          {step === STEPS.PREVIEW && (
            <button className="btn btn-primary" onClick={importData}>Execute Import</button>
          )}

          {step === STEPS.SUCCESS && (
            <button className="btn btn-primary" onClick={onClose}>Acknowledge</button>
          )}
        </div>
      </div>
    </div>
  );
}
