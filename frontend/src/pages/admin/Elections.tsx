import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const statusMap: Record<string, { label: string; dot: string; bg: string; color: string; borderLeft: string }> = {
  pending: { label: 'Pending',  dot: '#f59e0b', bg: '#fffbeb', color: '#92400e', borderLeft: '#f59e0b' },
  running: { label: 'Running',  dot: '#22c55e', bg: '#f0fdf4', color: '#14532d', borderLeft: '#22c55e' },
  paused:  { label: 'Paused',   dot: '#f97316', bg: '#fff7ed', color: '#7c2d12', borderLeft: '#f97316' },
  ended:   { label: 'Ended',    dot: '#94a3b8', bg: '#f8fafc', color: '#475569', borderLeft: '#cbd5e1' },
};

const inp: React.CSSProperties = {
  flex: 1, padding: '11px 14px', border: '1.5px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white',
};

export default function Elections() {
  const toast = useToast();
  const [elections, setElections] = useState<any[]>([]);
  const [form, setForm] = useState({ title: '', description: '' });

  const load = async () => {
    const res = await api.get('/elections');
    setElections(res.data);
  };
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/elections', form);
      setForm({ title: '', description: '' });
      toast('Election created successfully', 'success');
      load();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to create election', 'error');
    }
  };

  const action = async (id: number, act: string) => {
    try {
      await api.put(`/elections/${id}/${act}`);
      const labels: Record<string, string> = { start: 'started', pause: 'paused', end: 'ended' };
      toast(`Election ${labels[act] ?? act}`, 'success');
      load();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px' }}>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: '#0f172a', marginBottom: 4 }}>Elections</h1>
        <p style={{ fontSize: 14, color: '#64748b' }}>Create and manage elections</p>
      </div>

      {/* Create form */}
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: 24, marginBottom: 24,
      }}>
        <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 14, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Create New Election
        </p>
        <form onSubmit={create} style={{ display: 'flex', gap: 12 }}>
          <input style={inp} placeholder="Election title" value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })} required />
          <input style={inp} placeholder="Description (optional)" value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })} />
          <button type="submit" style={{
            background: '#2563eb', color: 'white', border: 'none',
            borderRadius: 10, padding: '11px 22px', fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap',
          }}>
            + Create
          </button>
        </form>
      </div>

      {/* Elections list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {elections.length === 0 && (
          <div style={{
            background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
            padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14,
          }}>
            No elections yet. Create your first election above.
          </div>
        )}
        {elections.map((el: any) => {
          const s = statusMap[el.status] || statusMap.ended;
          return (
            <div key={el.id} style={{
              background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              borderLeft: `4px solid ${s.borderLeft}`,
              padding: '18px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16,
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: s.bg, color: s.color,
                    border: `1px solid ${s.borderLeft}20`,
                    borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: s.dot, display: 'inline-block' }} />
                    {s.label}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#0f172a' }}>{el.title}</span>
                </div>
                {el.description && (
                  <p style={{ fontSize: 13, color: '#64748b', marginLeft: 2 }}>{el.description}</p>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                {(el.status === 'pending' || el.status === 'paused') && (
                  <button onClick={() => action(el.id, 'start')} style={{
                    background: '#f0fdf4', color: '#16a34a', border: '1px solid #86efac',
                    borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500,
                  }}>
                    ▶ Start
                  </button>
                )}
                {el.status === 'running' && (
                  <button onClick={() => action(el.id, 'pause')} style={{
                    background: '#fff7ed', color: '#c2410c', border: '1px solid #fdba74',
                    borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500,
                  }}>
                    ⏸ Pause
                  </button>
                )}
                {el.status !== 'ended' && (
                  <button onClick={() => action(el.id, 'end')} style={{
                    background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1',
                    borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 500,
                  }}>
                    ⏹ End
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
