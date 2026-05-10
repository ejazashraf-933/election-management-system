import { useEffect, useState } from 'react';
import api from '../../api/axios';

const avatarColors = ['#7c3aed', '#0891b2', '#15803d', '#b45309', '#be123c', '#0369a1'];

export default function Candidates() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [filterConstituency, setFilterConstituency] = useState('');
  const [filterParty, setFilterParty] = useState('');
  const [myConstituencyId, setMyConstituencyId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/candidates'),
      api.get('/constituencies'),
      api.get('/auth/me'),
    ]).then(([c, co, me]) => {
      setCandidates(c.data);
      setConstituencies(co.data);
      const cId = me.data.constituency?.id;
      setMyConstituencyId(cId ?? null);
      if (cId) setFilterConstituency(String(cId));
    }).finally(() => setLoading(false));
  }, []);

  const filtered = candidates.filter((c: any) => {
    if (filterConstituency && String(c.constituency?.id) !== filterConstituency) return false;
    if (filterParty) {
      const pName = c.party?.name?.toLowerCase() ?? '';
      if (filterParty === '__independent__' && c.party) return false;
      if (filterParty !== '__independent__' && !pName.includes(filterParty.toLowerCase())) return false;
    }
    return true;
  });

  const parties = Array.from(new Map(
    candidates.filter(c => c.party).map(c => [c.party.id, c.party])
  ).values());

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Candidates</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Browse all registered candidates</p>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '16px 20px', marginBottom: 20,
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Filter:</span>
        <select
          value={filterConstituency}
          onChange={e => setFilterConstituency(e.target.value)}
          style={{
            padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8,
            fontSize: 13, color: '#1e293b', background: 'white',
          }}
        >
          <option value="">All Constituencies</option>
          {constituencies.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name} {myConstituencyId === c.id ? '(mine)' : ''}
            </option>
          ))}
        </select>

        <select
          value={filterParty}
          onChange={e => setFilterParty(e.target.value)}
          style={{
            padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8,
            fontSize: 13, color: '#1e293b', background: 'white',
          }}
        >
          <option value="">All Parties</option>
          {parties.map((p: any) => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
          <option value="__independent__">Independent</option>
        </select>

        {(filterConstituency || filterParty) && (
          <button
            onClick={() => { setFilterConstituency(''); setFilterParty(''); }}
            style={{
              fontSize: 12, color: '#64748b', background: 'none', border: 'none',
              cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Clear filters
          </button>
        )}

        <span style={{ marginLeft: 'auto', fontSize: 13, color: '#94a3b8' }}>
          {filtered.length} candidate{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading ? (
        <div style={{
          background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
          padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14,
        }}>
          Loading candidates...
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 20, border: '1px solid #e2e8f0',
          padding: '56px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🏛️</div>
          <p style={{ fontSize: 17, fontWeight: 600, color: '#374151', marginBottom: 8 }}>No Candidates Found</p>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>Try adjusting the filters above.</p>
        </div>
      ) : (
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {filtered.map((c: any, i: number) => {
            const color = avatarColors[i % avatarColors.length];
            const initial = c.user?.name?.[0]?.toUpperCase() ?? '?';
            const isMyConstituency = myConstituencyId && c.constituency?.id === myConstituencyId;

            return (
              <div key={c.id} style={{
                background: 'white', borderRadius: 16,
                border: `1px solid ${isMyConstituency ? '#bfdbfe' : '#e2e8f0'}`,
                boxShadow: isMyConstituency ? '0 2px 8px rgba(37,99,235,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
                padding: '20px',
                position: 'relative',
              }}>
                {isMyConstituency && (
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    fontSize: 11, fontWeight: 600, background: '#eff6ff',
                    color: '#2563eb', border: '1px solid #bfdbfe',
                    borderRadius: 20, padding: '2px 8px',
                  }}>
                    Your Constituency
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  {c.photo
                    ? <img src={c.photo} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0', flexShrink: 0 }} alt="" />
                    : (
                      <div style={{
                        width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                        background: `${color}15`, border: `2px solid ${color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color, fontWeight: 700, fontSize: 22,
                      }}>
                        {initial}
                      </div>
                    )
                  }
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 16, marginBottom: 4 }}>
                      {c.user?.name}
                    </p>
                    <span style={{
                      display: 'inline-block', fontSize: 12, fontWeight: 600,
                      background: c.party ? '#eff6ff' : '#f0fdf4',
                      color: c.party ? '#1d4ed8' : '#16a34a',
                      border: `1px solid ${c.party ? '#bfdbfe' : '#86efac'}`,
                      borderRadius: 20, padding: '2px 10px',
                    }}>
                      {c.party?.name ?? 'Independent'}
                    </span>
                  </div>
                </div>

                <div style={{
                  background: '#f8fafc', borderRadius: 10, padding: '10px 14px',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#64748b' }}>Constituency</span>
                    <span style={{ fontWeight: 600, color: '#0f172a' }}>{c.constituency?.name ?? '—'}</span>
                  </div>
                  {c.party?.leaderName && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#64748b' }}>Party Leader</span>
                      <span style={{ fontWeight: 500, color: '#0f172a' }}>{c.party.leaderName}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#64748b' }}>Province</span>
                    <span style={{ fontWeight: 500, color: '#0f172a' }}>{c.constituency?.province ?? '—'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
