import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { dummyLeads } from '../utils/dummyData';
import { requestNotificationPermission, checkAndNotifyFollowUps } from '../utils/notifications';

const LeadContext = createContext();

const STORAGE_KEY = 'salescrm_leads_v2';
const SYNC_KEY = 'salescrm_sync_config';
const SYNC_INTERVAL = 30000; // 30 seconds

function loadLeads() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Failed to load leads:', e);
  }
  return null;
}

function saveLeads(leads) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  } catch (e) {
    console.error('Failed to save leads:', e);
  }
}

function loadSyncConfig() {
  try {
    const stored = localStorage.getItem(SYNC_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { url: '', connected: false };
}

function saveSyncConfig(config) {
  try {
    localStorage.setItem(SYNC_KEY, JSON.stringify(config));
  } catch {}
}

// Simple debounce
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

// ── Google Sheets API helpers ──

async function fetchFromSheet(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (err) {
    console.error('Fetch from sheet failed:', err);
    return { status: 'error', message: err.message };
  }
}

async function postToSheet(url, payload) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    });
    try {
      return await response.json();
    } catch {
      // Opaque response from redirect — treat as success
      return { status: 'success' };
    }
  } catch (err) {
    console.error('Post to sheet failed:', err);
    return { status: 'error', message: err.message };
  }
}

// ── Provider ──

