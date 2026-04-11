# 📋 LeadFlow — Complete Project Overview

> A comprehensive record of everything built, configured, and deployed for the LeadFlow Sales CRM application.

---

## 🚀 What is LeadFlow?

**LeadFlow** is a mobile-first, dark-themed Sales Lead Tracking web application. It is designed to help you manage your sales follow-ups, track lead status, and stay on top of your pipeline — all in one place.

**Live URL:** Your Vercel deployment URL  
**GitHub Repository:** https://github.com/prashant-thakur-dev/sales-crm-app

---

## ✅ Features Built

### 1. 🗂️ Lead Management (Core)
- Add new leads with: Name, Phone, Follow-up Date & Time, WhatsApp/Chat link, YouTube link, Remarks and Status
- Edit any lead at any time
- Delete leads with a confirmation step (no accidental deletes)
- Mark leads as **Completed** using a toggle checkbox

### 2. 📱 Mobile View (Bottom Navigation)
- **Today** — leads with follow-up scheduled for today
- **All Leads** — every lead in the system
- **Last 7 Days** — leads from the past 7 days
- **Next 7 Days** — upcoming follow-ups
- A floating **+** button (FAB) at the bottom to quickly add a new lead

### 3. 🖥️ Desktop View (Sidebar)
- Full left-hand sidebar with navigation links for all views
- Quick-action buttons: Add Lead, Import CSV, Export CSV, Settings
- Shows Google Sheet sync status (connected/disconnected)
- Shows last sync timestamp

### 4. 📇 Lead Card Design
- Shows lead name, phone number, status badge
- Remark / note displayed on the card
- Follow-up date and time chips
- **Two large action buttons** at the bottom, side by side:
  - 📞 **Call** — opens your phone dialer
  - 💬 **WhatsApp** — opens WhatsApp chat (auto-generates the link from the phone number — no need to manually paste!)
- **Edit ✏️** and **Delete 🗑️** buttons as small icons in the top-right corner of each card

### 5. 🌙 Dark Mode Theme
- Premium dark background (`#121215`)
- Soft, elegant card surfaces
- Vibrant accent colors for buttons and badges
- Full dark mode across all modals, inputs, and navigation

### 6. 🧑‍💼 Personalization (Welcome Greeting)
- In **Settings → Personalization**, you can type your name
- The app header will then greet you: `"Welcome, [Your Name] 👋"` instead of the generic title
- Your name is saved permanently (survives browser refresh)

### 7. 📤 Import / Export CSV
- **Export:** Download all your leads as a `.csv` file — open it in Excel/Google Sheets
- **Import:** Upload a `.csv` file to bulk-add leads, with column mapping and duplicate detection

### 8. 🔗 Google Sheets Two-Way Sync
- Connect a Google Sheet URL in **Settings**
- **App → Sheet:** Any new lead you add is automatically pushed to your sheet within 2 seconds
- **Sheet → App:** The app checks your sheet every 30 seconds and pulls in any new rows you added directly from the sheet
- A **race condition fix** ensures data is never accidentally overwritten during simultaneous push/pull
- Changes in the sheet appear in the app and vice-versa in real-time

### 9. 📅 Google Calendar Auto-Sync
- When you set a **follow-up date** on any lead, the Apps Script **automatically creates a Google Calendar event**
- Event title: `"📞 Follow up: [Lead Name]"`
- Event description includes phone, WhatsApp link, remarks and status
- If you **change** the follow-up date/time → the calendar event updates automatically
- If you **complete or remove** the follow-up → the calendar event is deleted
- No duplicate events — each lead tracks its `calendarEventId`

> **Requires:** Updated `google-apps-script.js` deployed with Google Calendar permission approved.

### 10. 🔔 Browser Push Notifications
- When you open LeadFlow, the browser asks for **notification permission once**
- Every **5 minutes**, the app checks for leads due **today**
- Fires a desktop/mobile popup: `"📞 Follow up: [Name] — [Phone] — [Remarks]"`
- **Smart:** Only notifies once per lead per day — no spam

---

## 🛠️ Technical Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Styling | Vanilla CSS with CSS Variables (Dark Theme) |
| State Management | React Context API (`LeadContext`) |
| Data Persistence | `localStorage` (offline-first) |
| Backend (Sync) | Google Apps Script (Web App) |
| Hosting | Vercel (auto-deploys from `main` branch) |
| Version Control | GitHub |

