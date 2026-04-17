import React from 'react';
import { formatDate, formatTime12 } from '../../../utils/dateUtils';

export default function LeadCard({ lead, onEdit, onDelete, onToggle }) {
  const chatIsLink = lead.chat && (lead.chat.startsWith('http') || lead.chat.startsWith('wa.me'));
  const hasYoutube = lead.youtubeLink && lead.youtubeLink.trim();

  const handleCall = () => {
    window.open(`tel:${lead.phone}`, '_self');
  };

  const getWhatsAppLink = () => {
    if (chatIsLink) return lead.chat;
    const digits = lead.phone.replace(/\D/g, '');
    const phoneWithCode = digits.length === 10 ? `91${digits}` : digits;
    return `https://wa.me/${phoneWithCode}`;
  };

  return (
    <div className="lead-card" data-status={lead.status} id={`lead-${lead.id}`}>
      {/* Header */}
      <div className="lead-card-header">
        <div>
          <div className="lead-name">{lead.name}</div>
          <div className="lead-phone">{lead.phone}</div>
        </div>
        <div className="header-right">
          <span className="status-badge" data-status={lead.status}>{lead.status}</span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => onEdit(lead)}
              title="Edit"
              style={{
                width: '28px', height: '28px',
                border: '1px solid #2a2a2a',
                color: '#666',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', background: 'transparent', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#4488FF'; e.currentTarget.style.color = '#4488FF'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#666'; }}
            >✏️</button>
            <button
              onClick={() => onDelete(lead.id)}
              title="Delete"
              style={{
                width: '28px', height: '28px',
                border: '1px solid #2a2a2a',
                color: '#666',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', background: 'transparent', cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF1A1A'; e.currentTarget.style.color = '#FF1A1A'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#2a2a2a'; e.currentTarget.style.color = '#666'; }}
            >🗑️</button>
          </div>
        </div>
      </div>

      {/* Remark */}
      {lead.remark && <div className="lead-remark">{lead.remark}</div>}

      {/* Meta */}
      <div className="lead-meta">
        {lead.followUpDate && (
          <span className="meta-chip">📅 {formatDate(lead.followUpDate)}</span>
        )}
        {lead.followUpTime && (
          <span className="meta-chip" style={{ color: '#4488FF', borderColor: '#4488FF' }}>
            🕐 {formatTime12(lead.followUpTime)}
          </span>
        )}
        {hasYoutube && (
          <a href={lead.youtubeLink} target="_blank" rel="noopener noreferrer" className="meta-link">
            ▶ Watch
          </a>
        )}
      </div>

      {/* Actions */}
      <div className="lead-actions">
        <button className="lead-btn call" onClick={handleCall} id={`call-${lead.id}`}>
          📞 Call
        </button>
        <a
          href={getWhatsAppLink()}
          target="_blank"
          rel="noopener noreferrer"
          className="lead-btn whatsapp"
        >
          💬 WhatsApp
        </a>
      </div>
    </div>
  );
}
