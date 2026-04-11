/**
 * ============================================================
 *  LeadFlow — Browser Push Notification Utility
 * ============================================================
 */

const NOTIF_KEY = 'salescrm_notif_shown';

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
      icon: '/logo192.png',
      badge: '/logo192.png',
      requireInteraction: false,
    });
    // Auto-close after 8s
    setTimeout(() => n.close(), 8000);
  } catch (e) {
    console.warn('Notification failed:', e);
  }
}

/**
 * Check all leads and fire notifications for those due today.
 * Tracks which leads were already notified (per day) to avoid spam.
 */
export function checkAndNotifyFollowUps(leads) {
  if (!canNotify()) return;

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const shownKey = `${NOTIF_KEY}_${today}`;
  let shown = [];
  try {
    shown = JSON.parse(localStorage.getItem(shownKey) || '[]');
  } catch {}

  const todaysLeads = leads.filter((lead) => {
    if (!lead.followUpDate || lead.completed) return false;
    return lead.followUpDate === today;
  });

  let newlyNotified = false;
  todaysLeads.forEach((lead) => {
    if (shown.includes(lead.id)) return; // already notified today
    const timeStr = lead.followUpTime ? ` at ${lead.followUpTime}` : '';
    fireNotification(
      `📞 Follow up: ${lead.name}`,
      `${lead.phone}${timeStr}${lead.remark ? ' — ' + lead.remark : ''}`,
      `followup-${lead.id}`
    );
    shown.push(lead.id);
    newlyNotified = true;
  });

  if (newlyNotified) {
    try {
      localStorage.setItem(shownKey, JSON.stringify(shown));
    } catch {}
  }

  return todaysLeads.length;
}
