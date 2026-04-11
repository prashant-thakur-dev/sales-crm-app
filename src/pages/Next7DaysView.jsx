import React from 'react';
import { useLeads } from '../context/LeadContext';
import { isInRange, getDayLabel } from '../utils/dateUtils';
import LeadCard from '../components/features/leads/LeadCard';

export default function Next7DaysView({ searchQuery, statusFilter, onEdit, onDelete }) {
  const { leads } = useLeads();

  // Get leads from next 7 days (not including today)
  let filtered = leads.filter(l => isInRange(l.followUpDate, 1, 7));

  // Apply search
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.status.toLowerCase().includes(q)
    );
  }

  // Apply status filter
  if (statusFilter !== 'All') {
    filtered = filtered.filter(l => l.status === statusFilter);
  }

  // Group by date, soonest first
  const grouped = {};
  filtered.forEach(lead => {
    const date = lead.followUpDate;
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(lead);
  });

  const sortedDates = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  return (
    <div id="next7-view">
      {sortedDates.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📆</div>
          <div className="empty-state-text">No upcoming leads</div>
          <div className="empty-state-sub">Schedule follow-ups to see them here</div>
        </div>
      ) : (
        sortedDates.map(date => (
          <div className="date-group" key={date}>
            <div className="date-group-header">
              <h3 className="date-group-title">{getDayLabel(date)}</h3>
              <span className="date-group-count">
                {grouped[date].length} call{grouped[date].length !== 1 ? 's' : ''} scheduled
              </span>
            </div>
            <div className="lead-cards-grid">
              {grouped[date].map(lead => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
