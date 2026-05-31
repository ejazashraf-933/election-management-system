import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 13px', border: '1.5px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white', boxSizing: 'border-box',
};
const lbl: React.CSSProperties = { display: 'block', fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 };

const SEAT_TYPE_COLORS: Record<string, string> = {
  ajk_general: '#1d4ed8', refugee_pakistan: '#0891b2',
  reserved_women: '#7c3aed', reserved_technocrat: '#b45309',
  reserved_ulama: '#166534', reserved_overseas: '#dc2626', default: '#475569',
};

const SEAT_TYPE_LABELS: Record<string, string> = {
  ajk_general: 'AJK General', refugee_pakistan: 'Refugee (Pakistan)',
  reserved_women: 'Reserved – Women', reserved_technocrat: 'Reserved – Technocrat',
  reserved_ulama: 'Reserved – Ulama', reserved_overseas: 'Reserved – Overseas',
};

const AJK_DISTRICTS = [
  'Muzaffarabad', 'Mirpur', 'Kotli', 'Rawalakot (Poonch)',
  'Bagh', 'Neelum', 'Haveli', 'Hattian Bala', 'Sudhnoti',
];

const REFUGEE_DISTRICTS = ['Rawalpindi', 'Lahore', 'Karachi', 'Islamabad', 'Other'];

const emptyForm = {
  name: '', province: 'AJK', district: '', description: '',
  type: 'ajk_general', seatType: 'general', seatNumber: '', totalRegisteredVoters: '',
};

