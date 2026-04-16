/**
 * AuditSummary — Full summary view with LPD results, PASS/FAIL, and completeness.
 * FR-20, FR-21, FR-26 through FR-30.
 */
import { useParams, useNavigate } from 'react-router-dom';
import { useAudit } from '../hooks/useAudit.js';
import { useCalculations } from '../hooks/useCalculations.js';
import { useToast } from '../shared/ToastContext.jsx';
import {
  calcTotalWatts,
  calcZoneLPD,
  calcZoneTotalSqFt,
  getCodeAllowance,
  calcPassFail,
} from '../shared/calculations.js';

export default function AuditSummary() {
  const { auditId } = useParams();
  const navigate = useNavigate();
  const { audit, updateAudit } = useAudit(auditId);
  const { totalSqFt, buildingLPD, codeAllowance, passFailResult } = useCalculations(audit);
  const { showToast } = useToast();

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
  const isMixed = audit.buildingType === 'mixed-use';

  // Completeness
  const locsWithSqFt = locations.filter((l) => l.sqFt != null && l.sqFt > 0).length;
  const totalFixtures = locations.reduce((s, l) => s + (l.fixtures?.length || 0), 0);
  const totalPhotos = locations.reduce((s, l) => s + (l.photos?.length || 0), 0);
  const totalWatts = locations.reduce(
    (s, l) => s + (l.fixtures || []).reduce((s2, f) => s2 + calcTotalWatts(f.wattage, f.qty), 0),
    0
  );

  // Validation warnings (FR-21)
  const missingFields = [];
  locations.forEach((loc, i) => {
    if (!loc.name) missingFields.push(`Location ${i + 1}: missing name`);
    loc.fixtures?.forEach((f, j) => {
      if (!f.wattage) missingFields.push(`${loc.name || `Loc ${i + 1}`}, Fixture ${j + 1}: missing wattage`);
    });
  });

  const handleMarkComplete = () => {
    if (missingFields.length > 0) {
      const proceed = window.confirm(
        `There are ${missingFields.length} warning(s):\n\n${missingFields.slice(0, 5).join('\n')}${missingFields.length > 5 ? `\n...and ${missingFields.length - 5} more` : ''}\n\nMark complete anyway?`
      );
      if (!proceed) return;
    }
    updateAudit({ status: 'complete' });
    showToast('Audit marked as complete!');
    navigate('/');
  };

  return (
    <div className="animate-fade-in">
      <button
        className="app-header__back"
        onClick={() => navigate(`/audit/${auditId}`)}
        style={{ marginBottom: '8px' }}
      >
        ← Locations
      </button>

      <h1 className="section-header">Audit Summary</h1>

      {/* ── Building Info ─────────────────── */}
      <div className="card" style={{ marginBottom: '16px' }}>
        <div className="card__title">{audit.address || 'Untitled'}</div>
        <div className="card__subtitle">
          {audit.buildingType} · {audit.buildingAreaType}
          {audit.bbl && ` · BBL: ${audit.bbl}`}
          {audit.bin && ` · BIN: ${audit.bin}`}
        </div>
        <div className="card__meta">
          <span>📅 {audit.auditDate}</span>
          {audit.auditors?.length > 0 && <span>👤 {audit.auditors.join(', ')}</span>}
        </div>
      </div>

      {/* ── Key Metrics ───────────────────── */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card__value">{locations.length}</div>
          <div className="stat-card__label">Locations</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{totalFixtures}</div>
          <div className="stat-card__label">Fixtures</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{totalSqFt.toLocaleString()}</div>
          <div className="stat-card__label">Total SqFt</div>
        </div>
        <div className="stat-card">
          <div className="stat-card__value">{totalWatts.toLocaleString()}</div>
          <div className="stat-card__label">Total Watts</div>
        </div>
      </div>

      {/* ── LPD Result ────────────────────── */}
      <div
        className="card"
        style={{
          textAlign: 'center',
          padding: '28px 20px',
          marginBottom: '16px',
          borderColor: passFailResult === 'PASS'
            ? 'rgba(34,197,94,0.4)'
            : passFailResult === 'FAIL'
              ? 'rgba(239,68,68,0.4)'
              : 'var(--color-border)',
        }}
      >
        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
          Building LPD
        </div>
        <div style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          color: passFailResult === 'PASS'
            ? 'var(--color-pass)'
            : passFailResult === 'FAIL'
              ? 'var(--color-fail)'
              : 'var(--color-accent)',
          margin: '4px 0',
        }}>
          {buildingLPD || '—'}
        </div>
        <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          Code Allowance: <strong>{codeAllowance ?? '—'}</strong> W/SqFt
          {audit.buildingAreaType && ` (${audit.buildingAreaType})`}
        </div>
        {passFailResult && (
          <div style={{ marginTop: '12px' }}>
            <span
              className={`badge badge--${passFailResult === 'PASS' ? 'pass' : 'fail'}`}
              style={{ fontSize: '1rem', padding: '6px 20px' }}
            >
              {passFailResult}
            </span>
          </div>
        )}
      </div>

      {/* ── Per-Zone Results (mixed-use) ──── */}
      {isMixed && audit.zones?.length > 0 && (
        <>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '12px' }}>
            Zone Results
          </h2>
          {audit.zones.map((zone, i) => {
            const zoneLPD = calcZoneLPD(locations, zone.id);
            const zoneCA = getCodeAllowance(zone.buildingAreaType);
            const zonePF = calcPassFail(zoneLPD, zoneCA);
            const zoneSqFt = calcZoneTotalSqFt(locations, zone.id);

            return (
              <div key={zone.id} className="card" style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span className={`zone-label zone-label--${i % 5}`} style={{ marginBottom: '6px', display: 'inline-block' }}>
                      {zone.name || `Zone ${i + 1}`}
                    </span>
                    <div className="card__subtitle">
                      {zone.buildingAreaType} · {zoneSqFt} SqFt · LPD: {zoneLPD}
                    </div>
                  </div>
                  {zonePF && (
                    <span className={`badge badge--${zonePF === 'PASS' ? 'pass' : 'fail'}`}>
                      {zonePF}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </>
      )}

      {/* ── Completeness ──────────────────── */}
      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '12px' }}>
        📍 {locsWithSqFt}/{locations.length} locations with SqFt · 📷 {totalPhotos} photos
      </div>

      {/* ── Warnings ──────────────────────── */}
      {missingFields.length > 0 && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'rgba(245,158,11,0.08)',
          border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '10px',
          fontSize: '0.875rem',
          color: 'var(--color-warning)',
        }}>
          <strong>⚠ {missingFields.length} warning{missingFields.length !== 1 ? 's' : ''}</strong>
          <ul style={{ margin: '6px 0 0 16px', listStyle: 'disc' }}>
            {missingFields.slice(0, 5).map((w, i) => (
              <li key={i} style={{ marginBottom: '2px' }}>{w}</li>
            ))}
            {missingFields.length > 5 && (
              <li>...and {missingFields.length - 5} more</li>
            )}
          </ul>
        </div>
      )}

      <hr className="section-divider" />

      {/* ── Actions ───────────────────────── */}
      <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
        {audit.status !== 'complete' && (
          <button
            className="btn btn--primary btn--full btn--lg"
            onClick={handleMarkComplete}
            id="btn-mark-complete"
          >
            ✓ Mark Audit Complete
          </button>
        )}
        {audit.status === 'complete' && (
          <>
            <div className="badge badge--pass" style={{ textAlign: 'center', padding: '12px', fontSize: '1rem', justifyContent: 'center' }}>
              ✓ Audit Complete
            </div>
            <button
              className="btn btn--secondary btn--full"
              onClick={() => {
                const confirmed = window.confirm(
                  'Are you sure you want to reopen this audit?\n\nThis will change the status back to "in-progress".'
                );
                if (confirmed) {
                  updateAudit({ status: 'in-progress', updatedAt: Date.now() });
                  showToast('Audit reopened!');
                }
              }}
              id="btn-reopen-audit"
            >
              ↩ Reopen Audit
            </button>
          </>
        )}
        <button
          className="btn btn--secondary btn--full"
          onClick={() => navigate(`/audit/${auditId}/edit`)}
          id="btn-edit-audit"
        >
          ✏️ Edit Audit Info
        </button>
        <button
          className="btn btn--secondary btn--full"
          onClick={() => navigate(`/audit/${auditId}`)}
        >
          ← Back to Locations
        </button>
      </div>
    </div>
  );
}
