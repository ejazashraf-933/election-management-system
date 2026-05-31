import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  setup:             { bg: '#f8fafc', color: '#475569', dot: '#94a3b8' },
  open:              { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  closed:            { bg: '#fff7ed', color: '#92400e', dot: '#f97316' },
  results_submitted: { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
};

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white', boxSizing: 'border-box',
};
const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 };

const emptyForm = { name: '', address: '', code: '', constituencyId: '', presidingOfficerId: '', totalRegisteredVoters: '' };

export default function PollingStations() {
  const toast = useToast();
  const [stations, setStations] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filterConstituency, setFilterConstituency] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const load = async () => {
    const params = filterConstituency ? `?constituencyId=${filterConstituency}` : '';
    const [stRes, statsRes] = await Promise.all([
      api.get(`/polling-stations${params}`),
      api.get('/polling-stations/stats'),
    ]);
    setStations(stRes.data);
    setStats(statsRes.data);
  };

  const loadMeta = async () => {
    const [cRes, uRes] = await Promise.all([
      api.get('/constituencies'),
      api.get('/users'),
    ]);
    setConstituencies(cRes.data);
    setUsers(uRes.data.filter((u: any) => u.role === 'presiding_officer' || u.role === 'admin' || u.role === 'superadmin'));
  };

  useEffect(() => { loadMeta(); }, []);
  useEffect(() => { load(); }, [filterConstituency]);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const openCreate = () => { setForm(emptyForm); setModalError(''); setModalOpen(true); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setModalError(''); setSaving(true);
    try {
      await api.post('/polling-stations', {
        name: form.name,
        address: form.address,
        code: form.code || undefined,
        constituencyId: Number(form.constituencyId),
        presidingOfficerId: form.presidingOfficerId ? Number(form.presidingOfficerId) : undefined,
        totalRegisteredVoters: form.totalRegisteredVoters ? Number(form.totalRegisteredVoters) : 0,
      });
      toast('Polling station created', 'success');
      setModalOpen(false); load();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Failed to create');
    } finally { setSaving(false); }
  };

  const doAction = async (id: number, action: string) => {
    try {
      await api.put(`/polling-stations/${id}/${action}`);
      toast(`Station ${action}ed`, 'success'); load();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  return (
    <div className="page-wrap">
      <PageHeader
        title="Polling Stations"
        subtitle="Manage polling stations across constituencies"
        action={
          <button onClick={openCreate} style={{
            background: '#2563eb', color: 'white', border: 'none',
            borderRadius: 12, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
          }}>+ Add Station</button>
        }
      />

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Total', val: stats.total, color: '#1d4ed8' },
            { label: 'Open', val: stats.open, color: '#16a34a' },
            { label: 'Closed', val: stats.closed, color: '#c2410c' },
            { label: 'Results In', val: stats.resultsSubmitted, color: '#6d28d9' },
          ].map(s => (
            <div key={s.label} style={{
              background: 'white', borderRadius: 12, border: '1px solid #e2e8f0',
              padding: '14px 18px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filter */}
      <div style={{ background: 'white', borderRadius: 12, border: '1px solid #e2e8f0', padding: '12px 16px', marginBottom: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Constituency:</label>
          <select style={{ ...inp, maxWidth: 280 }} value={filterConstituency} onChange={e => setFilterConstituency(e.target.value)}>
            <option value="">All Constituencies</option>
            {constituencies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {stations.length === 0 && <div style={{ gridColumn: '1/-1' }}><EmptyState emoji="🏫" title="No polling stations added yet." /></div>}
        {stations.map((s: any) => {
          const sc = STATUS_COLORS[s.status] || STATUS_COLORS.setup;
          return (
            <div key={s.id} style={{
              background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '16px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginBottom: 2 }}>
                    {s.code && <span style={{ color: '#2563eb', marginRight: 6 }}>[{s.code}]</span>}
                    {s.name}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>📍 {s.address}</div>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color,
                  border: `1px solid ${sc.dot}40`, borderRadius: 20, padding: '3px 9px',
                  display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, display: 'inline-block' }} />
                  {s.status.replace('_', ' ')}
                </span>
              </div>

              <div style={{ fontSize: 12, color: '#475569', marginBottom: 10, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>🗺️ {s.constituency?.name}</span>
                {s.presidingOfficer && <span>👤 {s.presidingOfficer.name}</span>}
                {s.totalRegisteredVoters > 0 && <span>👥 {s.totalRegisteredVoters.toLocaleString()}</span>}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                {s.status === 'setup' && (
                  <button onClick={() => doAction(s.id, 'open')} style={{
                    flex: 1, background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac',
                    borderRadius: 8, padding: '7px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>Open</button>
                )}
                {s.status === 'open' && (
                  <button onClick={() => doAction(s.id, 'close')} style={{
                    flex: 1, background: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74',
                    borderRadius: 8, padding: '7px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}>Close</button>
                )}
                {s.status === 'closed' && (
                  <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#64748b', padding: '7px' }}>
                    Ready for Form 45
                  </div>
                )}
                {s.status === 'results_submitted' && (
                  <div style={{ flex: 1, textAlign: 'center', fontSize: 12, color: '#1d4ed8', padding: '7px', fontWeight: 600 }}>
                    Results Submitted ✓
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 18, width: '100%', maxWidth: 460,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e40af, #0891b2)',
              borderRadius: '18px 18px 0 0', padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Add Polling Station</h3>
              <button onClick={() => setModalOpen(false)} style={{
                background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none',
                borderRadius: '50%', width: 30, height: 30, fontSize: 18, cursor: 'pointer',
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Station Name <span style={{ color: '#dc2626' }}>*</span></label>
                  <input style={inp} placeholder="e.g. Government High School" value={form.name}
                    onChange={e => set('name', e.target.value)} required />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lbl}>Address <span style={{ color: '#dc2626' }}>*</span></label>
                  <input style={inp} placeholder="Full address" value={form.address}
                    onChange={e => set('address', e.target.value)} required />
                </div>
                <div>
                  <label style={lbl}>Station Code</label>
                  <input style={inp} placeholder="e.g. PS-001" value={form.code}
                    onChange={e => set('code', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Registered Voters</label>
                  <input style={inp} type="number" min="0" placeholder="0" value={form.totalRegisteredVoters}
                    onChange={e => set('totalRegisteredVoters', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Constituency <span style={{ color: '#dc2626' }}>*</span></label>
                  <select style={inp} value={form.constituencyId} onChange={e => set('constituencyId', e.target.value)} required>
                    <option value="">-- Select --</option>
                    {constituencies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Presiding Officer</label>
                  <select style={inp} value={form.presidingOfficerId} onChange={e => set('presidingOfficerId', e.target.value)}>
                    <option value="">-- Select --</option>
                    {users.map((u: any) => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                  </select>
                </div>
              </div>

              {modalError && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 12,
                }}>{modalError}</div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: 12, background: saving ? '#93c5fd' : '#2563eb',
                  color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>{saving ? 'Creating...' : 'Create Station'}</button>
                <button type="button" onClick={() => setModalOpen(false)} style={{
                  padding: '12px 18px', background: '#f8fafc', color: '#475569',
                  border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
