import { useEffect, useState } from 'react';
import api from '../../api/axios';

const barColors = [
  'linear-gradient(90deg, #f59e0b, #fbbf24)',
  'linear-gradient(90deg, #3b82f6, #60a5fa)',
  'linear-gradient(90deg, #8b5cf6, #a78bfa)',
  'linear-gradient(90deg, #10b981, #34d399)',
  'linear-gradient(90deg, #f97316, #fb923c)',
  'linear-gradient(90deg, #ec4899, #f472b6)',
];

export default function Results() {
  const [elections, setElections] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [electionInfo, setElectionInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');

  useEffect(() => { api.get('/elections').then(r => setElections(r.data)); }, []);

  const loadResults = async (electionId: string) => {
    setSelectedElection(electionId);
    setFetchError('');
    if (!electionId) { setResults([]); setElectionInfo(null); return; }
    setLoading(true);
    try {
      const res = await api.get(`/votes/results/${electionId}`);
      setResults(res.data);
      setElectionInfo(elections.find((e: any) => String(e.id) === electionId) ?? null);
    } catch (err: any) {
      setFetchError(err.response?.data?.message || 'Failed to load results. Please try again.');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const maxVotes = Math.max(...results.map((r: any) => Number(r.totalVotes)), 1);
  const totalVotes = results.reduce((sum, r) => sum + Number(r.totalVotes), 0);

  const statusColor: Record<string, { bg: string; color: string; dot: string }> = {
    running: { bg: '#f0fdf4', color: '#16a34a', dot: '#22c55e' },
    ended:   { bg: '#f8fafc', color: '#475569', dot: '#94a3b8' },
    paused:  { bg: '#fff7ed', color: '#c2410c', dot: '#f97316' },
    pending: { bg: '#fffbeb', color: '#92400e', dot: '#f59e0b' },
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Election Results</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Live vote counts and standings</p>
      </div>

      {/* Election selector */}
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 20, marginBottom: 20,
      }}>
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 8 }}>
          Select Election
        </label>
        <select
          value={selectedElection}
          onChange={e => loadResults(e.target.value)}
          style={{
            width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
            borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white',
          }}
        >
          <option value="">-- Choose an election to view results --</option>
          {elections.map((el: any) => (
            <option key={el.id} value={el.id}>{el.title} — {el.status}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div style={{
          background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
          padding: '40px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14,
        }}>
          Loading results...
        </div>
      )}

      {fetchError && (
        <div style={{
          background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
          borderRadius: 12, padding: '14px 18px', fontSize: 14,
        }}>
          {fetchError}
        </div>
      )}

      {!loading && !fetchError && selectedElection && results.length === 0 && (
        <div style={{
          background: 'white', borderRadius: 20, border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '56px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <p style={{ fontSize: 17, fontWeight: 600, color: '#374151', marginBottom: 8 }}>No Votes Yet</p>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>No votes have been cast in this election.</p>
        </div>
      )}

      {results.length > 0 && (
        <>
          {/* Stats bar */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16,
          }}>
            <div style={{
              background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
              padding: '14px 18px',
            }}>
              <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Total Votes Cast</p>
              <p style={{ fontSize: 24, fontWeight: 700, color: '#0f172a' }}>{totalVotes}</p>
            </div>
            {electionInfo && (
              <div style={{
                background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
                padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <p style={{ fontSize: 12, color: '#64748b', marginBottom: 4 }}>Status</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: statusColor[electionInfo.status]?.dot ?? '#94a3b8',
                      display: 'inline-block',
                    }} />
                    <span style={{
                      fontSize: 14, fontWeight: 600,
                      color: statusColor[electionInfo.status]?.color ?? '#475569',
                      textTransform: 'capitalize',
                    }}>
                      {electionInfo.status}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Candidate results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {results.map((r: any, i: number) => {
              const pct = totalVotes > 0 ? Math.round((Number(r.totalVotes) / totalVotes) * 100) : 0;
              const barPct = Math.round((Number(r.totalVotes) / maxVotes) * 100);
              const isWinner = i === 0;
              const barColor = barColors[i % barColors.length];

              return (
                <div key={r.candidateId} style={{
                  background: isWinner ? '#fffbeb' : 'white',
                  borderRadius: 16,
                  border: `1px solid ${isWinner ? '#fde68a' : '#e2e8f0'}`,
                  boxShadow: isWinner ? '0 2px 8px rgba(245,158,11,0.15)' : '0 1px 3px rgba(0,0,0,0.06)',
                  padding: '18px 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {/* Rank badge */}
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        background: isWinner ? '#f59e0b' : '#f1f5f9',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: isWinner ? 18 : 14,
                        fontWeight: 700,
                        color: isWinner ? 'white' : '#64748b',
                      }}>
                        {isWinner ? '🏆' : i + 1}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginBottom: 2 }}>
                          {r.candidateName}
                        </p>
                        <p style={{ fontSize: 12, color: '#64748b' }}>
                          {r.partyName ?? 'Independent'}
                        </p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                        {r.totalVotes}
                      </p>
                      <p style={{ fontSize: 12, color: '#64748b' }}>{pct}% of votes</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ background: '#f1f5f9', borderRadius: 999, height: 8, overflow: 'hidden' }}>
                    <div style={{
                      height: 8, borderRadius: 999, width: `${barPct}%`,
                      background: isWinner ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' : barColor,
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
