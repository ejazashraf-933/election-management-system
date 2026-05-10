import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/ui/PageHeader';

const roleColors: Record<string, { bg: string; color: string; border: string }> = {
  superadmin: { bg: '#fef9c3', color: '#713f12', border: '#fde047' },
  admin:      { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  candidate:  { bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  voter:      { bg: '#f8fafc', color: '#475569', border: '#cbd5e1' },
};

const roleIcons: Record<string, string> = {
  superadmin: '👑', admin: '🛡️', candidate: '🏛️', voter: '👤',
};

export default function Users() {
  const toast = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [constituencies, setConstituencies] = useState<any[]>([]);
  const [assigning, setAssigning] = useState<number | null>(null);
  const [selectedConst, setSelectedConst] = useState<Record<number, string>>({});
  const [filter, setFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const [u, c] = await Promise.all([api.get('/users'), api.get('/constituencies')]);
    setUsers(u.data);
    setConstituencies(c.data);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const assignConstituency = async (userId: number) => {
    const cId = selectedConst[userId];
    if (!cId) return;
    setAssigning(userId);
    try {
      await api.patch(`/users/${userId}/constituency`, { constituencyId: Number(cId) });
      toast('Constituency assigned successfully', 'success');
      load();
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to assign constituency', 'error');
    } finally { setAssigning(null); }
  };

  const filtered = users.filter(u => {
    const matchesText =
      u.name?.toLowerCase().includes(filter.toLowerCase()) ||
      u.email?.toLowerCase().includes(filter.toLowerCase()) ||
      u.role?.toLowerCase().includes(filter.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesText && matchesRole;
  });

  const roleCounts: Record<string, number> = { all: users.length };
  users.forEach(u => { roleCounts[u.role] = (roleCounts[u.role] ?? 0) + 1; });

  const rolePills = [
    { key: 'all', label: 'All' },
    { key: 'voter', label: 'Voters' },
    { key: 'candidate', label: 'Candidates' },
    { key: 'superadmin', label: 'Superadmins' },
  ];

  const noConstituency = users.filter(u => !u.constituency).length;

  const warningBadge = noConstituency > 0 ? (
    <div style={{
      background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 12,
      padding: '10px 16px', fontSize: 13, color: '#92400e', fontWeight: 500,
    }}>
      ⚠️ {noConstituency} user{noConstituency > 1 ? 's' : ''} without constituency
    </div>
  ) : undefined;

  return (
    <div className="page-wrap">
      <PageHeader
        title="Users"
        subtitle="Manage registered users and assign constituencies"
        action={warningBadge}
        alignTop
      />

      {/* Search */}
      <div style={{
        background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)', padding: '14px 20px', marginBottom: 12,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <span style={{ fontSize: 16, color: '#94a3b8' }}>🔍</span>
        <input
          placeholder="Search by name, email or role..."
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            border: 'none', outline: 'none', fontSize: 14, color: '#1e293b',
            width: '100%', background: 'transparent',
          }}
        />
        {filter && (
          <button onClick={() => setFilter('')} style={{
            background: 'none', border: 'none', fontSize: 16, color: '#94a3b8', padding: 0, lineHeight: 1,
          }}>×</button>
        )}
        <span style={{ fontSize: 13, color: '#94a3b8', flexShrink: 0 }}>{filtered.length} users</span>
      </div>

      {/* Role filter pills */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {rolePills.map(pill => {
          const count = roleCounts[pill.key] ?? 0;
          const isActive = roleFilter === pill.key;
          const rc = roleColors[pill.key];
          return (
            <button
              key={pill.key}
              onClick={() => setRoleFilter(pill.key)}
              style={{
                padding: '6px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: 6,
                background: isActive ? (rc?.bg ?? '#eff6ff') : 'white',
                color: isActive ? (rc?.color ?? '#1d4ed8') : '#64748b',
                border: `1.5px solid ${isActive ? (rc?.border ?? '#bfdbfe') : '#e2e8f0'}`,
              }}
            >
              {pill.key !== 'all' && <span>{roleIcons[pill.key]}</span>}
              {pill.label}
              <span style={{
                fontSize: 11, background: isActive ? 'rgba(0,0,0,0.1)' : '#f1f5f9',
                color: isActive ? 'inherit' : '#94a3b8',
                borderRadius: 10, padding: '1px 6px', fontWeight: 700,
              }}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Users list */}
      {loading ? (
        <div style={{
          background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
          padding: '48px 24px', textAlign: 'center', color: '#94a3b8', fontSize: 14,
        }}>
          Loading users...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((u: any) => {
            const rc = roleColors[u.role] || roleColors.voter;
            const noConst = !u.constituency;
            return (
              <div key={u.id} style={{
                background: 'white', borderRadius: 16,
                border: `1px solid ${noConst ? '#fde68a' : '#e2e8f0'}`,
                boxShadow: noConst ? '0 1px 3px rgba(245,158,11,0.1)' : '0 1px 3px rgba(0,0,0,0.06)',
                padding: '18px 22px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                  {/* Avatar */}
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: rc.bg, border: `2px solid ${rc.border}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    {roleIcons[u.role] ?? '👤'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 160 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                      <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 15 }}>{u.name}</p>
                      <span style={{
                        fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '2px 8px',
                        background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                      }}>{u.role}</span>
                      {noConst && (
                        <span style={{
                          fontSize: 11, fontWeight: 600, borderRadius: 20, padding: '2px 8px',
                          background: '#fef9c3', color: '#92400e', border: '1px solid #fde047',
                        }}>⚠️ No constituency</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: '#64748b' }}>{u.email}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                      {u.constituency
                        ? `📍 ${u.constituency.name} — ${u.constituency.province}`
                        : '📍 No constituency assigned'}
                    </p>
                  </div>

                  {/* Assign constituency */}
                  <div className="assign-row">
                    <select
                      value={selectedConst[u.id] ?? u.constituency?.id ?? ''}
                      onChange={e => setSelectedConst(prev => ({ ...prev, [u.id]: e.target.value }))}
                      style={{
                        padding: '7px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8,
                        fontSize: 12, color: '#1e293b', background: 'white',
                      }}
                    >
                      <option value="">Assign constituency</option>
                      {constituencies.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => assignConstituency(u.id)}
                      disabled={assigning === u.id || !selectedConst[u.id]}
                      style={{
                        background: '#2563eb', color: 'white', border: 'none',
                        borderRadius: 8, padding: '7px 14px', fontSize: 12, fontWeight: 600,
                        opacity: assigning === u.id || !selectedConst[u.id] ? 0.5 : 1,
                      }}
                    >
                      {assigning === u.id ? '...' : 'Assign'}
                    </button>
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
