import React from 'react';
import { useLeads } from '../context/LeadContext';
import LeadCard from '../components/features/leads/LeadCard';

export default function PaymentCaseView({ searchQuery, statusFilter, onEdit, onDelete }) {
  const { leads, toggleComplete } = useLeads();

  // Filter for ONLY Payment Case, applying search queries if active
  const filtered = leads.filter(lead => {
    // 1. Must be Payment Case
    if (lead.status !== 'Payment Case') return false;

    // 2. Search filtering
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      const matchName = lead.name.toLowerCase().includes(sq);
      const matchPhone = lead.phone.includes(sq);
      if (!matchName && !matchPhone) return false;
    }

    return true;
  });

  // Sort by date (descending)
  filtered.sort((a, b) => {
    if (!a.followUpDate) return 1;
    if (!b.followUpDate) return -1;
    return new Date(b.followUpDate) - new Date(a.followUpDate);
  });

  return (
    <div className="view-container">
      <div className="view-header">
        <h2>💰 Payment Case Leads</h2>
        <p>Highest priority sales near closing</p>
      </div>

      <div className="lead-cards-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <span style={{ fontSize: '48px', opacity: 0.5 }}>💰</span>
            <h3>No Payment Case Leads</h3>
            <p className="empty-sub">Add a new lead and mark them as Payment Case to see them here.</p>
          </div>
        ) : (
          filtered.map(lead => (
            <LeadCard 
              key={lead.id} 
              lead={lead} 
              onEdit={onEdit} 
              onDelete={onDelete} 
              onToggle={toggleComplete}
            />
          ))
        )}
      </div>
    </div>
  );
}
