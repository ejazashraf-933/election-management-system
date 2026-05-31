import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_MAP: Record<string, { label: string; bg: string; color: string; border: string }> = {
  submitted:       { label: 'Submitted',       bg: '#eff6ff', color: '#1d4ed8', border: '#93c5fd' },
  under_scrutiny:  { label: 'Under Scrutiny',  bg: '#fffbeb', color: '#92400e', border: '#fde68a' },
  approved:        { label: 'Approved',         bg: '#f0fdf4', color: '#166534', border: '#86efac' },
  rejected:        { label: 'Rejected',         bg: '#fef2f2', color: '#991b1b', border: '#fca5a5' },
  withdrawn:       { label: 'Withdrawn',        bg: '#f8fafc', color: '#475569', border: '#cbd5e1' },
  appealed:        { label: 'Appealed',         bg: '#fdf4ff', color: '#7e22ce', border: '#d8b4fe' },
};

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white', boxSizing: 'border-box',
};

export default function Nominations() {
  const toast = useToast();
  const [nominations, setNominations] = useState<any[]>([]);
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [stats, setStats] = useState<any>(null);
  const [scrutinyModal, setScrutinyModal] = useState<any>(null);
  const [scrutinyForm, setScrutinyForm] = useState({ status: 'approved', notes: '', rejectionReason: '' });
  const [saving, setSaving] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const loadElections = async () => {
    const res = await api.get('/elections');
    setElections(res.data);
    if (res.data.length > 0 && !selectedElection) setSelectedElection(String(res.data[0].id));
  };

  const loadNominations = async () => {
    if (!selectedElection) return;
    const [nomRes, statRes] = await Promise.all([
      api.get(`/nominations?electionId=${selectedElection}`),
      api.get(`/nominations/stats/${selectedElection}`),
    ]);
    setNominations(nomRes.data);
    setStats(statRes.data);
  };

  useEffect(() => { loadElections(); }, []);
  useEffect(() => { loadNominations(); }, [selectedElection]);

  const openScrutiny = (nom: any) => {
    setScrutinyModal(nom);
    setScrutinyForm({ status: 'approved', notes: '', rejectionReason: '' });
  };

  const submitScrutiny = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/nominations/${scrutinyModal.id}/scrutinize`, {
        status: scrutinyForm.status,
        scrutinyNotes: scrutinyForm.notes || undefined,
        rejectionReason: scrutinyForm.rejectionReason || undefined,
      });
      toast(`Nomination ${scrutinyForm.status}`, 'success');
      setScrutinyModal(null);
      loadNominations();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Action failed', 'error');
    } finally { setSaving(false); }
  };

  const filtered = filterStatus === 'all' ? nominations : nominations.filter(n => n.status === filterStatus);

  return (
    <div className="page-wrap">
      <PageHeader title="Nominations" subtitle="Review and scrutinize candidate nominations" />

      {/* Election selector */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Election:</label>
          <select style={{ ...inp, maxWidth: 300 }} value={selectedElection} onChange={e => setSelectedElection(e.target.value)}>
            <option value="">-- Select election --</option>
            {elections.map((el: any) => <option key={el.id} value={el.id}>{el.title}</option>)}
          </select>

          {stats && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginLeft: 'auto' }}>
              {[
                { label: 'Total', val: stats.total, color: '#475569' },
                { label: 'Pending', val: stats.pending, color: '#d97706' },
                { label: 'Approved', val: stats.approved, color: '#16a34a' },
                { label: 'Rejected', val: stats.rejected, color: '#dc2626' },
                { label: 'Withdrawn', val: stats.withdrawn, color: '#94a3b8' },
              ].map(s => (
                <div key={s.label} style={{
                  background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10,
                  padding: '6px 12px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: '#94a3b8', fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Status filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['all', 'submitted', 'under_scrutiny', 'approved', 'rejected', 'withdrawn', 'appealed'].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} style={{
            padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            border: filterStatus === s ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
            background: filterStatus === s ? '#eff6ff' : 'white',
            color: filterStatus === s ? '#2563eb' : '#64748b',
          }}>{s === 'all' ? 'All' : STATUS_MAP[s]?.label}</button>
        ))}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.length === 0 && (
          <EmptyState emoji="📋" title={selectedElection ? 'No nominations found for this filter.' : 'Select an election above.'} />
        )}
        {filtered.map((n: any) => {
          const s = STATUS_MAP[n.status] || STATUS_MAP.submitted;
          return (
            <div key={n.id} style={{
              background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
              padding: '16px 20px', display: 'flex', alignItems: 'flex-start', gap: 16,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700, background: s.bg, color: s.color,
                    border: `1px solid ${s.border}`, borderRadius: 20, padding: '3px 10px',
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>{s.label}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: '#0f172a' }}>{n.applicant?.name}</span>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {n.applicant?.cnic || n.applicant?.email}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
                  <span>🗺️ {n.constituency?.name}</span>
                  {n.party && <span>🏛️ {n.party.name}</span>}
                  {n.isIndependent && <span style={{ color: '#7c3aed' }}>Independent</span>}
                  <span>📅 {new Date(n.submittedAt).toLocaleDateString()}</span>
                  {n.nominationFee && <span>💰 PKR {n.nominationFee}</span>}
                </div>
                {n.proposerName && (
                  <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                    Proposer: {n.proposerName} ({n.proposerCnic}) | Seconder: {n.seconderName} ({n.seconderCnic})
                  </div>
                )}
                {n.scrutinyNotes && (
                  <div style={{ fontSize: 12, color: '#475569', marginTop: 4, fontStyle: 'italic' }}>
                    Notes: {n.scrutinyNotes}
                  </div>
                )}
                {n.rejectionReason && (
                  <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4 }}>
                    Rejection: {n.rejectionReason}
                  </div>
                )}
              </div>
              {(n.status === 'submitted' || n.status === 'under_scrutiny' || n.status === 'appealed') && (
                <button onClick={() => openScrutiny(n)} style={{
                  background: '#2563eb', color: 'white', border: 'none',
                  borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600,
                  flexShrink: 0, cursor: 'pointer',
                }}>Scrutinize</button>
              )}
            </div>
          );
        })}
      </div>

      {/* Scrutiny Modal */}
      {scrutinyModal && (
        <div onClick={() => setScrutinyModal(null)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 18, width: '100%', maxWidth: 440,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
              borderRadius: '18px 18px 0 0', padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Nomination Scrutiny</h3>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>{scrutinyModal.applicant?.name} — {scrutinyModal.constituency?.name}</p>
              </div>
              <button onClick={() => setScrutinyModal(null)} style={{
                background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none',
                borderRadius: '50%', width: 30, height: 30, fontSize: 18, cursor: 'pointer',
              }}>×</button>
            </div>
            <form onSubmit={submitScrutiny} style={{ padding: '20px 24px 24px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                  Decision
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['approved', 'rejected', 'under_scrutiny'].map(s => (
                    <button key={s} type="button" onClick={() => setScrutinyForm(f => ({ ...f, status: s }))} style={{
                      flex: 1, padding: '9px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      border: scrutinyForm.status === s ? '2px solid #2563eb' : '1.5px solid #e2e8f0',
                      background: scrutinyForm.status === s ? '#eff6ff' : 'white',
                      color: scrutinyForm.status === s ? '#2563eb' : '#64748b',
                    }}>
                      {s === 'approved' ? 'Approve' : s === 'rejected' ? 'Reject' : 'Hold'}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                  Scrutiny Notes
                </label>
                <textarea style={{ ...inp, minHeight: 70, resize: 'vertical' } as any}
                  placeholder="Notes for the record..."
                  value={scrutinyForm.notes}
                  onChange={e => setScrutinyForm(f => ({ ...f, notes: e.target.value }))} />
              </div>
              {scrutinyForm.status === 'rejected' && (
                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5 }}>
                    Rejection Reason <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <textarea style={{ ...inp, minHeight: 60, resize: 'vertical' } as any}
                    placeholder="State the reason for rejection..."
                    value={scrutinyForm.rejectionReason}
                    onChange={e => setScrutinyForm(f => ({ ...f, rejectionReason: e.target.value }))}
                    required={scrutinyForm.status === 'rejected'} />
                </div>
              )}
              <button type="submit" disabled={saving} style={{
                width: '100%', padding: 12, background: saving ? '#93c5fd' : '#2563eb',
                color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
                {saving ? 'Saving...' : 'Submit Decision'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
