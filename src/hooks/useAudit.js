/**
 * useAudit — Local-storage-backed audit CRUD operations.
 * Demo mode: persists all data to localStorage instead of Firebase.
 *
 * Uses a simple module-level cache + storage events to keep
 * multiple components in sync without React context overhead.
 */
import { useState, useEffect, useCallback, useSyncExternalStore } from 'react';
import { createAudit } from '../shared/dataModel.js';
import { recalcAudit } from '../shared/calculations.js';

const STORAGE_KEY = 'll88_audits';

// ── Module-level store ────────────────────────────────────
let _cache = null;
const _listeners = new Set();

function notify() {
  _listeners.forEach((fn) => fn());
}

function _readFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function getAudits() {
  if (_cache === null) {
    _cache = _readFromStorage();
  }
  return _cache;
}

function setAudits(audits) {
  _cache = audits;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(audits));
  notify();
}

function subscribe(listener) {
  _listeners.add(listener);
  return () => _listeners.delete(listener);
}

// ── Keep cache fresh on app/tab switch ────────────────────
// Prevents data loss when user switches to another app and returns
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      _cache = _readFromStorage();
      notify();
    }
  });
}

// Cross-tab sync: pick up changes made in other browser tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      _cache = e.newValue ? JSON.parse(e.newValue) : [];
      notify();
    }
  });
}

// ── useAuditList ──────────────────────────────────────────
// Returns the full list of audits + add/delete operations.
export function useAuditList() {
  const audits = useSyncExternalStore(subscribe, getAudits, getAudits);

  const addAudit = useCallback((data) => {
    const audit = recalcAudit(createAudit(data));
    setAudits([audit, ...getAudits()]);
    return audit;
  }, []);

  const deleteAudit = useCallback((auditId) => {
    setAudits(getAudits().filter((a) => a.id !== auditId));
  }, []);

  return { audits, addAudit, deleteAudit };
}

// ── useAudit ──────────────────────────────────────────────
// Returns a single audit by ID + update function.
export function useAudit(auditId) {
  const audits = useSyncExternalStore(subscribe, getAudits, getAudits);
  const audit = audits.find((a) => a.id === auditId) || null;

  const updateAudit = useCallback(
    (updater) => {
      const all = getAudits();
      const idx = all.findIndex((a) => a.id === auditId);
      if (idx < 0) return;

      const current = all[idx];
      const updated = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
      const recalced = recalcAudit(updated);

      const next = [...all];
      next[idx] = recalced;
      setAudits(next);
    },
    [auditId]
  );

  return { audit, updateAudit };
}
