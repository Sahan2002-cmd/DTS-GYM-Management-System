// ============================================================
//  Schedules.jsx
//  Endpoints: /Schedule/*
// ============================================================
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSchedules, fetchSchedulesByMember, fetchMembers, fetchTrainers, fetchTimeslots,
         addSchedule, editSchedule, updateScheduleStatus, deleteSchedule } from '../actions';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { formatDate } from '../utils';
import { ROLES } from '../constants';

function FieldGroup({ label, children }) {
  return <div><label className="gym-label">{label}</label>{children}</div>;
}

const initForm = { p_member_id: '', p_trainer_id: '', p_timeslot_id: '', p_schedule_date: '', p_rfid_id: '', p_status: 'Pending' };

export default function Schedules() {
  const dispatch  = useDispatch();
  const user      = useSelector((s) => s.auth.user);
  const { data, loading } = useSelector((s) => s.schedules);
  const members   = useSelector((s) => s.members.data);
  const trainers  = useSelector((s) => s.trainers.data);
  const timeslots = useSelector((s) => s.timeslots.data);
  const adminId   = useSelector((s) => s.ui.currentUserId);

  const isAdmin   = user?.roleId === ROLES.ADMIN;
  const isTrainer = user?.roleId === ROLES.TRAINER;

  const [showAdd,     setShowAdd]     = useState(false);
  const [showEdit,    setShowEdit]    = useState(false);
  const [form,        setForm]        = useState(initForm);
  const [saving,      setSaving]      = useState(false);
  const [search,      setSearch]      = useState('');
  const [statusFilter,setStatusFilter]= useState('all');

  useEffect(() => {
    if (user?.roleId === ROLES.MEMBER) {
      dispatch(fetchSchedulesByMember(user.userId));
    } else {
      dispatch(fetchSchedules());
    }
    dispatch(fetchMembers());
    dispatch(fetchTrainers());
    dispatch(fetchTimeslots());
  }, [dispatch, user]);

  const handleAdd = async () => {
    if (!form.p_member_id || !form.p_trainer_id || !form.p_timeslot_id || !form.p_schedule_date) return;
    setSaving(true);
    const ok = await dispatch(addSchedule(form, adminId));
    setSaving(false);
    if (ok) { setShowAdd(false); setForm(initForm); }
  };

  const handleEditOpen = (row) => {
    setForm({
      p_schedule_id:   row.scheduleId,
      p_member_id:     row.memberId,
      p_trainer_id:    row.trainerId,
      p_timeslot_id:   row.timeslotId,
      p_schedule_date: row.scheduleDate?.substring(0,10) || '',
      p_rfid_id:       row.rfid_Id || '',
      p_status:        row.status || 'Pending',
    });
    setShowEdit(true);
  };

  const handleEdit = async () => {
    setSaving(true);
    const ok = await dispatch(editSchedule(form, adminId));
    setSaving(false);
    if (ok) { setShowEdit(false); setForm(initForm); }
  };

  const handleStatus = (id, status) => dispatch(updateScheduleStatus(id, status));
  const handleDelete = (id) => { if (window.confirm(`Delete schedule #${id}?`)) dispatch(deleteSchedule(id, adminId)); };

  let filtered = data;
  if (search)              filtered = filtered.filter((s) => String(s.scheduleId).includes(search) || (s.memberName || '').toLowerCase().includes(search.toLowerCase()));
  if (statusFilter !== 'all') filtered = filtered.filter((s) => s.status === statusFilter);

  const statusVariant = (s = '') => {
    if (s === 'Scheduled')  return 'active';
    if (s === 'Cancelled')  return 'inactive';
    return 'pending';
  };

  const columns = [
    { key: 'scheduleId',   label: 'ID',      width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'memberName',   label: 'Member',  render: (v, row) => {
      const m = members.find((x) => x.memberId === row.memberId);
      return <span className="font-medium" style={{ color: 'var(--gym-text)' }}>{v || (m ? `${m.firstName} ${m.lastName}` : `#${row.memberId}`)}</span>;
    }},
    { key: 'trainerName',  label: 'Trainer', render: (v, row) => {
      const t = trainers.find((x) => x.trainerId === row.trainerId);
      return <span style={{ color: 'var(--gym-accent3)' }}>{v || (t ? t.username : `#${row.trainerId}`)}</span>;
    }},
    { key: 'scheduleDate', label: 'Date',    render: (v) => formatDate(v) },
    { key: 'starttime',    label: 'Time',    render: (v, row) => (
      <span className="font-mono text-xs">{v && row.endtime ? `${v} – ${row.endtime}` : '—'}</span>
    )},
    { key: 'status',       label: 'Status',  render: (v) => <Badge variant={statusVariant(v)}>{v || 'Pending'}</Badge> },
    ...(isAdmin || isTrainer ? [{
      key: '_actions', label: 'Actions', render: (_, row) => (
        <div className="flex gap-1 flex-wrap">
          {row.status !== 'Scheduled' && <button className="btn btn-secondary btn-sm" style={{ color: 'var(--gym-success)', fontSize: '0.7rem' }} onClick={() => handleStatus(row.scheduleId, 'Scheduled')}>✓ Confirm</button>}
          {row.status !== 'Cancelled' && <button className="btn btn-secondary btn-sm" style={{ color: 'var(--gym-accent2)', fontSize: '0.7rem' }} onClick={() => handleStatus(row.scheduleId, 'Cancelled')}>✕ Cancel</button>}
          {isAdmin && <button className="btn btn-secondary btn-sm" onClick={() => handleEditOpen(row)}>✏️</button>}
          {isAdmin && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.scheduleId)}>🗑️</button>}
        </div>
      )
    }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <div className="page-title">Schedules</div>
          <div className="page-sub">{filtered.length} sessions</div>
        </div>
        {(isAdmin || isTrainer) && (
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Schedule</button>
        )}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--gym-muted)' }}>🔍</span>
          <input className="gym-input pl-8 w-48" placeholder="Search member, ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="gym-input w-36" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Scheduled">Scheduled</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} rowKey="scheduleId" />

      {/* ADD */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="CREATE SCHEDULE" maxWidth={500}>
        <div className="modal-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Member *">
              <select className="gym-input" value={form.p_member_id} onChange={(e) => setForm(f => ({ ...f, p_member_id: e.target.value }))}>
                <option value="">Select member...</option>
                {members.map((m) => <option key={m.memberId} value={m.memberId}>{m.firstName} {m.lastName}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Trainer *">
              <select className="gym-input" value={form.p_trainer_id} onChange={(e) => setForm(f => ({ ...f, p_trainer_id: e.target.value }))}>
                <option value="">Select trainer...</option>
                {trainers.map((t) => <option key={t.trainerId} value={t.trainerId}>{t.username}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Time Slot *">
              <select className="gym-input" value={form.p_timeslot_id} onChange={(e) => setForm(f => ({ ...f, p_timeslot_id: e.target.value }))}>
                <option value="">Select slot...</option>
                {timeslots.map((ts) => <option key={ts.timeslot_Id} value={ts.timeslot_Id}>{ts.starttime} – {ts.endtime}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Schedule Date *">
              <input className="gym-input" type="date" value={form.p_schedule_date} onChange={(e) => setForm(f => ({ ...f, p_schedule_date: e.target.value }))} />
            </FieldGroup>
            <FieldGroup label="RFID Tag ID">
              <input className="gym-input font-mono" type="number" value={form.p_rfid_id} onChange={(e) => setForm(f => ({ ...f, p_rfid_id: e.target.value }))} placeholder="Optional" />
            </FieldGroup>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Creating...' : 'Create Schedule'}</button>
        </div>
      </Modal>

      {/* EDIT */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="EDIT SCHEDULE" maxWidth={500}>
        <div className="modal-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Trainer">
              <select className="gym-input" value={form.p_trainer_id} onChange={(e) => setForm(f => ({ ...f, p_trainer_id: e.target.value }))}>
                <option value="">Select trainer...</option>
                {trainers.map((t) => <option key={t.trainerId} value={t.trainerId}>{t.username}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Time Slot">
              <select className="gym-input" value={form.p_timeslot_id} onChange={(e) => setForm(f => ({ ...f, p_timeslot_id: e.target.value }))}>
                <option value="">Select slot...</option>
                {timeslots.map((ts) => <option key={ts.timeslot_Id} value={ts.timeslot_Id}>{ts.starttime} – {ts.endtime}</option>)}
              </select>
            </FieldGroup>
            <FieldGroup label="Date">
              <input className="gym-input" type="date" value={form.p_schedule_date} onChange={(e) => setForm(f => ({ ...f, p_schedule_date: e.target.value }))} />
            </FieldGroup>
            <FieldGroup label="Status">
              <select className="gym-input" value={form.p_status} onChange={(e) => setForm(f => ({ ...f, p_status: e.target.value }))}>
                <option value="Pending">Pending</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </FieldGroup>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowEdit(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleEdit} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </Modal>
    </div>
  );
}
