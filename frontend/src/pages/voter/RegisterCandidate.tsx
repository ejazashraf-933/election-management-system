import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white',
  boxSizing: 'border-box',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5,
};

export default function RegisterCandidate() {
  const { user, updateRole } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [parties, setParties] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [form, setForm] = useState({ constituencyId: '', partyId: '', isIndependent: false });
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoHover, setPhotoHover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    Promise.all([api.get('/parties'), api.get('/constituencies')]).then(([p, c]) => {
      setParties(p.data);
      setConstituencies(c.data);
      // Pre-fill constituency from user profile if available
      if (user?.constituency?.id) {
        setForm(f => ({ ...f, constituencyId: String(user.constituency.id) }));
      }
    });
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('constituencyId', form.constituencyId);
      if (!form.isIndependent && form.partyId) fd.append('partyId', form.partyId);
      fd.append('isIndependent', String(form.isIndependent));
      if (photoFile) fd.append('photo', photoFile);

      await api.post('/candidates/self', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update role in context/localStorage so navbar switches to candidate links
      toast('You are now registered as a candidate!', 'success');
      updateRole('candidate');
      navigate('/vote');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const initial = user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div style={{ maxWidth: 520, margin: '40px auto', padding: '0 24px' }}>
      {/* Card */}
      <div style={{
        background: 'white', borderRadius: 20,
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        border: '1px solid #e2e8f0', overflow: 'hidden',
      }}>
        {/* Gradient header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
          padding: '32px 24px 56px',
          textAlign: 'center', position: 'relative',
        }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'white', marginBottom: 6 }}>
            Register as Candidate
          </h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
            Join the election — upload your photo and select your party
          </p>
        </div>

        {/* Profile photo overlapping header */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: -52 }}>
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => photoInputRef.current?.click()}
              onMouseEnter={() => setPhotoHover(true)}
              onMouseLeave={() => setPhotoHover(false)}
              style={{
                width: 104, height: 104, borderRadius: '50%',
                border: '4px solid white',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                cursor: 'pointer', overflow: 'hidden', position: 'relative',
                background: photoPreview ? 'transparent' : 'linear-gradient(135deg, #1e40af, #7c3aed)',
              }}
            >
              {photoPreview
                ? <img src={photoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                : <div style={{
                    width: '100%', height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 38, fontWeight: 700, color: 'white',
                  }}>{initial}</div>
              }
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: photoHover ? 1 : 0, transition: 'opacity 0.15s', fontSize: 28,
              }}>📷</div>
            </div>
            <div
              onClick={() => photoInputRef.current?.click()}
              style={{
                position: 'absolute', bottom: 2, right: 2,
                width: 30, height: 30, borderRadius: '50%',
                background: '#2563eb', border: '2px solid white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', fontSize: 14,
              }}
            >📷</div>
          </div>
          <input type="file" ref={photoInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
          {photoFile ? `Selected: ${photoFile.name}` : 'Click to upload your candidate photo'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '16px 28px 28px' }}>
          {/* Logged in as */}
          <div style={{
            background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
            padding: '12px 16px', marginBottom: 18, fontSize: 13, color: '#475569',
          }}>
            Registering as: <strong style={{ color: '#0f172a' }}>{user?.name}</strong>
            <span style={{ marginLeft: 8, color: '#94a3b8' }}>({user?.email})</span>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Constituency</label>
            <select style={inp} value={form.constituencyId}
              onChange={e => setForm({ ...form, constituencyId: e.target.value })} required>
              <option value="">Select your constituency</option>
              {constituencies.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name} — {c.province}</option>
              ))}
            </select>
            {user?.constituency && (
              <p style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                Your registered constituency: {user.constituency.name}
              </p>
            )}
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={lbl}>Political Party <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
            <select
              style={{ ...inp, opacity: form.isIndependent ? 0.5 : 1 }}
              value={form.partyId}
              onChange={e => setForm({ ...form, partyId: e.target.value })}
              disabled={form.isIndependent}
            >
              <option value="">No party — select below if independent</option>
              {parties.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} — {p.leaderName}</option>
              ))}
            </select>
          </div>

          <label style={{
            display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer',
            fontSize: 14, color: '#374151', fontWeight: 500,
            background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 10,
            padding: '11px 14px', marginBottom: 20,
          }}>
            <input
              type="checkbox"
              checked={form.isIndependent}
              onChange={e => setForm({ ...form, isIndependent: e.target.checked, partyId: '' })}
              style={{ width: 16, height: 16, accentColor: '#2563eb' }}
            />
            Stand as an Independent Candidate
          </label>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
              borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16,
            }}>{error}</div>
          )}

          <button type="submit" disabled={saving} style={{
            width: '100%', padding: '13px', background: saving ? '#93c5fd' : '#2563eb',
            color: 'white', border: 'none', borderRadius: 10,
            fontSize: 15, fontWeight: 600,
          }}>
            {saving ? 'Registering...' : 'Register as Candidate'}
          </button>

          <button type="button" onClick={() => navigate(-1)} style={{
            width: '100%', marginTop: 10, padding: '11px',
            background: '#f8fafc', color: '#475569',
            border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14,
          }}>
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
