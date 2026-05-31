import { useEffect, useState } from 'react';
import api from '../../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [turnout, setTurnout] = useState<any[]>([]);
  const [partyResults, setPartyResults] = useState<any[]>([]);
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/analytics/dashboard'),
      api.get('/elections'),
    ]).then(([sRes, eRes]) => {
      setStats(sRes.data);
      setElections(eRes.data);
      const ended = eRes.data.find((e: any) => e.status === 'ended' || e.status === 'running' || e.status === 'counting');
      if (ended) setSelectedElection(String(ended.id));
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedElection) return;
    Promise.all([
      api.get(`/analytics/turnout/${selectedElection}`),
      api.get(`/analytics/party-results/${selectedElection}`),
      api.get(`/analytics/constituency-winners/${selectedElection}`),
    ]).then(([tRes, pRes, wRes]) => {
      setTurnout(tRes.data);
      setPartyResults(pRes.data);
      setWinners(wRes.data);
    }).catch(() => {});
  }, [selectedElection]);

  if (loading) return (
    <div className="page-wrap" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ color: '#64748b', fontSize: 14 }}>Loading dashboard...</div>
    </div>
  );

  const STAT_CARDS = [
    { label: 'Total Voters', val: stats?.totalVoters, icon: '👥', color: '#1d4ed8', bg: '#eff6ff' },
    { label: 'Candidates', val: stats?.totalCandidates, icon: '🏛️', color: '#7c3aed', bg: '#fdf4ff' },
    { label: 'Constituencies', val: stats?.totalConstituencies, icon: '🗺️', color: '#0891b2', bg: '#ecfeff' },
    { label: 'Polling Stations', val: stats?.totalPollingStations, icon: '🏫', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Elections', val: stats?.totalElections, icon: '🗳️', color: '#d97706', bg: '#fffbeb' },
    { label: 'Nominations', val: stats?.totalNominations, icon: '📋', color: '#dc2626', bg: '#fef2f2' },
    { label: 'Stations Open', val: stats?.openStations, icon: '🟢', color: '#16a34a', bg: '#f0fdf4' },
    { label: 'Running', val: stats?.runningElections, icon: '⚡', color: '#7c3aed', bg: '#fdf4ff' },
  ];

  const inp: React.CSSProperties = {
    padding: '9px 13px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: 13, color: '#1e293b', background: 'white',
  };

  return (
    <div className="page-wrap">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>
          AJK Election Dashboard
        </h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>
          Azad Jammu & Kashmir — 53 Seat Legislative Assembly Election Overview
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12, marginBottom: 28 }}>
        {STAT_CARDS.map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
            padding: '16px', display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: 10, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
            }}>{s.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.color }}>{s.val ?? '—'}</div>
            <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* AJK Seat Distribution */}
      <div style={{ background: 'white', borderRadius: 16, border: '1px solid #e2e8f0', padding: '20px 24px', marginBottom: 20 }}>
        <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginBottom: 14 }}>AJK Assembly — 53 Seat Structure</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
          {[
            { label: 'AJK General (33)', count: 33, color: '#1d4ed8', total: 53 },
            { label: 'Refugee Pakistan (12)', count: 12, color: '#0891b2', total: 53 },
            { label: 'Women Reserved (5)', count: 5, color: '#7c3aed', total: 53 },
            { label: 'Ulama Reserved (1)', count: 1, color: '#166534', total: 53 },
            { label: 'Technocrat (1)', count: 1, color: '#b45309', total: 53 },
            { label: 'Overseas J&K (1)', count: 1, color: '#dc2626', total: 53 },
          ].map(s => (
            <div key={s.label} style={{ background: '#f8fafc', borderRadius: 10, padding: '12px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 6 }}>{s.label}</div>
              <div style={{ height: 4, borderRadius: 4, background: '#e2e8f0' }}>
                <div style={{
                  height: '100%', borderRadius: 4, background: s.color,
                  width: `${(s.count / s.total) * 100}%`, transition: 'width 0.5s',
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Election selector for analytics */}
      <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '14px 18px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: '#374151', whiteSpace: 'nowrap' }}>View Analytics For:</label>
          <select style={inp} value={selectedElection} onChange={e => setSelectedElection(e.target.value)}>
            <option value="">-- Select election --</option>
            {elections.map((el: any) => <option key={el.id} value={el.id}>{el.title} ({el.status})</option>)}
          </select>
        </div>
      </div>

      {selectedElection && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Voter Turnout */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '18px 20px' }}>
            <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginBottom: 14 }}>Voter Turnout by Constituency</p>
            {turnout.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No votes cast yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {turnout.map((t: any) => (
                  <div key={t.constituencyId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                      <span style={{ color: '#374151', fontWeight: 600 }}>{t.constituencyName}</span>
                      <span style={{ color: '#64748b' }}>
                        {t.votesCast.toLocaleString()} / {t.registeredVoters.toLocaleString()}
                        <strong style={{ color: '#1d4ed8', marginLeft: 6 }}>{t.turnoutPercent}%</strong>
                      </span>
                    </div>
                    <div style={{ height: 6, borderRadius: 6, background: '#e2e8f0' }}>
                      <div style={{
                        height: '100%', borderRadius: 6,
                        background: t.turnoutPercent > 60 ? '#16a34a' : t.turnoutPercent > 40 ? '#d97706' : '#dc2626',
                        width: `${Math.min(t.turnoutPercent, 100)}%`, transition: 'width 0.5s',
                      }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Party Results */}
          <div style={{ background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', padding: '18px 20px' }}>
            <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginBottom: 14 }}>Party-wise Vote Share</p>
            {partyResults.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '20px 0' }}>No results yet</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {partyResults.map((p: any, i: number) => {
                  const total = partyResults.reduce((s: number, r: any) => s + parseInt(r.totalVotes), 0);
                  const pct = total > 0 ? ((parseInt(p.totalVotes) / total) * 100).toFixed(1) : '0';
                  const COLORS = ['#1d4ed8', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2'];
                  return (
                    <div key={p.partyId || i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 3 }}>
                        <span style={{ color: '#374151', fontWeight: 600 }}>{p.partyName || 'Independent'}</span>
                        <span>
                          <strong style={{ color: COLORS[i % COLORS.length] }}>{parseInt(p.totalVotes).toLocaleString()}</strong>
                          <span style={{ color: '#94a3b8', marginLeft: 6 }}>{pct}%</span>
                        </span>
                      </div>
                      <div style={{ height: 6, borderRadius: 6, background: '#e2e8f0' }}>
                        <div style={{
                          height: '100%', borderRadius: 6, background: COLORS[i % COLORS.length],
                          width: `${pct}%`, transition: 'width 0.5s',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Constituency Winners */}
          <div style={{ gridColumn: '1/-1', background: 'white', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9' }}>
              <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14 }}>Constituency-wise Winners</p>
            </div>
            {winners.length === 0 ? (
              <p style={{ fontSize: 13, color: '#94a3b8', textAlign: 'center', padding: '24px 0' }}>No results yet</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 0 }}>
                {winners.map((w: any, i: number) => (
                  <div key={w.constituencyId} style={{
                    padding: '14px 18px', borderBottom: '1px solid #f1f5f9',
                    borderRight: (i + 1) % 3 !== 0 ? '1px solid #f1f5f9' : 'none',
                  }}>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 4, textTransform: 'uppercase', fontWeight: 600 }}>
                      {w.constituencyName}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 18 }}>🏆</span>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: 13 }}>{w.winner.candidateName}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>
                          {w.winner.partyName || 'Independent'} • {w.winner.votes.toLocaleString()} votes
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
