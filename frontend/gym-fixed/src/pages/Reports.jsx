// ============================================================
//  Reports.jsx — Admin reports with PDF export
//  Endpoints: /Report/*
// ============================================================
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMembers, fetchTrainers, fetchPayments, fetchSubscriptions, fetchSchedules, showToast, fetchTimeslots, fetchAttendance, fetchAssignments, fetchWorkouts, fetchRfidTags, fetchPlans } from '../actions';
import * as api from '../services/api';
import { formatCurrency, formatDate, sumBy } from '../utils';
import Badge from '../components/Badge';

function StatCard({ label, value, sub, color }) {
  return (
    <div className="card p-5">
      <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--gym-muted)' }}>{label}</div>
      <div className="text-3xl font-bold leading-none mb-1" style={{ color: color || 'var(--gym-accent)', fontFamily: "'Space Mono', monospace" }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'var(--gym-muted)' }}>{sub}</div>}
    </div>
  );
}

const TABS = [
  { id: 'overview',      label: '📊 Overview' },
  { id: 'members',       label: '👥 Members' },
  { id: 'payments',      label: '💰 Payments' },
  { id: 'subscriptions', label: '📋 Subscriptions' },
  { id: 'trainers',      label: '🏋️ Trainers' },
  { id: 'schedules',     label: '📅 Schedules' },
  { id: 'timeslots',     label: '🕐 Time Slots' },
  { id: 'attendance',    label: '✅ Attendance' },
  { id: 'assignments',   label: '🔗 Assignments' },
  { id: 'workouts',      label: '💪 Workouts' },
  { id: 'rfid',          label: '📡 RFID Tags' },
  { id: 'plans',         label: '📦 Plans' },
];

