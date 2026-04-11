# Google Sheets Sync — Setup Guide

## Overview
This CRM app can sync bi-directionally with a Google Sheet:
- **App → Sheet**: Any lead added, edited, or deleted in the app auto-pushes to the sheet
- **Sheet → App**: The app polls the sheet every 30 seconds and pulls any changes
- Data always persists locally in your browser too (as a fallback)

---

## Setup Steps

### 1. Create a Google Sheet
Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.

### 2. Open Apps Script
In your Google Sheet, go to **Extensions → Apps Script**

### 3. Paste the Script
- Delete any existing code in the Apps Script editor
- Open the `google-apps-script.js` file from this project
- Copy the entire contents and paste it into the Apps Script editor

### 4. Run Setup
- In the Apps Script editor, select `setup` from the function dropdown
- Click ▶ **Run**
- When prompted, click **Review permissions** → choose your Google account → click **Allow**
- This creates the headers in your spreadsheet

### 5. Deploy as Web App
- Click **Deploy → New deployment**
- Click the ⚙ gear icon and select **Web app**
- Set **Execute as**: Me
- Set **Who has access**: **Anyone**
- Click **Deploy**
- **Copy the Web App URL** (it looks like `https://script.google.com/macros/s/.../exec`)

### 6. Connect in the App
- Open your Sales CRM app
- Go to **Settings** (⚙ icon on mobile, or sidebar on desktop)
- Paste the Web App URL into the input field
- Click **Connect to Google Sheet**

---

## How Sync Works

| Action | What Happens |
|--------|-------------|
| Add a lead in the app | Automatically pushed to the Google Sheet (2s debounce) |
| Edit a lead in the app | Automatically pushed to the Google Sheet |
| Delete a lead | Automatically pushed to the Google Sheet |
| Add/edit a row in Google Sheet | Picked up on next poll (every 30 seconds) |
| Manual Pull (⬇️ button) | Immediately fetches latest data from sheet |
| Manual Push (⬆️ button) | Immediately pushes all app data to sheet |
| First connection (sheet empty) | All local leads are pushed to the sheet |
| First connection (sheet has data) | Sheet data is loaded into the app |

## Important Notes

- **After changing the Apps Script code**, you must create a **new deployment** (the URL changes)
- The sheet column order must match: `id, name, phone, chat, followUpDate, followUpTime, youtubeLink, remark, status, completed`
- Don't rename or delete the header row (row 1)
- The app uses **full sync** — the entire lead list is sent/received on each sync cycle
- Works with hundreds/thousands of leads without issues
