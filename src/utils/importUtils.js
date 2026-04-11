// Smart column mapping for auto-detecting field names from imported sheets
const FIELD_ALIASES = {
  name: ['name', 'lead name', 'full name', 'contact name', 'first name', 'customer', 'client', 'person'],
  phone: ['phone', 'phone number', 'mobile', 'mobile number', 'contact', 'contact number', 'cell', 'telephone', 'tel', 'mob'],
  chat: ['chat', 'chat link', 'whatsapp', 'wa link', 'message', 'notes', 'chat note'],
  followUpDate: ['follow up date', 'followup date', 'follow-up date', 'date', 'callback date', 'scheduled date', 'next date', 'follow up'],
  followUpTime: ['follow up time', 'followup time', 'follow-up time', 'time', 'callback time', 'scheduled time'],
  youtubeLink: ['youtube', 'youtube link', 'video', 'video link', 'yt link', 'demo link', 'demo video'],
  remark: ['remark', 'remarks', 'old app remark', 'comment', 'comments', 'note', 'notes', 'description', 'details', 'observation'],
  status: ['status', 'lead status', 'stage', 'pipeline', 'disposition', 'outcome', 'result'],
};

export function autoMapColumns(headers) {
  const mapping = {};

  headers.forEach((header) => {
    const normalized = header.toLowerCase().trim();

    for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
      if (mapping[field]) continue; // already mapped
      if (aliases.includes(normalized) || aliases.some(a => normalized.includes(a))) {
        mapping[field] = header;
        break;
      }
    }
  });

  return mapping;
}

export function parseExcelDate(serial) {
  if (!serial) return '';
  // If it's already a string date
  if (typeof serial === 'string') {
    // Try to parse various date formats
    const d = new Date(serial);
    if (!isNaN(d.getTime())) {
      return d.toISOString().split('T')[0];
    }
    return serial;
  }
  // Excel serial number to JS date
  if (typeof serial === 'number') {
    const epoch = new Date(1899, 11, 30);
    const date = new Date(epoch.getTime() + serial * 86400000);
    return date.toISOString().split('T')[0];
  }
  return '';
}

export function parseExcelTime(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    // Check if it's already HH:MM format
    const match = value.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      return `${match[1].padStart(2, '0')}:${match[2]}`;
    }
    return value;
  }
  if (typeof value === 'number') {
    // Excel time fraction (0-1)
    const totalMinutes = Math.round(value * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  return '';
}

export const CRM_FIELDS = [
  { key: 'name', label: 'Name', required: true },
  { key: 'phone', label: 'Phone Number', required: true },
  { key: 'chat', label: 'Chat' },
  { key: 'followUpDate', label: 'Follow-up Date' },
  { key: 'followUpTime', label: 'Follow-up Time' },
  { key: 'youtubeLink', label: 'YouTube Link' },
  { key: 'remark', label: 'Old App Remark' },
  { key: 'status', label: 'Lead Status' },
];
