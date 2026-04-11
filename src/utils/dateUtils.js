export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

export function formatDateFull(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]}`;
}

export function isToday(dateStr) {
  if (!dateStr) return false;
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  return dateStr === todayStr;
}

export function getTodayStr() {
  return new Date().toISOString().split('T')[0];
}

export function getDateRange(startOffset, endOffset) {
  const dates = [];
  const today = new Date();
  for (let i = startOffset; i <= endOffset; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

export function isInRange(dateStr, startOffset, endOffset) {
  if (!dateStr) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + 'T00:00:00');
  const start = new Date(today);
  start.setDate(start.getDate() + startOffset);
  const end = new Date(today);
  end.setDate(end.getDate() + endOffset);
  return d >= start && d <= end;
}

export function formatTime12(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
}

export function getDayLabel(dateStr) {
  const todayStr = getTodayStr();
  if (dateStr === todayStr) return 'Today';
  
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (dateStr === yesterday.toISOString().split('T')[0]) return 'Yesterday';
  
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (dateStr === tomorrow.toISOString().split('T')[0]) return 'Tomorrow';
  
  return formatDateFull(dateStr);
}
