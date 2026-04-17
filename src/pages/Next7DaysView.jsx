import React from 'react';
import { useLeads } from '../context/LeadContext';
import { isInRange, getDayLabel } from '../utils/dateUtils';
import LeadCard from '../components/features/leads/LeadCard';

export default function Next7DaysView({ searchQuery, statusFilter, onEdit, onDelete }) {
  const { leads } = useLeads();

  let filtered = leads.filter(l => isInRange(l.followUpDate, 1, 7));

  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.phone.includes(q) ||
      l.status.toLowerCase().includes(q)
    );
  }
  if (statusFilter !== 'All') {
    filtered = filtered.filter(l => l.status === statusFilter);
  }

  const grouped = {};
  filtered.forEach(lead => {
    const date = lead.followUpDate;
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(lead);
  });
  const sortedDates = Object.keys(grouped).sort((a, b) => a.localeCompare(b));

  return (
    <div className="view-container" id="next7-view">
      <div className="view-header">
        <h2>📆 Next 7 Days</h2>
        <p>{filtered.length} upcoming</p>
      </div>

      {sortedDates.length === 0 ? (
        <div className="empty-state">
          <h3>Nothing Scheduled</h3>
          <p className="empty-sub">Add leads with upcoming follow-up dates to see them here.</p>
        </div>
      ) : (
        sortedDates.map(date => (
          <div className="day-section" key={date}>
            <div className="day-section-label">
              {getDayLabel(date)}
              <span style={{ marginLeft: 'auto', color: '#666' }}>
                {grouped[date].length} lead{grouped[date].length !== 1 ? 's' : ''}
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
