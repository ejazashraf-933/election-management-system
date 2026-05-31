import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white', boxSizing: 'border-box',
};

export default function Form45Page() {
  const toast = useToast();
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [stations, setStations] = useState<any[]>([]);
  const [selectedStation, setSelectedStation] = useState('');
  const [candidates, setCandidates] = useState<any[]>([]);
  const [existingForm, setExistingForm] = useState<any>(null);
  const [consolidated, setConsolidated] = useState<any>(null);
  const [form, setForm] = useState({
    totalRegisteredVoters: '', totalVotesCast: '', totalValidVotes: '', totalRejectedVotes: '',
  });
  const [candidateVotes, setCandidateVotes] = useState<Record<number, string>>({});
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'submit' | 'consolidated'>('submit');

  useEffect(() => {
    api.get('/elections').then(r => {
      setElections(r.data);
      if (r.data.length > 0) setSelectedElection(String(r.data[0].id));
    });
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    api.get(`/polling-stations?constituencyId=`).then(r => {
      setStations(r.data.filter((s: any) => s.status === 'closed' || s.status === 'results_submitted'));
    });
    api.get(`/form45/election/${selectedElection}/consolidated`).then(r => setConsolidated(r.data)).catch(() => setConsolidated(null));
  }, [selectedElection]);

  useEffect(() => {
    if (!selectedStation || !selectedElection) return;
    api.get(`/form45/polling-station/${selectedStation}`).then(r => setExistingForm(r.data)).catch(() => setExistingForm(null));

    const station = stations.find(s => s.id === Number(selectedStation));
    if (station?.constituency?.id) {
      api.get(`/nominations/constituency/${station.constituency.id}/election/${selectedElection}`)
        .then(r => {
          setCandidates(r.data);
          const votes: Record<number, string> = {};
          r.data.forEach((n: any) => { votes[n.applicant.id] = '0'; });
          setCandidateVotes(votes);
        }).catch(() => setCandidates([]));
    }
  }, [selectedStation, selectedElection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStation || !selectedElection) return;
    setSaving(true);
    try {
      await api.post(`/form45/polling-station/${selectedStation}`, {
        electionId: Number(selectedElection),
        totalRegisteredVoters: Number(form.totalRegisteredVoters),
        totalVotesCast: Number(form.totalVotesCast),
        totalValidVotes: Number(form.totalValidVotes),
        totalRejectedVotes: Number(form.totalRejectedVotes),
        candidateVotes: Object.entries(candidateVotes).map(([candidateId, votes]) => ({
          candidateId: Number(candidateId),
          votes: Number(votes),
        })),
      });
      toast('Form 45 submitted successfully', 'success');
      setSelectedStation('');
      api.get(`/form45/election/${selectedElection}/consolidated`).then(r => setConsolidated(r.data));
    } catch (err: any) {
      toast(err.response?.data?.message || 'Submission failed', 'error');
    } finally { setSaving(false); }
  };

  return (
    <div className="page-wrap">
      <PageHeader title="Form 45 — Result of Count" subtitle="Submit and view official polling station results" />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: '#f1f5f9', borderRadius: 12, padding: 4, marginBottom: 20, width: 'fit-content' }}>
        {[{ key: 'submit', label: 'Submit Results' }, { key: 'consolidated', label: 'Consolidated View' }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key as any)} style={{
            padding: '8px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none',
            background: tab === t.key ? 'white' : 'transparent',
            color: tab === t.key ? '#1d4ed8' : '#64748b',
            boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Election selector */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Election:</label>
          <select style={{ ...inp, maxWidth: 300 }} value={selectedElection} onChange={e => setSelectedElection(e.target.value)}>
            <option value="">-- Select --</option>
            {elections.map((el: any) => <option key={el.id} value={el.id}>{el.title}</option>)}
          </select>
        </div>
      </div>

      {tab === 'submit' && (
        <>
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '14px 18px', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Polling Station (Closed only):</label>
              <select style={{ ...inp, maxWidth: 300 }} value={selectedStation} onChange={e => setSelectedStation(e.target.value)}>
                <option value="">-- Select station --</option>
                {stations.map((s: any) => <option key={s.id} value={s.id}>{s.code ? `[${s.code}] ` : ''}{s.name}</option>)}
              </select>
            </div>
          </div>

          {existingForm && (
            <div style={{
              background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 12, padding: '12px 16px', marginBottom: 16,
              fontSize: 13, color: '#166534',
            }}>
              ✓ Form 45 already submitted for this station. Hash: <code style={{ fontSize: 11 }}>{existingForm.stampHash?.slice(0, 16)}...</code>
            </div>
          )}

          {selectedStation && !existingForm && (
            <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '20px 24px' }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Vote Counts
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {[
                  { key: 'totalRegisteredVoters', label: 'Total Registered Voters' },
                  { key: 'totalVotesCast', label: 'Total Votes Cast' },
                  { key: 'totalValidVotes', label: 'Valid Votes' },
                  { key: 'totalRejectedVotes', label: 'Rejected Votes' },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>{label}</label>
                    <input style={inp} type="number" min="0" placeholder="0"
                      value={form[key as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} required />
                  </div>
                ))}
              </div>

              {candidates.length > 0 && (
                <>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Candidate Votes
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
                    {candidates.map((n: any) => (
                      <div key={n.applicant.id} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        background: '#f8fafc', borderRadius: 10, padding: '10px 14px',
                      }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a' }}>{n.applicant.name}</div>
                          <div style={{ fontSize: 11, color: '#64748b' }}>{n.party?.name || 'Independent'} • {n.constituency?.name}</div>
                        </div>
                        <input style={{ ...inp, width: 100, textAlign: 'center' }} type="number" min="0"
                          value={candidateVotes[n.applicant.id] ?? '0'}
                          onChange={e => setCandidateVotes(v => ({ ...v, [n.applicant.id]: e.target.value }))} />
                      </div>
                    ))}
                  </div>
                </>
              )}

              <button type="submit" disabled={saving} style={{
                width: '100%', padding: 12, background: saving ? '#93c5fd' : '#2563eb',
                color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>{saving ? 'Submitting...' : 'Submit Form 45'}</button>
            </form>
          )}

          {!selectedStation && <EmptyState emoji="📄" title="Select a closed polling station to submit Form 45." />}
        </>
      )}

      {tab === 'consolidated' && (
        <>
          {!consolidated ? (
            <EmptyState emoji="📊" title="No Form 45 results submitted yet for this election." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Summary */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { label: 'Polling Stations', val: consolidated.totalPollingStations, color: '#1d4ed8' },
                  { label: 'Votes Cast', val: consolidated.totalVotesCast, color: '#16a34a' },
                  { label: 'Valid Votes', val: consolidated.totalValidVotes, color: '#0891b2' },
                  { label: 'Rejected', val: consolidated.totalRejectedVotes, color: '#dc2626' },
                ].map(s => (
                  <div key={s.label} style={{
                    background: 'white', borderRadius: 12, border: '1px solid #e2e8f0',
                    padding: '14px 18px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val?.toLocaleString()}</div>
                    <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Results table */}
              <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9' }}>
                  <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>Candidate Results (Consolidated)</p>
                </div>
                {consolidated.candidates?.map((c: any, i: number) => (
                  <div key={c.candidateId} style={{
                    display: 'flex', alignItems: 'center', gap: 14, padding: '12px 18px',
                    borderBottom: i < consolidated.candidates.length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: i === 0 ? '#f0fdf4' : 'white',
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                      background: i === 0 ? '#16a34a' : '#f1f5f9',
                      color: i === 0 ? 'white' : '#64748b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: 14,
                    }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>
                        {i === 0 && <span style={{ color: '#16a34a', marginRight: 6 }}>🏆</span>}
                        {c.candidateName}
                      </div>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{c.partyName}</div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: 18, color: i === 0 ? '#16a34a' : '#1d4ed8' }}>
                      {c.totalVotes.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
