import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/ui/PageHeader';

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white', boxSizing: 'border-box',
};

const STATUS_MAP: Record<string, { label: string; bg: string; color: string }> = {
  submitted:      { label: 'Submitted — Awaiting Scrutiny', bg: '#eff6ff', color: '#1d4ed8' },
  under_scrutiny: { label: 'Under Scrutiny', bg: '#fffbeb', color: '#92400e' },
  approved:       { label: 'Approved — You are on the Ballot', bg: '#f0fdf4', color: '#166534' },
  rejected:       { label: 'Rejected', bg: '#fef2f2', color: '#991b1b' },
  withdrawn:      { label: 'Withdrawn', bg: '#f8fafc', color: '#475569' },
  appealed:       { label: 'Appealed', bg: '#fdf4ff', color: '#7e22ce' },
};

export default function MyNomination() {
  const toast = useToast();
  const { user } = useAuth();
  const [elections, setElections] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [parties, setParties] = useState<any[]>([]);
  const [myNominations, setMyNominations] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    electionId: '', constituencyId: '', partyId: '', isIndependent: false,
    nominationFee: '', proposerName: '', proposerCnic: '', seconderName: '', seconderCnic: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    Promise.all([
      api.get('/elections'),
      api.get('/constituencies'),
      api.get('/parties'),
      api.get('/nominations'),
    ]).then(([eRes, cRes, pRes, nRes]) => {
      setElections(eRes.data.filter((e: any) => e.status === 'nomination_open'));
      setConstituencies(cRes.data);
      setParties(pRes.data);
      setMyNominations(nRes.data.filter((n: any) => n.applicant?.id === user?.id));
    });
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/nominations', {
        electionId: Number(form.electionId),
        constituencyId: form.constituencyId ? Number(form.constituencyId) : undefined,
        partyId: form.partyId ? Number(form.partyId) : undefined,
        isIndependent: form.isIndependent,
        nominationFee: form.nominationFee ? Number(form.nominationFee) : undefined,
        proposerName: form.proposerName || undefined,
        proposerCnic: form.proposerCnic || undefined,
        seconderName: form.seconderName || undefined,
        seconderCnic: form.seconderCnic || undefined,
      });
      toast('Nomination submitted successfully', 'success');
      setShowForm(false);
      const nRes = await api.get('/nominations');
      setMyNominations(nRes.data.filter((n: any) => n.applicant?.id === user?.id));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Submission failed', 'error');
    } finally { setSaving(false); }
  };

  const doWithdraw = async (id: number) => {
    if (!confirm('Withdraw this nomination?')) return;
    try {
      await api.put(`/nominations/${id}/withdraw`);
      toast('Nomination withdrawn', 'info');
      const nRes = await api.get('/nominations');
      setMyNominations(nRes.data.filter((n: any) => n.applicant?.id === user?.id));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const doAppeal = async (id: number) => {
    try {
      await api.put(`/nominations/${id}/appeal`);
      toast('Appeal submitted', 'success');
      const nRes = await api.get('/nominations');
      setMyNominations(nRes.data.filter((n: any) => n.applicant?.id === user?.id));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  return (
    <div className="page-wrap">
      <PageHeader
        title="My Nominations"
        subtitle="Submit and track your AJK election nominations"
        action={
          elections.length > 0 && !showForm ? (
            <button onClick={() => setShowForm(true)} style={{
              background: '#2563eb', color: 'white', border: 'none',
              borderRadius: 12, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>+ File Nomination</button>
          ) : undefined
        }
      />

      {elections.length === 0 && (
        <div style={{
          background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12,
          padding: '14px 18px', fontSize: 13, color: '#92400e', marginBottom: 20,
        }}>
          No elections currently accepting nominations. Check back when an election opens its nomination period.
        </div>
      )}

      {/* Nomination form */}
      {showForm && (
        <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: 16 }}>File Nomination</h3>
            <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}>×</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Election *</label>
                <select style={inp} value={form.electionId} onChange={e => set('electionId', e.target.value)} required>
                  <option value="">-- Select election --</option>
                  {elections.map((el: any) => <option key={el.id} value={el.id}>{el.title}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Constituency *</label>
                <select style={inp} value={form.constituencyId} onChange={e => set('constituencyId', e.target.value)} required>
                  <option value="">-- Select constituency --</option>
                  {constituencies.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#374151', cursor: 'pointer' }}>
                <input type="checkbox" checked={form.isIndependent} onChange={e => set('isIndependent', e.target.checked)}
                  style={{ accentColor: '#2563eb', width: 16, height: 16 }} />
                Running as Independent candidate
              </label>
            </div>

            {!form.isIndependent && (
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Party</label>
                <select style={inp} value={form.partyId} onChange={e => set('partyId', e.target.value)}>
                  <option value="">-- Select party --</option>
                  {parties.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Proposer Name</label>
                <input style={inp} placeholder="Proposer full name" value={form.proposerName} onChange={e => set('proposerName', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Proposer CNIC</label>
                <input style={inp} placeholder="XXXXX-XXXXXXX-X" value={form.proposerCnic} onChange={e => set('proposerCnic', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Seconder Name</label>
                <input style={inp} placeholder="Seconder full name" value={form.seconderName} onChange={e => set('seconderName', e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Seconder CNIC</label>
                <input style={inp} placeholder="XXXXX-XXXXXXX-X" value={form.seconderCnic} onChange={e => set('seconderCnic', e.target.value)} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Nomination Fee (PKR)</label>
              <input style={{ ...inp, maxWidth: 160 }} type="number" min="0" placeholder="0" value={form.nominationFee}
                onChange={e => set('nominationFee', e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="submit" disabled={saving} style={{
                padding: '11px 24px', background: saving ? '#93c5fd' : '#2563eb',
                color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>{saving ? 'Submitting...' : 'Submit Nomination'}</button>
              <button type="button" onClick={() => setShowForm(false)} style={{
                padding: '11px 18px', background: '#f8fafc', color: '#475569',
                border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, cursor: 'pointer',
              }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* My nominations list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {myNominations.length === 0 && !showForm && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b', fontSize: 14 }}>
            No nominations filed yet.
          </div>
        )}
        {myNominations.map((n: any) => {
          const s = STATUS_MAP[n.status] || STATUS_MAP.submitted;
          return (
            <div key={n.id} style={{
              background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
              padding: '16px 20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: s.bg, color: s.color, borderRadius: 20,
                    padding: '4px 12px', fontSize: 12, fontWeight: 700, marginBottom: 8,
                  }}>{s.label}</div>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginBottom: 4 }}>
                    {n.election?.title}
                  </div>
                  <div style={{ fontSize: 13, color: '#64748b', display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <span>🗺️ {n.constituency?.name}</span>
                    {n.party && <span>🏛️ {n.party.name}</span>}
                    {n.isIndependent && <span style={{ color: '#7c3aed' }}>Independent</span>}
                    <span>📅 Filed: {new Date(n.submittedAt).toLocaleDateString()}</span>
                  </div>
                  {n.scrutinyNotes && (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#475569', fontStyle: 'italic' }}>
                      Notes: {n.scrutinyNotes}
                    </div>
                  )}
                  {n.rejectionReason && (
                    <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>
                      Rejection reason: {n.rejectionReason}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(n.status === 'submitted' || n.status === 'under_scrutiny') && (
                    <button onClick={() => doWithdraw(n.id)} style={{
                      background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                      borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>Withdraw</button>
                  )}
                  {n.status === 'rejected' && (
                    <button onClick={() => doAppeal(n.id)} style={{
                      background: '#fdf4ff', color: '#7e22ce', border: '1px solid #d8b4fe',
                      borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>Appeal</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
