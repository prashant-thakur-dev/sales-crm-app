import { v4 as uuidv4 } from 'uuid';

const today = new Date();
const d = (offset) => {
  const dt = new Date(today);
  dt.setDate(dt.getDate() + offset);
  return dt.toISOString().split('T')[0];
};

export const STATUSES = [
  'Follow Up',
  'Demo Done',
  'Demo Scheduled',
  'Ringing',
  'Payment Case',
  'Converted',
  'Renewal',
];

export const dummyLeads = [];
