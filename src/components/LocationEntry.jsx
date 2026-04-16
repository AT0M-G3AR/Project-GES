/**
 * LocationEntry — Add/edit a single location with fixtures and photos.
 * FR-07 through FR-19: Room name, SqFt, zone, fixtures, photos.
 *
 * Auto-saves to localStorage on every change so data survives
 * mobile camera round-trips (iOS/Android unload the page when the
 * native camera opens, destroying React state).
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAudit } from '../hooks/useAudit.js';
import { createLocation, createFixture } from '../shared/dataModel.js';
import FixtureRow from './FixtureRow.jsx';
import PhotoCapture from './PhotoCapture.jsx';

const DRAFT_KEY = 'll88_location_draft';

/** Save draft to sessionStorage (survives camera round-trip, cleared on tab close) */
function saveDraft(auditId, loc) {
  try {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ auditId, loc }));
  } catch { /* quota exceeded — ignore */ }
}

/** Load draft from sessionStorage */
function loadDraft(auditId) {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw);
    if (draft.auditId === auditId) return draft.loc;
  } catch { /* corrupt — ignore */ }
  return null;
}

function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}

export default function LocationEntry() {
  const { auditId, locationId } = useParams();
  const navigate = useNavigate();
  const { audit, updateAudit } = useAudit(auditId);
  const isNew = !locationId || locationId === 'new';

  // Local form state
  const [loc, setLoc] = useState(null);
  const [initialized, setInitialized] = useState(false);

  // Initialize location state — check for a saved draft first (camera recovery)
  useEffect(() => {
    if (!audit || initialized) return;

    // 1. Check for a draft from a camera round-trip
    const draft = loadDraft(auditId);
    if (draft) {
      // Verify the draft matches the current location being edited
      const matchesCurrent = isNew
        ? !audit.locations.find((l) => l.id === draft.id) // draft is for a new location
        : draft.id === locationId;                          // draft matches this location

      if (matchesCurrent) {
        setLoc(draft);
        setInitialized(true);
        return;
      }
    }

    // 2. No draft — initialize normally
    if (isNew) {
      setLoc(createLocation());
    } else {
      const existing = audit.locations.find((l) => l.id === locationId);
      if (existing) {
        setLoc({ ...existing });
      }
    }
    setInitialized(true);
  }, [audit, locationId, isNew, initialized, auditId]);

  // Auto-save draft whenever loc changes (so data survives camera)
  useEffect(() => {
    if (loc && initialized) {
      saveDraft(auditId, loc);
    }
  }, [loc, auditId, initialized]);

  if (!audit || !loc) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-state__icon">⏳</div>
        <div className="empty-state__title">Loading...</div>
      </div>
    );
  }

  const isMixed = audit.buildingType === 'mixed-use';

  // ── Local updaters ─────────────────────────────
  const setField = (field) => (e) => {
    const val = e.target.type === 'number'
      ? (e.target.value === '' ? null : parseFloat(e.target.value))
      : e.target.value;
    setLoc((prev) => ({ ...prev, [field]: val }));
  };

  const addFixture = () => {
    setLoc((prev) => ({
      ...prev,
      fixtures: [...prev.fixtures, createFixture()],
    }));
  };

  const updateFixture = (idx, updated) => {
    setLoc((prev) => {
      const fixtures = [...prev.fixtures];
      fixtures[idx] = updated;
      return { ...prev, fixtures };
    });
  };

  const deleteFixture = (idx) => {
    setLoc((prev) => ({
      ...prev,
      fixtures: prev.fixtures.filter((_, i) => i !== idx),
    }));
  };

  const addPhoto = (photo) => {
    setLoc((prev) => ({
      ...prev,
      photos: [...prev.photos, { ...photo, locationId: prev.id }],
    }));
  };

  const updatePhoto = (photoId, updatedPhoto) => {
    setLoc((prev) => ({
      ...prev,
      photos: prev.photos.map((p) => (p.id === photoId ? updatedPhoto : p)),
    }));
  };

  const deletePhoto = (photoId) => {
    setLoc((prev) => ({
      ...prev,
      photos: prev.photos.filter((p) => p.id !== photoId),
    }));
  };

  // ── Save ───────────────────────────────────────
  const handleSave = () => {
    updateAudit((prev) => {
      // Prevent double-save: check if the ID already exists regardless of isNew.
      const exists = prev.locations.some((l) => l.id === loc.id);
      if (exists) {
        return {
          ...prev,
          locations: prev.locations.map((l) => (l.id === loc.id ? loc : l)),
        };
      } else {
        return { ...prev, locations: [...prev.locations, loc] };
      }
    });
    clearDraft();
    // window.location.href gives guaranteed navigation on all mobile browsers.
    // Since all data lives in localStorage the reload is safe.
    window.location.href = `/audit/${auditId}`;
  };

  // ── Cancel / Back ──────────────────────────────
  const handleBack = () => {
    clearDraft();
    window.location.href = `/audit/${auditId}`;
  };

  return (
    <div className="animate-fade-in">
      <button
        className="app-header__back"
        onClick={handleBack}
        style={{ marginBottom: '8px' }}
      >
        ← Locations
      </button>

      <h1 className="section-header">
        {isNew ? 'New Location' : (loc.name || 'Edit Location')}
      </h1>

      {/* ── Location Info ─────────────────── */}
      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="loc-name">Location Name *</label>
          <input
            id="loc-name"
            className="form-input"
            type="text"
            placeholder="e.g. Lobby, Apt 2A"
            value={loc.name}
            onChange={setField('name')}
          />
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="loc-sqft">Area SqFt</label>
          <input
            id="loc-sqft"
            className="form-input"
            type="number"
            min="0"
            placeholder="—"
            value={loc.sqFt ?? ''}
            onChange={setField('sqFt')}
          />
          <div className="form-hint">Leave blank for secondary fixture rows</div>
        </div>
      </div>

      {/* ── Zone Selector (mixed-use) ─────── */}
      {isMixed && audit.zones.length > 0 && (
        <div className="form-group">
          <label className="form-label" htmlFor="loc-zone">Zone</label>
          <select
            id="loc-zone"
            className="form-select"
            value={loc.zoneId || ''}
            onChange={(e) => setLoc((prev) => ({ ...prev, zoneId: e.target.value || null }))}
          >
            <option value="">— Select Zone —</option>
            {audit.zones.map((z, i) => (
              <option key={z.id} value={z.id}>
                {z.name || `Zone ${i + 1}`} ({z.buildingAreaType})
              </option>
            ))}
          </select>
        </div>
      )}

      <hr className="section-divider" />

      {/* ── Fixtures ──────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>
          Fixtures ({loc.fixtures.length})
        </h2>
        <button type="button" className="btn btn--ghost" onClick={addFixture}>
          + Add Fixture
        </button>
      </div>

      {loc.fixtures.length === 0 ? (
        <div className="empty-state" style={{ padding: '32px 16px' }}>
          <div className="empty-state__icon">💡</div>
          <div className="empty-state__title">No fixtures yet</div>
          <div className="empty-state__text">
            Tap "Add Fixture" to start logging lighting in this location.
          </div>
        </div>
      ) : (
        loc.fixtures.map((fix, i) => (
          <FixtureRow
            key={fix.id}
            fixture={fix}
            index={i}
            sqFt={loc.sqFt}
            onUpdate={(updated) => updateFixture(i, updated)}
            onDelete={() => deleteFixture(i)}
          />
        ))
      )}

      <hr className="section-divider" />

      {/* ── Photos ────────────────────────── */}
      <PhotoCapture
        photos={loc.photos}
        locationName={loc.name}
        onAddPhoto={addPhoto}
        onUpdatePhoto={updatePhoto}
        onDeletePhoto={deletePhoto}
      />

      <hr className="section-divider" />

      {/* ── Save Button ───────────────────── */}
      <button
        type="button"
        className="btn btn--primary btn--full btn--lg"
        onClick={handleSave}
        id="btn-save-location"
      >
        {isNew ? 'Save Location' : 'Update Location'}
      </button>
    </div>
  );
}
