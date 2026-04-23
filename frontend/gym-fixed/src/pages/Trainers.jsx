// ============================================================
//  Trainers.jsx — Full CRUD
//  Endpoints: /Trainer/*
// ============================================================
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrainers, addTrainer, editTrainer, deleteTrainer, fetchTrainerTimeslots, addTrainerAssignmentByMember, fetchAssignments } from '../actions';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { ROLES } from '../constants';
import TrainerRequestPanel from '../components/member/TrainerRequestPanel';
import { getImgUrl } from '../utils';

function FieldGroup({ label, children }) {
  return <div><label className="gym-label">{label}</label>{children}</div>;
}

const initUser    = { p_username: '', p_email: '', p_phone: '', p_password_hash: '' };
const initTrainer = { p_experience_years: '', p_bio: '' };

export default function Trainers() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.trainers);
  const trainerTimeslots = useSelector((s) => s.trainerTimeslots.data);
  const trainerRequests  = useSelector((s) => s.trainerRequests?.data || []);
  const myAssignments     = useSelector((s) => s.assignments.data);
  
  const adminId  = useSelector((s) => s.ui.currentUserId);
  const user     = useSelector((s) => s.auth.user);
  const isAdmin  = user?.roleId === ROLES.ADMIN;
  const isMember = user?.roleId === ROLES.MEMBER;

  const [showAdd,  setShowAdd]  = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [cardData, setCardData] = useState(null);
  const [uForm,    setUForm]    = useState(initUser);
  const [tForm,    setTForm]    = useState(initTrainer);
  const [editForm, setEditForm] = useState({});
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState('');
  const [viewMode, setViewMode] = useState('cards');

  useEffect(() => { 
    dispatch(fetchTrainers());
    if (isMember) {
      dispatch(fetchTrainerTimeslots());
      dispatch(fetchAssignments());
    }
  }, [dispatch, isMember]);

  const handleAdd = async () => {
    if (!uForm.p_username || !uForm.p_email) return;
    setSaving(true);
    const ok = await dispatch(addTrainer({ ...uForm, ...tForm }, adminId));
    setSaving(false);
    if (ok) { setShowAdd(false); setUForm(initUser); setTForm(initTrainer); }
  };

  const handleEditOpen = (row) => {
    setEditForm({
      p_trainer_id:      row.trainerId,
      p_experience_years:row.experience_years || '',
      p_bio:             row.bio || '',
    });
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    const ok = await dispatch(editTrainer(editForm, adminId));
    setSaving(false);
    if (ok) setShowEdit(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete trainer "${name}"?`)) dispatch(deleteTrainer(id, adminId));
  };

  const filtered = search
    ? data.filter((t) =>
        (t.username || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.email    || '').toLowerCase().includes(search.toLowerCase()))
    : data;

  const columns = [
    { key: 'trainerId',        label: 'ID',         width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'username',         label: 'Trainer',    render: (v, row) => (
      <button className="flex items-center gap-2 text-left" style={{ background:'none', border:'none', cursor:'pointer' }}
        onClick={() => { setCardData(row); setShowCard(true); }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden" style={{ background:'rgba(71,200,255,.15)', color:'var(--gym-accent3)' }}>
          {row.profile_image ? (
            <img src={getImgUrl(row.profile_image)} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-xs">{(v||'T').charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="font-medium" style={{ color:'var(--gym-text)' }}>{v}</span>
      </button>
    )},
    { key: 'email',            label: 'Email',      render: (v) => <span className="text-xs" style={{ color:'var(--gym-muted)' }}>{v}</span> },
    { key: 'experience_years', label: 'Exp (yrs)',  render: (v) => v || '0' },
    { key: 'status',           label: 'Status',     render: (v) => <Badge variant={v === 'active' ? 'active' : 'inactive'}>{v || 'active'}</Badge> },
    ...(isAdmin ? [{ key: '_actions', label: 'Actions', render: (_, row) => (
      <div className="flex gap-2">
        <button className="btn btn-secondary btn-sm" onClick={() => handleEditOpen(row)}>✏️ Edit</button>
        <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(row.trainerId, row.username)}>🗑️</button>
      </div>
    )}] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <div className="page-title">Trainers</div>
          <div className="page-sub">{(data || []).length} registered experts</div>
        </div>
        <div className="flex gap-2">
          {!isMember && (
            <div className="flex rounded-lg p-1" style={{ background: 'var(--gym-surface2)', border: '1px solid var(--gym-border)' }}>
               {[{ id: 'cards', l: '🎴' }, { id: 'table', l: '📋' }].map(v => (
                 <button key={v.id} onClick={() => setViewMode(v.id)} 
                   className="px-3 py-1 rounded text-sm transition-all"
                   style={{ 
                     background: viewMode === v.id ? 'var(--gym-accent)' : 'transparent',
                     color: viewMode === v.id ? '#000' : 'var(--gym-muted)',
                     fontWeight: viewMode === v.id ? 700 : 400
                   }}>{v.l}</button>
               ))}
            </div>
          )}
          {isAdmin && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Trainer</button>}
        </div>
      </div>

      {!isMember && (
        <div className="flex items-center gap-3">
          <div className="relative w-64">
             <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs opacity-50">🔍</span>
             <input className="gym-input pl-9" placeholder="Search trainers..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      )}

      {isMember ? (
        <TrainerRequestPanel
          trainers={data}
          trainerTimeslots={trainerTimeslots}
          trainerRequests={trainerRequests}
          activeAssignments={(myAssignments || []).filter(a => a.memberId === user?.userId) || []}
          onRequestTrainer={(t) => dispatch(addTrainerAssignmentByMember({
            p_trainer_id: t.trainerId,
            p_member_id: user.userId,
            p_assignment_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            p_admin_id: user.userId
          }))}
        />
      ) : viewMode === 'table' ? (
        <DataTable columns={columns} data={filtered} loading={loading} rowKey="trainerId" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {(filtered || []).map((t) => (
            <div key={t.trainerId} className="card p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden" style={{ background:'rgba(71,200,255,.15)', color:'var(--gym-accent3)' }}>
                    {t.profile_image ? (
                      <img src={getImgUrl(t.profile_image)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-xl">{(t.username||'T').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color:'var(--gym-text)' }}>{t.username}</div>
                    <div className="text-xs" style={{ color:'var(--gym-muted)' }}>{t.email}</div>
                  </div>
                </div>
                <Badge variant={t.status === 'active' ? 'active' : 'inactive'}>{t.status || 'active'}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['📞 Phone', t.phone],
                  ['⭐ Experience', `${t.experience_years || 0} years`],
                ].map(([k, v]) => (
                  <div key={k} className="p-2 rounded-lg text-xs" style={{ background:'var(--gym-surface2)' }}>
                    <div style={{ color:'var(--gym-muted)' }}>{k}</div>
                    <div className="font-medium mt-0.5" style={{ color:'var(--gym-text)' }}>{v || '—'}</div>
                  </div>
                ))}
              </div>
              {t.bio && <div className="text-xs p-2 rounded-lg" style={{ background:'var(--gym-surface2)', color:'var(--gym-muted)' }}>{t.bio}</div>}
              {isAdmin && (
                <div className="flex gap-2 pt-2 border-t" style={{ borderColor:'var(--gym-border)' }}>
                  <button className="btn btn-secondary btn-sm flex-1" onClick={() => handleEditOpen(t)}>✏️ Edit</button>
                  <button className="btn btn-danger btn-sm flex-1"    onClick={() => handleDelete(t.trainerId, t.username)}>🗑️ Delete</button>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && !loading && (
            <div className="col-span-3 text-center py-12" style={{ color:'var(--gym-muted)' }}>No trainers found.</div>
          )}
        </div>
      )}

      {/* Add */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="ADD TRAINER" maxWidth={500}>
        <div className="modal-body space-y-4">
          <div className="text-xs font-semibold tracking-widest mb-1" style={{ color:'var(--gym-muted)' }}>USER ACCOUNT</div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Username *"><input className="gym-input" value={uForm.p_username} onChange={(e) => setUForm(f => ({ ...f, p_username: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Phone"><input className="gym-input" value={uForm.p_phone} onChange={(e) => setUForm(f => ({ ...f, p_phone: e.target.value }))} /></FieldGroup>
          </div>
          <FieldGroup label="Email *"><input className="gym-input" type="email" value={uForm.p_email} onChange={(e) => setUForm(f => ({ ...f, p_email: e.target.value }))} /></FieldGroup>
          <FieldGroup label="Password *"><input className="gym-input" type="password" value={uForm.p_password_hash} onChange={(e) => setUForm(f => ({ ...f, p_password_hash: e.target.value }))} /></FieldGroup>
          <div className="text-xs font-semibold tracking-widest mt-2 mb-1" style={{ color:'var(--gym-muted)' }}>TRAINER DETAILS</div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Experience (years)"><input className="gym-input" type="number" min="0" value={tForm.p_experience_years} onChange={(e) => setTForm(f => ({ ...f, p_experience_years: e.target.value }))} placeholder="0" /></FieldGroup>
          </div>
          <FieldGroup label="Bio"><textarea className="gym-input resize-none" rows={3} value={tForm.p_bio} onChange={(e) => setTForm(f => ({ ...f, p_bio: e.target.value }))} placeholder="Trainer bio..." /></FieldGroup>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Adding...' : 'Add Trainer'}</button>
        </div>
      </Modal>

      {/* Edit */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="EDIT TRAINER" maxWidth={440}>
        <div className="modal-body space-y-4">
          <FieldGroup label="Experience (years)">
            <input className="gym-input" type="number" min="0" value={editForm.p_experience_years || ''}
              onChange={(e) => setEditForm(f => ({ ...f, p_experience_years: e.target.value }))} />
          </FieldGroup>
          <FieldGroup label="Bio">
            <textarea className="gym-input resize-none" rows={4} value={editForm.p_bio || ''}
              onChange={(e) => setEditForm(f => ({ ...f, p_bio: e.target.value }))} />
          </FieldGroup>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </Modal>

      {/* Card */}
      <Modal isOpen={showCard} onClose={() => setShowCard(false)} title="TRAINER PROFILE" maxWidth={400}>
        {cardData && (
          <div className="modal-body space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background:'rgba(71,200,255,.15)', color:'var(--gym-accent3)' }}>
                {cardData.profile_image ? (
                  <img src={getImgUrl(cardData.profile_image)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-2xl">{(cardData.username||'T').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color:'var(--gym-text)' }}>{cardData.username}</div>
                <div className="text-sm" style={{ color:'var(--gym-accent3)' }}>Trainer #{cardData.trainerId}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Email',      cardData.email],
                ['Phone',      cardData.phone],
                ['Experience', `${cardData.experience_years || 0} years`],
                ['Status',     cardData.status],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl" style={{ background:'var(--gym-surface2)' }}>
                  <div className="text-xs" style={{ color:'var(--gym-muted)' }}>{k}</div>
                  <div className="text-sm font-medium" style={{ color:'var(--gym-text)' }}>{v || '—'}</div>
                </div>
              ))}
            </div>
            {cardData.bio && <div className="p-3 rounded-xl text-sm" style={{ background:'var(--gym-surface2)', color:'var(--gym-muted)' }}>{cardData.bio}</div>}
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowCard(false)}>Close</button>
        </div>
      </Modal>
    </div>
  );
}
