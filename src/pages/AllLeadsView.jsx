import React, { useState } from 'react';
import { useLeads } from '../context/LeadContext';
import LeadCard from '../components/features/leads/LeadCard';

export default function AllLeadsView({ searchQuery, statusFilter, onEdit, onDelete }) {
  const { leads } = useLeads();

  // Apply search
  let filtered = leads;
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

  // Sort initially by follow-up date (most recent first) or creation order
  filtered.sort((a, b) => {
    // Sort by follow-up date descending
    if (a.followUpDate !== b.followUpDate) {
      return (b.followUpDate || '').localeCompare(a.followUpDate || '');
    }
    return 0;
  });

  return (
    <div id="all-leads-view">
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📇</div>
          <div className="empty-state-text">No leads found</div>
          <div className="empty-state-sub">Add a lead or import from a file</div>
        </div>
      ) : (
        <div className="lead-cards-grid">
          {filtered.map(lead => (
            <LeadCard
              key={lead.id}
              lead={lead}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
