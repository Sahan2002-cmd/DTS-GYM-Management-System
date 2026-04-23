// ============================================================
//  RFID.jsx — Full RFID Tag Management + Attendance
//  Endpoints: /RfidTag/* and /Attendance/*
// ============================================================
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchRfidTags, addRfidTag, deleteRfidTag, assignRfidToMember,
  tapRFID, fetchAttendance, fetchMembers,
} from '../actions';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { formatDate } from '../utils';
import { ROLES } from '../constants';

function FieldGroup({ label, children }) {
  return <div><label className="gym-label">{label}</label>{children}</div>;
}

export default function RFID() {
  const dispatch    = useDispatch();
  const adminId     = useSelector((s) => s.ui.currentUserId);
  const user        = useSelector((s) => s.auth.user);
  const rfidTags    = useSelector((s) => s.rfidTags?.data || []);
  const rfidLoading = useSelector((s) => s.rfidTags?.loading || false);
  const members     = useSelector((s) => s.members.data);
  const attendance  = useSelector((s) => s.attendance.data);
  const isAdmin     = user?.roleId === ROLES.ADMIN;

  // Tap
  const [rfidId,    setRfidId]    = useState('');
  const [tapResult, setTapResult] = useState(null);
  const [tapping,   setTapping]   = useState(false);

  // Add tag modal
  const [showAdd,   setShowAdd]   = useState(false);
  const [addForm,   setAddForm]   = useState({ p_issue_date: new Date().toISOString().split('T')[0], p_is_active: 1, p_rfid_number: '' });
  const [addSaving, setAddSaving] = useState(false);

  // Assign modal
  const [showAssign,   setShowAssign]   = useState(false);
  const [assignForm,   setAssignForm]   = useState({ rfidId: '', memberId: '' });
  const [assignSaving, setAssignSaving] = useState(false);

  // Tab
  const [tab, setTab] = useState('tags');

  useEffect(() => {
    dispatch(fetchRfidTags());
    dispatch(fetchMembers());
    dispatch(fetchAttendance());
  }, [dispatch]);

  const handleTap = async () => {
    if (!rfidId.trim()) return;
    setTapping(true); setTapResult(null);
    const res = await dispatch(tapRFID(rfidId.trim()));
    setTapResult(res
      ? { ok: true,  msg: 'Attendance recorded successfully!' }
      : { ok: false, msg: 'RFID not recognised or error occurred.' }
    );
    setTapping(false);
    if (res) dispatch(fetchAttendance());
  };

  const handleAddTag = async () => {
    setAddSaving(true);
    const ok = await dispatch(addRfidTag(addForm, adminId));
    setAddSaving(false);
    if (ok) { setShowAdd(false); setAddForm({ p_issue_date: new Date().toISOString().split('T')[0], p_is_active: 1, p_rfid_number: '' }); }
  };

  const handleDeleteTag = (id) => {
    if (window.confirm(`Delete RFID tag #${id}?`)) dispatch(deleteRfidTag(id, adminId));
  };

  const handleOpenAssign = (id) => {
    setAssignForm({ rfidId: id, memberId: '' });
    setShowAssign(true);
  };

  const handleAssign = async () => {
    setAssignSaving(true);
    const ok = await dispatch(assignRfidToMember(assignForm.rfidId, assignForm.memberId, adminId));
    setAssignSaving(false);
    if (ok) { setShowAssign(false); dispatch(fetchRfidTags()); }
  };

  const handleToggleStatus = async (row) => {
    const newStatus = row.isActive ? 0 : 1;
    setSaving(true);
    try {
      await dispatch(addRfidTag({ p_rfid_number: row.rfid_number, p_issue_date: row.issueDate, p_is_active: newStatus }, adminId));
      dispatch(fetchRfidTags());
    } catch {}
    setSaving(false);
  };

  const [saving, setSaving] = useState(false);

  const tagColumns = [
    { key: 'rfId_Id',     label: 'DB ID',    width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'rfid_number', label: 'RFID No.', render: (v) => <span className="font-mono text-xs" style={{color:'var(--gym-accent)'}}>{v || '—'}</span> },
    { key: 'issueDate', label: 'Issue Date', render: (v) => formatDate(v) },
    { key: 'isActive',  label: 'Status', render: (v) => <Badge variant={v ? 'active' : 'inactive'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'isActive', label: 'Status Toggle', render: (v, row) => (
      isAdmin ? (
        <button
          className={"btn btn-sm " + (v ? "btn-danger" : "btn-secondary")}
          style={{ color: v ? 'var(--gym-accent2)' : 'var(--gym-success)' }}
          onClick={() => handleToggleStatus(row)}
        >
          {v ? '🔴 Set Inactive' : '🟢 Set Active'}
        </button>
      ) : <Badge variant={v ? 'active' : 'inactive'}>{v ? 'Active' : 'Inactive'}</Badge>
    )},
    ...(isAdmin ? [{
      key: '_actions', label: 'Actions', render: (_, row) => (
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => handleOpenAssign(row.rfId_Id)}>Assign</button>
          <button className="btn btn-danger btn-sm"    onClick={() => handleDeleteTag(row.rfId_Id)}>Delete</button>
        </div>
      )
    }] : []),
  ];

  const attColumns = [
    { key: 'attendanceId',  label: 'ID',       width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'memberName',    label: 'Member',   render: (v, row) => {
      const m = members.find((x) => x.memberId === row.memberId);
      return <span style={{ color: 'var(--gym-text)', fontWeight: 500 }}>{v || (m ? `${m.firstName} ${m.lastName}` : `#${row.memberId}`)}</span>;
    }},
    { key: 'rfId_Id',       label: 'RFID Tag', width: 80, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'check_in_time', label: 'Check In',  render: (v) => <span className="font-mono text-xs" style={{ color: 'var(--gym-success)' }}>{v ? v.substring(0,19) : '—'}</span> },
    { key: 'check_out_time',label: 'Check Out', render: (v) => <span className="font-mono text-xs" style={{ color: v ? 'var(--gym-accent2)' : 'var(--gym-muted)' }}>{v ? v.substring(0,19) : 'Still in gym'}</span> },
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <div className="page-title">RFID Management</div>
          <div className="page-sub">{rfidTags.length} tags registered · {attendance.length} attendance records</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ Add RFID Tag</button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--gym-border)' }}>
        {[
          { id: 'tags',      label: '🏷️ RFID Tags',  count: rfidTags.length },
          { id: 'scanner',   label: '📡 Scanner',     count: null },
          { id: 'attendance',label: '📋 Attendance',  count: attendance.length },
        ].map(({ id, label, count }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className="px-4 py-2 text-sm font-semibold transition-colors relative"
            style={{
              color: tab === id ? 'var(--gym-accent)' : 'var(--gym-muted)',
              borderBottom: tab === id ? '2px solid var(--gym-accent)' : '2px solid transparent',
              background: 'transparent',
              marginBottom: -1,
            }}
          >
            {label} {count !== null && <span className="id-chip ml-1">{count}</span>}
          </button>
        ))}
      </div>

      {/* RFID Tags Tab */}
      {tab === 'tags' && (
        <DataTable columns={tagColumns} data={rfidTags} loading={rfidLoading} rowKey="rfId_Id" />
      )}

      {/* Scanner Tab */}
      {tab === 'scanner' && (
        <div className="grid md:grid-cols-2 gap-5">
          <div className="card p-6 space-y-5">
            <div className="text-base font-semibold" style={{ color: 'var(--gym-accent)', letterSpacing: '0.05em' }}>📡 RFID CHECK-IN SCANNER</div>
            <div
              className="flex items-center justify-center rounded-2xl"
              style={{
                height: 160,
                background: 'var(--gym-surface2)',
                border: `2px dashed ${tapping ? 'var(--gym-warning)' : 'var(--gym-border2)'}`,
                transition: 'border-color 0.3s',
              }}
            >
              {tapping ? (
                <div className="text-center">
                  <div className="text-4xl mb-2 animate-pulse">📡</div>
                  <div className="text-sm" style={{ color: 'var(--gym-warning)' }}>Processing...</div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-5xl mb-2">🏷️</div>
                  <div className="text-sm" style={{ color: 'var(--gym-muted)' }}>Enter RFID ID below</div>
                </div>
              )}
            </div>

            <FieldGroup label="RFID Tag ID">
              <input
                className="gym-input text-center font-mono text-base tracking-widest"
                type="number"
                value={rfidId}
                onChange={(e) => setRfidId(e.target.value)}
                placeholder="Enter RFID tag ID number"
                onKeyDown={(e) => e.key === 'Enter' && handleTap()}
              />
            </FieldGroup>
            <button
              className="btn btn-primary w-full py-3 justify-center"
              onClick={handleTap}
              disabled={tapping || !rfidId.trim()}
            >
              {tapping ? 'Processing...' : '📡 Check In with RFID'}
            </button>

            {tapResult && (
              <div
                className="p-4 rounded-xl flex items-center gap-3 text-sm font-medium"
                style={{
                  background: tapResult.ok ? 'rgba(71,255,154,.08)' : 'rgba(255,71,71,.08)',
                  border: `1px solid ${tapResult.ok ? 'rgba(71,255,154,.25)' : 'rgba(255,71,71,.25)'}`,
                  color: tapResult.ok ? 'var(--gym-success)' : 'var(--gym-accent2)',
                }}
              >
                <span className="text-2xl">{tapResult.ok ? '✅' : '❌'}</span>
                {tapResult.msg}
              </div>
            )}
          </div>

          <div className="card p-6 space-y-4">
            <div className="text-base font-semibold" style={{ color: 'var(--gym-accent3)', letterSpacing: '0.05em' }}>📖 HOW RFID WORKS</div>
            {[
              { icon: '1️⃣', title: 'Member Enters Gym', desc: 'Member taps RFID tag at the entrance scanner → Attendance check-in recorded automatically.' },
              { icon: '2️⃣', title: 'Equipment Station', desc: 'Member taps RFID at each machine (e.g. Treadmill) → Equipment usage session begins.' },
              { icon: '3️⃣', title: 'Live Tracking', desc: 'Admin/Trainer sees real-time: who is on which machine, how long, vs target time.' },
              { icon: '4️⃣', title: 'Session End', desc: 'Second tap at machine → Session ends, actual_mins logged against target_mins.' },
              { icon: '5️⃣', title: 'Exit Gym', desc: 'Member taps at exit scanner → Attendance check-out time recorded.' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-3 p-3 rounded-xl" style={{ background: 'var(--gym-surface2)' }}>
                <span className="text-xl flex-shrink-0 mt-0.5">{icon}</span>
                <div>
                  <div className="text-sm font-semibold mb-0.5" style={{ color: 'var(--gym-text)' }}>{title}</div>
                  <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Tab */}
      {tab === 'attendance' && (
        <DataTable columns={attColumns} data={attendance} loading={false} rowKey="attendanceId" />
      )}

      {/* Add Tag Modal */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="ADD RFID TAG" maxWidth={400}>
        <div className="modal-body space-y-4">
          <FieldGroup label="RFID Tag Number (Physical) *">
            <input className="gym-input font-mono tracking-widest" placeholder="e.g. A3F2C1 or 001234"
              value={addForm.p_rfid_number}
              onChange={(e) => setAddForm(f => ({ ...f, p_rfid_number: e.target.value.toUpperCase() }))} />
            <div className="text-xs mt-1" style={{color:'var(--gym-muted)'}}>Physical code printed on the RFID card/tag.</div>
          </FieldGroup>
          <FieldGroup label="Issue Date *">
            <input className="gym-input" type="date" value={addForm.p_issue_date}
              onChange={(e) => setAddForm(f => ({ ...f, p_issue_date: e.target.value }))} />
          </FieldGroup>
          <FieldGroup label="Status">
            <select className="gym-input" value={addForm.p_is_active}
              onChange={(e) => setAddForm(f => ({ ...f, p_is_active: e.target.value }))}>
              <option value={1}>Active</option>
              <option value={0}>Inactive</option>
            </select>
          </FieldGroup>
          <div className="p-3 rounded-xl text-xs" style={{ background: 'var(--gym-surface2)', color: 'var(--gym-muted)' }}>
            ℹ️ The DB ID is auto-generated. The RFID Number above is the physical code on the card. After adding, use "Assign" to link to a member.
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAddTag} disabled={addSaving}>
            {addSaving ? 'Adding...' : 'Add Tag'}
          </button>
        </div>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={showAssign} onClose={() => setShowAssign(false)} title="ASSIGN RFID TO MEMBER" maxWidth={420}>
        <div className="modal-body space-y-4">
          <div className="p-3 rounded-xl text-sm font-medium" style={{ background: 'var(--gym-surface2)', color: 'var(--gym-accent)' }}>
            🏷️ Assigning Tag ID: <strong>#{assignForm.rfidId}</strong>
          </div>
          <FieldGroup label="Member *">
            <select className="gym-input" value={assignForm.memberId}
              onChange={(e) => setAssignForm(f => ({ ...f, memberId: e.target.value }))}>
              <option value="">Select member...</option>
              {members.map((m) => (
                <option key={m.memberId} value={m.memberId}>
                  {m.firstName} {m.lastName} — #{m.memberId}
                </option>
              ))}
            </select>
          </FieldGroup>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowAssign(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAssign} disabled={assignSaving || !assignForm.memberId}>
            {assignSaving ? 'Assigning...' : 'Assign Tag'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
