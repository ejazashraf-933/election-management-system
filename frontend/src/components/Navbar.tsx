import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabel: Record<string, string> = {
  superadmin: 'Super Admin',
  admin: 'Admin',
  chief_election_commissioner: 'Chief EC',
  district_returning_officer: 'District RO',
  returning_officer: 'Returning Officer',
  presiding_officer: 'Presiding Officer',
  polling_agent: 'Polling Agent',
  observer: 'Observer',
  voter: 'Voter',
  candidate: 'Candidate',
};

const roleIcon: Record<string, string> = {
  superadmin: '👑', admin: '🛡️',
  chief_election_commissioner: '⚖️', district_returning_officer: '🗂️',
  returning_officer: '📋', presiding_officer: '🏫',
  polling_agent: '👁️', observer: '🔍',
  voter: '👤', candidate: '🏛️',
};

const adminLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/admin/elections', label: 'Elections' },
  { to: '/admin/phases', label: 'Phases' },
  { to: '/admin/nominations', label: 'Nominations' },
  { to: '/admin/parties', label: 'Parties' },
  { to: '/admin/constituencies', label: 'Constituencies' },
  { to: '/admin/polling-stations', label: 'Polling Stations' },
  { to: '/admin/form45', label: 'Form 45' },
  { to: '/admin/reserved-seats', label: 'Reserved Seats' },
  { to: '/admin/candidates', label: 'Candidates' },
  { to: '/admin/users', label: 'Users' },
  { to: '/results', label: 'Results' },
];

const officerLinks = [
  { to: '/admin/polling-stations', label: 'Polling Stations' },
  { to: '/admin/form45', label: 'Form 45' },
  { to: '/results', label: 'Results' },
];

const observerLinks = [
  { to: '/results', label: 'Results' },
  { to: '/admin/polling-stations', label: 'Stations' },
];

const voterLinks = [
  { to: '/vote', label: 'Vote' },
  { to: '/candidates', label: 'Candidates' },
  { to: '/my-nomination', label: 'My Nomination' },
  { to: '/history', label: 'My History' },
  { to: '/results', label: 'Results' },
  { to: '/register-candidate', label: 'Run for Election' },
];

const candidateLinks = [
  { to: '/vote', label: 'Vote' },
  { to: '/candidates', label: 'Candidates' },
  { to: '/my-nomination', label: 'My Nomination' },
  { to: '/history', label: 'My History' },
  { to: '/results', label: 'Results' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role;
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const links =
    role === 'admin' || role === 'superadmin' || role === 'chief_election_commissioner' || role === 'district_returning_officer' || role === 'returning_officer'
      ? adminLinks
      : role === 'presiding_officer'
      ? officerLinks
      : role === 'observer'
      ? observerLinks
      : role === 'voter'
      ? voterLinks
      : role === 'candidate'
      ? candidateLinks
      : [];

  const homeRoute =
    role === 'admin' || role === 'superadmin' || role === 'chief_election_commissioner' || role === 'district_returning_officer' || role === 'returning_officer'
      ? '/dashboard'
      : role === 'presiding_officer'
      ? '/admin/polling-stations'
      : (role === 'voter' || role === 'candidate')
      ? '/vote'
      : '/login';

  const bar = (transform: string, opacity = 1) => ({
    width: 22, height: 2, background: '#475569', display: 'block',
    transition: 'all 0.2s', transform, opacity,
  });

  return (
    <nav style={{
      background: 'white', borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)', position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60,
      }}>
        {/* Logo */}
        <Link to={homeRoute} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
          }}>🗳️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', lineHeight: 1.2 }}>AJK EMS</div>
            <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Election System
            </div>
          </div>
        </Link>

        {/* Desktop nav */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 1, overflowX: 'auto', maxWidth: 700 }}>
            {links.map(l => {
              const active = location.pathname === l.to;
              return (
                <Link key={l.to} to={l.to} style={{
                  textDecoration: 'none', fontSize: 13, whiteSpace: 'nowrap',
                  fontWeight: active ? 600 : 400,
                  color: active ? '#2563eb' : '#475569',
                  padding: '6px 10px', borderRadius: 8,
                  background: active ? '#eff6ff' : 'transparent',
                }}>{l.label}</Link>
              );
            })}
          </div>
        )}

        {/* Right */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            {user && role && (
              <span style={{
                fontSize: 12, color: '#475569', fontWeight: 500,
                background: '#f8fafc', border: '1px solid #e2e8f0',
                padding: '4px 10px', borderRadius: 20,
                display: 'flex', alignItems: 'center', gap: 5,
              }}>
                <span>{roleIcon[role] ?? '👤'}</span>
                {roleLabel[role] ?? role}
              </span>
            )}
            {user ? (
              <button onClick={handleLogout} style={{
                fontSize: 13, background: '#fef2f2', color: '#dc2626',
                border: '1px solid #fecaca', padding: '6px 16px',
                borderRadius: 8, fontWeight: 500, cursor: 'pointer',
              }}>Logout</button>
            ) : (
              <Link to="/login" style={{
                fontSize: 13, background: '#2563eb', color: 'white',
                padding: '7px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 500,
              }}>Login</Link>
            )}
          </div>
        )}

        {/* Hamburger */}
        {isMobile && (
          <button onClick={() => setMenuOpen(o => !o)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: 8, display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            <span style={bar(menuOpen ? 'rotate(45deg) translateY(7px)' : 'none')} />
            <span style={bar('none', menuOpen ? 0 : 1)} />
            <span style={bar(menuOpen ? 'rotate(-45deg) translateY(-7px)' : 'none')} />
          </button>
        )}
      </div>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{
          background: 'white', borderTop: '1px solid #e2e8f0',
          padding: '12px 16px 20px', maxHeight: '80vh', overflowY: 'auto',
        }}>
          {user && role && (
            <div style={{
              fontSize: 13, color: '#475569', fontWeight: 600,
              marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f1f5f9',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              {roleIcon[role] ?? '👤'} {roleLabel[role] ?? role}
              {user.name && <span style={{ color: '#94a3b8', fontWeight: 400 }}>— {user.name}</span>}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {links.map(l => {
              const active = location.pathname === l.to;
              return (
                <Link key={l.to} to={l.to} style={{
                  textDecoration: 'none', fontSize: 15,
                  fontWeight: active ? 600 : 400,
                  color: active ? '#2563eb' : '#374151',
                  padding: '11px 12px', borderRadius: 8,
                  background: active ? '#eff6ff' : 'transparent',
                }}>{l.label}</Link>
              );
            })}
            {user ? (
              <button onClick={handleLogout} style={{
                marginTop: 10, fontSize: 14, background: '#fef2f2', color: '#dc2626',
                border: '1px solid #fecaca', padding: '11px 16px',
                borderRadius: 8, fontWeight: 500, cursor: 'pointer', textAlign: 'left',
              }}>Logout</button>
            ) : (
              <Link to="/login" style={{
                marginTop: 10, fontSize: 14, background: '#2563eb', color: 'white',
                padding: '11px 16px', borderRadius: 8, textDecoration: 'none',
                fontWeight: 600, display: 'block', textAlign: 'center',
              }}>Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
