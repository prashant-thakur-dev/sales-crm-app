import React from 'react';
import { formatDate, formatTime12 } from '../utils/dateUtils';

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
      <div className="lead-card-header">
        <div>
          <div className="lead-name">{lead.name}</div>
          <div className="lead-phone">{lead.phone}</div>
        </div>
        <div className="header-right" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className="status-badge" data-status={lead.status}>{lead.status}</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => onEdit(lead)} style={{ color: 'var(--text-secondary)', fontSize: '16px' }} title="Edit">✏️</button>
            <button onClick={() => onDelete(lead.id)} style={{ color: 'var(--danger)', fontSize: '16px' }} title="Delete">🗑️</button>
          </div>
        </div>
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
        {/* Chat logic moved to bottom actions */}
        {hasYoutube && (
          <a href={lead.youtubeLink} target="_blank" rel="noopener noreferrer" className="meta-link">
            ▶ Watch
          </a>
        )}
      </div>

      <div className="lead-actions" style={{ display: 'flex', gap: '12px' }}>
        <button className="lead-btn call" onClick={handleCall} id={`call-${lead.id}`} style={{ flex: 1, height: '44px', fontSize: '16px' }}>
          📞 Call
        </button>
        <a 
          href={getWhatsAppLink()} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="lead-btn" 
          style={{ flex: 1, height: '44px', fontSize: '16px', background: '#25D366', color: '#fff', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: 'var(--radius-md)', fontWeight: 600 }}
        >
          💬 WhatsApp
        </a>
      </div>
    </div>
  );
}
