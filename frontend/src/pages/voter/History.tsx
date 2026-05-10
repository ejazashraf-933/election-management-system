import { useEffect, useState } from 'react';
import api from '../../api/axios';

const avatarColors = ['#7c3aed', '#0891b2', '#15803d', '#b45309', '#be123c', '#0369a1'];

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
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Voting History</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>A record of your past votes</p>
      </div>

      {loading ? (
        <div style={{
          background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
          padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14,
        }}>
          Loading your history...
        </div>
      ) : history.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 20, border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '56px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🗳️</div>
          <p style={{ fontSize: 17, fontWeight: 600, color: '#374151', marginBottom: 8 }}>No Votes Yet</p>
          <p style={{ fontSize: 14, color: '#94a3b8' }}>You haven't cast any votes yet.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {history.map((v: any, i: number) => {
            const color = avatarColors[i % avatarColors.length];
            const initial = v.candidate?.user?.name?.[0]?.toUpperCase() ?? '?';
            return (
              <div key={v.id} style={{
                background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px 24px',
              }}>
                {/* Election name + date */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
                      display: 'inline-block', flexShrink: 0,
                    }} />
                    <p style={{ fontWeight: 600, color: '#0f172a', fontSize: 15 }}>
                      {v.election?.title}
                    </p>
                  </div>
                  <span style={{ fontSize: 12, color: '#94a3b8' }}>{formatDate(v.castedAt)}</span>
                </div>

                {/* Candidate info */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  background: '#f8fafc', borderRadius: 12, padding: '12px 14px',
                }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: `${color}15`, border: `2px solid ${color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color, fontWeight: 700, fontSize: 16,
                  }}>
                    {initial}
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#374151' }}>
                      {v.candidate?.user?.name}
                    </p>
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>
                      {v.candidate?.party?.name ?? 'Independent'}
                    </p>
                  </div>
                  <div style={{ marginLeft: 'auto' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, background: '#f0fdf4',
                      color: '#16a34a', border: '1px solid #86efac',
                      borderRadius: 20, padding: '3px 10px',
                    }}>
                      ✓ Voted
                    </span>
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
