/**
 * App.jsx — Root Application Component
 * Single Vite React app serving mobile + dashboard views via routing.
 */
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import AuditListPage from './components/AuditListPage.jsx';
import AuditSetup from './components/AuditSetup.jsx';
import AuditEdit from './components/AuditEdit.jsx';
import LocationList from './components/LocationList.jsx';
import LocationEntry from './components/LocationEntry.jsx';
import AuditSummary from './components/AuditSummary.jsx';

export default function App() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <>
      {/* ── App Header ─────────────────────────────── */}
      <header className="app-header">
        <img src="/favicon.svg" alt="LL88" className="app-header__logo" />
        <div>
          <div className="app-header__title">LL88 Audit Tool</div>
          <div className="app-header__subtitle">Gaia Energy Solutions</div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────── */}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<AuditListPage />} />
          <Route path="/audit/new" element={<AuditSetup />} />
          <Route path="/audit/:auditId/edit" element={<AuditEdit />} />
          <Route path="/audit/:auditId" element={<LocationList />} />
          <Route path="/audit/:auditId/location/new" element={<LocationEntry />} />
          <Route path="/audit/:auditId/location/:locationId" element={<LocationEntry />} />
          <Route path="/audit/:auditId/summary" element={<AuditSummary />} />
        </Routes>
      </main>
    </>
  );
}
