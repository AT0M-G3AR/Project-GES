/**
 * AuditSetup — New audit creation form.
 * FR-01 through FR-06: Address, BBL, BIN, Building Type, Area Type, Zones, Auditors.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditList } from '../hooks/useAudit.js';
import { createZone } from '../shared/dataModel.js';
import {
  BUILDING_TYPES,
  BUILDING_AREA_CATEGORIES,
  BUILDING_AREA_TYPES,
  METERING_TYPES,
} from '../shared/constants.js';

export default function AuditSetup() {
  const navigate = useNavigate();
  const { addAudit } = useAuditList();

  const [form, setForm] = useState({
    address: '',
    bbl: '',
    bin: '',
    buildingType: 'residential',
    buildingAreaType: 'Multifamily',
    meteringType: 'directly-metered',
    auditDate: new Date().toISOString().split('T')[0],
    auditorName: '',
    zones: [],
  });

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  // When buildingType changes, set a sensible default area type
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
    const audit = addAudit({
      address: form.address,
      bbl: form.bbl,
      bin: form.bin,
      buildingType: form.buildingType,
      buildingAreaType: form.buildingAreaType,
      meteringType: form.meteringType,
      auditDate: form.auditDate,
      auditors: form.auditorName ? [form.auditorName] : [],
      zones: form.zones,
    });
    navigate(`/audit/${audit.id}`);
  };

  return (
    <div className="animate-fade-in">
      <button className="app-header__back" onClick={() => navigate('/')} style={{ marginBottom: 'var(--space-4)' }}>
        ← Back
      </button>

      <h1 className="section-header">New Audit</h1>

      <form onSubmit={handleSubmit}>
        {/* ── Building Address ─────────────────── */}
        <div className="form-group">
          <label className="form-label" htmlFor="address">Building Address *</label>
          <input
            id="address"
            className="form-input"
            type="text"
            placeholder="123 Example St, New York, NY 10001"
            value={form.address}
            onChange={set('address')}
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
              placeholder="0000000000"
              value={form.bbl}
              onChange={set('bbl')}
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="bin">BIN</label>
            <input
              id="bin"
              className="form-input"
              type="text"
              placeholder="0000000"
              value={form.bin}
              onChange={set('bin')}
            />
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
          id="btn-create-audit"
        >
          Create Audit →
        </button>
      </form>
    </div>
  );
}
