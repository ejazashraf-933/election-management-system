import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const BASE = 'http://localhost:3000';

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5,
};

export default function Register() {
  const navigate = useNavigate();
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', email: '', password: '', constituencyId: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Constituencies endpoint is now public — no token needed
  useEffect(() => {
    axios.get(`${BASE}/constituencies`).then(r => setConstituencies(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.constituencyId) {
      setError('Please select your constituency. If yours is not listed, contact an admin.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post(`${BASE}/auth/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
        role: 'voter',
        constituencyId: Number(form.constituencyId),
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel */}
      <div style={{
        width: 400, flexShrink: 0,
        background: 'linear-gradient(160deg, #1e40af 0%, #7c3aed 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 48, color: 'white',
      }}>
        <div style={{
          width: 70, height: 70, borderRadius: 20,
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, marginBottom: 24,
        }}>📋</div>

        <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 10 }}>
          Voter Registration
        </h2>
        <p style={{ fontSize: 14, opacity: 0.8, textAlign: 'center', lineHeight: 1.8, maxWidth: 260 }}>
          Register to cast your vote in upcoming elections. Only voters can register here.
        </p>

        <div style={{ marginTop: 36, display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
          {[
            { icon: '🗳️', text: 'Cast your vote securely' },
            { icon: '📊', text: 'View live election results' },
            { icon: '🏛️', text: 'Represent your constituency' },
          ].map(f => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, opacity: 0.9,
              background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '10px 14px',
            }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        <div style={{
          marginTop: 28, background: 'rgba(255,255,255,0.1)', borderRadius: 12,
          padding: '14px 16px', width: '100%', fontSize: 13, opacity: 0.85, lineHeight: 1.6,
        }}>
          🏛️ Want to run? After registering as a voter, you can register as a <strong>Candidate</strong> from your dashboard.
        </div>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 10 }}>Already have an account?</p>
          <Link to="/login" style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.15)',
            color: 'white', textDecoration: 'none', borderRadius: 8,
            padding: '8px 20px', fontSize: 14, fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.3)',
          }}>
            Sign in instead
          </Link>
        </div>
      </div>

      {/* Right panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '48px 40px', background: '#f8fafc', overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>
            Create Voter Account
          </h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 28 }}>
            Fill in your details to register as a voter
          </p>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
              padding: '12px 16px', borderRadius: 10, fontSize: 14, marginBottom: 20,
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Full Name</label>
              <input style={inp} type="text" placeholder="John Doe"
                value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Email Address</label>
              <input style={inp} type="email" placeholder="you@example.com"
                value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={lbl}>Password</label>
              <input style={inp} type="password" placeholder="Minimum 6 characters"
                value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>
                Your Constituency <span style={{ color: '#dc2626' }}>*</span>
              </label>
              {constituencies.length === 0 ? (
                <div style={{
                  padding: '12px 14px', background: '#fffbeb', border: '1.5px solid #fde68a',
                  borderRadius: 10, fontSize: 13, color: '#92400e',
                }}>
                  No constituencies available yet. Register and ask an admin to assign yours.
                </div>
              ) : (
                <select style={inp} value={form.constituencyId}
                  onChange={e => setForm({ ...form, constituencyId: e.target.value })} required>
                  <option value="">-- Select your constituency --</option>
                  {constituencies.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name} — {c.province}</option>
                  ))}
                </select>
              )}
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 5 }}>
                Not sure which one? Contact an admin — they can assign it after registration.
              </p>
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: 13,
              background: loading ? '#93c5fd' : '#2563eb',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Creating account...' : 'Register as Voter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 24 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
