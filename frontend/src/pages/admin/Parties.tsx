import { useEffect, useRef, useState } from 'react';
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

export default function Parties() {
  const toast = useToast();
  const [parties, setParties] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [form, setForm] = useState({ name: '', leaderName: '', description: '' });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState('');
  const [logoHover, setLogoHover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [deleting, setDeleting] = useState<number | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const load = async () => { const res = await api.get('/parties'); setParties(res.data); };
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({ name: '', leaderName: '', description: '' });
    setLogoFile(null); setLogoPreview(''); setModalError('');
    setModalOpen(true);
  };

  const openEdit = (p: any) => {
    setEditTarget(p);
    setForm({ name: p.name, leaderName: p.leaderName, description: p.description || '' });
    setLogoFile(null); setLogoPreview(p.logo || ''); setModalError('');
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setSaving(true);
    try {
      let partyId: number;
      if (editTarget) {
        const res = await api.put(`/parties/${editTarget.id}`, form);
        partyId = res.data.id;
      } else {
        const res = await api.post('/parties', form);
        partyId = res.data.id;
      }
      if (logoFile) {
        const fd = new FormData();
        fd.append('logo', logoFile);
        await api.post(`/parties/${partyId}/logo`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      toast(editTarget ? 'Party updated successfully' : 'Party registered successfully', 'success');
      closeModal();
      load();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Operation failed');
    } finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this party?')) return;
    setDeleting(id);
    try {
      await api.delete(`/parties/${id}`);
      toast('Party deleted', 'info');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to delete party', 'error');
    }
    setDeleting(null);
    load();
  };

  const initial = form.name?.[0]?.toUpperCase() || editTarget?.name?.[0]?.toUpperCase() || '?';

  return (
    <div className="page-wrap">
      <PageHeader
        title="Political Parties"
        subtitle="Register and manage political parties"
        action={
          <button onClick={openCreate} style={{
            background: '#2563eb', color: 'white', border: 'none',
            borderRadius: 12, padding: '11px 22px', fontSize: 14, fontWeight: 600,
          }}>+ Add Party</button>
        }
      />

      {/* Parties grid */}
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {parties.length === 0 && (
          <div style={{ gridColumn: '1 / -1' }}>
            <EmptyState
              emoji="🏛️"
              title="No parties registered yet."
              action={
                <button onClick={openCreate} style={{
                  background: '#eff6ff', color: '#2563eb',
                  border: '1px solid #bfdbfe', borderRadius: 8, padding: '8px 18px', fontSize: 13, fontWeight: 600,
                }}>+ Register First Party</button>
              }
            />
          </div>
        )}
        {parties.map((p: any) => (
          <div key={p.id} style={{
            background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
              {p.logo
                ? <img src={p.logo} style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0', flexShrink: 0 }} alt="" />
                : (
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 20,
                  }}>
                    {p.name[0].toUpperCase()}
                  </div>
                )
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginBottom: 2 }}>{p.name}</p>
                <p style={{ fontSize: 13, color: '#64748b' }}>Leader: {p.leaderName}</p>
                {p.description && <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{p.description}</p>}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => openEdit(p)} style={{
                flex: 1, background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                borderRadius: 8, padding: '7px', fontSize: 13, fontWeight: 500,
              }}>Edit</button>
              <button onClick={() => remove(p.id)} disabled={deleting === p.id} style={{
                flex: 1, background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                borderRadius: 8, padding: '7px', fontSize: 13, fontWeight: 500,
              }}>
                {deleting === p.id ? '...' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
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
            width: '100%', maxWidth: 460, maxHeight: '90vh', overflowY: 'auto',
          }}>
            {/* Gradient header */}
            <div style={{
              background: 'linear-gradient(135deg, #1e40af, #3b82f6)',
              borderRadius: '20px 20px 0 0', padding: '24px 24px 48px',
              position: 'relative', textAlign: 'center',
            }}>
              <button onClick={closeModal} style={{
                position: 'absolute', top: 14, right: 16,
                background: 'rgba(255,255,255,0.2)', color: 'white',
                border: 'none', borderRadius: '50%', width: 30, height: 30,
                fontSize: 18, lineHeight: '30px', padding: 0,
              }}>×</button>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white', marginBottom: 4 }}>
                {editTarget ? 'Edit Party' : 'Register New Party'}
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>
                {editTarget ? `Editing ${editTarget.name}` : 'Fill in party details below'}
              </p>
            </div>

            {/* Logo avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: -44 }}>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => logoInputRef.current?.click()}
                  onMouseEnter={() => setLogoHover(true)}
                  onMouseLeave={() => setLogoHover(false)}
                  style={{
                    width: 88, height: 88, borderRadius: '50%',
                    border: '4px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    cursor: 'pointer', overflow: 'hidden', position: 'relative',
                    background: logoPreview ? 'transparent' : 'linear-gradient(135deg, #1e40af, #3b82f6)',
                  }}
                >
                  {logoPreview
                    ? <img src={logoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, color: 'white' }}>{initial}</div>
                  }
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: logoHover ? 1 : 0, transition: 'opacity 0.15s', fontSize: 24,
                  }}>📷</div>
                </div>
                <div onClick={() => logoInputRef.current?.click()} style={{
                  position: 'absolute', bottom: 2, right: 2,
                  width: 26, height: 26, borderRadius: '50%',
                  background: '#2563eb', border: '2px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 12,
                }}>📷</div>
              </div>
              <input type="file" ref={logoInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleLogoChange} />
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
              {logoFile ? `Selected: ${logoFile.name}` : 'Click to upload party logo'}
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '16px 28px 28px' }}>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Party Name</label>
                <input style={inp} placeholder="e.g. Pakistan Tehreek-e-Insaf"
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Leader Name</label>
                <input style={inp} placeholder="e.g. Imran Khan"
                  value={form.leaderName} onChange={e => setForm({ ...form, leaderName: e.target.value })} required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label style={lbl}>Description <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></label>
                <input style={inp} placeholder="Brief description of the party"
                  value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              {modalError && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626',
                  borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 14,
                }}>{modalError}</div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: 12, background: saving ? '#93c5fd' : '#2563eb',
                  color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
                }}>
                  {saving ? 'Saving...' : editTarget ? 'Save Changes' : 'Add Party'}
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