export function LeadProvider({ children }) {
  const [leads, setLeadsRaw] = useState(() => loadLeads() || dummyLeads);
  const [toast, setToast] = useState(null);
  
  // Personalization
  const [userName, setUserName] = useState(() => localStorage.getItem('salescrm_username') || '');

  // Sync state
  const [syncConfig, setSyncConfigRaw] = useState(loadSyncConfig);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  // Flag to prevent push-back when we just pulled
  const fromSyncRef = useRef(false);
  const pendingPushRef = useRef(false);
  const isInitialMount = useRef(true);
  const leadsRef = useRef(leads);
  leadsRef.current = leads;
  const intervalRef = useRef(null);

  const showToast = useCallback((message, duration = 2500) => {
    setToast(message);
    setTimeout(() => setToast(null), duration);
  }, []);

  // ── Persist leads to localStorage ──
  useEffect(() => {
    saveLeads(leads);
  }, [leads]);

  // ── Persist user name to localStorage ──
  useEffect(() => {
    localStorage.setItem('salescrm_username', userName);
  }, [userName]);

  // ── Persist sync config ──
  useEffect(() => {
    saveSyncConfig({ url: syncConfig.url, connected: syncConfig.connected });
  }, [syncConfig]);

  // ── Debounced push to sheet ──
  const debouncedPush = useCallback(
    debounce(async (url, leadsData) => {
      const result = await postToSheet(url, { action: 'sync', leads: leadsData });
      // If Apps Script returned updated leads (with calendarEventIds), save them
      if (result.status === 'success' && Array.isArray(result.leads)) {
        fromSyncRef.current = true; // prevent push loop
        setLeadsRaw(result.leads);
      }
      setLastSync(new Date());
      pendingPushRef.current = false;
    }, 2000),
    []
  );

  // ── Auto-push on lead changes ──
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (fromSyncRef.current) {
      fromSyncRef.current = false;
      return;
    }
    if (syncConfig.connected && syncConfig.url) {
      pendingPushRef.current = true;
      debouncedPush(syncConfig.url, leads);
    }
  }, [leads, syncConfig.connected, syncConfig.url, debouncedPush]);

  // ── Pull from sheet ──
  const pullFromSheet = useCallback(async () => {
    if (!syncConfig.url || pendingPushRef.current) return;
    setIsSyncing(true);
    try {
      const result = await fetchFromSheet(syncConfig.url);
      if (result.status === 'success' && Array.isArray(result.data)) {
        fromSyncRef.current = true;
        setLeadsRaw(result.data);
        setLastSync(new Date());
      }
    } catch (err) {
      console.error('Pull failed:', err);
    }
    setIsSyncing(false);
  }, [syncConfig.url]);

  // ── Push to sheet (manual) ──
  const pushToSheet = useCallback(async () => {
    if (!syncConfig.url) return;
    setIsSyncing(true);
    const result = await postToSheet(syncConfig.url, {
      action: 'sync',
      leads: leadsRef.current,
    });
    if (result.status === 'success') {
      // Save back updated leads (with calendarEventIds)
      if (Array.isArray(result.leads)) {
        fromSyncRef.current = true;
        setLeadsRaw(result.leads);
      }
      setLastSync(new Date());
      showToast('Pushed to Google Sheet ✓');
    } else {
      showToast('Push failed: ' + (result.message || 'Unknown error'));
    }
    setIsSyncing(false);
  }, [syncConfig.url, showToast]);

  // ── Periodic polling ──
  useEffect(() => {
    clearInterval(intervalRef.current);
    if (syncConfig.connected && syncConfig.url) {
      intervalRef.current = setInterval(pullFromSheet, SYNC_INTERVAL);
    }
    return () => clearInterval(intervalRef.current);
  }, [syncConfig.connected, syncConfig.url, pullFromSheet]);

  // ── Auto-reconnect on load ──
  useEffect(() => {
    if (syncConfig.connected && syncConfig.url) {
      pullFromSheet();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Request notification permission and check follow-ups ──
  useEffect(() => {
    requestNotificationPermission();
  }, []);

  useEffect(() => {
    // Check immediately on load
    checkAndNotifyFollowUps(leads);
    // Then check every 5 minutes
    const notifInterval = setInterval(() => {
      checkAndNotifyFollowUps(leadsRef.current);
    }, 5 * 60 * 1000);
    return () => clearInterval(notifInterval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Connect to sheet ──
  const connectSheet = useCallback(async (url) => {
    setIsSyncing(true);
    try {
      const result = await fetchFromSheet(url);
      if (result.status === 'success') {
        if (result.data && result.data.length > 0) {
          // Sheet has data — pull it
          fromSyncRef.current = true;
          setLeadsRaw(result.data);
          showToast(`Connected! Loaded ${result.data.length} leads from sheet`);
        } else {
          // Sheet is empty — push our data
          await postToSheet(url, { action: 'sync', leads: leadsRef.current });
          showToast(`Connected! Pushed ${leadsRef.current.length} leads to sheet`);
        }
        setSyncConfigRaw({ url, connected: true });
        setLastSync(new Date());
      } else {
        showToast('Failed to connect: ' + (result.message || 'Check the URL'));
      }
    } catch (err) {
      showToast('Connection error. Check the URL.');
      console.error(err);
    }
    setIsSyncing(false);
  }, [showToast]);

  // ── Disconnect ──
  const disconnectSheet = useCallback(() => {
    clearInterval(intervalRef.current);
    setSyncConfigRaw({ url: '', connected: false });
    showToast('Disconnected from Google Sheet');
  }, [showToast]);

  // ── CRUD operations ──

  const setLeads = useCallback((newLeads) => {
    setLeadsRaw(newLeads);
  }, []);

  const addLead = useCallback((lead) => {
    setLeadsRaw(prev => [...prev, lead]);
    showToast('Lead added successfully');
  }, [showToast]);

  const updateLead = useCallback((id, updates) => {
    setLeadsRaw(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteLead = useCallback((id) => {
    setLeadsRaw(prev => prev.filter(l => l.id !== id));
    showToast('Lead deleted');
  }, [showToast]);

  const toggleComplete = useCallback((id) => {
    setLeadsRaw(prev => prev.map(l => l.id === id ? { ...l, completed: !l.completed } : l));
  }, []);

  const bulkAddLeads = useCallback((newLeads) => {
    setLeadsRaw(prev => [...prev, ...newLeads]);
  }, []);

  const bulkUpdateLeads = useCallback((updates) => {
    setLeadsRaw(prev => {
      const map = new Map(updates.map(u => [u.id, u]));
      return prev.map(l => map.has(l.id) ? { ...l, ...map.get(l.id) } : l);
    });
  }, []);

  const findByPhone = useCallback((phone) => {
    const normalized = phone.replace(/\D/g, '');
    return leads.find(l => l.phone.replace(/\D/g, '') === normalized);
  }, [leads]);

  // ── Sync status object exposed to components ──
  const syncStatus = {
    isConnected: syncConfig.connected,
    isSyncing,
    lastSync,
    sheetUrl: syncConfig.url,
    connect: connectSheet,
    disconnect: disconnectSheet,
    pullFromSheet,
    pushToSheet,
  };

  return (
    <LeadContext.Provider value={{
      leads,
      setLeads,
      addLead,
      updateLead,
      deleteLead,
      toggleComplete,
      bulkAddLeads,
      bulkUpdateLeads,
      findByPhone,
      toast,
      showToast,
      syncStatus,
      userName,
      setUserName,
    }}>
      {children}
    </LeadContext.Provider>
  );
}

export function useLeads() {
  const ctx = useContext(LeadContext);
  if (!ctx) throw new Error('useLeads must be used inside LeadProvider');
  return ctx;
}
