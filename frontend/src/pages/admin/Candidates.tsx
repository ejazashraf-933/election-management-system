import { useEffect, useRef, useState } from 'react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import PageHeader from '../../components/ui/PageHeader';
import CandidateAvatar from '../../components/ui/CandidateAvatar';
import EmptyState from '../../components/ui/EmptyState';

export default function Candidates() {
  const toast = useToast();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<any>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [photoHover, setPhotoHover] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const load = async () => { const res = await api.get('/candidates'); setCandidates(res.data); };
  useEffect(() => { load(); }, []);

  const openEdit = (c: any) => {
    setEditTarget(c);
    setPhotoFile(null);
    setPhotoPreview(c.photo ?? '');
    setModalError('');
    setModalOpen(true);
  };

  const closeModal = () => { setModalOpen(false); setEditTarget(null); };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setSaving(true);
    try {
      if (photoFile) {
        const fd = new FormData();
        fd.append('photo', photoFile);
        await api.post(`/candidates/${editTarget.id}/photo`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      toast('Photo updated successfully', 'success');
      closeModal();
      load();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const editInitial = editTarget?.user?.name?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="page-wrap">
      <PageHeader title="Candidates" subtitle="View registered candidates and manage their photos" />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {candidates.length === 0 && (
          <EmptyState
            emoji="🏛️"
            title="No candidates registered yet."
            description="Voters can register as candidates from their dashboard."
          />
        )}
        {candidates.map((c: any, i: number) => (
          <div key={c.id} style={{
            background: 'white', borderRadius: 16, border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)', padding: '18px 22px',
            display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
          }}>
            <CandidateAvatar photo={c.photo} name={c.user?.name ?? '?'} size={54} colorIndex={i} />

            <div style={{ flex: 1, minWidth: 160 }}>
              <p style={{ fontWeight: 700, color: '#0f172a', fontSize: 15, marginBottom: 4 }}>
                {c.user?.name ?? 'Unknown'}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 12, background: '#eff6ff', color: '#1d4ed8',
                  borderRadius: 20, padding: '2px 8px', fontWeight: 500,
                }}>
                  {c.party?.name ?? 'Independent'}
                </span>
                <span style={{ fontSize: 12, color: '#64748b' }}>·</span>
                <span style={{ fontSize: 12, color: '#64748b' }}>{c.constituency?.name}</span>
                <span style={{
                  fontSize: 11, color: '#94a3b8', background: '#f8fafc',
                  border: '1px solid #e2e8f0', borderRadius: 8, padding: '2px 8px',
                }}>
                  User #{c.user?.id}
                </span>
              </div>
            </div>

            <div className="btn-group">
              <button onClick={() => openEdit(c)} style={{
                background: '#eff6ff', color: '#2563eb', border: '1px solid #bfdbfe',
                borderRadius: 8, padding: '7px 16px', fontSize: 13, fontWeight: 500,
              }}>
                Edit Photo
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
            width: '100%', maxWidth: 480, maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{
              background: 'linear-gradient(135deg, #1e40af, #7c3aed)',
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
                Update Candidate Photo
              </h2>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)' }}>{editTarget?.user?.name}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: -48 }}>
              <div style={{ position: 'relative' }}>
                <div
                  onClick={() => photoInputRef.current?.click()}
                  onMouseEnter={() => setPhotoHover(true)}
                  onMouseLeave={() => setPhotoHover(false)}
                  style={{
                    width: 96, height: 96, borderRadius: '50%',
                    border: '4px solid white', boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    cursor: 'pointer', overflow: 'hidden', position: 'relative',
                    background: photoPreview ? 'transparent' : '#7c3aed15',
                  }}
                >
                  {photoPreview
                    ? <img src={photoPreview} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, color: '#7c3aed' }}>{editInitial}</div>
                  }
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: photoHover ? 1 : 0, transition: 'opacity 0.15s', fontSize: 26,
                  }}>📷</div>
                </div>
                <div onClick={() => photoInputRef.current?.click()} style={{
                  position: 'absolute', bottom: 2, right: 2, width: 28, height: 28, borderRadius: '50%',
                  background: '#2563eb', border: '2px solid white',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', fontSize: 13,
                }}>📷</div>
              </div>
              <input type="file" ref={photoInputRef} style={{ display: 'none' }} accept="image/*" onChange={handlePhotoChange} />
            </div>
            <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 8 }}>
              {photoFile ? `Selected: ${photoFile.name}` : 'Click photo to upload'}
            </p>

            <form onSubmit={handleSubmit} style={{ padding: '16px 28px 28px' }}>
              {editTarget && (
                <div style={{
                  background: '#f8fafc', borderRadius: 12, padding: '16px',
                  marginBottom: 20, border: '1px solid #e2e8f0',
                }}>
                  {[
                    { label: 'Name', value: editTarget.user?.name },
                    { label: 'Party', value: editTarget.party?.name ?? 'Independent' },
                    { label: 'Constituency', value: editTarget.constituency?.name },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                      <span style={{ color: '#64748b' }}>{row.label}</span>
                      <span style={{ fontWeight: 600, color: '#0f172a' }}>{row.value}</span>
                    </div>
                  ))}
                  <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 10, textAlign: 'center' }}>
                    Only photo can be updated here
                  </p>
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
                  flex: 1, padding: '12px', background: saving ? '#93c5fd' : '#2563eb',
                  color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600,
                }}>
                  {saving ? 'Saving...' : 'Update Photo'}
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
