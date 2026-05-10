import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/ui/PageHeader';
import CandidateAvatar from '../../components/ui/CandidateAvatar';
import EmptyState from '../../components/ui/EmptyState';

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

  const selectStyle: React.CSSProperties = {
    padding: '8px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8,
    fontSize: 13, color: '#1e293b', background: 'white',
  };

  return (
    <div className="page-wrap">
      <PageHeader title="Candidates" subtitle="Browse all registered candidates" />

      {/* Filters */}
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '16px 20px', marginBottom: 20,
        display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>Filter:</span>
        <select style={selectStyle} value={filterConstituency} onChange={e => setFilterConstituency(e.target.value)}>
          <option value="">All Constituencies</option>
          {constituencies.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name} {myConstituencyId === c.id ? '(mine)' : ''}
            </option>
          ))}
        </select>
        <select style={selectStyle} value={filterParty} onChange={e => setFilterParty(e.target.value)}>
          <option value="">All Parties</option>
          {parties.map((p: any) => (
            <option key={p.id} value={p.name}>{p.name}</option>
          ))}
          <option value="__independent__">Independent</option>
        </select>
        {(filterConstituency || filterParty) && (
          <button
            onClick={() => { setFilterConstituency(''); setFilterParty(''); }}
            style={{ fontSize: 12, color: '#64748b', background: 'none', border: 'none', textDecoration: 'underline' }}
          >
            Clear filters
          </button>
        )}
        <span style={{ fontSize: 13, color: '#94a3b8', marginLeft: 'auto' }}>
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
        <EmptyState emoji="🏛️" title="No Candidates Found" description="Try adjusting the filters above." />
      ) : (
        <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {filtered.map((c: any, i: number) => {
            const isMyConstituency = myConstituencyId && c.constituency?.id === myConstituencyId;
            return (
              <div key={c.id} style={{
                background: 'white', borderRadius: 16,
                border: `1px solid ${isMyConstituency ? '#bfdbfe' : '#e2e8f0'}`,
                boxShadow: isMyConstituency ? '0 2px 8px rgba(37,99,235,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
                padding: '20px', position: 'relative',
              }}>
                {isMyConstituency && (
                  <span style={{
                    position: 'absolute', top: 12, right: 12,
                    fontSize: 11, fontWeight: 600, background: '#eff6ff',
                    color: '#2563eb', border: '1px solid #bfdbfe', borderRadius: 20, padding: '2px 8px',
                  }}>
                    Your Constituency
                  </span>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                  <CandidateAvatar photo={c.photo} name={c.user?.name ?? '?'} size={56} colorIndex={i} />
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
                  {[
                    { label: 'Constituency', value: c.constituency?.name ?? '—' },
                    ...(c.party?.leaderName ? [{ label: 'Party Leader', value: c.party.leaderName }] : []),
                    { label: 'Province', value: c.constituency?.province ?? '—' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                      <span style={{ color: '#64748b' }}>{row.label}</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
