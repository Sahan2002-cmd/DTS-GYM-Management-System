// ============================================================
//  Members.jsx — Full CRUD
//  Endpoints: /Member/*
// ============================================================
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembers, addMember, editMember, deleteMember } from '../actions';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { formatDate } from '../utils';
import { ROLES } from '../constants';

function FieldGroup({ label, children }) {
  return <div><label className="gym-label">{label}</label>{children}</div>;
}

const initUser   = { p_username: '', p_email: '', p_phone: '', p_password_hash: '' };
const initMember = { p_first_name: '', p_last_name: '', p_blood_group: '', p_weight: '', p_height: '', p_fitness_goal: '', p_join_date: '' };

export default function Members() {
  const dispatch  = useDispatch();
  const { data, loading } = useSelector((s) => s.members);
  const adminId   = useSelector((s) => s.ui.currentUserId);
  const user      = useSelector((s) => s.auth.user);
  const isAdmin   = user?.roleId === ROLES.ADMIN;

  const [showAdd,    setShowAdd]    = useState(false);
  const [showEdit,   setShowEdit]   = useState(false);
  const [showCard,   setShowCard]   = useState(false);
  const [cardData,   setCardData]   = useState(null);
  const [userForm,   setUserForm]   = useState(initUser);
  const [memForm,    setMemForm]    = useState(initMember);
  const [editForm,   setEditForm]   = useState({});
  const [saving,     setSaving]     = useState(false);
  const [search,     setSearch]     = useState('');
  const [viewMode,   setViewMode]   = useState('table');

  useEffect(() => { dispatch(fetchMembers()); }, [dispatch]);

  const handleAdd = async () => {
    if (!userForm.p_username || !userForm.p_email || !memForm.p_first_name) return;
    setSaving(true);
    const ok = await dispatch(addMember({ ...userForm, ...memForm }, adminId));
    setSaving(false);
    if (ok) { setShowAdd(false); setUserForm(initUser); setMemForm(initMember); }
  };

  const handleEditOpen = (row) => {
    setEditForm({
      p_member_id:    row.memberId,
      p_first_name:   row.firstName  || '',
      p_last_name:    row.lastName   || '',
      p_blood_group:  row.blood_group|| '',
      p_weight:       row.weight     || '',
      p_height:       row.height     || '',
      p_fitness_goal: row.fitness_goal|| '',
    });
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    const ok = await dispatch(editMember(editForm, adminId));
    setSaving(false);
    if (ok) setShowEdit(false);
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete member "${name}"? This sets them inactive.`))
      dispatch(deleteMember(id, adminId));
  };

  const filtered = search
    ? data.filter((m) =>
        (m.firstName + ' ' + m.lastName).toLowerCase().includes(search.toLowerCase()) ||
        (m.email || '').toLowerCase().includes(search.toLowerCase()) ||
        String(m.memberId).includes(search))
    : data;

  const columns = [
    { key: 'memberId',    label: 'ID',       width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'firstName',   label: 'Name',     render: (v, row) => (
      <button className="flex items-center gap-2 text-left" style={{ background:'none', border:'none', cursor:'pointer' }}
        onClick={() => { setCardData(row); setShowCard(true); }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden" style={{ background:'rgba(71,255,154,.15)', color:'var(--gym-success)', fontFamily:"'Space Mono',monospace" }}>
          {row.profile_image ? (
            <img src={getImgUrl(row.profile_image)} alt="" className="w-full h-full object-cover" />
          ) : (
            <span className="font-bold text-xs">{(v||'M').charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="font-medium" style={{ color:'var(--gym-text)' }}>{v} {row.lastName}</span>
      </button>
    )},
    { key: 'email',       label: 'Email',    render: (v) => <span className="text-xs" style={{ color:'var(--gym-muted)' }}>{v || '—'}</span> },
    { key: 'phone',       label: 'Phone',    render: (v) => <span className="text-xs">{v || '—'}</span> },
    { key: 'blood_group', label: 'Blood',    render: (v) => v || '—' },
    { key: 'joinDate',    label: 'Joined',   render: (v) => <span className="text-xs" style={{ color:'var(--gym-muted)' }}>{formatDate(v)}</span> },
    { key: 'status',      label: 'Status',   render: (v) => <Badge variant={v === 'active' ? 'active' : 'inactive'}>{v || 'active'}</Badge> },
    ...(isAdmin ? [{ key: '_actions', label: 'Actions', render: (_, row) => (
      <div className="flex gap-2">
        <button className="btn btn-secondary btn-sm" onClick={() => handleEditOpen(row)}>✏️</button>
        <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(row.memberId, `${row.firstName} ${row.lastName}`)}>🗑️</button>
      </div>
    )}] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <div className="page-title">Members</div>
          <div className="page-sub">{filtered.length} members</div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'var(--gym-muted)' }}>🔍</span>
            <input className="gym-input pl-8 w-48" placeholder="Search name, email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-secondary" onClick={() => setViewMode(viewMode === 'table' ? 'cards' : 'table')}>
            {viewMode === 'table' ? '⊞ Cards' : '☰ Table'}
          </button>
          {isAdmin && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Member</button>}
        </div>
      </div>

      {viewMode === 'table' ? (
        <DataTable columns={columns} data={filtered} loading={loading} rowKey="memberId" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((m) => (
            <div key={m.memberId} className="card p-5 space-y-3 cursor-pointer" onClick={() => { setCardData(m); setShowCard(true); }}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center overflow-hidden" style={{ background:'rgba(71,255,154,.15)', color:'var(--gym-success)', fontFamily:"'Space Mono',monospace" }}>
                    {m.profile_image ? (
                      <img src={getImgUrl(m.profile_image)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="font-bold text-xl">{(m.firstName||'M').charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold" style={{ color:'var(--gym-text)' }}>{m.firstName} {m.lastName}</div>
                    <div className="text-xs" style={{ color:'var(--gym-muted)' }}>{m.email}</div>
                  </div>
                </div>
                <Badge variant={m.status === 'active' ? 'active' : 'inactive'}>{m.status || 'active'}</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[['Blood', m.blood_group], ['Weight', m.weight ? `${m.weight}kg` : '—'], ['Height', m.height ? `${m.height}cm` : '—']].map(([k, v]) => (
                  <div key={k} className="p-2 rounded-lg" style={{ background:'var(--gym-surface2)' }}>
                    <div style={{ color:'var(--gym-muted)' }}>{k}</div>
                    <div className="font-medium" style={{ color:'var(--gym-text)' }}>{v || '—'}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="ADD MEMBER" maxWidth={520}>
        <div className="modal-body space-y-4">
          <div className="text-xs font-semibold tracking-widest" style={{ color:'var(--gym-muted)' }}>USER ACCOUNT</div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Username *"><input className="gym-input" value={userForm.p_username} onChange={(e) => setUserForm(f => ({ ...f, p_username: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Phone"><input className="gym-input" value={userForm.p_phone} onChange={(e) => setUserForm(f => ({ ...f, p_phone: e.target.value }))} /></FieldGroup>
          </div>
          <FieldGroup label="Email *"><input className="gym-input" type="email" value={userForm.p_email} onChange={(e) => setUserForm(f => ({ ...f, p_email: e.target.value }))} /></FieldGroup>
          <FieldGroup label="Password *"><input className="gym-input" type="password" value={userForm.p_password_hash} onChange={(e) => setUserForm(f => ({ ...f, p_password_hash: e.target.value }))} /></FieldGroup>
          <div className="text-xs font-semibold tracking-widest mt-2" style={{ color:'var(--gym-muted)' }}>MEMBER DETAILS</div>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="First Name *"><input className="gym-input" value={memForm.p_first_name} onChange={(e) => setMemForm(f => ({ ...f, p_first_name: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Last Name *"><input className="gym-input" value={memForm.p_last_name} onChange={(e) => setMemForm(f => ({ ...f, p_last_name: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Join Date"><input className="gym-input" type="date" value={memForm.p_join_date} onChange={(e) => setMemForm(f => ({ ...f, p_join_date: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Blood Group">
              <select className="gym-input" value={memForm.p_blood_group} onChange={(e) => setMemForm(f => ({ ...f, p_blood_group: e.target.value }))}>
                <option value="">Select...</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Weight (kg)"><input className="gym-input" type="number" value={memForm.p_weight} onChange={(e) => setMemForm(f => ({ ...f, p_weight: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Height (cm)"><input className="gym-input" type="number" value={memForm.p_height} onChange={(e) => setMemForm(f => ({ ...f, p_height: e.target.value }))} /></FieldGroup>
          </div>
          <FieldGroup label="Fitness Goal">
            <textarea className="gym-input resize-none" rows={2} value={memForm.p_fitness_goal} onChange={(e) => setMemForm(f => ({ ...f, p_fitness_goal: e.target.value }))} placeholder="e.g. Lose weight, Build muscle..." />
          </FieldGroup>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Adding...' : 'Add Member'}</button>
        </div>
      </Modal>

      {/* Edit */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="EDIT MEMBER" maxWidth={480}>
        <div className="modal-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="First Name"><input className="gym-input" value={editForm.p_first_name||''} onChange={(e) => setEditForm(f => ({ ...f, p_first_name: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Last Name"><input className="gym-input" value={editForm.p_last_name||''} onChange={(e) => setEditForm(f => ({ ...f, p_last_name: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Weight (kg)"><input className="gym-input" type="number" value={editForm.p_weight||''} onChange={(e) => setEditForm(f => ({ ...f, p_weight: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Height (cm)"><input className="gym-input" type="number" value={editForm.p_height||''} onChange={(e) => setEditForm(f => ({ ...f, p_height: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Blood Group">
              <select className="gym-input" value={editForm.p_blood_group||''} onChange={(e) => setEditForm(f => ({ ...f, p_blood_group: e.target.value }))}>
                <option value="">Select...</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((b) => <option key={b} value={b}>{b}</option>)}
              </select>
            </FieldGroup>
          </div>
          <FieldGroup label="Fitness Goal">
            <textarea className="gym-input resize-none" rows={2} value={editForm.p_fitness_goal||''} onChange={(e) => setEditForm(f => ({ ...f, p_fitness_goal: e.target.value }))} />
          </FieldGroup>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </Modal>

      {/* Card */}
      <Modal isOpen={showCard} onClose={() => setShowCard(false)} title="MEMBER PROFILE" maxWidth={420}>
        {cardData && (
          <div className="modal-body space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden" style={{ background:'rgba(71,255,154,.15)', color:'var(--gym-success)', fontFamily:"'Space Mono',monospace" }}>
                {cardData.profile_image ? (
                  <img src={getImgUrl(cardData.profile_image)} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-2xl">{(cardData.firstName||'M').charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div>
                <div className="text-xl font-bold" style={{ color:'var(--gym-text)' }}>{cardData.firstName} {cardData.lastName}</div>
                <div className="text-sm" style={{ color:'var(--gym-success)' }}>Member #{cardData.memberId}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Email',   cardData.email],
                ['Phone',   cardData.phone],
                ['Joined',  formatDate(cardData.joinDate)],
                ['Blood',   cardData.blood_group],
                ['Weight',  cardData.weight ? `${cardData.weight} kg` : '—'],
                ['Height',  cardData.height ? `${cardData.height} cm` : '—'],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl" style={{ background:'var(--gym-surface2)' }}>
                  <div className="text-xs" style={{ color:'var(--gym-muted)' }}>{k}</div>
                  <div className="text-sm font-medium truncate" style={{ color:'var(--gym-text)' }}>{v || '—'}</div>
                </div>
              ))}
            </div>
            {cardData.fitness_goal && (
              <div className="p-3 rounded-xl" style={{ background:'var(--gym-surface2)' }}>
                <div className="text-xs mb-1" style={{ color:'var(--gym-muted)' }}>Fitness Goal</div>
                <div className="text-sm" style={{ color:'var(--gym-text)' }}>💪 {cardData.fitness_goal}</div>
              </div>
            )}
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowCard(false)}>Close</button>
          {isAdmin && cardData && <button className="btn btn-primary" onClick={() => { handleEditOpen(cardData); setShowCard(false); }}>✏️ Edit</button>}
        </div>
      </Modal>
    </div>
  );
}
