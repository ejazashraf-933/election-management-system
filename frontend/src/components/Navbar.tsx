import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roleLabel: Record<string, string> = {
  superadmin: '👑 Super Admin',
  admin: '🛡️ Admin',
  voter: '👤 Voter',
  candidate: '🏛️ Candidate',
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const role = user?.role;

  const handleLogout = () => { logout(); navigate('/login'); };

  const adminLinks = [
    { to: '/admin/elections', label: 'Elections' },
    { to: '/admin/parties', label: 'Parties' },
    { to: '/admin/constituencies', label: 'Constituencies' },
    { to: '/admin/candidates', label: 'Candidates' },
    { to: '/admin/users', label: 'Users' },
    { to: '/results', label: 'Results' },
  ];

  const voterLinks = [
    { to: '/vote', label: 'Vote' },
    { to: '/candidates', label: 'Candidates' },
    { to: '/history', label: 'My History' },
    { to: '/results', label: 'Results' },
    { to: '/register-candidate', label: 'Register as Candidate' },
  ];

  const candidateLinks = [
    { to: '/vote', label: 'Vote' },
    { to: '/candidates', label: 'Candidates' },
    { to: '/history', label: 'My History' },
    { to: '/results', label: 'Results' },
  ];

  const links = role === 'admin' || role === 'superadmin' ? adminLinks
    : role === 'voter' ? voterLinks
    : role === 'candidate' ? candidateLinks : [];

  // If logged in, logo goes to dashboard — not /login
  const homeRoute = role === 'admin' || role === 'superadmin'
    ? '/admin/elections'
    : role === 'voter' || role === 'candidate'
    ? '/vote'
    : '/login';

  return (
    <nav style={{
      background: 'white',
      borderBottom: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1100,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
      }}>
        {/* Logo */}
        <Link to={homeRoute} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 36, height: 36, background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🗳️</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#0f172a', lineHeight: 1.2 }}>EMS</div>
            <div style={{ fontSize: 10, color: '#94a3b8', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Election System
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {links.map(l => {
            const active = location.pathname === l.to;
            return (
              <Link key={l.to} to={l.to} style={{
                textDecoration: 'none',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                color: active ? '#2563eb' : '#475569',
                padding: '6px 12px',
                borderRadius: 8,
                background: active ? '#eff6ff' : 'transparent',
                transition: 'all 0.15s',
              }}>
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user && role && (
            <span className="nav-role-label" style={{
              fontSize: 12, color: '#475569', fontWeight: 500,
              background: '#f8fafc', border: '1px solid #e2e8f0',
              padding: '4px 10px', borderRadius: 20,
            }}>
              {roleLabel[role] ?? role}
            </span>
          )}
          {user ? (
            <button onClick={handleLogout} style={{
              fontSize: 13, background: '#fef2f2', color: '#dc2626',
              border: '1px solid #fecaca', padding: '6px 16px',
              borderRadius: 8, fontWeight: 500,
            }}>
              Logout
            </button>
          ) : (
            <Link to="/login" style={{
              fontSize: 13, background: '#2563eb', color: 'white',
              padding: '7px 16px', borderRadius: 8, textDecoration: 'none', fontWeight: 500,
            }}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
