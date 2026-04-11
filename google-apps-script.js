/**
 * ============================================
 *   SALES CRM — Google Sheets Sync Script
 * ============================================
 * 
 * INSTRUCTIONS:
 * 1. Create a new Google Spreadsheet
 * 2. Go to Extensions → Apps Script
 * 3. Delete any existing code and paste this entire script
 * 4. Click "Deploy" → "New deployment"
 * 5. Select type: "Web app"
 * 6. Set "Execute as": Me
 * 7. Set "Who has access": Anyone
 * 8. Click "Deploy" and copy the Web App URL
 * 9. Paste the URL in your Sales CRM app → Settings → Google Sheet URL
 * 
 * IMPORTANT: After any code change, create a NEW deployment
 * (Deploy → New deployment), don't just update the old one.
 */

var HEADERS = ['id', 'name', 'phone', 'chat', 'followUpDate', 'followUpTime', 'youtubeLink', 'remark', 'status', 'completed'];

/**
 * Handle GET requests — read all leads from the sheet
 */
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
      // Skip completely empty rows
      if (!row[0] && !row[1] && !row[2]) continue;

      var lead = {};
      for (var j = 0; j < headers.length; j++) {
        var key = headers[j];
        var val = row[j];

        if (key === 'completed') {
          lead[key] = (val === true || val === 'true' || val === 'TRUE');
        } else if (key === 'followUpDate' && val instanceof Date) {
          // Convert Date object to YYYY-MM-DD string
          lead[key] = Utilities.formatDate(val, Session.getScriptTimeZone(), 'yyyy-MM-dd');
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

/**
 * Handle POST requests — write leads to the sheet
 */
function doPost(e) {
  try {
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;

    if (action === 'sync') {
      var leads = payload.leads || [];

      // Ensure headers exist in row 1
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');

      // Clear all existing data rows
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        sheet.getRange(2, 1, lastRow - 1, HEADERS.length).clearContent();
      }

      // Write leads
      if (leads.length > 0) {
        var rows = leads.map(function(lead) {
          return HEADERS.map(function(h) {
            if (h === 'completed') {
              return lead[h] === true || lead[h] === 'true';
            }
            return lead[h] !== undefined && lead[h] !== null ? String(lead[h]) : '';
          });
        });
        sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
      }

      lock.releaseLock();
      return jsonResponse({ status: 'success', count: leads.length, ts: Date.now() });
    }

    lock.releaseLock();
    return jsonResponse({ status: 'error', message: 'Unknown action: ' + action });
  } catch (err) {
    return jsonResponse({ status: 'error', message: err.message });
  }
}

/**
 * Helper to return a JSON response with CORS headers
 */
function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Run this function once to set up the sheet with headers.
 * Go to Run → setup() in the Apps Script editor.
 */
function setup() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  
  // Auto-resize columns
  for (var i = 1; i <= HEADERS.length; i++) {
    sheet.autoResizeColumn(i);
  }
  
  Logger.log('Setup complete! Headers: ' + HEADERS.join(', '));
}