export default function Constituencies() {
  const toast = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [form, setForm] = useState<any>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const [filterType, setFilterType] = useState('all');

  const load = async () => { const res = await api.get('/constituencies'); setItems(res.data); };
  useEffect(() => { load(); }, []);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const openCreate = () => {
    setEditTarget(null); setForm(emptyForm); setModalError(''); setModalOpen(true);
  };
  const openEdit = (c: any) => {
    setEditTarget(c);
    setForm({
      name: c.name, province: c.province || 'AJK', district: c.district || '',
      description: c.description || '', type: c.type || 'ajk_general',
      seatType: c.seatType || 'general', seatNumber: c.seatNumber || '',
      totalRegisteredVoters: c.totalRegisteredVoters || '',
    });
    setModalError(''); setModalOpen(true);
  };
  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setModalError(''); setSaving(true);
    try {
      const payload = {
        ...form,
        totalRegisteredVoters: form.totalRegisteredVoters ? Number(form.totalRegisteredVoters) : 0,
      };
      if (editTarget) await api.put(`/constituencies/${editTarget.id}`, payload);
      else await api.post('/constituencies', payload);
      toast(editTarget ? 'Constituency updated' : 'Constituency added', 'success');
      closeModal(); load();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this constituency?')) return;
    setDeleting(id);
    try { await api.delete(`/constituencies/${id}`); toast('Constituency deleted', 'info'); }
    catch (err: any) { toast(err.response?.data?.message || 'Failed to delete', 'error'); }
    setDeleting(null); load();
  };

  const districtOptions = form.type === 'refugee_pakistan' ? REFUGEE_DISTRICTS : AJK_DISTRICTS;

  const filtered = filterType === 'all' ? items : items.filter(c => c.type === filterType);

  const generalCount = items.filter(c => c.seatType === 'general').length;
  const reservedCount = items.filter(c => c.seatType === 'reserved').length;

  return (
    <div className="page-wrap">
      <PageHeader
        title="Constituencies"
        subtitle={`${items.length} total — ${generalCount} general, ${reservedCount} reserved (AJK: 45 general + 8 reserved = 53)`}
        action={
          <button onClick={openCreate} style={{
            background: '#2563eb', color: 'white', border: 'none',
            borderRadius: 12, padding: '11px 22px', fontSize: 14, fontWeight: 600,
          }}>+ Add Constituency</button>
        }
      />

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'ajk_general', label: 'AJK General' },
          { key: 'refugee_pakistan', label: 'Refugee' },
          { key: 'reserved_women', label: 'Women' },
          { key: 'reserved_ulama', label: 'Ulama' },
          { key: 'reserved_technocrat', label: 'Technocrat' },
          { key: 'reserved_overseas', label: 'Overseas' },
        ].map(f => (
          <button key={f.key} onClick={() => setFilterType(f.key)} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            border: filterType === f.key ? '1.5px solid #2563eb' : '1.5px solid #e2e8f0',
            background: filterType === f.key ? '#eff6ff' : 'white',
            color: filterType === f.key ? '#2563eb' : '#64748b',
          }}>{f.label}</button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState emoji="🗺️" title="No constituencies match this filter."
              action={<button onClick={openCreate} style={{
                background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600,
              }}>+ Add Constituency</button>}
            />
          </div>
        )}
        {filtered.map((c: any) => {
          const color = SEAT_TYPE_COLORS[c.type] || SEAT_TYPE_COLORS.default;
          return (
            <div key={c.id} style={{
              background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '18px',
              borderLeft: `4px solid ${color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                  background: `${color}15`, border: `2px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color, fontWeight: 700, fontSize: 12,
                }}>
                  {c.seatNumber || `#${c.id}`}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 14, marginBottom: 4 }}>{c.name}</p>
                  <span style={{
                    fontSize: 10, fontWeight: 700, background: `${color}15`,
                    color, borderRadius: 20, padding: '2px 8px', display: 'inline-block',
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>{SEAT_TYPE_LABELS[c.type] || c.type}</span>
                </div>
              </div>

              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                {c.district && <span style={{ marginRight: 10 }}>📍 {c.district}</span>}
                {c.province && <span>🗾 {c.province}</span>}
              </div>

              {c.totalRegisteredVoters > 0 && (
                <div style={{
                  fontSize: 12, color: '#475569', background: '#f8fafc',
                  borderRadius: 8, padding: '6px 10px', marginBottom: 10,
                }}>
                  👥 {c.totalRegisteredVoters.toLocaleString()} registered voters
                </div>
              )}

              {c.description && (
                <p style={{ fontSize: 12, color: '#94a3b8', marginBottom: 10 }}>{c.description}</p>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(c)} style={{
                  flex: 1, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                  borderRadius: 8, padding: '7px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}>Edit</button>
                <button onClick={() => remove(c.id)} disabled={deleting === c.id} style={{
                  flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                  borderRadius: 8, padding: '7px', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}>
                  {deleting === c.id ? '...' : 'Delete'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {modalOpen && (
        <div onClick={closeModal} style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: 'white', borderRadius: 20,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #065f46, #0891b2)',
              borderRadius: '20px 20px 0 0', padding: '24px 24px 28px',
              position: 'sticky', top: 0,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 2 }}>
                    {editTarget ? 'Edit Constituency' : 'Add Constituency'}
                  </h2>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>AJK Electoral Constituency</p>
                </div>
                <button onClick={closeModal} style={{
                  background: 'rgba(255,255,255,0.2)', color: 'white',
                  border: 'none', borderRadius: '50%', width: 32, height: 32,
                  fontSize: 18, cursor: 'pointer',
                }}>×</button>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '20px 24px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={lbl}>Constituency Name <span style={{ color: '#dc2626' }}>*</span></label>
                  <input style={inp} placeholder="e.g. LA-01-Muzaffarabad-I"
                    value={form.name} onChange={e => set('name', e.target.value)} required />
                </div>
                <div>
                  <label style={lbl}>Seat Number</label>
                  <input style={inp} placeholder="e.g. LA-01"
                    value={form.seatNumber} onChange={e => set('seatNumber', e.target.value)} />
                </div>
                <div>
                  <label style={lbl}>Province</label>
                  <select style={inp} value={form.province} onChange={e => set('province', e.target.value)} required>
                    {['AJK', 'Punjab', 'Sindh', 'KPK', 'Balochistan', 'ICT'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lbl}>Constituency Type <span style={{ color: '#dc2626' }}>*</span></label>
                  <select style={inp} value={form.type} onChange={e => set('type', e.target.value)} required>
                    <option value="ajk_general">AJK General</option>
                    <option value="refugee_pakistan">Refugee (Pakistan)</option>
                    <option value="reserved_women">Reserved – Women</option>
                    <option value="reserved_ulama">Reserved – Ulama</option>
                    <option value="reserved_technocrat">Reserved – Technocrat</option>
                    <option value="reserved_overseas">Reserved – Overseas</option>
                  </select>
                </div>
                <div>
                  <label style={lbl}>Seat Category</label>
                  <select style={inp} value={form.seatType} onChange={e => set('seatType', e.target.value)}>
                    <option value="general">General</option>
                    <option value="reserved">Reserved</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={lbl}>District</label>
                  <select style={inp} value={form.district} onChange={e => set('district', e.target.value)}>
                    <option value="">-- Select --</option>
                    {districtOptions.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Registered Voters</label>
                  <input style={inp} type="number" placeholder="0" min="0"
                    value={form.totalRegisteredVoters}
                    onChange={e => set('totalRegisteredVoters', e.target.value)} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={lbl}>Description <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                <input style={inp} placeholder="Brief description"
                  value={form.description} onChange={e => set('description', e.target.value)} />
              </div>

              {modalError && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14,
                }}>{modalError}</div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: 12, background: saving ? '#6ee7b7' : '#0891b2',
                  color: 'white', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
                }}>
                  {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Constituency'}
                </button>
                <button type="button" onClick={closeModal} style={{
                  padding: '12px 18px', background: '#f8fafc', color: '#475569',
                  border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14, cursor: 'pointer',
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
