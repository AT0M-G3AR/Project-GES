/**
 * LocationList — Shows all locations/rooms for a single audit.
 * FR-07, FR-10: Room list, add/reorder/delete, navigate to entry.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useAudit } from '../hooks/useAudit.js';
import { useCalculations } from '../hooks/useCalculations.js';
import { calcTotalWatts } from '../shared/calculations.js';

export default function LocationList() {
  const { auditId } = useParams();
  const navigate = useNavigate();
  const { audit, updateAudit } = useAudit(auditId);
  const { totalSqFt, buildingLPD, codeAllowance, passFailResult } = useCalculations(audit);

  if (!audit) {
    return (
      <div className="empty-state animate-fade-in">
        <div className="empty-state__icon">🔍</div>
        <div className="empty-state__title">Audit not found</div>
        <button className="btn btn--primary" onClick={() => navigate('/')}>Go Home</button>
      </div>
    );
  }

  const locations = audit.locations || [];

  // FR-20: Completeness indicator
  const locsWithSqFt = locations.filter((l) => l.sqFt != null && l.sqFt > 0).length;
  const completionPct = locations.length > 0
    ? Math.round((locsWithSqFt / locations.length) * 100)
    : 0;

  const deleteLocation = (locId) => {
    updateAudit((prev) => ({
      ...prev,
      locations: prev.locations.filter((l) => l.id !== locId),
    }));
  };

  return (
    <div className="animate-fade-in">
      {/* Back + Title */}
      <button className="app-header__back" onClick={() => navigate('/')} style={{ marginBottom: '8px' }}>
        ← Audits
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div>
          <h1 className="section-header" style={{ marginBottom: '4px' }}>
            {audit.address || 'Untitled'}
          </h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            {audit.buildingType} · {audit.buildingAreaType}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
          <button
            className="btn btn--secondary"
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            onClick={() => navigate(`/audit/${auditId}/edit`)}
            title="Edit Audit Info"
          >
            ✏️ Edit
          </button>
          {passFailResult && (
            <span className={`badge badge--${passFailResult === 'PASS' ? 'pass' : 'fail'}`}>
              {passFailResult}
            </span>
          )}
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__value">{locations.length}</div>
          <div className="stat-card__label">Locations</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{totalSqFt.toLocaleString()}</div>
          <div className="stat-card__label">Total SqFt</div>
        </div>
        <div className={`stat-card ${passFailResult === 'PASS' ? 'stat-card--pass' : passFailResult === 'FAIL' ? 'stat-card--fail' : ''}`}>
          <div className="stat-card__value">{buildingLPD || '—'}</div>
          <div className="stat-card__label">Building LPD</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{codeAllowance ?? '—'}</div>
          <div className="stat-card__label">Code Allow.</div>
        </div>
      </div>

      {/* Completeness */}
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '4px' }}>
        {locsWithSqFt} / {locations.length} locations with SqFt ({completionPct}%)
      </div>
      <div className="progress-bar" style={{ marginBottom: '20px' }}>
        <div className="progress-bar__fill" style={{ width: `${completionPct}%` }} />
      </div>

      {/* ── Location Cards ─────────────────── */}
      {locations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">🏠</div>
          <div className="empty-state__title">No locations yet</div>
          <div className="empty-state__text">
            Tap + to add rooms, halls, or other areas in this building.
          </div>
        </div>
      ) : (
        locations.map((loc, i) => {
          const locWatts = (loc.fixtures || []).reduce(
            (s, f) => s + calcTotalWatts(f.wattage, f.qty), 0
          );
          const zone = audit.zones?.find((z) => z.id === loc.zoneId);

          return (
            <div
              key={loc.id}
              className="card card--clickable animate-slide-up"
              style={{ animationDelay: `${i * 50}ms` }}
              onClick={() => navigate(`/audit/${auditId}/location/${loc.id}`)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div className="card__title">{loc.name || `Location ${i + 1}`}</div>
                  <div className="card__subtitle">
                    {loc.sqFt ? `${loc.sqFt} sq ft` : 'No SqFt'} ·
                    {' '}{(loc.fixtures || []).length} fixture{(loc.fixtures || []).length !== 1 ? 's' : ''} ·
                    {' '}{locWatts}W
                  </div>
                </div>
                <button
                  className="delete-icon-btn"
                  onClick={(e) => { e.stopPropagation(); deleteLocation(loc.id); }}
                  title="Delete location"
                >
                  ✕
                </button>
              </div>
              {zone && (
                <div style={{ marginTop: '8px' }}>
                  <span className={`zone-label zone-label--${audit.zones.indexOf(zone) % 5}`}>
                    {zone.name}
                  </span>
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ── Summary Button ─────────────────── */}
      {locations.length > 0 && (
        <button
          className="btn btn--secondary btn--full"
          style={{ marginTop: '16px' }}
          onClick={() => navigate(`/audit/${auditId}/summary`)}
        >
          View Full Summary →
        </button>
      )}

      {/* ── FAB: Add Location ──────────────── */}
      <button
        className="fab"
        onClick={() => navigate(`/audit/${auditId}/location/new`)}
        title="Add Location"
        id="btn-add-location"
      >
        +
      </button>
    </div>
  );
}
