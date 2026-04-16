/**
 * AuditEdit — Edit an existing audit's info (address, BBL, BIN, building type, etc.)
 * Works for both in-progress and completed audits.
 */
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAudit } from '../hooks/useAudit.js';
import { createZone } from '../shared/dataModel.js';
import AddressAutocomplete from './AddressAutocomplete.jsx';
import {
  BUILDING_TYPES,
  BUILDING_AREA_CATEGORIES,
  BUILDING_AREA_TYPES,
  METERING_TYPES,
} from '../shared/constants.js';

// NYC GeoClient API — auto-populates BBL/BIN from address
const GEOCLIENT_APP_ID = import.meta.env.VITE_NYC_GEOCLIENT_APP_ID || '';
const GEOCLIENT_APP_KEY = import.meta.env.VITE_NYC_GEOCLIENT_APP_KEY || '';

async function lookupBblBin(houseNumber, street, borough) {
  if (!GEOCLIENT_APP_ID || !GEOCLIENT_APP_KEY) return null;
  try {
    const params = new URLSearchParams({
      houseNumber,
      street,
      borough,
      app_id: GEOCLIENT_APP_ID,
      app_key: GEOCLIENT_APP_KEY,
    });
    const res = await fetch(`https://api.nyc.gov/geo/geoclient/v1/address.json?${params}`);
    const data = await res.json();
    const result = data?.address;
    if (result) {
      return {
        bbl: result.bbl || '',
        bin: result.buildingIdentificationNumber || '',
      };
    }
  } catch { /* silent fallback */ }
  return null;
}

/** Strip non-numeric, non-hyphen characters from BBL/BIN inputs */
function sanitizeBblBin(value) {
  return value.replace(/[^0-9-]/g, '');
}

