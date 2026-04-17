import React from 'react';
import { useLeads } from '../context/LeadContext';
import LeadCard from '../components/features/leads/LeadCard';

export default function PaymentCaseView({ searchQuery, statusFilter, onEdit, onDelete }) {
  const { leads, toggleComplete } = useLeads();

  const filtered = leads.filter(lead => {
    if (lead.status !== 'Payment Case') return false;
    if (searchQuery) {
      const sq = searchQuery.toLowerCase();
      if (!lead.name.toLowerCase().includes(sq) && !lead.phone.includes(sq)) return false;
    }
    return true;
  });

  filtered.sort((a, b) => {
    if (!a.followUpDate) return 1;
    if (!b.followUpDate) return -1;
    return b.followUpDate.localeCompare(a.followUpDate);
  });

  return (
    <div className="view-container" id="payment-case-view">
      <div className="view-header">
        <h2>💰 Payment Case</h2>
        <p>{filtered.length} high-value leads</p>
      </div>

      {/* Banner */}
      <div style={{
        background: 'rgba(0,255,136,0.07)',
        border: '1px solid rgba(0,255,136,0.3)',
        borderLeft: '4px solid #00FF88',
        padding: '10px 16px',
        marginBottom: '16px',
        fontFamily: 'Courier New, monospace',
        fontSize: '11px',
        color: '#00FF88',
        letterSpacing: '1px',
      }}>
        ▸ PRIORITY QUEUE — LEADS WITH 90%+ CONVERSION PROBABILITY
      </div>

      <div className="lead-cards-grid">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <h3>No Payment Cases</h3>
            <p className="empty-sub">Set a lead's status to "Payment Case" to see it here.</p>
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
