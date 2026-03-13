/**
 * AuditListPage — Home screen showing all audits with create button.
 */
import { useNavigate } from 'react-router-dom';
import { useAuditList } from '../hooks/useAudit.js';

export default function AuditListPage() {
  const { audits, deleteAudit } = useAuditList();
  const navigate = useNavigate();

  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-5)' }}>
        <h1 className="section-header" style={{ marginBottom: 0 }}>Audits</h1>
        <span className="badge badge--status">{audits.length} total</span>
      </div>

      {audits.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state__icon">📋</div>
          <div className="empty-state__title">No audits yet</div>
          <div className="empty-state__text">
            Tap the + button to create your first LL88 lighting audit.
          </div>
        </div>
      ) : (
        audits.map((audit, i) => (
          <div
            key={audit.id}
            className="card card--clickable animate-slide-up"
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => navigate(`/audit/${audit.id}`)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div className="card__title">{audit.address || 'Untitled Audit'}</div>
                <div className="card__subtitle">
                  {audit.buildingType} · {audit.buildingAreaType}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {audit.passFailResult && (
                  <span className={`badge badge--${audit.passFailResult === 'PASS' ? 'pass' : 'fail'}`}>
                    {audit.passFailResult}
                  </span>
                )}
                <span className={`badge badge--${audit.status === 'complete' ? 'pass' : 'pending'}`}>
                  {audit.status}
                </span>
              </div>
            </div>
            <div className="card__meta">
              <span>📍 {audit.locations?.length || 0} locations</span>
              <span>📅 {audit.auditDate}</span>
              {audit.buildingLPD > 0 && (
                <span>⚡ LPD {audit.buildingLPD}</span>
              )}
            </div>
          </div>
        ))
      )}

      <button
        className="fab"
        onClick={() => navigate('/audit/new')}
        title="New Audit"
        id="btn-new-audit"
      >
        +
      </button>
    </div>
  );
}
