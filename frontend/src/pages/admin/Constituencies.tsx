import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';

const inp: React.CSSProperties = {
  width: '100%', padding: '11px 14px', border: '1.5px solid #e2e8f0',
  borderRadius: 10, fontSize: 14, color: '#1e293b', background: 'white',
};
const lbl: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 5,
};

const PROVINCE_COLORS: Record<string, string> = {
  Punjab: '#7c3aed', Sindh: '#0891b2', KPK: '#15803d',
  Balochistan: '#b45309', default: '#475569',
};

export default function Constituencies() {
  const toast = useToast();
  const [items, setItems] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [form, setForm] = useState({ name: '', province: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => { const res = await api.get('/constituencies'); setItems(res.data); };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: '', province: '', description: '' });
    setModalError('');
    setModalOpen(true);
  };

  const openEdit = (c: any) => {
    setEditTarget(c);
    setForm({ name: c.name, province: c.province, description: c.description || '' });
    setModalError('');
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setSaving(true);
    try {
      if (editTarget) {
        await api.put(`/constituencies/${editTarget.id}`, form);
      } else {
        await api.post('/constituencies', form);
      }
      toast(editTarget ? 'Constituency updated' : 'Constituency added', 'success');
      closeModal();
      load();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this constituency?')) return;
    setDeleting(id);
    try {
      await api.delete(`/constituencies/${id}`);
      toast('Constituency deleted', 'info');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to delete constituency', 'error');
    }
    setDeleting(null);
    load();
  };

  const accentColor = PROVINCE_COLORS[form.province] || PROVINCE_COLORS[editTarget?.province] || PROVINCE_COLORS.default;

  return (
    <div className="page-wrap">
      <PageHeader
        title="Constituencies"
        subtitle="Manage election constituencies and provinces"
        action={
          <button onClick={openCreate} style={{
            background: '#2563eb', color: 'white', border: 'none',
            borderRadius: 12, padding: '11px 22px', fontSize: 14, fontWeight: 600,
          }}>+ Add Constituency</button>
        }
      />

      {/* Grid */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {items.length === 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState
              emoji="🗺️"
              title="No constituencies added yet."
              action={
                <button onClick={openCreate} style={{
                  background: '#eff6ff', color: '#2563eb',
                  border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600,
                }}>+ Add First Constituency</button>
              }
            />
          </div>
        )}
        {items.map((c: any) => {
          const color = PROVINCE_COLORS[c.province] || PROVINCE_COLORS.default;
          return (
            <div key={c.id} style={{
              background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px',
              borderLeft: `4px solid ${color}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `${color}15`, border: `2px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color, fontWeight: 700, fontSize: 15,
                }}>
                  {c.id}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginBottom: 4 }}>{c.name}</p>
                  <span style={{
                    fontSize: 11, fontWeight: 600, background: `${color}15`,
                    color, borderRadius: 20, padding: '2px 8px', display: 'inline-block',
                  }}>{c.province}</span>
                  {c.description && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>{c.description}</p>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => openEdit(c)} style={{
                  flex: 1, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                  borderRadius: 8, padding: '7px', fontSize: 13, fontWeight: 500,
                }}>Edit</button>
                <button onClick={() => remove(c.id)} disabled={deleting === c.id} style={{
                  flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                  borderRadius: 8, padding: '7px', fontSize: 13, fontWeight: 500,
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
            width: '100%', maxWidth: 440,
          }}>
            {/* Gradient header */}
            <div style={{
              background: 'linear-gradient(135deg, #065f46, #0891b2)',
              borderRadius: '20px 20px 0 0', padding: '28px 24px 36px',
              position: 'relative', textAlign: 'center',
            }}>
              <button onClick={closeModal} style={{
                position: 'absolute', top: 14, right: 16,
                background: 'rgba(255,255,255,0.2)', color: 'white',
                border: 'none', borderRadius: '50%', width: 30, height: 30,
                fontSize: 18, lineHeight: '30px', padding: 0,
              }}>×</button>
              <div style={{ fontSize: 40, marginBottom: 8 }}>🗺️</div>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>
                {editTarget ? 'Edit Constituency' : 'Add Constituency'}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                {editTarget ? `Editing ${editTarget.name}` : 'Fill in constituency details'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px 28px 28px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Constituency Name</label>
                <input style={inp} placeholder="e.g. NA-01-Peshawar"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Province</label>
                <select style={inp} value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} required>
                  <option value="">Select province</option>
                  {['Punjab', 'Sindh', 'KPK', 'Balochistan', 'Gilgit-Baltistan', 'AJK', 'ICT'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label style={lbl}>Description <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                <input style={inp} placeholder="Brief description"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              {form.province && (
                <div style={{
                  marginBottom: 16, padding: '10px 14px', borderRadius: 10,
                  background: `${accentColor}10`, border: `1px solid ${accentColor}30`,
                  fontSize: 13, color: accentColor, fontWeight: 500,
                }}>
                  Province: {form.province}
                </div>
              )}

              {modalError && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14,
                }}>{modalError}</div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: 12, background: saving ? '#6ee7b7' : '#0891b2',
                  color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
                }}>
                  {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Constituency'}
                </button>
                <button type="button" onClick={closeModal} style={{
                  padding: '12px 20px', background: '#f8fafc', color: '#475569',
                  border: '1px solid #e2e8f0', borderRadius: 10, fontSize: 14,
                }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
