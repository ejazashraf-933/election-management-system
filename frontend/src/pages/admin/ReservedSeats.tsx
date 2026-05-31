import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white', boxSizing: 'border-box',
};

export default function ReservedSeats() {
  const toast = useToast();
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [parties, setParties] = useState<any[]>([]);
  const [partyVotes, setPartyVotes] = useState<Record<number, string>>({});
  const [allocation, setAllocation] = useState<any>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/elections'), api.get('/parties')]).then(([eRes, pRes]) => {
      setElections(eRes.data.filter((e: any) => e.status === 'ended' || e.status === 'counting'));
      setParties(pRes.data);
      const votes: Record<number, string> = {};
      pRes.data.forEach((p: any) => { votes[p.id] = ''; });
      setPartyVotes(votes);
    });
  }, []);

  const calculate = async () => {
    if (!selectedElection) { toast('Select an election first', 'error'); return; }
    setCalculating(true);
    try {
      const partyVoteList = parties
        .filter(p => partyVotes[p.id] && Number(partyVotes[p.id]) > 0)
        .map(p => ({ partyId: p.id, partyName: p.name, votes: Number(partyVotes[p.id]) }));

      if (partyVoteList.length === 0) { toast('Enter votes for at least one party', 'error'); return; }

      const res = await api.post(`/reserved-seats/calculate/${selectedElection}`, { partyVotes: partyVoteList });
      setAllocation(res.data);
      toast('Allocation calculated', 'success');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Calculation failed', 'error');
    } finally { setCalculating(false); }
  };

  const SEAT_TYPES = [
    { label: 'Women Reserved', count: 5, color: '#7c3aed', icon: '👩' },
    { label: 'Ulama Reserved', count: 1, color: '#166534', icon: '📖' },
    { label: 'Technocrat', count: 1, color: '#b45309', icon: '🔬' },
    { label: 'Overseas J&K', count: 1, color: '#dc2626', icon: '✈️' },
  ];

  return (
    <div className="page-wrap">
      <PageHeader
        title="Reserved Seats Allocation"
        subtitle="Proportional allocation of 8 reserved seats after general election results"
      />

      {/* Reserved seats info */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '18px 20px', marginBottom: 20 }}>
        <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginBottom: 12 }}>Reserved Seat Categories (AJK Assembly)</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {SEAT_TYPES.map(s => (
            <div key={s.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px', borderLeft: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 11, color: '#64748b' }}>{s.label}</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 12 }}>
          Total: 8 reserved seats distributed proportionally by party vote share in general election
        </p>
      </div>

      {/* Election selector */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '16px 20px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Completed Election:</label>
          <select style={{ ...inp, maxWidth: 300 }} value={selectedElection} onChange={e => setSelectedElection(e.target.value)}>
            <option value="">-- Select ended election --</option>
            {elections.map((el: any) => <option key={el.id} value={el.id}>{el.title}</option>)}
          </select>
        </div>
      </div>

      {/* Party votes input */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '18px 20px', marginBottom: 20 }}>
        <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginBottom: 14 }}>
          Enter General Election Votes per Party
        </p>
        {parties.length === 0 ? (
          <EmptyState emoji="🏛️" title="No parties registered yet." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
            {parties.map((p: any) => (
              <div key={p.id} style={{
                background: '#f8fafc', borderRadius: 10, padding: '12px 14px',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {p.logo && <img src={p.logo} alt="" style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover' }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f172a', marginBottom: 4 }}>{p.name}</div>
                  <input style={{ ...inp, padding: '6px 10px', fontSize: 13 }} type="number" min="0" placeholder="Total votes"
                    value={partyVotes[p.id] ?? ''}
                    onChange={e => setPartyVotes(v => ({ ...v, [p.id]: e.target.value }))} />
                </div>
              </div>
            ))}
          </div>
        )}
        <button onClick={calculate} disabled={calculating || !selectedElection} style={{
          marginTop: 16, padding: '11px 24px',
          background: calculating || !selectedElection ? '#93c5fd' : '#2563eb',
          color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          {calculating ? 'Calculating...' : 'Calculate Reserved Seat Allocation'}
        </button>
      </div>

      {/* Results */}
      {allocation && (
        <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '18px 20px' }}>
          <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginBottom: 6 }}>Allocation Results</p>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
            Total votes: {allocation.totalVotesCast.toLocaleString()} | Reserved seats: {allocation.totalReservedSeats}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {allocation.allocation.map((a: any, i: number) => (
              <div key={a.partyId} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 16px', borderRadius: 10,
                background: i === 0 ? '#f0fdf4' : '#f8fafc',
                border: `1px solid ${i === 0 ? '#86efac' : '#e2e8f0'}`,
              }}>
                <div style={{ fontWeight: 800, fontSize: 18, color: '#1d4ed8', width: 24, textAlign: 'center' }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a' }}>{a.partyName}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>
                    {a.votes.toLocaleString()} votes • {a.voteSharePercent}% share
                  </div>
                </div>
                <div style={{
                  background: i === 0 ? '#16a34a' : '#1d4ed8', color: 'white',
                  borderRadius: 10, padding: '6px 16px', fontWeight: 800, fontSize: 18,
                }}>
                  {a.seatsEntitled} seats
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
