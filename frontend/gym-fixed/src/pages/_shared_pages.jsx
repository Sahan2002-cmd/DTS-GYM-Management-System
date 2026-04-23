// ============================================================
//  _shared_pages.jsx — Timeslots, Assignments, Workouts
//  All endpoints corrected
// ============================================================
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTimeslots, addTimeslot, deleteTimeslot, fetchTrainers,
  fetchAssignments, addAssignment, deleteAssignment, fetchMembers,
  fetchWorkouts, fetchExercises, addWorkout, deleteWorkout, fetchSchedules,
  addExercise, deleteExercise,
  approveTrainerTimeslot, fetchTrainerTimeslots, addTrainerTimeslot,
  activateSubscription, editWorkout, approveUserAction, updateAssignmentStatus,
} from '../actions';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { ROLES } from '../constants';
import { formatDate } from '../utils';

function FieldGroup({ label, children }) {
  return <div><label className="gym-label">{label}</label>{children}</div>;
}

// ─────────────────────────────────────────────────────────────
//  TIMESLOTS
// ─────────────────────────────────────────────────────────────
export function Timeslots() {
  const dispatch  = useDispatch();
  const { data, loading } = useSelector((s) => s.timeslots);
  const trainerTS = useSelector((s) => s.trainerTimeslots?.data || []);
  const user      = useSelector((s) => s.auth.user);
  const trainers  = useSelector((s) => s.trainers.data);
  const adminId   = useSelector((s) => s.ui.currentUserId);
  const isAdmin   = user?.roleId === ROLES.ADMIN;
  const isTrainer = user?.roleId === ROLES.TRAINER;

  const [tab,      setTab]      = useState('master');
  const [showAdd,  setShowAdd]  = useState(false);
  const [showReq,  setShowReq]  = useState(false);
  const [form,     setForm]     = useState({ p_starttime: '', p_endtime: '' });
  const [reqForm,  setReqForm]  = useState({
    p_trainer_id: '',
    p_timeslot_id: '',
    p_day_of_week: '',
    _slotType: 'master',
    _scheduleType: 'dayofweek',
    _selectedDays: [],
    _start_date: '',
    _end_date: '',
    p_custom_start: '',
    p_custom_end: '',
  });
  const [saving,   setSaving]   = useState(false);

  const RESET_REQ_FORM = {
    p_trainer_id: '',
    p_timeslot_id: '',
    p_day_of_week: '',
    _slotType: 'master',
    _scheduleType: 'dayofweek',
    _selectedDays: [],
    _start_date: '',
    _end_date: '',
    p_custom_start: '',
    p_custom_end: '',
  };

  useEffect(() => {
    dispatch(fetchTimeslots());
    dispatch(fetchTrainers());
    dispatch(fetchTrainerTimeslots());
  }, [dispatch]);

  const handleAdd = async () => {
    if (!form.p_starttime || !form.p_endtime) return;
    setSaving(true);
    const ok = await dispatch(addTimeslot(form, adminId));
    setSaving(false);
    if (ok) { setShowAdd(false); setForm({ p_starttime: '', p_endtime: '' }); }
  };

  // ─── FIX: Full validation + correct payload assembly ───────
  const handleReqSubmit = async () => {
    const currentTrainerId = user?.userId || user?.trainerId || reqForm.p_trainer_id;

    // ── Validation ──────────────────────────────────────────
    if (!currentTrainerId) {
      alert('Error: Trainer ID is missing. Please log in again.');
      return;
    }

    if (reqForm._slotType === 'custom') {
      // FIX Bug 3: Validate custom time fields before sending
      if (!reqForm.p_custom_start || !reqForm.p_custom_end) {
        alert('Please enter both Start Time and End Time for your custom slot.');
        return;
      }
    } else {
      if (!reqForm.p_timeslot_id) {
        alert('Please select a Master Time Slot.');
        return;
      }
    }

    if (reqForm._scheduleType === 'dayofweek' && !reqForm.p_day_of_week) {
      alert('Please select a Day of Week.');
      return;
    }
    if (reqForm._scheduleType === 'duration' && (!reqForm._start_date || !reqForm._end_date)) {
      alert('Please enter both Start Date and End Date.');
      return;
    }
    if (reqForm._scheduleType === 'oneyear' && !(reqForm._selectedDays?.length)) {
      alert('Please select at least one day of the week.');
      return;
    }

    setSaving(true);

    // ── Build clean payload ──────────────────────────────────
    const payload = { p_trainer_id: currentTrainerId };

    // Schedule type
    if (reqForm._scheduleType) payload.p_schedule_type = reqForm._scheduleType;

    // Slot time — custom or master
    if (reqForm._slotType === 'custom') {
      payload.p_custom_starttime = reqForm.p_custom_start;
      payload.p_custom_endtime   = reqForm.p_custom_end;
    } else {
      payload.p_timeslot_id = reqForm.p_timeslot_id;
    }

    // Schedule-type-specific day/date fields
    if (reqForm._scheduleType === 'duration') {
      payload.p_start_date = reqForm._start_date;
      payload.p_end_date   = reqForm._end_date;
    } else if (reqForm._scheduleType === 'oneyear') {
      // FIX Bug 2: send BOTH p_selected_days AND p_day_of_week so the
      // DB column (day_of_week) is populated via the controller's
      // null-coalescing: p_day_of_week = p_selected_days ?? p_day_of_week
      const joinedDays = reqForm._selectedDays.join(',');
      payload.p_selected_days = joinedDays;
      payload.p_day_of_week   = joinedDays;
    } else {
      // dayofweek
      payload.p_day_of_week = reqForm.p_day_of_week;
    }

    const ok = await dispatch(addTrainerTimeslot(payload));
    setSaving(false);

    if (ok) {
      setShowReq(false);
      setReqForm(RESET_REQ_FORM);
    }
  };

  const handleDelete  = (id) => { if (window.confirm(`Delete timeslot #${id}?`)) dispatch(deleteTimeslot(id, adminId)); };
  const handleApprove = (id) => dispatch(approveTrainerTimeslot(id, 1, adminId));
  const handleReject  = (id) => dispatch(approveTrainerTimeslot(id, 0, adminId));
  const handleDelReq  = (id) => { if (window.confirm(`Delete request #${id}?`)) dispatch(deleteTrainerTimeslot(id, adminId)); };

  const masterCols = [
    { key: 'timeslot_Id', label: 'ID',    width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'starttime',   label: 'Start', render: (v) => <span className="font-mono" style={{ color: 'var(--gym-accent)' }}>{v}</span> },
    { key: 'endtime',     label: 'End',   render: (v) => <span className="font-mono" style={{ color: 'var(--gym-accent3)' }}>{v}</span> },
    ...(isAdmin ? [{ key: '_actions', label: '', render: (_, row) => (
      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(row.timeslot_Id)}>🗑️ Delete</button>
    )}] : []),
  ];

  const trainerCols = [
    { key: 'trainerTimeslot_Id', label: 'ID', width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'trainerName', label: 'Trainer', render: (v, row) => {
      const t = trainers.find((x) => x.trainerId === row.trainer_Id);
      return <span style={{ color: 'var(--gym-accent3)' }}>{v || (t ? t.username : `#${row.trainer_Id}`)}</span>;
    }},
    {
      key: 'schedule_type',
      label: 'Schedule Type',
      render: (v) => <span className="font-semibold" style={{ color: 'var(--gym-text)' }}>{(v || 'Master').toUpperCase()}</span>
    },
    {
      key: '_time',
      label: 'Time',
      render: (_, r) => {
        if (r.custom_starttime && r.custom_endtime) {
          return <span className="font-mono text-xs">{r.custom_starttime} - {r.custom_endtime}</span>;
        }
        return <span className="font-mono text-xs">{r.starttime || 'N/A'} - {r.endtime || 'N/A'}</span>;
      }
    },
    {
      key: '_days',
      label: 'Days / Date Range',
      render: (_, r) => {
        if (r.schedule_type === 'duration') return `${r.start_date || ''} to ${r.end_date || ''}`;
        if (r.selected_days) return r.selected_days;
        return r.day_of_week || 'N/A';
      }
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (v) => {
        if (v === true || v === 1) return <Badge variant="active">Approved</Badge>;
        if (v === false || v === 0 || v === null) return <Badge variant="pending">Pending</Badge>;
        return <Badge variant="danger">Rejected</Badge>;
      }
    },
    ...(isAdmin ? [{
      key: '_actions',
      label: 'Actions',
      render: (_, r) => (
        <div className="flex gap-2">
          {(r.isActive === false || r.isActive === 0 || r.isActive === null) && (
            <>
              <button className="btn btn-secondary btn-sm" style={{ color: 'var(--gym-success)' }} onClick={() => handleApprove(r.trainerTimeslot_Id)}>✓ Approve</button>
              <button className="btn btn-danger btn-sm" onClick={() => handleReject(r.trainerTimeslot_Id)}>✕ Reject</button>
            </>
          )}
          <button className="btn btn-danger btn-sm" onClick={() => handleDelReq(r.trainerTimeslot_Id)}>🗑️ Delete</button>
        </div>
      )
    }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <div className="page-title">Time Slots</div>
          <div className="page-sub">{data.length} master slots</div>
        </div>
        <div className="flex gap-2">
          {isAdmin   && <button className="btn btn-primary"   onClick={() => setShowAdd(true)}>+ Add Slot</button>}
          {isTrainer && <button className="btn btn-secondary" onClick={() => setShowReq(true)}>+ Request Slot</button>}
        </div>
      </div>

      <div className="flex gap-1 border-b" style={{ borderColor: 'var(--gym-border)' }}>
        {[{ id: 'master', label: 'Master Slots' }, { id: 'trainer', label: 'Trainer Assignments' }].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 text-sm font-semibold"
            style={{ color: tab === id ? 'var(--gym-accent)' : 'var(--gym-muted)', borderBottom: tab === id ? '2px solid var(--gym-accent)' : '2px solid transparent', background: 'transparent', marginBottom: -1 }}
          >{label}</button>
        ))}
      </div>

      {tab === 'master'  && <DataTable columns={masterCols}  data={data}      loading={loading} rowKey="timeslot_Id" />}
      {tab === 'trainer' && <DataTable columns={trainerCols} data={trainerTS} loading={false}   rowKey="trainerTimeslot_Id" />}

      {/* Add Master Slot */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="ADD TIME SLOT" maxWidth={400}>
        <div className="modal-body space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Start Time *"><input className="gym-input" type="time" value={form.p_starttime} onChange={(e) => setForm(f => ({ ...f, p_starttime: e.target.value }))} /></FieldGroup>
            <FieldGroup label="End Time *"><input className="gym-input" type="time" value={form.p_endtime} onChange={(e) => setForm(f => ({ ...f, p_endtime: e.target.value }))} /></FieldGroup>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Saving...' : 'Add Slot'}</button>
        </div>
      </Modal>

      {/* ── Request Trainer Slot ─────────────────────────────────── */}
      <Modal isOpen={showReq} onClose={() => { setShowReq(false); setReqForm(RESET_REQ_FORM); }} title="REQUEST TIME SLOT" maxWidth={480}>
        <div className="modal-body space-y-4">

          {/* Time Slot Type */}
          <FieldGroup label="Time Slot Type *">
            <select
              className="gym-input"
              value={reqForm._slotType || 'master'}
              onChange={(e) => setReqForm(f => ({ ...f, _slotType: e.target.value, p_timeslot_id: '', p_custom_start: '', p_custom_end: '' }))}
            >
              <option value="master">Master Time Slot (Fixed hours)</option>
              <option value="custom">Define Own Time Slot</option>
            </select>
          </FieldGroup>

          {/* Master slot selector */}
          {(!reqForm._slotType || reqForm._slotType === 'master') && (
            <FieldGroup label="Select Master Slot *">
              <select
                className="gym-input"
                value={reqForm.p_timeslot_id}
                onChange={(e) => setReqForm(f => ({ ...f, p_timeslot_id: e.target.value }))}
              >
                <option value="">Select slot...</option>
                {data.map((ts) => (
                  <option key={ts.timeslot_Id} value={ts.timeslot_Id}>
                    {ts.starttime} – {ts.endtime}
                  </option>
                ))}
              </select>
            </FieldGroup>
          )}

          {/* Custom time inputs */}
          {reqForm._slotType === 'custom' && (
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Start Time *">
                <input
                  className="gym-input"
                  type="time"
                  value={reqForm.p_custom_start || ''}
                  onChange={(e) => setReqForm(f => ({ ...f, p_custom_start: e.target.value }))}
                />
              </FieldGroup>
              <FieldGroup label="End Time *">
                <input
                  className="gym-input"
                  type="time"
                  value={reqForm.p_custom_end || ''}
                  onChange={(e) => setReqForm(f => ({ ...f, p_custom_end: e.target.value }))}
                />
              </FieldGroup>
            </div>
          )}

          {/* Schedule Type */}
          <FieldGroup label="Schedule Type *">
            <select
              className="gym-input"
              value={reqForm._scheduleType || 'dayofweek'}
              onChange={(e) => setReqForm(f => ({ ...f, _scheduleType: e.target.value, p_day_of_week: '', _selectedDays: [], _start_date: '', _end_date: '' }))}
            >
              <option value="dayofweek">Day of Week (recurring weekly)</option>
              <option value="duration">Time Duration (date range)</option>
              <option value="oneyear">One Year (full year, select days)</option>
            </select>
          </FieldGroup>

          {/* Day of week — single select */}
          {(!reqForm._scheduleType || reqForm._scheduleType === 'dayofweek') && (
            <FieldGroup label="Day of Week *">
              <select
                className="gym-input"
                value={reqForm.p_day_of_week}
                onChange={(e) => setReqForm(f => ({ ...f, p_day_of_week: e.target.value }))}
              >
                <option value="">Select day...</option>
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </FieldGroup>
          )}

          {/* Duration — date range */}
          {reqForm._scheduleType === 'duration' && (
            <div className="grid grid-cols-2 gap-4">
              <FieldGroup label="Start Date *">
                <input
                  className="gym-input"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={reqForm._start_date || ''}
                  onChange={(e) => setReqForm(f => ({ ...f, _start_date: e.target.value }))}
                />
              </FieldGroup>
              <FieldGroup label="End Date *">
                <input
                  className="gym-input"
                  type="date"
                  min={reqForm._start_date || new Date().toISOString().split('T')[0]}
                  value={reqForm._end_date || ''}
                  onChange={(e) => setReqForm(f => ({ ...f, _end_date: e.target.value }))}
                />
              </FieldGroup>
            </div>
          )}

          {/* One Year — multi-select days
              FIX Bug 1: replaced <button> with <div role="button"> to prevent
              the invalid DOM nesting error:
              "<button> cannot appear as descendant of <button>"
              Previously the day toggles were <button> elements nested inside
              the Modal whose footer also contains <button>s — browsers fire
              the nearest ancestor button's onClick on any click, so selecting
              a day was accidentally triggering the Submit button with an
              incomplete / empty payload.
          */}
          {reqForm._scheduleType === 'oneyear' && (
            <FieldGroup label="Select Days of Week (multiple allowed)">
              <div className="grid grid-cols-4 gap-2 mt-1">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((d) => {
                  const selected = (reqForm._selectedDays || []).includes(d);
                  return (
                    <div
                      key={d}
                      role="button"
                      tabIndex={0}
                      className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer select-none text-center"
                      style={{
                        background: selected ? 'var(--gym-accent)' : 'var(--gym-surface)',
                        color: selected ? '#000' : 'var(--gym-text)',
                        border: `1px solid ${selected ? 'var(--gym-accent)' : 'var(--gym-border)'}`,
                      }}
                      onClick={() => {
                        let sd = [...(reqForm._selectedDays || [])];
                        if (selected) sd = sd.filter((x) => x !== d);
                        else sd.push(d);
                        setReqForm(f => ({ ...f, _selectedDays: sd }));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          let sd = [...(reqForm._selectedDays || [])];
                          if (selected) sd = sd.filter((x) => x !== d);
                          else sd.push(d);
                          setReqForm(f => ({ ...f, _selectedDays: sd }));
                        }
                      }}
                    >
                      {d.substring(0, 3)}
                    </div>
                  );
                })}
              </div>
            </FieldGroup>
          )}

        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => { setShowReq(false); setReqForm(RESET_REQ_FORM); }}>Cancel</button>
          <button className="btn btn-primary" onClick={handleReqSubmit} disabled={saving}>
            {saving ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </Modal>

    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  ASSIGNMENTS
// ─────────────────────────────────────────────────────────────
export function Assignments() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.assignments);
  const trainers  = useSelector((s) => s.trainers.data);
  const members   = useSelector((s) => s.members.data);
  const adminId   = useSelector((s) => s.ui.currentUserId);

  const [showAdd,   setShowAdd]   = useState(false);
  const [form,      setForm]      = useState({ p_trainer_id: '', p_member_id: '', p_assignment_date: '' });
  const [saving,    setSaving]    = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    dispatch(fetchAssignments());
    dispatch(fetchTrainers());
    dispatch(fetchMembers());
  }, [dispatch]);

  const handleExport = () => {
    setExporting(true);
    try {
      const rows = data.map((a) => ({
        ID: a.assignmentId,
        Member: a.memberName || '#' + a.member_Id,
        Trainer: a.trainerName || '#' + a.trainerId,
        Date: a.assignment_date ? a.assignment_date.substring(0, 10) : '—',
        Status: a.is_active !== false ? 'Active' : 'Inactive',
      }));
      const header = Object.keys(rows[0] || {}).join(',');
      const csvRows = rows.map((r) => Object.values(r).map((v) => `"${v}"`).join(','));
      const csv = [header, ...csvRows].join('\n');

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `DTS_GYM_assignments_${new Date().toISOString().substring(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
    setExporting(false);
  };

  const handleAdd = async () => {
    if (!form.p_trainer_id || !form.p_member_id) return;
    setSaving(true);
    const ok = await dispatch(addAssignment(form, adminId));
    setSaving(false);
    if (ok) { setShowAdd(false); setForm({ p_trainer_id: '', p_member_id: '', p_assignment_date: '' }); }
  };

  const handleUpdateStatus = (id, status) => {
    dispatch(updateAssignmentStatus(id, status, adminId));
  };

  const columns = [
    { key: 'assignmentId', label: 'ID', width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'memberName',  label: 'Member',  render: (v, r) => v || `#${r.member_Id}` },
    { key: 'trainerName', label: 'Trainer', render: (v, r) => v || `#${r.trainerId}` },
    { key: 'assignment_date', label: 'Assigned Date', render: (v) => v ? v.substring(0, 10) : '—' },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={v?.toLowerCase() === 'approved' ? 'active' : v?.toLowerCase() === 'rejected' ? 'inactive' : 'pending'}>{v || 'pending'}</Badge> },
    { key: '_actions', label: 'Actions', render: (_, r) => (
      <div className="flex gap-2">
        {r.status?.toLowerCase() === 'pending' && (
          <>
            <button className="btn btn-secondary btn-sm" style={{ color: 'var(--gym-success)' }} onClick={() => handleUpdateStatus(r.assignmentId, 'approved')}>✓ Approve</button>
            <button className="btn btn-danger btn-sm" onClick={() => handleUpdateStatus(r.assignmentId, 'rejected')}>✕ Reject</button>
          </>
        )}
        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.assignmentId)}>🗑️ Remove</button>
      </div>
    )},
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <div className="page-title">Trainer Assignments</div>
          <div className="page-sub">{data.length} active assignments</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={handleExport} disabled={exporting}>{exporting ? 'Exporting...' : 'Export CSV'}</button>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Assign Member</button>
        </div>
      </div>

      <DataTable columns={columns} data={data} loading={loading} rowKey="assignmentId" />

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="ASSIGN TRAINER TO MEMBER" maxWidth={440}>
        <div className="modal-body space-y-4">
          <FieldGroup label="Member *">
            <select className="gym-input" value={form.p_member_id} onChange={(e) => setForm(f => ({ ...f, p_member_id: e.target.value }))}>
              <option value="">Select member...</option>
              {members.map((m) => <option key={m.memberId} value={m.memberId}>{m.firstName} {m.lastName} — #{m.memberId}</option>)}
            </select>
          </FieldGroup>
          <FieldGroup label="Trainer *">
            <select className="gym-input" value={form.p_trainer_id} onChange={(e) => setForm(f => ({ ...f, p_trainer_id: e.target.value }))}>
              <option value="">Select trainer...</option>
              {trainers.map((t) => <option key={t.trainerId} value={t.trainerId}>{t.username}</option>)}
            </select>
          </FieldGroup>
          <FieldGroup label="Assignment Date">
            <input className="gym-input" type="date" value={form.p_assignment_date} onChange={(e) => setForm(f => ({ ...f, p_assignment_date: e.target.value }))} />
          </FieldGroup>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Assigning...' : 'Assign'}</button>
        </div>
      </Modal>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
//  WORKOUTS (NonEquipmentExercise + Exercise Catalog)
// ─────────────────────────────────────────────────────────────
export function Workouts() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.workouts);
  const exercises = useSelector((s) => s.workouts.exercises || []);
  const adminId   = useSelector((s) => s.ui.currentUserId);
  const user      = useSelector((s) => s.auth.user);
  const isAdmin   = user?.roleId === ROLES.ADMIN;
  const isTrainer = user?.roleId === ROLES.TRAINER;

  const [tab,        setTab]        = useState('workouts');
  const [search,     setSearch]     = useState('');
  const [showExAdd,  setShowExAdd]  = useState(false);
  const [showWkAdd,  setShowWkAdd]  = useState(false);
  const [showWkEdit, setShowWkEdit] = useState(false);
  const [saving,     setSaving]     = useState(false);

  const [exForm, setExForm] = useState({ p_exercise_name: '', p_muscle_group: '', p_description: '' });
  const [wkForm, setWkForm] = useState({ p_use_id: '', p_schedule_id: '', p_exercise_id: '', p_sets: '', p_reps: '', p_notes: '', p_sub_status: 'pending' });

  useEffect(() => {
    dispatch(fetchWorkouts());
    dispatch(fetchExercises());
    dispatch(fetchSchedules());
  }, [dispatch]);

  const handleAddExercise = async () => {
    if (!exForm.p_exercise_name) return;
    setSaving(true);
    const ok = await dispatch(addExercise(exForm, adminId));
    setSaving(false);
    if (ok) { setShowExAdd(false); setExForm({ p_exercise_name: '', p_muscle_group: '', p_description: '' }); }
  };

  const handleAddWorkout = async () => {
    if (!wkForm.p_schedule_id || !wkForm.p_exercise_id) return;
    setSaving(true);
    const ok = await dispatch(addWorkout(wkForm, adminId));
    setSaving(false);
    if (ok) { setShowWkAdd(false); setWkForm({ p_use_id: '', p_schedule_id: '', p_exercise_id: '', p_sets: '', p_reps: '', p_notes: '', p_sub_status: 'pending' }); }
  };

  const handleEditWorkout = async () => {
    if (!wkForm.p_schedule_id || !wkForm.p_exercise_id) return;
    setSaving(true);
    const ok = await dispatch(editWorkout(wkForm, adminId));
    setSaving(false);
    if (ok) { setShowWkEdit(false); setWkForm({ p_use_id: '', p_schedule_id: '', p_exercise_id: '', p_sets: '', p_reps: '', p_notes: '', p_sub_status: 'pending' }); }
  };

  const openEdit = (row) => {
    setWkForm({
      p_use_id: row.use_Id || row.wse_id,
      p_schedule_id: row.scheduleId || '',
      p_exercise_id: row.exercise_Id || '',
      p_sets: row.sets || '',
      p_reps: row.reps || '',
      p_notes: row.notes || '',
      p_sub_status: row.sub_status || 'pending',
    });
    setShowWkEdit(true);
  };

  const handleDeleteWorkout = (id) => {
    if (window.confirm(`Delete workout #${id}?`)) dispatch(deleteWorkout(id, adminId));
  };
  const handleDeleteExercise = (id) => {
    if (window.confirm(`Delete exercise #${id}?`)) dispatch(deleteExercise(id, adminId));
  };

  const filtered = search
    ? data.filter((w) => String(w.use_Id || w.wse_id || '').includes(search) || String(w.scheduleId).includes(search))
    : data;

  const workoutCols = [
    { key: 'use_Id', label: 'ID', width: 60, render: (v, row) => <span className="id-chip">#{v || row.wse_id}</span> },
    { key: 'scheduleId', label: 'Schedule', render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'exercise_Id', label: 'Exercise', render: (v) => {
      const ex = exercises.find((e) => e.exerciseId === v || e.exercise_Id === v);
      return ex ? <span className="font-medium" style={{ color: 'var(--gym-text)' }}>{ex.ExerciseName || ex.exerciseName}</span> : <span className="id-chip">#{v}</span>;
    }},
    { key: 'sets', label: 'Sets', render: (v) => v || '—' },
    { key: 'reps', label: 'Reps', render: (v) => v || '—' },
    { key: 'sub_status', label: 'Status', render: (v) => <Badge variant={v === 'completed' ? 'active' : 'pending'}>{v || 'pending'}</Badge> },
    ...(isAdmin || isTrainer ? [{ key: '_actions', label: '', render: (_, row) => (
      <div className="flex gap-1">
        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(row)}>✏️</button>
        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteWorkout(row.use_Id || row.wse_id)}>🗑️</button>
      </div>
    )}] : []),
  ];

  const exerciseCols = [
    { key: 'exerciseId', label: 'ID', width: 60, render: (v, row) => <span className="id-chip">#{v || row.exercise_Id}</span> },
    { key: 'exerciseName', label: 'Exercise', render: (v, row) => <span className="font-semibold" style={{ color: 'var(--gym-text)' }}>{v || row.ExerciseName}</span> },
    { key: 'muscleGroup', label: 'Muscle Group', render: (v, row) => v || row.MuscleGroup || '—' },
    ...(isAdmin || isTrainer ? [{ key: '_actions', label: '', render: (_, row) => (
      <button className="btn btn-danger btn-sm" onClick={() => handleDeleteExercise(row.exerciseId || row.exercise_Id)}>🗑️ Delete</button>
    )}] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <div className="page-title">Workout Sessions</div>
          <div className="page-sub">Assign non-equipment routines</div>
        </div>
        <div className="flex gap-2">
          {tab === 'workouts' && (isAdmin || isTrainer) && <button className="btn btn-primary" onClick={() => { setWkForm({ p_use_id: '', p_schedule_id: '', p_exercise_id: '', p_sets: '', p_reps: '', p_notes: '', p_sub_status: 'pending' }); setShowWkAdd(true); }}>+ Add Workout</button>}
          {tab === 'exercises' && (isAdmin || isTrainer) && <button className="btn btn-primary" onClick={() => setShowExAdd(true)}>+ Add Exercise</button>}
        </div>
      </div>

      <div className="flex gap-1 border-b" style={{ borderColor: 'var(--gym-border)' }}>
        {[{ id: 'workouts', label: '🏋️ Assigned Workouts' }, { id: 'exercises', label: '📋 Exercise Catalog' }].map(({ id, label }) => (
          <button key={id} onClick={() => setTab(id)}
            className="px-4 py-2 text-sm font-semibold"
            style={{ color: tab === id ? 'var(--gym-accent)' : 'var(--gym-muted)', borderBottom: tab === id ? '2px solid var(--gym-accent)' : '2px solid transparent', background: 'transparent', marginBottom: -1 }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'workouts' && (
        <div className="space-y-3">
          <div className="relative w-52">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--gym-muted)' }}>🔍</span>
            <input className="gym-input pl-8" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <DataTable columns={workoutCols} data={filtered} loading={loading} rowKey="use_Id" />
        </div>
      )}
      {tab === 'exercises' && (
        <DataTable columns={exerciseCols} data={exercises} loading={false} rowKey="exerciseId" />
      )}

      {/* Add Workout */}
      <Modal isOpen={showWkAdd} onClose={() => setShowWkAdd(false)} title="ASSIGN WORKOUT" maxWidth={460}>
        <div className="modal-body space-y-4">
          <FieldGroup label="Schedule ID *">
            <input className="gym-input" type="number" placeholder="Enter schedule ID..." value={wkForm.p_schedule_id} onChange={(e) => setWkForm(f => ({ ...f, p_schedule_id: e.target.value }))} />
          </FieldGroup>
          <FieldGroup label="Select Exercise *">
            <select className="gym-input" value={wkForm.p_exercise_id} onChange={(e) => setWkForm(f => ({ ...f, p_exercise_id: e.target.value }))}>
              <option value="">Choose an exercise...</option>
              {exercises.map((e) => <option key={e.exerciseId || e.exercise_Id} value={e.exerciseId || e.exercise_Id}>{e.ExerciseName || e.exerciseName}</option>)}
            </select>
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Sets"><input className="gym-input" type="number" value={wkForm.p_sets} onChange={(e) => setWkForm(f => ({ ...f, p_sets: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Reps"><input className="gym-input" type="number" value={wkForm.p_reps} onChange={(e) => setWkForm(f => ({ ...f, p_reps: e.target.value }))} /></FieldGroup>
          </div>
          <FieldGroup label="Notes"><textarea className="gym-input resize-none" rows={2} value={wkForm.p_notes} onChange={(e) => setWkForm(f => ({ ...f, p_notes: e.target.value }))} /></FieldGroup>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowWkAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAddWorkout} disabled={saving}>{saving ? 'Assigning...' : 'Assign Workout'}</button>
        </div>
      </Modal>

      {/* Edit Workout */}
      <Modal isOpen={showWkEdit} onClose={() => setShowWkEdit(false)} title="EDIT WORKOUT" maxWidth={460}>
        <div className="modal-body space-y-4">
          <FieldGroup label="Schedule ID *">
            <input className="gym-input bg-opacity-50 cursor-not-allowed" readOnly value={wkForm.p_schedule_id} />
          </FieldGroup>
          <FieldGroup label="Status">
            <select className="gym-input" value={wkForm.p_sub_status} onChange={(e) => setWkForm(f => ({ ...f, p_sub_status: e.target.value }))}>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Sets"><input className="gym-input" type="number" value={wkForm.p_sets} onChange={(e) => setWkForm(f => ({ ...f, p_sets: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Reps"><input className="gym-input" type="number" value={wkForm.p_reps} onChange={(e) => setWkForm(f => ({ ...f, p_reps: e.target.value }))} /></FieldGroup>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowWkEdit(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleEditWorkout} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
        </div>
      </Modal>

      {/* Add Exercise to Catalog */}
      <Modal isOpen={showExAdd} onClose={() => setShowExAdd(false)} title="ADD EXERCISE TO CATALOG" maxWidth={460}>
        <div className="modal-body space-y-4">
          <FieldGroup label="Exercise Name *">
            <input className="gym-input" value={exForm.p_exercise_name} onChange={(e) => setExForm(f => ({ ...f, p_exercise_name: e.target.value }))} placeholder="e.g. Bench Press" />
          </FieldGroup>
          <FieldGroup label="Muscle Group">
            <input className="gym-input" value={exForm.p_muscle_group} onChange={(e) => setExForm(f => ({ ...f, p_muscle_group: e.target.value }))} placeholder="e.g. Chest, Triceps" />
          </FieldGroup>
          <FieldGroup label="Description">
            <textarea className="gym-input resize-none" rows={3} value={exForm.p_description} onChange={(e) => setExForm(f => ({ ...f, p_description: e.target.value }))} placeholder="Exercise description..." />
          </FieldGroup>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowExAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAddExercise} disabled={saving}>{saving ? 'Adding...' : 'Add Exercise'}</button>
        </div>
      </Modal>

    </div>
  );
}