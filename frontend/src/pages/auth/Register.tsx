import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white',
  boxSizing: 'border-box',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5,
};

export default function Register() {
  const navigate = useNavigate();
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    cnic: '', dateOfBirth: '', phone: '',
    domicileDistrict: '', isAJKResident: false, constituencyId: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get(`${BASE}/constituencies`).then(r => setConstituencies(r.data)).catch(() => {});
  }, []);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const formatCnic = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 13);
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.constituencyId) {
      setError('Please select your constituency.');
      return;
    }
    if (form.cnic && form.cnic.length !== 15) {
      setError('CNIC must be in format XXXXX-XXXXXXX-X (13 digits).');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await axios.post(`${BASE}/auth/register`, {
        name: form.name,
        email: form.email,
        password: form.password,
        constituencyId: Number(form.constituencyId),
        ...(form.cnic && { cnic: form.cnic }),
        ...(form.dateOfBirth && { dateOfBirth: form.dateOfBirth }),
        ...(form.phone && { phone: form.phone }),
        ...(form.domicileDistrict && { domicileDistrict: form.domicileDistrict }),
        isAJKResident: form.isAJKResident,
      });
      navigate('/login');
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg.join(', ') :
        msg === 'Email already registered' ? 'An account with this email already exists.' :
        msg === 'CNIC already registered' ? 'This CNIC is already registered.' :
        msg || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const ajkDistricts = [
    'Muzaffarabad', 'Mirpur', 'Kotli', 'Rawalakot (Poonch)',
    'Bagh', 'Neelum', 'Haveli', 'Hattian Bala', 'Sudhnoti',
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>
      {/* Left panel */}
      <div className="auth-left" style={{
        width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(160deg, #1e40af 0%, #7c3aed 100%)',
        padding: 48, color: 'white',
      }}>
        <div style={{
          width: 70, height: 70, borderRadius: 20,
          background: 'rgba(255,255,255,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 36, marginBottom: 24,
        }}>📋</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 10 }}>
          AJK Voter Registration
        </h2>
        <p style={{ fontSize: 14, opacity: 0.8, textAlign: 'center', lineHeight: 1.8, maxWidth: 260 }}>
          Register with your CNIC to participate in Azad Kashmir elections.
        </p>
        <div style={{ marginTop: 32, display: 'flex', flexDirection: 'column', gap: 14, width: '100%' }}>
          {[
            { icon: '🪪', text: 'CNIC-verified voter identity' },
            { icon: '🗳️', text: 'Cast your vote securely' },
            { icon: '📊', text: 'Live election results' },
            { icon: '🏛️', text: '53-seat Assembly elections' },
          ].map(f => (
            <div key={f.text} style={{
              display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, opacity: 0.9,
              background: 'rgba(255,255,255,0.08)', borderRadius: 10, padding: '9px 13px',
            }}>
              <span style={{ fontSize: 18 }}>{f.icon}</span>
              <span>{f.text}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 10 }}>Already registered?</p>
          <Link to="/login" style={{
            display: 'inline-block', background: 'rgba(255,255,255,0.15)',
            color: 'white', textDecoration: 'none', borderRadius: 8,
            padding: '8px 20px', fontSize: 14, fontWeight: 500,
            border: '1px solid rgba(255,255,255,0.3)',
          }}>Sign in</Link>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right" style={{
        flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
        background: '#f8fafc', overflowY: 'auto', padding: '40px 24px',
      }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Create Voter Account</h2>
          <p style={{ fontSize: 14, color: '#64748b', marginBottom: 24 }}>
            Fill in your details to register as an AJK voter
          </p>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
              padding: '12px 16px', borderRadius: 10, fontSize: 14, marginBottom: 20,
            }}>{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Section: Personal Info */}
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
              Personal Information
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={lbl}>Full Name <span style={{ color: '#dc2626' }}>*</span></label>
                <input style={inp} placeholder="Muhammad Ali" value={form.name}
                  onChange={e => set('name', e.target.value)} required />
              </div>
              <div>
                <label style={lbl}>Phone Number</label>
                <input style={inp} placeholder="03xx-xxxxxxx" value={form.phone}
                  onChange={e => set('phone', e.target.value)} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={lbl}>CNIC <span style={{ color: '#64748b', fontWeight: 400 }}>(optional)</span></label>
                <input style={inp} placeholder="XXXXX-XXXXXXX-X" value={form.cnic}
                  onChange={e => set('cnic', formatCnic(e.target.value))} maxLength={15} />
              </div>
              <div>
                <label style={lbl}>Date of Birth</label>
                <input style={inp} type="date" value={form.dateOfBirth}
                  onChange={e => set('dateOfBirth', e.target.value)} />
              </div>
            </div>

            {/* Section: Location */}
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10, marginTop: 6 }}>
              Location & Domicile
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Domicile District</label>
              <select style={inp} value={form.domicileDistrict}
                onChange={e => set('domicileDistrict', e.target.value)}>
                <option value="">-- Select district --</option>
                {ajkDistricts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={{ ...lbl, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isAJKResident}
                  onChange={e => set('isAJKResident', e.target.checked)}
                  style={{ width: 16, height: 16, accentColor: '#2563eb' }} />
                I am an AJK resident / domicile holder
              </label>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={lbl}>Your Constituency <span style={{ color: '#dc2626' }}>*</span></label>
              {constituencies.length === 0 ? (
                <div style={{
                  padding: '12px 14px', background: '#fffbeb', border: '1.5px solid #fde68a',
                  borderRadius: 10, fontSize: 13, color: '#92400e',
                }}>No constituencies yet — ask an admin to add them.</div>
              ) : (
                <select style={inp} value={form.constituencyId}
                  onChange={e => set('constituencyId', e.target.value)} required>
                  <option value="">-- Select constituency --</option>
                  {constituencies.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.seatNumber ? `[${c.seatNumber}] ` : ''}{c.name} — {c.district || c.province}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Section: Account */}
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 10 }}>
              Account Credentials
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>Email Address <span style={{ color: '#dc2626' }}>*</span></label>
              <input style={inp} type="email" placeholder="you@example.com" value={form.email}
                onChange={e => set('email', e.target.value)} required />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={lbl}>Password <span style={{ color: '#dc2626' }}>*</span></label>
              <input style={inp} type="password" placeholder="Minimum 6 characters" value={form.password}
                onChange={e => set('password', e.target.value)} required minLength={6} />
            </div>

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: 13,
              background: loading ? '#93c5fd' : '#2563eb',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Registering...' : 'Register as Voter'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 20 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#2563eb', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
