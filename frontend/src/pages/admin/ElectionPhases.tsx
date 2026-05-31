import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

const PHASE_STATUS_COLORS: Record<string, { bg: string; color: string; dot: string }> = {
  scheduled: { bg: '#eff6ff', color: '#1d4ed8', dot: '#3b82f6' },
  voting:    { bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
  counting:  { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  completed: { bg: '#f8fafc', color: '#475569', dot: '#94a3b8' },
};

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white', boxSizing: 'border-box',
};

export default function ElectionPhases() {
  const toast = useToast();
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [phases, setPhases] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ phaseNumber: '', title: '', scheduledDate: '', constituencyIds: [] as number[] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/elections'), api.get('/constituencies')]).then(([eRes, cRes]) => {
      setElections(eRes.data);
      setConstituencies(cRes.data);
      if (eRes.data.length > 0) setSelectedElection(String(eRes.data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    api.get(`/election-phases/election/${selectedElection}`).then(r => setPhases(r.data)).catch(() => setPhases([]));
  }, [selectedElection]);

  const toggleConstituency = (id: number) => {
    setForm(f => ({
      ...f,
      constituencyIds: f.constituencyIds.includes(id)
        ? f.constituencyIds.filter(c => c !== id)
        : [...f.constituencyIds, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/election-phases', {
        electionId: Number(selectedElection),
        phaseNumber: Number(form.phaseNumber),
        title: form.title,
        scheduledDate: form.scheduledDate,
        constituencyIds: form.constituencyIds,
      });
      toast('Phase created', 'success');
      setModalOpen(false);
      setForm({ phaseNumber: '', title: '', scheduledDate: '', constituencyIds: [] });
      api.get(`/election-phases/election/${selectedElection}`).then(r => setPhases(r.data));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed', 'error');
    } finally { setSaving(false); }
  };

  const doAction = async (id: number, action: string) => {
    try {
      await api.put(`/election-phases/${id}/${action}`);
      toast(`Phase ${action}ed`, 'success');
      api.get(`/election-phases/election/${selectedElection}`).then(r => setPhases(r.data));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  return (
    <div className="page-wrap">
      <PageHeader
        title="Election Phases"
        subtitle="Manage multi-phase elections across AJK districts"
        action={
          selectedElection ? (
            <button onClick={() => setModalOpen(true)} style={{
              background: '#2563eb', color: 'white', border: 'none',
              borderRadius: 12, padding: '11px 22px', fontSize: 14, fontWeight: 600, cursor: 'pointer',
            }}>+ Add Phase</button>
          ) : undefined
        }
      />

      {/* Election selector */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Election:</label>
          <select style={{ ...inp, maxWidth: 300 }} value={selectedElection} onChange={e => setSelectedElection(e.target.value)}>
            <option value="">-- Select election --</option>
            {elections.map((el: any) => <option key={el.id} value={el.id}>{el.title}</option>)}
          </select>
        </div>
      </div>

      {/* Phases list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {phases.length === 0 && (
          <EmptyState emoji="📅" title={selectedElection ? 'No phases created yet.' : 'Select an election above.'} />
        )}
        {phases.map((p: any) => {
          const sc = PHASE_STATUS_COLORS[p.status] || PHASE_STATUS_COLORS.scheduled;
          return (
            <div key={p.id} style={{
              background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)', padding: '18px 20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: sc.bg, border: `2px solid ${sc.dot}40`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: sc.color, fontWeight: 800, fontSize: 18,
                }}>{p.phaseNumber}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>{p.title}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, background: sc.bg, color: sc.color,
                      border: `1px solid ${sc.dot}40`, borderRadius: 20, padding: '2px 9px',
                    }}>{p.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>
                    📅 Scheduled: {new Date(p.scheduledDate).toLocaleDateString()}
                    {p.startTime && ` | Started: ${new Date(p.startTime).toLocaleString()}`}
                    {p.endTime && ` | Ended: ${new Date(p.endTime).toLocaleString()}`}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {(p.constituencies || []).map((c: any) => (
                      <span key={c.id} style={{
                        fontSize: 11, background: '#f1f5f9', color: '#475569',
                        borderRadius: 6, padding: '3px 8px',
                      }}>{c.name}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {p.status === 'scheduled' && (
                    <button onClick={() => doAction(p.id, 'start')} style={{
                      background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac',
                      borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>Start Voting</button>
                  )}
                  {p.status === 'voting' && (
                    <button onClick={() => doAction(p.id, 'end')} style={{
                      background: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74',
                      borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>End Voting</button>
                  )}
                  {p.status === 'counting' && (
                    <button onClick={() => doAction(p.id, 'complete')} style={{
                      background: '#eff6ff', color: '#1d4ed8', border: '1px solid #93c5fd',
                      borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>Mark Complete</button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Phase Modal */}
      {modalOpen && (
        <div onClick={() => setModalOpen(false)} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 18, width: '100%', maxWidth: 500,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
              borderRadius: '18px 18px 0 0', padding: '20px 24px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              position: 'sticky', top: 0,
            }}>
              <h3 style={{ color: 'white', fontWeight: 700, fontSize: 16 }}>Create Election Phase</h3>
              <button onClick={() => setModalOpen(false)} style={{
                background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none',
                borderRadius: '50%', width: 30, height: 30, fontSize: 18, cursor: 'pointer',
              }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Phase #</label>
                  <input style={inp} type="number" min="1" placeholder="1" value={form.phaseNumber}
                    onChange={e => setForm(f => ({ ...f, phaseNumber: e.target.value }))} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Scheduled Date</label>
                  <input style={inp} type="datetime-local" value={form.scheduledDate}
                    onChange={e => setForm(f => ({ ...f, scheduledDate: e.target.value }))} required />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>Phase Title</label>
                  <input style={inp} placeholder="e.g. Phase 1 — Mirpur Division" value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
                  Constituencies in this phase ({form.constituencyIds.length} selected)
                </label>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px' }}>
                  {constituencies.map((c: any) => (
                    <label key={c.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px',
                      borderRadius: 6, cursor: 'pointer', fontSize: 13,
                      background: form.constituencyIds.includes(c.id) ? '#eff6ff' : 'transparent',
                    }}>
                      <input type="checkbox" checked={form.constituencyIds.includes(c.id)}
                        onChange={() => toggleConstituency(c.id)}
                        style={{ accentColor: '#2563eb' }} />
                      <span>{c.seatNumber && `[${c.seatNumber}] `}{c.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              <button type="submit" disabled={saving} style={{
                width: '100%', padding: 12, marginTop: 16,
                background: saving ? '#93c5fd' : '#2563eb',
                color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>{saving ? 'Creating...' : 'Create Phase'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
