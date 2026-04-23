// ============================================================
//  Equipment.jsx — Equipment + Live RFID Tracking
//  Endpoints: /Equipment/*, /EquipmentUsageLog/*
// ============================================================
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEquipment, addEquipment, editEquipment, deleteEquipment, fetchLiveEquipmentUsage } from '../actions';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { ROLES } from '../constants';

function FieldGroup({ label, children }) {
  return <div><label className="gym-label">{label}</label>{children}</div>;
}

const initForm = { p_equipment_name: '', p_equipment_type: '', p_description: '' };

export default function Equipment() {
  const dispatch      = useDispatch();
  const { data, loading } = useSelector((s) => s.equipment);
  const liveUsage     = useSelector((s) => s.equipmentUsage?.data || []);
  const adminId       = useSelector((s) => s.ui.currentUserId);
  const user          = useSelector((s) => s.auth.user);
  const isAdmin       = user?.roleId === ROLES.ADMIN;

  const [tab,      setTab]      = useState('equipment');
  const [showAdd,  setShowAdd]  = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form,     setForm]     = useState(initForm);
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState('');
  const [liveTimer,setLiveTimer]= useState(null);

  useEffect(() => {
    dispatch(fetchEquipment());
    dispatch(fetchLiveEquipmentUsage());
    // Auto-refresh live usage every 30s
    const timer = setInterval(() => dispatch(fetchLiveEquipmentUsage()), 30000);
    setLiveTimer(timer);
    return () => clearInterval(timer);
  }, [dispatch]);

  const handleAdd = async () => {
    if (!form.p_equipment_name) return;
    setSaving(true);
    const ok = await dispatch(addEquipment(form, adminId));
    setSaving(false);
    if (ok) { setShowAdd(false); setForm(initForm); }
  };

  const handleEditOpen = (row) => {
    setForm({ p_equipment_id: row.equipmentId, p_equipment_name: row.equipmentName, p_equipment_type: row.equipmentType || '', p_description: row.description || '' });
    setShowEdit(true);
  };

  const handleEditSave = async () => {
    setSaving(true);
    const ok = await dispatch(editEquipment(form, adminId));
    setSaving(false);
    if (ok) { setShowEdit(false); setForm(initForm); }
  };

  const handleDelete = (id, name) => {
    if (window.confirm(`Delete equipment "${name}"?`)) dispatch(deleteEquipment(id, adminId));
  };

  const filtered = search
    ? data.filter((e) => (e.equipmentName || '').toLowerCase().includes(search.toLowerCase()))
    : data;

  const eqCols = [
    { key: 'equipmentId',   label: 'ID',    width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'equipmentName', label: 'Name',  render: (v) => <span className="font-medium" style={{ color:'var(--gym-text)' }}>{v}</span> },
    { key: 'equipmentType', label: 'Type',  render: (v) => <span style={{ color:'var(--gym-accent3)' }}>{v || '—'}</span> },
    { key: 'description',   label: 'Notes', render: (v) => <span className="text-xs" style={{ color:'var(--gym-muted)' }}>{v ? v.substring(0,50)+'…' : '—'}</span> },
    { key: 'quantity',      label: 'Qty',   render: (v) => <Badge variant="info">{v || 0}</Badge> },
    ...(isAdmin ? [{ key: '_actions', label: 'Actions', render: (_, row) => (
      <div className="flex gap-2">
        <button className="btn btn-secondary btn-sm" onClick={() => handleEditOpen(row)}>✏️ Edit</button>
        <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(row.equipmentId, row.equipmentName)}>🗑️</button>
      </div>
    )}] : [{ key: '_tag', label: 'Start Usage', render: (_, row) => (
      <button className="btn btn-primary btn-sm flex items-center gap-1" onClick={() => handleTagRFID(row)}>
        <span>📡</span> Tag RFID
      </button>
    )}]),
  ];

  const handleTagRFID = async (eq) => {
    const rfid = window.prompt(`Enter RFID Tag ID to start using ${eq.equipmentName}:`);
    if (!rfid) return;
    try {
      const res = await api.apiClient.post(`/Equipment/Tag?equipmentId=${eq.equipmentId}&rfidId=${rfid}`);
      if (res.data?.StatusCode === 200) {
        dispatch(showToast(`Session started for ${eq.equipmentName}`, 'success'));
        dispatch(fetchLiveEquipmentUsage());
      } else {
        dispatch(showToast(res.data?.Result || 'Failed to start session', 'error'));
      }
    } catch { dispatch(showToast('Connection error', 'error')); }
  };

  const liveCols = [
    { key: 'LogId',        label: 'Log',     width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'memberName',   label: 'Member',  render: (v) => <span className="font-medium" style={{ color:'var(--gym-text)' }}>{v || '—'}</span> },
    { key: 'equipmentName',label: 'Machine', render: (v) => <span style={{ color:'var(--gym-accent3)' }}>{v || '—'}</span> },
    { key: 'starttime',    label: 'Started', render: (v) => <span className="font-mono text-xs">{v ? v.substring(0,19) : '—'}</span> },
    { key: 'elapsed_mins', label: 'Elapsed', render: (v, row) => {
      const mins = v !== undefined ? v : (row.starttime ? Math.floor((Date.now() - new Date(row.starttime)) / 60000) : 0);
      const over = row.target_mins && mins > row.target_mins;
      return <span className="font-mono text-xs font-bold" style={{ color: over ? 'var(--gym-accent2)' : 'var(--gym-success)' }}>{mins} min{over ? ' ⚠️' : ''}</span>;
    }},
    { key: 'target_mins',  label: 'Target',  render: (v) => v ? <span className="text-xs">{v} min</span> : '—' },
    { key: 'status',       label: 'Status',  render: (v) => <Badge variant={v === 'completed' ? 'active' : 'info'}>{v || 'in_progress'}</Badge> },
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <div className="page-title">Equipment</div>
          <div className="page-sub">{data.length} items · {liveUsage.length} in use now</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => dispatch(fetchLiveEquipmentUsage())}>↺ Refresh Live</button>
          {isAdmin && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add Equipment</button>}
        </div>
      </div>

      {/* Live Alert */}
      {liveUsage.length > 0 && (
        <div className="p-3 rounded-xl flex items-center gap-3" style={{ background:'rgba(71,200,255,.08)', border:'1px solid rgba(71,200,255,.2)' }}>
          <span className="text-xl">🔴</span>
          <span className="text-sm font-medium" style={{ color:'var(--gym-accent3)' }}>
            <strong>{liveUsage.length}</strong> member{liveUsage.length > 1 ? 's' : ''} currently using equipment
          </span>
        </div>
      )}

      <div className="flex gap-1 border-b" style={{ borderColor:'var(--gym-border)' }}>
        {[
          { id:'equipment', label:'🏋️ Equipment List' },
          { id:'live',      label:`🔴 Live Tracking (${liveUsage.length})` },
        ].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 text-sm font-semibold"
            style={{ color: tab===id ? 'var(--gym-accent)' : 'var(--gym-muted)', borderBottom: tab===id ? '2px solid var(--gym-accent)' : '2px solid transparent', background:'transparent', marginBottom:-1 }}>
            {label}
          </button>
        ))}
      </div>

      {tab === 'equipment' && (
        <div className="space-y-3">
          <div className="relative w-52">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color:'var(--gym-muted)' }}>🔍</span>
            <input className="gym-input pl-8" placeholder="Search equipment..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <DataTable columns={eqCols} data={filtered} loading={loading} rowKey="equipmentId" />
        </div>
      )}

      {tab === 'live' && (
        <div className="space-y-3">
          {liveUsage.length === 0
            ? <div className="card p-8 text-center" style={{ color:'var(--gym-muted)' }}>
                <div className="text-4xl mb-3">🏃</div>
                <div className="text-sm">No members currently using equipment.</div>
              </div>
            : <DataTable columns={liveCols} data={liveUsage} loading={false} rowKey="LogId" />
          }
        </div>
      )}

      {/* Add */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="ADD EQUIPMENT" maxWidth={440}>
        <div className="modal-body space-y-4">
          <FieldGroup label="Equipment Name *">
            <input className="gym-input" value={form.p_equipment_name} onChange={(e) => setForm(f => ({ ...f, p_equipment_name: e.target.value }))} placeholder="e.g. Treadmill" />
          </FieldGroup>
          <FieldGroup label="Type">
            <input className="gym-input" value={form.p_equipment_type} onChange={(e) => setForm(f => ({ ...f, p_equipment_type: e.target.value }))} placeholder="e.g. Cardio, Strength" />
          </FieldGroup>
          <FieldGroup label="Description">
            <textarea className="gym-input resize-none" rows={3} value={form.p_description} onChange={(e) => setForm(f => ({ ...f, p_description: e.target.value }))} />
          </FieldGroup>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Adding...' : 'Add Equipment'}</button>
        </div>
      </Modal>

      {/* Edit */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="EDIT EQUIPMENT" maxWidth={440}>
        <div className="modal-body space-y-4">
          <FieldGroup label="Name">
            <input className="gym-input" value={form.p_equipment_name} onChange={(e) => setForm(f => ({ ...f, p_equipment_name: e.target.value }))} />
          </FieldGroup>
          <FieldGroup label="Type">
            <input className="gym-input" value={form.p_equipment_type} onChange={(e) => setForm(f => ({ ...f, p_equipment_type: e.target.value }))} />
          </FieldGroup>
          <FieldGroup label="Description">
            <textarea className="gym-input resize-none" rows={3} value={form.p_description} onChange={(e) => setForm(f => ({ ...f, p_description: e.target.value }))} />
          </FieldGroup>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleEditSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </Modal>
    </div>
  );
}
