/**
 * ============================================================
 *  LeadFlow — Browser Push Notification Utility
 * ============================================================
 */

const NOTIF_KEY      = 'salescrm_notif_shown';
const NOTIF_15M_KEY  = 'salescrm_notif_15m';

/** Request and return notification permission */
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return 'unsupported';
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  const result = await Notification.requestPermission();
  return result;
}

/** Return true if we can fire notifications */
export function canNotify() {
  return 'Notification' in window && Notification.permission === 'granted';
}

/** Fire a single browser notification */
export function fireNotification(title, body, tag) {
  if (!canNotify()) return;
  try {
    const n = new Notification(title, {
      body,
      tag,
      icon: '/favicon.ico',
      requireInteraction: false,
    });
    // Auto-close after 8 seconds
    setTimeout(() => n.close(), 8000);
  } catch (e) {
    console.warn('Notification failed:', e);
  }
}

/**
 * Check leads due TODAY and fire a morning reminder notification.
 * Only fires once per lead per day to avoid spam.
 */
export function checkAndNotifyFollowUps(leads) {
  if (!canNotify()) return 0;

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const shownKey = `${NOTIF_KEY}_${today}`;
  let shown = [];
  try { shown = JSON.parse(localStorage.getItem(shownKey) || '[]'); } catch {}

  const todaysLeads = leads.filter(lead =>
    lead.followUpDate === today && !lead.completed
  );

  let count = 0;
  todaysLeads.forEach((lead) => {
    if (shown.includes(lead.id)) return;
    const timeStr = lead.followUpTime ? ` at ${formatTime12(lead.followUpTime)}` : '';
    fireNotification(
      `📞 Follow up today: ${lead.name}`,
      `${lead.phone}${timeStr}${lead.remark ? ' — ' + lead.remark : ''}`,
      `followup-${lead.id}`
    );
    shown.push(lead.id);
    count++;
  });

  if (count > 0) {
    try { localStorage.setItem(shownKey, JSON.stringify(shown)); } catch {}
  }

  return todaysLeads.length;
}

/**
 * Check for leads whose follow-up time is within the next 15 minutes.
 * Fires a "⏰ 15 minutes away" reminder.
 * Only fires once per lead per day.
 */
export function checkAndNotify15MinReminders(leads) {
  if (!canNotify()) return;

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const shownKey = `${NOTIF_15M_KEY}_${today}`;
  let shown = [];
  try { shown = JSON.parse(localStorage.getItem(shownKey) || '[]'); } catch {}

  let changed = false;

  leads.forEach((lead) => {
    if (!lead.followUpDate || !lead.followUpTime || lead.completed) return;
    if (lead.followUpDate !== today) return;
    if (shown.includes(lead.id)) return;

    // Parse the follow-up time
    const [hours, minutes] = lead.followUpTime.split(':').map(Number);
    const followUpMs = new Date(
      now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0
    ).getTime();

    const diffMs = followUpMs - now.getTime();
    const diffMin = diffMs / 60000;

    // Fire if between 0 and 16 minutes away (so the 5-min polling cycle catches it)
    if (diffMin >= 0 && diffMin <= 16) {
      fireNotification(
        `⏰ 15 min reminder: ${lead.name}`,
        `Follow-up at ${formatTime12(lead.followUpTime)} — ${lead.phone}${lead.remark ? '\n' + lead.remark : ''}`,
        `reminder-15m-${lead.id}`
      );
      shown.push(lead.id);
      changed = true;
    }
  });

  if (changed) {
    try { localStorage.setItem(shownKey, JSON.stringify(shown)); } catch {}
  }
}

/** Convert 24h time string (HH:MM) to 12h format */
function formatTime12(time) {
  if (!time) return '';
  const [h, m] = time.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}