---

## 📁 Project File Structure

```
crmapp/
├── public/
│   └── banner.png               ← Logo/branding image
├── src/
│   ├── components/
│   │   ├── LeadCard.jsx          ← Individual lead card with Call/WhatsApp buttons
│   │   ├── LeadForm.jsx          ← Add/Edit lead form (modal)
│   │   ├── Sidebar.jsx           ← Desktop sidebar navigation
│   │   ├── SettingsModal.jsx     ← Settings: Google Sheets URL + Personalization
│   │   ├── AllLeadsView.jsx      ← "All Leads" tab view
│   │   └── ImportModal.jsx       ← CSV import with column mapping
│   ├── context/
│   │   └── LeadContext.jsx       ← Central state: leads, sync, notifications, user
│   ├── utils/
│   │   ├── dummyData.js          ← Empty (no demo data — clean for client)
│   │   ├── dateUtils.js          ← Date formatting helpers
│   │   └── notifications.js      ← Browser push notification logic
│   ├── App.jsx                   ← Main app shell, routing, modals
│   ├── index.css                 ← All styles (dark theme, layout, components)
│   └── main.jsx                  ← React entry point
├── google-apps-script.js         ← Copy this into Google Apps Script editor
├── GOOGLE_SHEETS_SETUP.md        ← Step-by-step guide for setting up Google Sheets
├── GIT_WORKFLOW.md               ← How to use dev/main branches
├── PROJECT_OVERVIEW.md           ← This file
├── README.md                     ← Project links and summary
├── index.html                    ← HTML entry point (title, fonts, meta tags)
├── vite.config.js                ← Vite build config
└── package.json                  ← Dependencies
```

---

## ⚙️ Setup & Configuration Guide

### A. First Time: Google Sheets Sync Setup

1. Create a new **Google Spreadsheet**
2. Click **Extensions → Apps Script**
3. Delete all existing code
4. Copy the **entire content** of `google-apps-script.js` and paste it
5. Click ▶ **Deploy → New deployment**
6. Type: **Web app**
7. Execute as: **Me**
8. Who has access: **Anyone**
9. Click **Deploy** → Approve ALL permissions (Sheets + Calendar)
10. Copy the **Web App URL**
11. Open LeadFlow → **Settings** → Paste the URL → Click **Connect**

> ⚠️ Every time you update the script, you must create a **New Deployment** — not update the existing one.

### B. Setting Your Name (Personalization)

1. Open the app → tap the **⚙️ Settings** icon
2. Scroll to **Personalization**
3. Enter your name → Click **Save Name**
4. The header will now show `"Welcome, [Name] 👋"`

### C. Enable Browser Notifications

- The app will automatically ask for notification permission when you first open it
- Click **Allow** to receive follow-up reminders
- If you accidentally clicked **Block**, go to your browser Settings → Site Settings → Notifications → Find the app URL → Allow

---

## 🌿 Git Branch Workflow

| Branch | Purpose |
|--------|---------|
| `main` | **Production** — client sees this via Vercel |
| `dev` | **Development** — your safe sandbox for changes |

### Save your work (daily):
```bash
git add . && git commit -m "your message" && git push origin dev
```

### Release to client (when satisfied):
```bash
git checkout main && git merge dev && git push origin main && git checkout dev
```

---

## 🐛 Bugs Fixed

| Bug | Fix |
|---|---|
| Settings modal showing black screen | Missing `setUserName` prop was crashing the component |
| Typed text invisible in dark mode | Input `:focus` was styling text on white background; changed to dark elevated color |
| Data disappearing from Google Sheet | Race condition between auto-push and auto-pull — added `pendingPushRef` shield |
| Initial app crashed on reconnect | Added `isInitialMount` guard to prevent pushing empty data on first render |

---

## 🔮 Future Improvements (Optional Next Steps)

- [ ] **Search & Filter** — search leads by name or phone number
- [ ] **Lead Pipeline View** — Kanban board view (New → Contacted → Negotiating → Closed)
- [ ] **Analytics Dashboard** — charts showing leads by status, conversion rate
- [ ] **User Authentication** — login with Google (Firebase Auth) for multi-user support
- [ ] **PWA / Install to Home Screen** — make the app installable on Android/iOS
- [ ] **Reminder Time Picker** — set notification reminders X hours before follow-up time
