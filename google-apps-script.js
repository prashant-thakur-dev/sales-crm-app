/**
 * ============================================
 *   LeadFlow — Google Sheets + Calendar Sync Script
 * ============================================
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a new Google Spreadsheet
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code and paste this entire script
 * 4. Click "Deploy" → "New deployment"
 * 5. Select type: "Web app"
 * 6. Set "Execute as": Me
 * 7. Set "Who has access": Anyone
 * 8. Click "Deploy" — you will be asked to approve BOTH
 *    "Google Sheets" AND "Google Calendar" permissions. Approve both.
 * 9. Copy the Web App URL and paste it in the LeadFlow app → Settings
 *
 * IMPORTANT: After any code change, create a NEW deployment
 * (Deploy → New deployment), don't just update the old one.
 */

var HEADERS = [
  'id', 'name', 'phone', 'chat', 'followUpDate', 'followUpTime',
  'youtubeLink', 'remark', 'status', 'completed', 'calendarEventId'
];

// ── Handle GET requests — read all leads from the sheet ──

function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return jsonResponse({ status: 'success', data: [], ts: Date.now() });
    }

    var headers = data[0].map(function(h) { return String(h).trim(); });
    var leads = [];

    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (!row[0] && !row[1] && !row[2]) continue;

      var lead = {};
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j];
        var val = row[j];

        if (key === 'completed') {
          lead[key] = (val === true || val === 'true' || val === 'TRUE');
        } else if (key === 'followUpDate' && val instanceof Date) {
          lead[key] = Utilities.formatDate(val, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'yyyy-MM-dd');
        } else if (key === 'followUpTime' && val instanceof Date) {
          // Fix 1899 GMT drift returning as e.g. 12:13 instead of 12:30
          lead[key] = Utilities.formatDate(val, SpreadsheetApp.getActiveSpreadsheet().getSpreadsheetTimeZone(), 'HH:mm');
        } else {
          lead[key] = (val !== undefined && val !== null) ? String(val) : '';
        }
      }
      leads.push(lead);
    }

    return jsonResponse({ status: 'success', data: leads, ts: Date.now() });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ── Handle POST requests — write leads and sync calendar ──

function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    if (action === 'sync') {
      var incomingLeads = payload.leads || [];

      // ── Build a map of existing calendarEventIds from the sheet ──
      var existingEventMap = {};
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var existingData = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getValues();
        var calIdx = HEADERS.indexOf('calendarEventId');
        var idIdx = HEADERS.indexOf('id');
        existingData.forEach(function(row) {
          var id = String(row[idIdx] || '');
          var eventId = String(row[calIdx] || '');
          if (id && eventId) existingEventMap[id] = eventId;
        });
      }

      // ── For each incoming lead, sync Google Calendar event ──
      var calendar = CalendarApp.getDefaultCalendar();
      var updatedLeads = incomingLeads.map(function(lead) {
        var calEventId = existingEventMap[lead.id] || lead.calendarEventId || '';

        if (lead.followUpDate && !lead.completed) {
          // Build event date/time
          var dateStr = lead.followUpDate; // YYYY-MM-DD
          var parts = dateStr.split('-');
          var year = parseInt(parts[0]);
          var month = parseInt(parts[1]) - 1; // JS months 0-indexed
          var day = parseInt(parts[2]);

          var startDate, endDate;
          if (lead.followUpTime) {
            var timeParts = lead.followUpTime.split(':');
            var hour = parseInt(timeParts[0]);
            var min = parseInt(timeParts[1] || '0');
            startDate = new Date(year, month, day, hour, min, 0);
            endDate   = new Date(year, month, day, hour, min + 30, 0); // 30-min slot
          } else {
            startDate = new Date(year, month, day, 9, 0, 0);
            endDate   = new Date(year, month, day, 9, 30, 0);
          }

          var title = '📞 Follow up: ' + lead.name;
          var description =
            'Phone: ' + lead.phone + '\n' +
            (lead.remark ? 'Notes: ' + lead.remark + '\n' : '') +
            (lead.chat   ? 'Chat: '  + lead.chat   + '\n' : '') +
            'Status: ' + lead.status + '\n' +
            '— Created by LeadFlow';

          try {
            if (calEventId) {
              // Try to update existing event
              var existingEvent = calendar.getEventById(calEventId);
              if (existingEvent) {
                existingEvent.setTitle(title);
                existingEvent.setDescription(description);
                existingEvent.setTime(startDate, endDate);
              } else {
                // Event was deleted from calendar — recreate it
                var newEvent = calendar.createEvent(title, startDate, endDate, { description: description });
                calEventId = newEvent.getId();
              }
            } else {
              // Create brand new event
              var created = calendar.createEvent(title, startDate, endDate, { description: description });
              calEventId = created.getId();
            }
          } catch (calErr) {
            Logger.log('Calendar error for lead ' + lead.id + ': ' + calErr.message);
          }
        } else if (calEventId) {
          // Follow-up removed or completed — delete the calendar event
          try {
            var evToDelete = calendar.getEventById(calEventId);
            if (evToDelete) evToDelete.deleteEvent();
          } catch (del) {}
          calEventId = '';
        }

        return Object.assign({}, lead, { calendarEventId: calEventId });
      });

      // ── Write headers ──
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');

      // ── Clear old data rows ──
      var currentLastRow = sheet.getLastRow();
      if (currentLastRow > 1) {
        sheet.getRange(2, 1, currentLastRow - 1, HEADERS.length).clearContent();
      }

      // ── Write updated leads ──
      if (updatedLeads.length > 0) {
        var rows = updatedLeads.map(function(lead) {
          return HEADERS.map(function(h) {
            if (h === 'completed') return lead[h] === true || lead[h] === 'true';
            return (lead[h] !== undefined && lead[h] !== null) ? String(lead[h]) : '';
          });
        });
        sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
      }

      lock.releaseLock();
      return jsonResponse({
        status: 'success',
        count: updatedLeads.length,
        leads: updatedLeads, // return updated leads so app can store calendarEventIds
        ts: Date.now()
      });
    }

    lock.releaseLock();
    return jsonResponse({ status: 'error', message: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}

// ── Helper: JSON response ──

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Setup: Run once in Apps Script editor to initialize the sheet ──

function setup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  for (var i = 1; i <= HEADERS.length; i++) {
    sheet.autoResizeColumn(i);
  }
  Logger.log('Setup complete! Headers: ' + HEADERS.join(', '));
}
