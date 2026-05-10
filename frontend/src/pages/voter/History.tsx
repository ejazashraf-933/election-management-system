import { useEffect, useState } from 'react';
import api from '../../api/axios';
import PageHeader from '../../components/ui/PageHeader';
import CandidateAvatar from '../../components/ui/CandidateAvatar';
import EmptyState from '../../components/ui/EmptyState';

export default function History() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/votes/history').then(r => setHistory(r.data)).finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      + ' · ' + date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="page-wrap-sm">
      <PageHeader title="Voting History" subtitle="A record of your past votes" />

      {loading ? (
        <div style={{
          background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
          padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14,
        }}>
          Loading your history...
        </div>
      ) : history.length === 0 ? (
        <EmptyState emoji="🗳️" title="No Votes Yet" description="You haven't cast any votes yet." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map((v: any, i: number) => (
            <div key={v.id} style={{
              background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 24px',
            }}>
              {/* Election name + date */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 8, marginBottom: 14,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
                    display: 'inline-block', flexShrink: 0,
                  }} />
                  <p style={{ fontWeight: 600, color: '#0f172a', fontSize: 15 }}>
                    {v.election?.title}
                  </p>
                </div>
                <span style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' }}>
                  {formatDate(v.castedAt)}
                </span>
              </div>

              {/* Candidate info */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 12,
                background: '#f8fafc', borderRadius: 12, padding: '12px 14px',
              }}>
                <CandidateAvatar
                  photo={v.candidate?.photo}
                  name={v.candidate?.user?.name ?? '?'}
                  size={40}
                  colorIndex={i}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                    {v.candidate?.user?.name}
                  </p>
                  <p style={{ fontSize: 12, color: '#94a3b8' }}>
                    {v.candidate?.party?.name ?? 'Independent'}
                  </p>
                </div>
                <span style={{
                  fontSize: 11, fontWeight: 600, background: '#f0fdf4',
                  color: '#16a34a', border: '1px solid #86efac',
                  borderRadius: 20, padding: '3px 10px', flexShrink: 0,
                }}>
                  ✓ Voted
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
