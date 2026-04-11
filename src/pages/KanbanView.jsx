import React, { useState } from 'react';
import { useLeads } from '../context/LeadContext';
import { STATUSES } from '../utils/dummyData';

const COLUMN_COLORS = {
  'Follow Up':       { bg: 'rgba(37,99,235,0.12)',  accent: '#3b82f6', icon: '📞' },
  'Demo Scheduled':  { bg: 'rgba(245,158,11,0.12)', accent: '#f59e0b', icon: '📅' },
  'Demo Done':       { bg: 'rgba(139,92,246,0.12)', accent: '#8b5cf6', icon: '✅' },
  'Ringing':         { bg: 'rgba(99,102,241,0.12)', accent: '#6366f1', icon: '🔔' },
  'Payment Case':    { bg: 'rgba(16,185,129,0.12)', accent: '#10b981', icon: '💰' },
  'Converted':       { bg: 'rgba(34,197,94,0.12)',  accent: '#22c55e', icon: '🏆' },
  'Renewal':         { bg: 'rgba(249,115,22,0.12)', accent: '#f97316', icon: '🔄' },
};

function KanbanCard({ lead, onEdit, onDelete, onDragStart }) {
  return (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      id={`kanban-${lead.id}`}
    >
      <div className="kanban-card-header">
        <span className="kanban-card-name">{lead.name}</span>
        <div className="kanban-card-actions">
          <button onClick={() => onEdit(lead)} title="Edit" className="kanban-action-btn edit">✏️</button>
          <button onClick={() => onDelete(lead.id)} title="Delete" className="kanban-action-btn delete">🗑️</button>
        </div>
      </div>
      <div className="kanban-card-phone">{lead.phone}</div>
      {lead.followUpDate && (
        <div className="kanban-card-date">📅 {lead.followUpDate}{lead.followUpTime ? ` · ${lead.followUpTime}` : ''}</div>
      )}
      {lead.remark && <div className="kanban-card-remark">{lead.remark}</div>}
      <div className="kanban-card-footer">
        <a
          href={`https://wa.me/${lead.phone.replace(/\D/g, '').length === 10 ? '91' + lead.phone.replace(/\D/g, '') : lead.phone.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="kanban-wa-btn"
        >
          💬
        </a>
        <a href={`tel:${lead.phone}`} className="kanban-call-btn">📞</a>
      </div>
    </div>
  );
}

export default function KanbanView({ onEdit, onDelete }) {
  const { leads, updateLead } = useLeads();
  const [dragOverCol, setDragOverCol] = useState(null);
  const [draggingId, setDraggingId] = useState(null);

  const handleDragStart = (e, id) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(status);
  };

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (draggingId) {
      updateLead(draggingId, { status });
    }
    setDragOverCol(null);
    setDraggingId(null);
  };

  const handleDragEnd = () => {
    setDragOverCol(null);
    setDraggingId(null);
  };

  return (
    <div className="kanban-board" id="kanban-board">
      <div className="kanban-scroll-container">
        {STATUSES.map((status) => {
          const colLeads = leads.filter(l => l.status === status);
          const colors = COLUMN_COLORS[status] || { bg: 'rgba(255,255,255,0.05)', accent: '#aaa', icon: '📌' };
          const isOver = dragOverCol === status;

          return (
            <div
              key={status}
              className={`kanban-column ${isOver ? 'drag-over' : ''}`}
              style={{ '--col-accent': colors.accent, '--col-bg': colors.bg }}
              onDragOver={(e) => handleDragOver(e, status)}
              onDrop={(e) => handleDrop(e, status)}
              onDragLeave={() => setDragOverCol(null)}
              id={`kanban-col-${status.replace(/\s+/g, '-').toLowerCase()}`}
            >
              {/* Column Header */}
              <div className="kanban-col-header">
                <span className="kanban-col-icon">{colors.icon}</span>
                <span className="kanban-col-title">{status}</span>
                <span className="kanban-col-count">{colLeads.length}</span>
              </div>

              {/* Cards */}
              <div className="kanban-cards-list">
                {colLeads.length === 0 ? (
                  <div className="kanban-empty">Drop here</div>
                ) : (
                  colLeads.map(lead => (
                    <KanbanCard
                      key={lead.id}
                      lead={lead}
                      onEdit={onEdit}
                      onDelete={onDelete}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