export default function Reports() {
  const dispatch = useDispatch();
  const members       = useSelector((s) => s.members.data);
  const trainers      = useSelector((s) => s.trainers.data);
  const payments      = useSelector((s) => s.payments.data);
  const subscriptions = useSelector((s) => s.subscriptions.data);
  const schedules     = useSelector((s) => s.schedules.data);
  const timeslots     = useSelector((s) => s.timeslots?.data || []);
  const attendance    = useSelector((s) => s.allAttendance?.data || s.attendance?.data || []);
  const assignments   = useSelector((s) => s.assignments?.data || []);
  const workouts      = useSelector((s) => s.workouts?.data || []);
  const rfidTags      = useSelector((s) => s.rfidTags?.data || []);
  const plans         = useSelector((s) => s.plans?.data || []);
  const adminId       = useSelector((s) => s.ui.currentUserId);

  const [activeTab,  setActiveTab]  = useState('overview');
  const [dateFrom,   setDateFrom]   = useState('');
  const [dateTo,     setDateTo]     = useState('');
  const [memSearch,  setMemSearch]  = useState('');
  const [paySearch,  setPaySearch]  = useState('');
  const [exporting,  setExporting]  = useState(false);

  useEffect(() => {
    dispatch(fetchMembers());
    dispatch(fetchTrainers());
    dispatch(fetchPayments());
    dispatch(fetchSubscriptions());
    dispatch(fetchSchedules());
    dispatch(fetchTimeslots());
    dispatch(fetchAttendance());
    dispatch(fetchAssignments());
    dispatch(fetchWorkouts());
    dispatch(fetchRfidTags());
    dispatch(fetchPlans());
  }, [dispatch]);

  const totalRevenue   = sumBy(payments.filter((p) => (p.payment_status||'').toLowerCase()==='completed'), 'paymentAmount');
  const activeSubs     = subscriptions.filter((s) => s.is_active).length;
  const pendingSch     = schedules.filter((s) => s.status === 'Pending').length;
  const completedSch   = schedules.filter((s) => s.status === 'Scheduled').length;
  const avgPayment     = payments.length ? totalRevenue / payments.filter((p)=>(p.payment_status||'').toLowerCase()==='completed').length || 0 : 0;

  // Monthly revenue for bar chart
  const monthlyRevenue = (() => {
    const map = {};
    payments.forEach((p) => {
      if (!p.payment_date || (p.payment_status||'').toLowerCase() !== 'completed') return;
      const key = p.payment_date.substring(0, 7);
      map[key] = (map[key] || 0) + parseFloat(p.paymentAmount || 0);
    });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0])).slice(-6);
  })();
  const maxMonth = Math.max(...monthlyRevenue.map((m) => m[1]), 1);

  // Plan distribution
  const planDist = (() => {
    const map = {};
    subscriptions.forEach((s) => { const k = s.planType || `Plan #${s.planId}`; map[k] = (map[k] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  })();
  const maxPlan = Math.max(...planDist.map((p) => p[1]), 1);

  const filteredMembers = members.filter((m) =>
    !memSearch || (m.firstName + ' ' + m.lastName).toLowerCase().includes(memSearch.toLowerCase()) ||
    (m.email || '').toLowerCase().includes(memSearch.toLowerCase())
  );
  const filteredPayments = payments.filter((p) => {
    if (paySearch && !(p.memberName || '').toLowerCase().includes(paySearch.toLowerCase()) && !String(p.paymentId).includes(paySearch)) return false;
    if (dateFrom && p.payment_date && p.payment_date < dateFrom) return false;
    if (dateTo   && p.payment_date && p.payment_date.substring(0,10) > dateTo)   return false;
    return true;
  });

  const handleExportPdf = async (type) => {
    setExporting(true);
    try {
      const res = await api.exportReportPdf(adminId, type, dateFrom, dateTo, null);
      if (res.data?.StatusCode === 200 && res.data?.ResultSet) {
        const b64      = res.data.ResultSet;
        const byteChars= atob(b64);
        const bytes    = new Uint8Array(byteChars.length);
        for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
        const blob = new Blob([bytes], { type: 'application/pdf' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href     = url;
        a.download = `DTS_GYM_${type}_report_${new Date().toISOString().substring(0,10)}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        dispatch(showToast('Report exported!', 'success'));
      } else {
        dispatch(showToast('Export failed', 'error'));
      }
    } catch {
      dispatch(showToast('Export failed — check backend', 'error'));
    }
    setExporting(false);
  };

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <div className="page-title">Reports</div>
          <div className="page-sub">Analytics and PDF exports for DTS GYM</div>
        </div>
        {/* Date filters */}
        <div className="flex gap-2 items-center">
          <input className="gym-input" type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} style={{ width: 140 }} />
          <span style={{ color: 'var(--gym-muted)' }}>→</span>
          <input className="gym-input" type="date" value={dateTo}   onChange={(e) => setDateTo(e.target.value)}   style={{ width: 140 }} />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto border-b" style={{ borderColor: 'var(--gym-border)' }}>
        {TABS.map(({ id, label }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="px-4 py-2 text-sm font-semibold whitespace-nowrap transition-colors"
            style={{
              color: activeTab === id ? 'var(--gym-accent)' : 'var(--gym-muted)',
              borderBottom: activeTab === id ? '2px solid var(--gym-accent)' : '2px solid transparent',
              background: 'transparent', marginBottom: -1,
            }}
          >{label}</button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard label="Total Revenue"    value={formatCurrency(totalRevenue)}  color="var(--gym-accent)" />
            <StatCard label="Members"          value={members.length}                color="var(--gym-success)" />
            <StatCard label="Active Subs"      value={activeSubs}                    color="var(--gym-accent3)" />
            <StatCard label="Avg Payment"      value={formatCurrency(avgPayment)}    color="var(--gym-warning)" />
            <StatCard label="Trainers"         value={trainers.length}               color="var(--gym-accent3)" />
            <StatCard label="Total Schedules"  value={schedules.length}              color="var(--gym-muted)" />
            <StatCard label="Pending Sessions" value={pendingSch}                    color="var(--gym-warning)" />
            <StatCard label="Completed"        value={completedSch}                  color="var(--gym-success)" />
          </div>

          {/* Monthly revenue bar chart */}
          <div className="card p-5">
            <div className="text-sm font-semibold mb-4" style={{ color: 'var(--gym-accent)', letterSpacing: '0.08em' }}>📈 MONTHLY REVENUE (LAST 6 MONTHS)</div>
            {monthlyRevenue.length === 0
              ? <div className="text-center py-8 text-sm" style={{ color: 'var(--gym-muted)' }}>No payment data yet.</div>
              : (
                <div className="flex items-end gap-3 h-32">
                  {monthlyRevenue.map(([month, amount]) => {
                    const pct = Math.round((amount / maxMonth) * 100);
                    return (
                      <div key={month} className="flex-1 flex flex-col items-center gap-1">
                        <div className="text-xs font-mono" style={{ color: 'var(--gym-accent)' }}>{formatCurrency(amount).replace('LKR ','')}</div>
                        <div className="w-full rounded-t-sm transition-all" style={{ height: `${Math.max(pct, 4)}%`, background: 'var(--gym-accent)', minHeight: 6 }} />
                        <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>{month.substring(5)}</div>
                      </div>
                    );
                  })}
                </div>
              )
            }
          </div>

          {/* Plan distribution */}
          <div className="card p-5">
            <div className="text-sm font-semibold mb-4" style={{ color: 'var(--gym-accent3)', letterSpacing: '0.08em' }}>📊 PLAN DISTRIBUTION</div>
            <div className="space-y-3">
              {planDist.map(([name, count]) => (
                <div key={name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--gym-text)' }}>{name}</span>
                    <span style={{ color: 'var(--gym-muted)' }}>{count} subs</span>
                  </div>
                  <div className="h-2 rounded-full" style={{ background: 'var(--gym-border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.round((count / maxPlan) * 100)}%`, background: 'var(--gym-accent3)' }} />
                  </div>
                </div>
              ))}
              {planDist.length === 0 && <div className="text-sm text-center py-4" style={{ color: 'var(--gym-muted)' }}>No subscription data yet.</div>}
            </div>
          </div>
        </div>
      )}

      {/* ── MEMBERS ── */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <input className="gym-input w-60" placeholder="🔍 Search members..." value={memSearch} onChange={(e) => setMemSearch(e.target.value)} />
            <button className="btn btn-secondary" onClick={() => handleExportPdf('member')} disabled={exporting}>
              {exporting ? 'Exporting...' : '📄 Export PDF'}
            </button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--gym-surface2)' }}>
                <tr>{['#', 'Name', 'Email', 'Phone', 'Blood', 'Joined', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider" style={{ color: 'var(--gym-muted)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filteredMembers.map((m, i) => (
                  <tr key={m.memberId} style={{ borderTop: '1px solid var(--gym-border)', background: i % 2 === 0 ? 'transparent' : 'var(--gym-surface2)05' }}>
                    <td className="px-4 py-3"><span className="id-chip">#{m.memberId}</span></td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--gym-text)' }}>{m.firstName} {m.lastName}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--gym-muted)' }}>{m.email}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--gym-muted)' }}>{m.phone || '—'}</td>
                    <td className="px-4 py-3 text-xs">{m.blood_group || '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--gym-muted)' }}>{formatDate(m.joinDate)}</td>
                    <td className="px-4 py-3"><Badge variant={m.status === 'active' ? 'active' : 'inactive'}>{m.status}</Badge></td>
                  </tr>
                ))}
                {filteredMembers.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--gym-muted)' }}>No members found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PAYMENTS ── */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center flex-wrap gap-3">
            <input className="gym-input w-60" placeholder="🔍 Search member, payment ID..." value={paySearch} onChange={(e) => setPaySearch(e.target.value)} />
            <div className="flex gap-2">
              <span className="text-sm py-2" style={{ color: 'var(--gym-muted)' }}>Filtered: {filteredPayments.length} | Total: {formatCurrency(sumBy(filteredPayments.filter((p) => (p.payment_status||'').toLowerCase()==='completed'), 'paymentAmount'))}</span>
              <button className="btn btn-secondary" onClick={() => handleExportPdf('payment')} disabled={exporting}>
                {exporting ? 'Exporting...' : '📄 Export PDF'}
              </button>
            </div>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--gym-surface2)' }}>
                <tr>{['#', 'Member', 'Plan', 'Amount', 'Type', 'Status', 'Date'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider" style={{ color: 'var(--gym-muted)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {filteredPayments.map((p, i) => (
                  <tr key={p.paymentId} style={{ borderTop: '1px solid var(--gym-border)', background: i % 2 === 0 ? 'transparent' : 'var(--gym-surface2)05' }}>
                    <td className="px-4 py-3"><span className="id-chip">#{p.paymentId}</span></td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--gym-text)' }}>{p.memberName || '—'}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--gym-muted)' }}>{p.planType || '—'}</td>
                    <td className="px-4 py-3 font-mono font-bold text-xs" style={{ color: 'var(--gym-accent)' }}>{formatCurrency(p.paymentAmount)}</td>
                    <td className="px-4 py-3 text-xs">{(p.payment_type || '').toLowerCase() === 'card' ? '💳 Card' : '💵 Cash'}</td>
                    <td className="px-4 py-3"><Badge variant={(p.payment_status||'').toLowerCase() === 'completed' ? 'active' : (p.payment_status||'').toLowerCase() === 'pending' ? 'pending' : 'inactive'}>{p.payment_status}</Badge></td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--gym-muted)' }}>{p.payment_date ? p.payment_date.substring(0,10) : '—'}</td>
                  </tr>
                ))}
                {filteredPayments.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--gym-muted)' }}>No payments found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── SUBSCRIPTIONS ── */}
      {activeTab === 'subscriptions' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn btn-secondary" onClick={() => handleExportPdf('subscription')} disabled={exporting}>
              {exporting ? 'Exporting...' : '📄 Export PDF'}
            </button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--gym-surface2)' }}>
                <tr>{['#', 'Member', 'Plan', 'Start', 'End', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider" style={{ color: 'var(--gym-muted)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {subscriptions.map((s, i) => (
                  <tr key={s.subscriptionId} style={{ borderTop: '1px solid var(--gym-border)', background: i % 2 === 0 ? 'transparent' : 'transparent' }}>
                    <td className="px-4 py-3"><span className="id-chip">#{s.subscriptionId}</span></td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--gym-text)' }}>{s.memberName || `#${s.memberId}`}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--gym-accent)' }}>{s.planType}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--gym-muted)' }}>{formatDate(s.startDate)}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: s.end_date && new Date(s.end_date) < new Date() ? 'var(--gym-accent2)' : 'var(--gym-muted)' }}>{formatDate(s.end_date)}</td>
                    <td className="px-4 py-3"><Badge variant={s.is_active ? 'active' : 'inactive'}>{s.is_active ? 'Active' : 'Inactive'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TRAINERS ── */}
      {activeTab === 'trainers' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn btn-secondary" onClick={() => handleExportPdf('trainer')} disabled={exporting}>
              {exporting ? 'Exporting...' : '📄 Export PDF'}
            </button>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {trainers.map((t) => {
              const assignedMembers = 0;
              return (
                <div key={t.trainerId} className="card p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: 'rgba(71,200,255,.15)', color: 'var(--gym-accent3)', fontFamily: "'Space Mono', monospace" }}>
                      {(t.username || 'T').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold" style={{ color: 'var(--gym-text)' }}>{t.username}</div>
                      <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>{t.email}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      ['Experience', `${t.experience_years || 0} years`],
                      ['Status', t.status],
                    ].map(([k, v]) => (
                      <div key={k} className="p-2 rounded-lg text-xs" style={{ background: 'var(--gym-surface2)' }}>
                        <div style={{ color: 'var(--gym-muted)' }}>{k}</div>
                        <div style={{ color: 'var(--gym-text)', fontWeight: 500 }}>{v || '—'}</div>
                      </div>
                    ))}
                  </div>
                  {t.bio && <div className="text-xs p-2 rounded-lg" style={{ background: 'var(--gym-surface2)', color: 'var(--gym-muted)' }}>{t.bio}</div>}
                </div>
              );
            })}
            {trainers.length === 0 && <div className="col-span-3 py-8 text-center text-sm" style={{ color: 'var(--gym-muted)' }}>No trainers found.</div>}
          </div>
        </div>
      )}

      {/* ── SCHEDULES ── */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button className="btn btn-secondary" onClick={() => handleExportPdf('schedule')} disabled={exporting}>
              {exporting ? 'Exporting...' : '📄 Export Schedule PDF'}
            </button>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead style={{ background: 'var(--gym-surface2)' }}>
                <tr>{['#', 'Member', 'Trainer', 'Date', 'Time', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider" style={{ color: 'var(--gym-muted)' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {schedules.map((s, i) => (
                  <tr key={s.scheduleId} style={{ borderTop: '1px solid var(--gym-border)' }}>
                    <td className="px-4 py-3"><span className="id-chip">#{s.scheduleId}</span></td>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--gym-text)' }}>{s.memberName || `#${s.memberId}`}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--gym-accent3)' }}>{s.trainerName || `#${s.trainerId}`}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--gym-muted)' }}>{formatDate(s.scheduleDate)}</td>
                    <td className="px-4 py-3 text-xs font-mono">{s.starttime && s.endtime ? `${s.starttime} – ${s.endtime}` : '—'}</td>
                    <td className="px-4 py-3">
                      <Badge variant={s.status === 'Scheduled' ? 'active' : s.status === 'Cancelled' ? 'inactive' : 'pending'}>{s.status || 'Pending'}</Badge>
                    </td>
                  </tr>
                ))}
                {schedules.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--gym-muted)' }}>No schedules found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TIMESLOTS ── */}
      {activeTab === 'timeslots' && (
        <div className="space-y-3">
          <div className="flex justify-end"><button className="btn btn-secondary" onClick={() => handleExportPdf('member')} disabled={exporting}>{exporting ? 'Exporting...' : '📄 Export PDF'}</button></div>
          <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--gym-surface2)' }}>
              <tr>{['#','Start','End'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider" style={{ color: 'var(--gym-muted)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {timeslots.map((t) => (
                <tr key={t.timeslot_Id} style={{ borderTop: '1px solid var(--gym-border)' }}>
                  <td className="px-4 py-3"><span className="id-chip">#{t.timeslot_Id}</span></td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--gym-accent)' }}>{t.starttime}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--gym-accent3)' }}>{t.endtime}</td>
                </tr>
              ))}
              {timeslots.length === 0 && <tr><td colSpan={3} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--gym-muted)' }}>No timeslots found.</td></tr>}
            </tbody>
          </table>
                  </div>
        </div>
      )}

      {/* ── ATTENDANCE ── */}
      {activeTab === 'attendance' && (
        <div className="space-y-3">
          <div className="flex justify-end"><button className="btn btn-secondary" onClick={() => handleExportPdf('attendance')} disabled={exporting}>{exporting ? 'Exporting...' : '📄 Export Attendance PDF'}</button></div>
          <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--gym-surface2)' }}>
              <tr>{['#','Member','RFID','Check In','Check Out','Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider" style={{ color: 'var(--gym-muted)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {attendance.map((a) => (
                <tr key={a.attendanceId} style={{ borderTop: '1px solid var(--gym-border)' }}>
                  <td className="px-4 py-3"><span className="id-chip">#{a.attendanceId}</span></td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--gym-text)' }}>{a.memberName || `#${a.memberId}`}</td>
                  <td className="px-4 py-3 text-xs font-mono">{a.rfId_Id || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--gym-success)' }}>{a.check_in_time?.substring(0,19) || '—'}</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: a.check_out_time ? 'var(--gym-accent2)' : 'var(--gym-muted)' }}>{a.check_out_time?.substring(0,19) || 'Still inside'}</td>
                  <td className="px-4 py-3"><Badge variant={a.check_out_time ? 'inactive' : 'active'}>{a.check_out_time ? 'Left' : 'Inside'}</Badge></td>
                </tr>
              ))}
              {attendance.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--gym-muted)' }}>No attendance records.</td></tr>}
            </tbody>
          </table>
                  </div>
        </div>
      )}

      {/* ── ASSIGNMENTS ── */}
      {activeTab === 'assignments' && (
        <div className="space-y-3">
          <div className="flex justify-end"><button className="btn btn-secondary" onClick={() => handleExportPdf('trainer_assignment')} disabled={exporting}>{exporting ? 'Exporting...' : '📄 Export PDF'}</button></div>
          <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--gym-surface2)' }}>
              <tr>{['#','Member','Trainer','Date','Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider" style={{ color: 'var(--gym-muted)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {assignments.map((a) => (
                <tr key={a.assignmentId} style={{ borderTop: '1px solid var(--gym-border)' }}>
                  <td className="px-4 py-3"><span className="id-chip">#{a.assignmentId}</span></td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--gym-text)' }}>{a.memberName || `#${a.memberId}`}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--gym-accent3)' }}>{a.trainerName || `#${a.trainerId || a.trainer_Id}`}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--gym-muted)' }}>{formatDate(a.assignment_date)}</td>
                  <td className="px-4 py-3"><Badge variant={a.is_active !== false ? 'active' : 'inactive'}>{a.is_active !== false ? 'Active' : 'Inactive'}</Badge></td>
                </tr>
              ))}
              {assignments.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--gym-muted)' }}>No assignments found.</td></tr>}
            </tbody>
          </table>
                  </div>
        </div>
      )}

      {/* ── WORKOUTS ── */}
      {activeTab === 'workouts' && (
        <div className="space-y-3">
          <div className="flex justify-end"><button className="btn btn-secondary" onClick={() => handleExportPdf('member')} disabled={exporting}>{exporting ? 'Exporting...' : '📄 Export PDF'}</button></div>
          <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--gym-surface2)' }}>
              <tr>{['#','Schedule','Exercise','Sets','Reps','Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider" style={{ color: 'var(--gym-muted)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {workouts.map((w) => (
                <tr key={w.use_Id || w.wse_id} style={{ borderTop: '1px solid var(--gym-border)' }}>
                  <td className="px-4 py-3"><span className="id-chip">#{w.use_Id || w.wse_id}</span></td>
                  <td className="px-4 py-3"><span className="id-chip">#{w.scheduleId}</span></td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--gym-text)' }}>{w.exerciseName || `#${w.exercise_Id}`}</td>
                  <td className="px-4 py-3 text-xs">{w.sets || '—'}</td>
                  <td className="px-4 py-3 text-xs">{w.reps || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={w.sub_status === 'completed' ? 'active' : 'pending'}>{w.sub_status || 'pending'}</Badge></td>
                </tr>
              ))}
              {workouts.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--gym-muted)' }}>No workout records.</td></tr>}
            </tbody>
          </table>
                  </div>
        </div>
      )}

      {/* ── RFID TAGS ── */}
      {activeTab === 'rfid' && (
        <div className="space-y-3">
          <div className="flex justify-end"><button className="btn btn-secondary" onClick={() => handleExportPdf('member')} disabled={exporting}>{exporting ? 'Exporting...' : '📄 Export PDF'}</button></div>
          <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--gym-surface2)' }}>
              <tr>{['#','RFID No.','Issue Date','Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider" style={{ color: 'var(--gym-muted)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {rfidTags.map((t) => (
                <tr key={t.rfId_Id} style={{ borderTop: '1px solid var(--gym-border)' }}>
                  <td className="px-4 py-3"><span className="id-chip">#{t.rfId_Id}</span></td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: 'var(--gym-accent)' }}>{t.rfid_number || '—'}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--gym-muted)' }}>{formatDate(t.issueDate)}</td>
                  <td className="px-4 py-3"><Badge variant={t.isActive ? 'active' : 'inactive'}>{t.isActive ? 'Active' : 'Inactive'}</Badge></td>
                </tr>
              ))}
              {rfidTags.length === 0 && <tr><td colSpan={4} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--gym-muted)' }}>No RFID tags found.</td></tr>}
            </tbody>
          </table>
                  </div>
        </div>
      )}

      {/* ── PLANS ── */}
      {activeTab === 'plans' && (
        <div className="space-y-3">
          <div className="flex justify-end"><button className="btn btn-secondary" onClick={() => handleExportPdf('subscription')} disabled={exporting}>{exporting ? 'Exporting...' : '📄 Export PDF'}</button></div>
          <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead style={{ background: 'var(--gym-surface2)' }}>
              <tr>{['#','Plan Name','Type','Duration','Price','Status'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold tracking-wider" style={{ color: 'var(--gym-muted)' }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.planId} style={{ borderTop: '1px solid var(--gym-border)' }}>
                  <td className="px-4 py-3"><span className="id-chip">#{p.planId}</span></td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--gym-text)' }}>{p.planName || p.plan_name || '—'}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--gym-accent3)' }}>{p.planType || p.plan_type || '—'}</td>
                  <td className="px-4 py-3 text-xs">{p.durationMonths || p.duration_months || '—'} mo</td>
                  <td className="px-4 py-3 text-xs font-mono" style={{ color: 'var(--gym-success)' }}>LKR {p.price || '—'}</td>
                  <td className="px-4 py-3"><Badge variant={p.is_active !== false ? 'active' : 'inactive'}>{p.is_active !== false ? 'Active' : 'Inactive'}</Badge></td>
                </tr>
              ))}
              {plans.length === 0 && <tr><td colSpan={6} className="px-4 py-8 text-center text-sm" style={{ color: 'var(--gym-muted)' }}>No plans found.</td></tr>}
            </tbody>
          </table>
                  </div>
        </div>
      )}
    </div>
  );
}
