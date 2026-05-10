import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const avatarColors = ['#7c3aed', '#0891b2', '#15803d', '#b45309', '#be123c', '#0369a1'];

export default function Vote() {
  const toast = useToast();
  const [elections, setElections] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [myVotes, setMyVotes] = useState<any[]>([]);
  const [selectedElection, setSelectedElection] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [loading, setLoading] = useState(false);
  const [myConstituencyId, setMyConstituencyId] = useState<number | null>(null);

  useEffect(() => {
    api.get('/auth/me').then(r => setMyConstituencyId(r.data.constituency?.id ?? null));
    api.get('/elections').then(r => setElections(r.data.filter((e: any) => e.status === 'running')));
    api.get('/candidates').then(r => setCandidates(r.data));
    api.get('/votes/history').then(r => setMyVotes(r.data));
  }, []);

  // Filter candidates by voter's constituency
  const visibleCandidates = myConstituencyId
    ? candidates.filter((c: any) => c.constituency?.id === myConstituencyId)
    : candidates;

  // Check if already voted in the selected election
  const alreadyVoted = selectedElection
    ? myVotes.find((v: any) => String(v.election?.id) === selectedElection)
    : null;

  const castVote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/votes', {
        candidateId: Number(selectedCandidate),
        electionId: Number(selectedElection),
      });
      toast('Your vote has been cast successfully!', 'success');
      const h = await api.get('/votes/history');
      setMyVotes(h.data);
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to cast vote', 'error');
    } finally { setLoading(false); }
  };

  if (elections.length === 0) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Cast Your Vote</h1>
          <p style={{ fontSize: 14, color: '#64748b' }}>Participate in the democratic process</p>
        </div>
        <div style={{
          background: 'white', borderRadius: 20, border: '1px solid #fde68a',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '56px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
          <p style={{ fontSize: 17, fontWeight: 600, color: '#92400e', marginBottom: 8 }}>No Active Election</p>
          <p style={{ fontSize: 14, color: '#b45309' }}>Voting is not open at the moment. Check back later.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Cast Your Vote</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Your vote is anonymous and secure</p>
      </div>

      {myConstituencyId && !alreadyVoted && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
          padding: '10px 16px', marginBottom: 20, fontSize: 13, color: '#1d4ed8',
        }}>
          Showing candidates from your constituency only
        </div>
      )}

      {/* Election selector */}
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 24, marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#eff6ff', color: '#2563eb',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 700,
          }}>1</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Select Election</p>
        </div>
        <select
          value={selectedElection}
          onChange={e => { setSelectedElection(e.target.value); setSelectedCandidate(''); setMessage(''); setError(''); }}
          style={{
            width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
            borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white',
          }}
        >
          <option value="">-- Choose an election --</option>
          {elections.map((el: any) => (
            <option key={el.id} value={el.id}>{el.title}</option>
          ))}
        </select>
      </div>

      {/* Already voted banner */}
      {alreadyVoted && (
        <div style={{
          background: '#f0fdf4', border: '1px solid #86efac', borderRadius: 16,
          padding: '24px 24px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>✅</div>
          <p style={{ fontSize: 16, fontWeight: 700, color: '#14532d', marginBottom: 8 }}>
            You have already voted in this election
          </p>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 12,
            background: 'white', border: '1px solid #86efac', borderRadius: 12,
            padding: '12px 20px', marginTop: 4,
          }}>
            {alreadyVoted.candidate?.photo
              ? <img src={alreadyVoted.candidate.photo} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} alt="" />
              : (
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: '#7c3aed15', border: '2px solid #7c3aed30',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#7c3aed', fontWeight: 700, fontSize: 16,
                }}>
                  {alreadyVoted.candidate?.user?.name?.[0]?.toUpperCase()}
                </div>
              )
            }
            <div style={{ textAlign: 'left' }}>
              <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>
                {alreadyVoted.candidate?.user?.name}
              </p>
              <p style={{ fontSize: 12, color: '#64748b' }}>
                {alreadyVoted.candidate?.party?.name ?? 'Independent'}
              </p>
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 14 }}>
            Votes cannot be changed once cast. View your full history in My History.
          </p>
        </div>
      )}

      {/* Voting form — only if not yet voted */}
      {selectedElection && !alreadyVoted && (
        <form onSubmit={castVote}>
          {/* Step 2: Candidate */}
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 24, marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: '#eff6ff', color: '#2563eb',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 700,
              }}>2</div>
              <p style={{ fontSize: 14, fontWeight: 600, color: '#0f172a' }}>Select Candidate</p>
            </div>

            {visibleCandidates.length === 0 ? (
              <div style={{
                background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
                padding: '20px', textAlign: 'center',
              }}>
                <p style={{ fontSize: 14, color: '#92400e' }}>No candidates found in your constituency.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {visibleCandidates.map((c: any, i: number) => {
                  const selected = String(selectedCandidate) === String(c.id);
                  const color = avatarColors[i % avatarColors.length];
                  return (
                    <label key={c.id} style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 16px', borderRadius: 12, cursor: 'pointer',
                      border: `2px solid ${selected ? '#2563eb' : '#e2e8f0'}`,
                      background: selected ? '#eff6ff' : 'white',
                      transition: 'all 0.15s',
                    }}>
                      <input type="radio" name="candidate" value={c.id}
                        style={{ display: 'none' }}
                        onChange={() => setSelectedCandidate(String(c.id))} />
                      {c.photo
                        ? <img src={c.photo} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} alt="" />
                        : (
                          <div style={{
                            width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                            background: `${color}15`, border: `2px solid ${color}30`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color, fontWeight: 700, fontSize: 18,
                          }}>
                            {c.user?.name?.[0]?.toUpperCase()}
                          </div>
                        )
                      }
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: '#0f172a', fontSize: 15, marginBottom: 2 }}>
                          {c.user?.name}
                        </p>
                        <p style={{ fontSize: 12, color: '#64748b' }}>
                          {c.party?.name ?? 'Independent'} · {c.constituency?.name}
                        </p>
                      </div>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                        border: `2px solid ${selected ? '#2563eb' : '#cbd5e1'}`,
                        background: selected ? '#2563eb' : 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {selected && <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>✓</span>}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading || !selectedCandidate} style={{
            width: '100%', padding: 14, fontSize: 15, fontWeight: 700,
            background: loading ? '#93c5fd' : !selectedCandidate ? '#e2e8f0' : '#2563eb',
            color: !selectedCandidate ? '#94a3b8' : 'white',
            border: 'none', borderRadius: 12,
            cursor: loading || !selectedCandidate ? 'not-allowed' : 'pointer',
          }}>
            {loading ? 'Submitting...' : 'Submit Vote'}
          </button>
        </form>
      )}
    </div>
  );
}
