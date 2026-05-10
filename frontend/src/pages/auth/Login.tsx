import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.access_token, res.data.role);
      const role = res.data.role;
      if (role === 'admin' || role === 'superadmin') navigate('/admin/elections');
      else navigate('/vote');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left Panel — hidden on mobile via CSS */}
      <div className="auth-left" style={{
        flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        padding: '48px', color: 'white',
      }}>
        <div style={{ fontSize: 64, marginBottom: 24 }}>🗳️</div>
        <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12, textAlign: 'center' }}>
          Election Management System
        </h1>
        <p style={{ fontSize: 15, opacity: 0.8, textAlign: 'center', maxWidth: 300, lineHeight: 1.6 }}>
          A secure and transparent platform for managing democratic elections.
        </p>
        <div style={{ marginTop: 48, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {['🔒 Secure & Encrypted', '📊 Real-time Results', '🏛️ Multi-constituency Support'].map(f => (
            <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, opacity: 0.9 }}>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right" style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>Welcome back</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 32 }}>Sign in to your account to continue</p>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
              padding: '12px 16px', borderRadius: 10, fontSize: 14, marginBottom: 24,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Email address
              </label>
              <input type="email" placeholder="you@example.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required
                style={{
                  width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0',
                  borderRadius: 10, fontSize: 14, background: 'white', color: '#1e293b',
                }}
              />
            </div>

            <div style={{ marginBottom: 28 }}>
              <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: '#374151', marginBottom: 6 }}>
                Password
              </label>
              <input type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required
                style={{
                  width: '100%', padding: '12px 16px', border: '1.5px solid #e2e8f0',
                  borderRadius: 10, fontSize: 14, background: 'white', color: '#1e293b',
                }}
              />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              background: loading ? '#93c5fd' : '#2563eb',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600,
            }}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 24 }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#2563eb', fontWeight: 600 }}>
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
