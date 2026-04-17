import React, { useState } from 'react';
import { useLeads } from '../context/LeadContext';
import LeadCard from '../components/features/leads/LeadCard';

export default function AllLeadsView({ searchQuery, statusFilter, onEdit, onDelete }) {
  const { leads } = useLeads();
  const [sortBy, setSortBy] = useState('date-desc');

  let filtered = [...leads];

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

  filtered.sort((a, b) => {
    if (sortBy === 'date-desc') return (b.followUpDate || '').localeCompare(a.followUpDate || '');
    if (sortBy === 'date-asc') return (a.followUpDate || '').localeCompare(b.followUpDate || '');
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="view-container" id="all-leads-view">
      <div className="view-header">
        <h2>📇 All Leads</h2>
        <p>{filtered.length} records</p>
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          style={{
            marginLeft: 'auto',
            fontFamily: 'Courier New, monospace',
            fontSize: '10px',
            color: '#F0F0F0',
            background: '#111',
            border: '1px solid #2a2a2a',
            padding: '4px 8px',
            cursor: 'pointer',
            letterSpacing: '0.5px',
          }}
        >
          <option value="date-desc">DATE ↓</option>
          <option value="date-asc">DATE ↑</option>
          <option value="name">NAME A-Z</option>
        </select>
      </div>

      <div className="lead-cards-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No Leads Found</h3>
            <p className="empty-sub">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filtered.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))
        )}
      </div>
    </div>
  );
}
