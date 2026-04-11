import React from 'react';
import { formatDate, formatTime12 } from '../utils/dateUtils';

export default function LeadCard({ lead, onEdit, onDelete, onToggle }) {
  const chatIsLink = lead.chat && (lead.chat.startsWith('http') || lead.chat.startsWith('wa.me'));
  const hasYoutube = lead.youtubeLink && lead.youtubeLink.trim();

  const handleCall = () => {
    window.open(`tel:${lead.phone}`, '_self');
  };

  return (
    <div className="lead-card" data-status={lead.status} id={`lead-${lead.id}`}>
      <div className="lead-card-header">
        <div>
          <div className="lead-name">{lead.name}</div>
          <div className="lead-phone">{lead.phone}</div>
        </div>
        <span className="status-badge" data-status={lead.status}>{lead.status}</span>
      </div>

      {lead.remark && <div className="lead-remark">{lead.remark}</div>}

      <div className="lead-meta">
        {lead.followUpDate && (
          <span className="meta-chip">📅 {formatDate(lead.followUpDate)}</span>
        )}
        {lead.followUpTime && (
          <span className="meta-chip" style={{ color: '#2563eb', fontWeight: 700 }}>
            🕐 {formatTime12(lead.followUpTime)}
          </span>
        )}
        {chatIsLink ? (
          <a href={lead.chat} target="_blank" rel="noopener noreferrer" className="meta-link">
            💬 Chat
          </a>
        ) : lead.chat ? (
          <span className="meta-chip">💬 {lead.chat}</span>
        ) : null}
        {hasYoutube && (
          <a href={lead.youtubeLink} target="_blank" rel="noopener noreferrer" className="meta-link">
            ▶ Watch
          </a>
        )}
      </div>

      <div className="lead-actions">
        <button className="lead-btn edit" onClick={() => onEdit(lead)} id={`edit-${lead.id}`}>
          ✏️ Edit
        </button>
        <button className="lead-btn call" onClick={handleCall} id={`call-${lead.id}`}>
          📞 Call
        </button>
        <button className="lead-btn delete" onClick={() => onDelete(lead.id)} id={`del-${lead.id}`}>
          Del
        </button>
      </div>
    </div>
  );
}
