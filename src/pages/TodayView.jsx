import React from 'react';
import { useLeads } from '../context/LeadContext';
import { getTodayStr, formatTime12 } from '../utils/dateUtils';
import LeadCard from '../components/features/leads/LeadCard';

export default function TodayView({ searchQuery, statusFilter, onEdit, onDelete }) {
  const { leads, toggleComplete } = useLeads();
  const todayStr = getTodayStr();

  // Filter today's leads
  let todayLeads = leads.filter(l => l.followUpDate === todayStr);

  // Apply search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    todayLeads = todayLeads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.status.toLowerCase().includes(q)
    );
  }

  // Apply status filter
  if (statusFilter !== 'All') {
    todayLeads = todayLeads.filter(l => l.status === statusFilter);
  }

  // Sort by time
  todayLeads.sort((a, b) => (a.followUpTime || '').localeCompare(b.followUpTime || ''));

  const completed = todayLeads.filter(l => l.completed).length;
  const remaining = todayLeads.length - completed;
  const percent = todayLeads.length > 0 ? Math.round((completed / todayLeads.length) * 100) : 0;

  return (
    <div id="today-view">
      {/* Progress tracker */}
      <div className="progress-section">
        <div className="progress-title">Today's Calls</div>
        <div className="progress-stats">
          <div className="stat-box completed">
            <span className="stat-number">{completed}</span>
            <span className="stat-label">Completed</span>
          </div>
          <div className="stat-box remaining">
            <span className="stat-number">{remaining}</span>
            <span className="stat-label">Remaining</span>
          </div>
          <div className="stat-box total">
            <span className="stat-number">{todayLeads.length}</span>
            <span className="stat-label">Total</span>
          </div>
        </div>
        <div className="progress-bar-wrapper">
          <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
        </div>
        <div className="progress-percent">{percent}% done</div>
      </div>

      {/* Lead cards */}
      {todayLeads.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📭</div>
          <div className="empty-state-text">No leads for today</div>
          <div className="empty-state-sub">Add a lead or import from a file</div>
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

          {/* Today's Tasks Checklist */}
          <div className="tasks-section">
            <h3 className="tasks-title">Today's Tasks</h3>
            {todayLeads.map(lead => (
              <div
                key={lead.id}
                className={`task-item ${lead.completed ? 'completed' : ''}`}
                id={`task-${lead.id}`}
              >
                <button
                  className={`task-checkbox ${lead.completed ? 'checked' : ''}`}
                  onClick={() => toggleComplete(lead.id)}
                  aria-label={lead.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {lead.completed && '✓'}
                </button>
                <span className="task-label">Call {lead.name}</span>
                {lead.followUpTime && (
                  <span className="task-time">{formatTime12(lead.followUpTime)}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