export default function AuditEdit() {
  const { auditId } = useParams();
  const navigate = useNavigate();
  const { audit, updateAudit } = useAudit(auditId);

  const [form, setForm] = useState(null);

  // Initialize form from audit data
  useEffect(() => {
    if (audit && !form) {
      setForm({
        address: audit.address || '',
        bbl: audit.bbl || '',
        bin: audit.bin || '',
        buildingType: audit.buildingType || 'residential',
        buildingAreaType: audit.buildingAreaType || 'Multifamily',
        meteringType: audit.meteringType || 'directly-metered',
        auditDate: audit.auditDate || new Date().toISOString().split('T')[0],
        auditorName: audit.auditors?.[0] || '',
        zones: audit.zones || [],
      });
    }
  }, [audit]);

  if (!audit) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-state__icon">🔍</div>
        <div className="empty-state__title">Audit not found</div>
        <button className="btn btn--primary" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  if (!form) return null;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const setBblBin = (field) => (e) => {
    const cleaned = sanitizeBblBin(e.target.value);
    setForm((f) => ({ ...f, [field]: cleaned }));
  };

  const handleAddressSelect = async (placeData) => {
    if (!placeData?.components) return;
    const comps = placeData.components;
    const streetNumber = comps.find(c => c.types.includes('street_number'))?.long_name || '';
    const route = comps.find(c => c.types.includes('route'))?.long_name || '';
    const borough = comps.find(c => c.types.includes('sublocality_level_1') || c.types.includes('sublocality'))?.long_name || '';
    if (streetNumber && route && borough) {
      const result = await lookupBblBin(streetNumber, route, borough);
      if (result) {
        setForm((f) => ({
          ...f,
          bbl: result.bbl || f.bbl,
          bin: result.bin || f.bin,
        }));
      }
    }
  };

  const handleBuildingTypeChange = (e) => {
    const bt = e.target.value;
    let defaultArea = 'Multifamily';
    if (bt === 'non-residential') defaultArea = 'Office';
    if (bt === 'mixed-use') defaultArea = '';
    setForm((f) => ({
      ...f,
      buildingType: bt,
      buildingAreaType: defaultArea,
      zones: bt === 'mixed-use' && f.zones.length === 0
        ? [createZone({ name: 'Zone 1', buildingAreaType: 'Multifamily' }),
           createZone({ name: 'Zone 2', buildingAreaType: 'Office' })]
        : bt !== 'mixed-use'
          ? []
          : f.zones,
    }));
  };

  const addZone = () => {
    setForm((f) => ({
      ...f,
      zones: [...f.zones, createZone({ name: `Zone ${f.zones.length + 1}` })],
    }));
  };

  const updateZone = (idx, field, value) => {
    setForm((f) => {
      const zones = [...f.zones];
      zones[idx] = { ...zones[idx], [field]: value };
      return { ...f, zones };
    });
  };

  const removeZone = (idx) => {
    setForm((f) => ({
      ...f,
      zones: f.zones.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateAudit({
      address: form.address,
      bbl: form.bbl,
      bin: form.bin,
      buildingType: form.buildingType,
      buildingAreaType: form.buildingAreaType,
      meteringType: form.meteringType,
      auditDate: form.auditDate,
      auditors: form.auditorName ? [form.auditorName] : [],
      zones: form.zones,
      updatedAt: Date.now(),
    });
    navigate(`/audit/${auditId}`);
  };

  return (
    <div className="animate-fade-in">
      <button className="app-header__back" onClick={() => navigate(`/audit/${auditId}`)} style={{ marginBottom: 'var(--space-4)' }}>
        ← Back
      </button>

      <h1 className="section-header">Edit Audit Info</h1>

      {audit.status === 'complete' && (
        <div style={{
          marginBottom: '16px',
          padding: '10px 14px',
          background: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '10px',
          fontSize: '0.875rem',
          color: 'var(--color-accent)',
        }}>
          ℹ️ This audit is marked as <strong>complete</strong>. You can still edit its information.
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* ── Building Address ─────────────────── */}
        <div className="form-group">
          <label className="form-label" htmlFor="address">Building Address *</label>
          <AddressAutocomplete
            id="address"
            value={form.address}
            onChange={set('address')}
            onSelect={handleAddressSelect}
            required
            autoFocus
          />
        </div>

        {/* ── BBL / BIN ────────────────────────── */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="bbl">BBL</label>
            <input
              id="bbl"
              className="form-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9\-]*"
              placeholder="1-23456-7890"
              value={form.bbl}
              onChange={setBblBin('bbl')}
            />
            <div className="form-hint">Numbers and hyphens only</div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="bin">BIN</label>
            <input
              id="bin"
              className="form-input"
              type="text"
              inputMode="numeric"
              pattern="[0-9\-]*"
              placeholder="1234567"
              value={form.bin}
              onChange={setBblBin('bin')}
            />
            <div className="form-hint">Numbers and hyphens only</div>
          </div>
        </div>

        {/* ── Building Type ────────────────────── */}
        <div className="form-group">
          <label className="form-label" htmlFor="buildingType">Building Type *</label>
          <select
            id="buildingType"
            className="form-select"
            value={form.buildingType}
            onChange={handleBuildingTypeChange}
          >
            {BUILDING_TYPES.map((bt) => (
              <option key={bt} value={bt}>
                {bt.charAt(0).toUpperCase() + bt.slice(1)}
              </option>
            ))}
          </select>
          <div className="form-hint">
            Drives LPD threshold lookup for PASS/FAIL determination.
          </div>
        </div>

        {/* ── Building Area Type (non-mixed) ───── */}
        {form.buildingType !== 'mixed-use' && (
          <div className="form-group">
            <label className="form-label" htmlFor="buildingAreaType">Building Area Type *</label>
            <select
              id="buildingAreaType"
              className="form-select"
              value={form.buildingAreaType}
              onChange={set('buildingAreaType')}
            >
              {Object.entries(BUILDING_AREA_CATEGORIES).map(([cat, types]) => (
                <optgroup key={cat} label={cat}>
                  {types.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        )}

        {/* ── Mixed-Use Zone Definitions ────────── */}
        {form.buildingType === 'mixed-use' && (
          <div className="form-group">
            <label className="form-label">Space Zones</label>
            <div className="form-hint" style={{ marginBottom: '12px' }}>
              Define separate zones with their own building area types.
            </div>
            {form.zones.map((zone, idx) => (
              <div key={zone.id} className="fixture-row" style={{ marginBottom: '12px' }}>
                <div className="fixture-row__header">
                  <span className={`zone-label zone-label--${idx % 5}`}>
                    Zone {idx + 1}
                  </span>
                  {form.zones.length > 2 && (
                    <button
                      type="button"
                      className="delete-icon-btn"
                      onClick={() => removeZone(idx)}
                    >
                      ✕
                    </button>
                  )}
                </div>
                <div className="fixture-row__grid">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Zone Name</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder={`e.g. Residential Floors`}
                      value={zone.name}
                      onChange={(e) => updateZone(idx, 'name', e.target.value)}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Area Type</label>
                    <select
                      className="form-select"
                      value={zone.buildingAreaType}
                      onChange={(e) => updateZone(idx, 'buildingAreaType', e.target.value)}
                    >
                      {BUILDING_AREA_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn btn--secondary btn--full"
              onClick={addZone}
            >
              + Add Zone
            </button>
          </div>
        )}

        {/* ── Metering ─────────────────────────── */}
        <div className="form-group">
          <label className="form-label" htmlFor="meteringType">Metering Type</label>
          <select
            id="meteringType"
            className="form-select"
            value={form.meteringType}
            onChange={set('meteringType')}
          >
            {METERING_TYPES.map((mt) => (
              <option key={mt} value={mt}>
                {mt.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        {/* ── Date & Auditor ───────────────────── */}
        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="auditDate">Audit Date</label>
            <input
              id="auditDate"
              className="form-input"
              type="date"
              value={form.auditDate}
              onChange={set('auditDate')}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="auditorName">Auditor Name</label>
            <input
              id="auditorName"
              className="form-input"
              type="text"
              placeholder="Your name"
              value={form.auditorName}
              onChange={set('auditorName')}
            />
          </div>
        </div>

        <hr className="section-divider" />

        <button
          type="submit"
          className="btn btn--primary btn--full btn--lg"
          id="btn-save-audit"
        >
          💾 Save Changes
        </button>
      </form>
    </div>
  );
}
