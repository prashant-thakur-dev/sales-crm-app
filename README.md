# LeadFlow — Lead Tracking Dashboard

Welcome to the LeadFlow project! This documentation serves as a central hub for all deployment links, repositories, and related setup files. You can use this to showcase the application to your client.

---

## 🚀 Live Deployments

### 1. Vercel (Permanent Deployment)
This is your primary, permanent production deployment connected to your Vercel account. 
- **Live URL:** [https://crmapp-21c80kzgs-prashant042002s-projects.vercel.app](https://crmapp-21c80kzgs-prashant042002s-projects.vercel.app)
- *If this link asks for a login, you can turn off "Vercel Authentication" within your Vercel Dashboard for this project.*

### 2. Netlify (Temporary Drop)
This is an anonymous Netlify deployment, useful for quick access without accounts.
- **Live URL:** [http://majestic-creponne-3e3cf7.netlify.app](http://majestic-creponne-3e3cf7.netlify.app)
- **Password:** `My-Drop-Site`
- *Note: As an anonymous drop, this specific link expires after 60 minutes from deployment.*

---

## 💻 Source Code Repository

Your entire codebase is safely backed up on GitHub.
- **GitHub Repository:** [https://github.com/prashant-thakur-dev/sales-crm-app](https://github.com/prashant-thakur-dev/sales-crm-app)

---

## 🛠 Features to Test

When sharing these links with your client, they can test the following features:
- **Mobile-First Design:** Open on a phone to see the smooth, app-like bottom navigation and slide-up drawers.
- **Desktop Layout:** Open on a laptop/desktop to see the split sidebar, 3-column wide card grid, and larger interface.
- **Lead Management:** Try adding a new lead via the "+" button. Edit existing ones and delete them (with a confirmation modal).
- **Task Checklist:** Go to the "Today" tab and check off tasks to see the daily progress bar update in real-time.
- **Filters & Search:** Try searching a name or clicking on the "Follow Up" / "Converted" status chips.

---

## 📊 Google Sheets Sync Integration

This application has a built-in 2-way sync with Google Sheets, allowing new leads to automatically appear in a spreadsheet, and vice versa.

### How to set up Google Sheets Sync:
If your client wants to see the Google Sheets sync working, follow the setup guide here:
- 📖 **Guide:** [`GOOGLE_SHEETS_SETUP.md`](./GOOGLE_SHEETS_SETUP.md)
- 📜 **Script:** [`google-apps-script.js`](./google-apps-script.js) (You need to paste this code into your Google Sheet's Apps Script editor as per the guide).

Once set up, anytime you or the client adds a lead on the website, it will be automatically pushed (with a 2-second delay) to the specified Google Sheet.

---

## 🗂 Key Files Overview
If you're exploring the repository, here's where the magic happens:
- `src/App.jsx` — The main application shell and responsive layouts.
- `src/index.css` — The complete mobile-first & CSS grid design system.
- `src/context/LeadContext.jsx` — The core logic, LocalStorage persistence, and Google Sheets polling/syncing functionality.
- `src/components/ImportModal.jsx` — The complex 4-step wizard for Excel/CSV data ingestion.
