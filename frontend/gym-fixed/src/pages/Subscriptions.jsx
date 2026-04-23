// ============================================================
//  Subscriptions.jsx — Full CRUD
//  Endpoints: /Subscription/*
// ============================================================
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSubscriptions, fetchMembers, fetchPlans, fetchTrainers,
         addSubscription, editSubscription, deactivateSubscription, activateSubscription } from '../actions';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { formatDate, formatCurrency } from '../utils';
import { ROLES } from '../constants';

function FieldGroup({ label, children }) {
  return <div><label className="gym-label">{label}</label>{children}</div>;
}

const initForm = {
  p_member_id: '', p_plan_id: '', p_trainer_id: '',
  p_start_date: '', p_end_date: '', p_is_active: 1,
};

export default function Subscriptions() {
  const dispatch = useDispatch();
  const { data, loading } = useSelector((s) => s.subscriptions);
  const members   = useSelector((s) => s.members.data);
  const plans     = useSelector((s) => s.plans.data);
  const trainers  = useSelector((s) => s.trainers.data);
  const adminId   = useSelector((s) => s.ui.currentUserId);
  const user      = useSelector((s) => s.auth.user);
  const isAdmin   = user?.roleId === ROLES.ADMIN;

  const [showAdd,  setShowAdd]  = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form,     setForm]     = useState(initForm);
  const [saving,   setSaving]   = useState(false);
  const [search,   setSearch]   = useState('');
  const [statusF,  setStatusF]  = useState('all');

  useEffect(() => {
    dispatch(fetchSubscriptions());
    dispatch(fetchMembers());
    dispatch(fetchPlans());
    dispatch(fetchTrainers());
  }, [dispatch]);

  const handleAdd = async () => {
    if (!form.p_member_id || !form.p_plan_id || !form.p_start_date) return;
    setSaving(true);
    const ok = await dispatch(addSubscription(form, adminId));
    setSaving(false);
    if (ok) { setShowAdd(false); setForm(initForm); }
  };

  const handleEditOpen = (row) => {
    setForm({
      p_subscription_id: row.subscriptionId,
      p_member_id: row.memberId, p_plan_id: row.planId,
      p_trainer_id: row.trainer_Id || '',
      p_start_date: row.startDate?.substring(0,10) || '',
      p_end_date: row.end_date?.substring(0,10) || '',
      p_is_active: row.is_active ? 1 : 0,
    });
    setShowEdit(true);
  };

  const handleEdit = async () => {
    setSaving(true);
    const ok = await dispatch(editSubscription(form, adminId));
    setSaving(false);
    if (ok) { setShowEdit(false); setForm(initForm); }
  };

  const handleDeactivate = (id) => {
    if (window.confirm(`Deactivate subscription #${id}?`))
      dispatch(deactivateSubscription(id, adminId));
  };

  let filtered = data;
  if (search)          filtered = filtered.filter((s) =>
    String(s.subscriptionId).includes(search) ||
    (s.memberName || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.planType   || '').toLowerCase().includes(search.toLowerCase())
  );
  if (statusF !== 'all') filtered = filtered.filter((s) =>
    statusF === 'active' ? s.is_active : !s.is_active
  );

  const activeCount = data.filter((s) => s.is_active).length;

  const columns = [
    { key: 'subscriptionId', label: 'ID',     width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'memberName',     label: 'Member', render: (v, row) => {
      const m = members.find((x) => x.memberId === row.memberId);
      const name = v || (m ? `${m.firstName} ${m.lastName}` : `#${row.memberId}`);
      return <span className="font-medium" style={{ color: 'var(--gym-text)' }}>{name}</span>;
    }},
    { key: 'planType',   label: 'Plan',  render: (v, row) => {
      const p = plans.find((x) => x.planId === row.planId);
      return <span style={{ color: 'var(--gym-accent)' }}>{v || p?.planType || `#${row.planId}`}</span>;
    }},
    { key: 'startDate',  label: 'Start', render: (v) => formatDate(v) },
    { key: 'end_date',   label: 'End',   render: (v) => {
      const expired = v && new Date(v) < new Date();
      return <span style={{ color: expired ? 'var(--gym-accent2)' : 'var(--gym-muted)' }}>{formatDate(v)}</span>;
    }},
    { key: 'is_active',  label: 'Status', render: (v) => <Badge variant={v ? 'active' : 'inactive'}>{v ? 'Active' : 'Inactive'}</Badge> },
    ...(isAdmin ? [{
      key: '_actions', label: 'Actions', render: (_, row) => (
        <div className="flex gap-2">
          <button className="btn btn-secondary btn-sm" onClick={() => handleEditOpen(row)}>✏️ Edit</button>
          {row.is_active && <button className="btn btn-danger btn-sm" onClick={() => handleDeactivate(row.subscriptionId)}>⏹ Deactivate</button>}
          {!row.is_active && <button className="btn btn-secondary btn-sm" style={{color:'var(--gym-success)'}} onClick={() => dispatch(activateSubscription(row.subscriptionId, adminId))}>▶ Activate</button>}
        </div>
      )
    }] : []),
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <div className="page-title">Subscriptions</div>
          <div className="page-sub">{activeCount} active · {data.length} total</div>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={() => setShowAdd(true)}>+ New Subscription</button>}
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--gym-muted)' }}>🔍</span>
          <input className="gym-input pl-8 w-52" placeholder="Search member, plan..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="gym-input w-36" value={statusF} onChange={(e) => setStatusF(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} rowKey="subscriptionId" />

      {/* ADD */}
      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="NEW SUBSCRIPTION" maxWidth={500}>
        <div className="modal-body space-y-4">
          <FieldGroup label="Member *">
            <select className="gym-input" value={form.p_member_id} onChange={(e) => setForm(f => ({ ...f, p_member_id: e.target.value }))}>
              <option value="">Select member...</option>
              {members.map((m) => <option key={m.memberId} value={m.memberId}>{m.firstName} {m.lastName} — #{m.memberId}</option>)}
            </select>
          </FieldGroup>
          <FieldGroup label="Plan *">
            <select className="gym-input" value={form.p_plan_id} onChange={(e) => setForm(f => ({ ...f, p_plan_id: e.target.value }))}>
              <option value="">Select plan...</option>
              {plans.map((p) => <option key={p.planId} value={p.planId}>{p.planType} — {formatCurrency(p.price)} ({p.duration_days}d)</option>)}
            </select>
          </FieldGroup>
          <FieldGroup label="Trainer (optional)">
            <select className="gym-input" value={form.p_trainer_id} onChange={(e) => setForm(f => ({ ...f, p_trainer_id: e.target.value }))}>
              <option value="">No trainer assigned</option>
              {trainers.map((t) => <option key={t.trainerId} value={t.trainerId}>{t.username}</option>)}
            </select>
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="Start Date *">
              <input className="gym-input" type="date" value={form.p_start_date} onChange={(e) => setForm(f => ({ ...f, p_start_date: e.target.value }))} />
            </FieldGroup>
            <FieldGroup label="End Date (auto-calc if blank)">
              <input className="gym-input" type="date" value={form.p_end_date} onChange={(e) => setForm(f => ({ ...f, p_end_date: e.target.value }))} />
            </FieldGroup>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowAdd(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>{saving ? 'Creating...' : 'Create Subscription'}</button>
        </div>
      </Modal>

      {/* EDIT */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="EDIT SUBSCRIPTION" maxWidth={500}>
        <div className="modal-body space-y-4">
          <FieldGroup label="Plan">
            <select className="gym-input" value={form.p_plan_id} onChange={(e) => setForm(f => ({ ...f, p_plan_id: e.target.value }))}>
              <option value="">Select plan...</option>
              {plans.map((p) => <option key={p.planId} value={p.planId}>{p.planType} — {formatCurrency(p.price)}</option>)}
            </select>
          </FieldGroup>
          <FieldGroup label="Trainer">
            <select className="gym-input" value={form.p_trainer_id} onChange={(e) => setForm(f => ({ ...f, p_trainer_id: e.target.value }))}>
              <option value="">None</option>
              {trainers.map((t) => <option key={t.trainerId} value={t.trainerId}>{t.username}</option>)}
            </select>
          </FieldGroup>
          <div className="grid grid-cols-2 gap-4">
            <FieldGroup label="End Date">
              <input className="gym-input" type="date" value={form.p_end_date} onChange={(e) => setForm(f => ({ ...f, p_end_date: e.target.value }))} />
            </FieldGroup>
            <FieldGroup label="Status">
              <select className="gym-input" value={form.p_is_active} onChange={(e) => setForm(f => ({ ...f, p_is_active: e.target.value }))}>
                <option value={1}>Active</option>
                <option value={0}>Inactive</option>
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
