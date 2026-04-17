import React from 'react';
import { useLeads } from '../context/LeadContext';
import { getTodayStr, formatTime12 } from '../utils/dateUtils';
import LeadCard from '../components/features/leads/LeadCard';

export default function TodayView({ searchQuery, statusFilter, onEdit, onDelete }) {
  const { leads, toggleComplete } = useLeads();
  const todayStr = getTodayStr();

  let todayLeads = leads.filter(l => l.followUpDate === todayStr);

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    todayLeads = todayLeads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.status.toLowerCase().includes(q)
    );
  }
  if (statusFilter !== 'All') {
    todayLeads = todayLeads.filter(l => l.status === statusFilter);
  }
  todayLeads.sort((a, b) => (a.followUpTime || '').localeCompare(b.followUpTime || ''));

  const completed = todayLeads.filter(l => l.completed).length;
  const remaining = todayLeads.length - completed;
  const percent = todayLeads.length > 0 ? Math.round((completed / todayLeads.length) * 100) : 0;

  return (
    <div className="view-container" id="today-view">
      <div className="view-header">
        <h2>📅 Today</h2>
        <p>{todayLeads.length} follow-ups</p>
      </div>

      {/* Progress HUD */}
      {todayLeads.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3,1fr)',
          gap: '1px',
          border: '1px solid #2a2a2a',
          marginBottom: '16px',
          background: '#2a2a2a',
        }}>
          {[
            { label: 'DONE', value: completed, color: '#00FF88' },
            { label: 'LEFT', value: remaining, color: '#FFD700' },
            { label: 'TOTAL', value: todayLeads.length, color: '#F0F0F0' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#111',
              padding: '12px',
              textAlign: 'center',
              fontFamily: 'Courier New, monospace',
            }}>
              <div style={{ fontSize: '28px', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '9px', color: '#666', letterSpacing: '2px', marginTop: '4px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Progress bar */}
      {todayLeads.length > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <div style={{ height: '3px', background: '#2a2a2a', position: 'relative' }}>
            <div style={{
              height: '100%',
              width: `${percent}%`,
              background: 'linear-gradient(90deg, #FF1A1A, #FF6B6B)',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <div style={{
            fontFamily: 'Courier New, monospace',
            fontSize: '9px',
            color: '#FF1A1A',
            letterSpacing: '2px',
            marginTop: '4px',
          }}>
            {percent}% COMPLETE
          </div>
        </div>
      )}

      {/* Lead Cards */}
      {todayLeads.length === 0 ? (
        <div className="empty-state">
          <h3>No Leads Today</h3>
          <p className="empty-sub">Add a lead with today's follow-up date to see it here.</p>
        </div>
      ) : (
        <>
          <div className="lead-cards-grid">
            {todayLeads.map(lead => (
              <LeadCard
                key={lead.id}
                lead={lead}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggle={toggleComplete}
              />
            ))}
          </div>

          {/* Tasks checklist */}
          <div style={{ marginTop: '20px', borderTop: '1px solid #2a2a2a', paddingTop: '16px' }}>
            <div style={{
              fontFamily: 'Courier New, monospace',
              fontSize: '9px',
              color: '#FF1A1A',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}>[ CALL CHECKLIST ]</div>
            {todayLeads.map(lead => (
              <div
                key={lead.id}
                id={`task-${lead.id}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 0',
                  borderBottom: '1px solid #1a1a1a',
                  opacity: lead.completed ? 0.4 : 1,
                }}
              >
                <button
                  onClick={() => toggleComplete(lead.id)}
                  style={{
                    width: '20px', height: '20px',
                    border: `1px solid ${lead.completed ? '#00FF88' : '#333'}`,
                    background: lead.completed ? '#00FF88' : 'transparent',
                    color: lead.completed ? '#000' : 'transparent',
                    fontWeight: 900, fontSize: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s',
                  }}
                >✓</button>
                <span style={{
                  fontFamily: 'Courier New, monospace',
                  fontSize: '12px',
                  color: '#F0F0F0',
                  textDecoration: lead.completed ? 'line-through' : 'none',
                  flex: 1,
                }}>Call {lead.name}</span>
                {lead.followUpTime && (
                  <span style={{
                    fontFamily: 'Courier New, monospace',
                    fontSize: '10px',
                    color: '#4488FF',
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                  }}>{formatTime12(lead.followUpTime)}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
