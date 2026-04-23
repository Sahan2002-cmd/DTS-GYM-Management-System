// ============================================================
//  Attendance.jsx — Member & Trainer Attendance Management
//  APIs: /Attendance/* and /TrainerAttendance/*
// ============================================================
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import * as api from '../services/api';

function formatDT(v) {
  if (!v) return '—';
  try { return new Date(v).toLocaleString('en-US', { month: 'short', day: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return v; }
}

const TABS = ['Member Attendance', 'Trainer Attendance'];

export default function Attendance() {
  const { user } = useSelector((s) => s.auth);
  const adminId  = useSelector((s) => s.ui.currentUserId);
  const isAdmin  = user?.roleId === 1;
  const isTrainer = user?.roleId === 2;

  const [tab,         setTab]         = useState(0);
  const [records,     setRecords]     = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [search,      setSearch]      = useState('');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [rfidInput,   setRfidInput]   = useState('');
  const [rfidMsg,     setRfidMsg]     = useState('');
  const [rfidMsgType, setRfidMsgType] = useState('info');
  const [trainerRecords, setTrainerRecords] = useState([]);
  const [trainerLoading, setTrainerLoading] = useState(false);
  const [trainerSearch,  setTrainerSearch]  = useState('');
  const [tDateFrom,  setTDateFrom]  = useState('');
  const [tDateTo,    setTDateTo]    = useState('');
  const [tCheckMsg,  setTCheckMsg]  = useState('');
  const [tMsgType,   setTMsgType]   = useState('info');

  const loadMemberAttendance = async () => {
    setLoading(true);
    try {
      let res;
      if (dateFrom && dateTo) {
        res = await api.getAttendanceByDateRange(dateFrom, dateTo);
      } else if (!isAdmin && user?.userId) {
        res = await api.getMemberAttendance(user.userId);
      } else {
        res = await api.getAllAttendance();
      }
      const data = res?.data?.ResultSet || res?.data || [];
      setRecords(Array.isArray(data) ? data : []);
    } catch { setRecords([]); }
    setLoading(false);
  };

  const loadTrainerAttendance = async () => {
    setTrainerLoading(true);
    try {
      let res;
      if (tDateFrom && tDateTo) {
        res = await api.getTrainerAttendanceByDateRange(tDateFrom, tDateTo);
      } else if (isTrainer && user?.userId) {
        res = await api.getTrainerAttendanceByTrainer(user.userId);
      } else {
        res = await api.getAllTrainerAttendance();
      }
      const data = res?.data?.ResultSet || res?.data || [];
      setTrainerRecords(Array.isArray(data) ? data : []);
    } catch { setTrainerRecords([]); }
    setTrainerLoading(false);
  };

  useEffect(() => { loadMemberAttendance(); }, [dateFrom, dateTo]);
  useEffect(() => { loadTrainerAttendance(); }, [tDateFrom, tDateTo]);

  // ── RFID Manual Check-in/out ──────────────────────────────
  const handleRfidCheckIn = async () => {
    if (!rfidInput.trim()) return;
    try {
      const res = await api.checkIn(rfidInput.trim());
      const data = res?.data;
      setRfidMsg(data?.Result || data?.Message || 'Check-in recorded successfully!');
      setRfidMsgType(data?.StatusCode === 200 ? 'success' : 'error');
      setRfidInput('');
      loadMemberAttendance();
    } catch { setRfidMsg('Check-in failed. Check RFID ID.'); setRfidMsgType('error'); }
    setTimeout(() => setRfidMsg(''), 4000);
  };

  const handleRfidCheckOut = async () => {
    if (!rfidInput.trim()) return;
    try {
      const res = await api.checkOut(rfidInput.trim());
      const data = res?.data;
      setRfidMsg(data?.Result || data?.Message || 'Check-out recorded successfully!');
      setRfidMsgType(data?.StatusCode === 200 ? 'success' : 'error');
      setRfidInput('');
      loadMemberAttendance();
    } catch { setRfidMsg('Check-out failed. Check RFID ID.'); setRfidMsgType('error'); }
    setTimeout(() => setRfidMsg(''), 4000);
  };

  // ── Trainer Check-in/out ──────────────────────────────────
  const handleTrainerCheckIn = async () => {
    const tid = user?.trainerId || user?.userId;
    if (!tid) { setTCheckMsg('No trainer ID found.'); setTMsgType('error'); return; }
    try {
      const res = await api.trainerCheckIn(tid);
      const data = res?.data;
      setTCheckMsg(data?.Result || 'Trainer check-in recorded!');
      setTMsgType(data?.StatusCode === 200 ? 'success' : 'error');
      loadTrainerAttendance();
    } catch { setTCheckMsg('Check-in failed.'); setTMsgType('error'); }
    setTimeout(() => setTCheckMsg(''), 4000);
  };

  const handleTrainerCheckOut = async () => {
    const tid = user?.trainerId || user?.userId;
    if (!tid) { setTCheckMsg('No trainer ID found.'); setTMsgType('error'); return; }
    try {
      const res = await api.trainerCheckOut(tid);
      const data = res?.data;
      setTCheckMsg(data?.Result || 'Trainer check-out recorded!');
      setTMsgType(data?.StatusCode === 200 ? 'success' : 'error');
      loadTrainerAttendance();
    } catch { setTCheckMsg('Check-out failed.'); setTMsgType('error'); }
    setTimeout(() => setTCheckMsg(''), 4000);
  };

  const filtered = search
    ? records.filter((r) =>
        String(r.memberId || '').includes(search) ||
        (r.memberName || r.username || '').toLowerCase().includes(search.toLowerCase()) ||
        String(r.rfidId || r.rfidNumber || '').toLowerCase().includes(search.toLowerCase())
      )
    : records;

  const filteredTrainer = trainerSearch
    ? trainerRecords.filter((r) =>
        String(r.trainerId || '').includes(trainerSearch) ||
        (r.trainerName || r.username || '').toLowerCase().includes(trainerSearch.toLowerCase())
      )
    : trainerRecords;

  const memberColumns = [
    { key: 'attendanceId', label: 'ID', width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'memberId',  label: 'Member ID', render: (v) => <span className="font-mono text-xs">{v || '—'}</span> },
    { key: 'memberName', label: 'Name', render: (v, row) => <span style={{ color: 'var(--gym-text)' }}>{v || row.username || '—'}</span> },
    { key: 'rfidId',    label: 'RFID',   render: (v, row) => <span className="font-mono text-xs" style={{ color: 'var(--gym-accent3)' }}>{v || row.rfidNumber || '—'}</span> },
    { key: 'checkInTime',  label: 'Check In',  render: (v) => <span className="text-xs">{formatDT(v)}</span> },
    { key: 'checkOutTime', label: 'Check Out', render: (v) => v ? <span className="text-xs">{formatDT(v)}</span> : <Badge variant="pending">Still In</Badge> },
    { key: 'date', label: 'Date', render: (v, row) => <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>{v || row.attendanceDate || '—'}</span> },
  ];

  const trainerColumns = [
    { key: 'attendanceId', label: 'ID', width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'trainerId', label: 'Trainer ID', render: (v) => <span className="font-mono text-xs">{v || '—'}</span> },
    { key: 'trainerName', label: 'Name', render: (v, row) => <span style={{ color: 'var(--gym-text)' }}>{v || row.username || '—'}</span> },
    { key: 'checkInTime',  label: 'Check In',  render: (v) => <span className="text-xs">{formatDT(v)}</span> },
    { key: 'checkOutTime', label: 'Check Out', render: (v) => v ? <span className="text-xs">{formatDT(v)}</span> : <Badge variant="pending">Still In</Badge> },
    { key: 'date', label: 'Date', render: (v, row) => <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>{v || row.attendanceDate || '—'}</span> },
  ];

  const msgColor = (t) => t === 'error' ? 'var(--gym-accent2)' : t === 'success' ? 'var(--gym-success)' : 'var(--gym-accent3)';
  const msgBg   = (t) => t === 'error' ? 'rgba(255,71,71,.08)' : t === 'success' ? 'rgba(71,255,154,.08)' : 'rgba(71,200,255,.08)';

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <div className="page-title">Attendance</div>
          <div className="page-sub">Track member & trainer check-in/out records</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary" onClick={() => { loadMemberAttendance(); loadTrainerAttendance(); }}>↺ Refresh</button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--gym-surface2)', border: '1px solid var(--gym-border)' }}>
        {(isAdmin ? TABS : isTrainer ? ['Trainer Attendance'] : ['Member Attendance']).map((t, i) => {
          const idx = isAdmin ? i : isTrainer ? 1 : 0;
          return (
            <button key={t} onClick={() => setTab(idx)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
              style={{ background: tab === idx ? 'var(--gym-surface)' : 'transparent', color: tab === idx ? 'var(--gym-accent)' : 'var(--gym-muted)', border: tab === idx ? '1px solid var(--gym-border2)' : '1px solid transparent' }}>
              {t}
            </button>
          );
        })}
      </div>

      {/* ── Member Attendance Tab ── */}
      {tab === 0 && (
        <div className="space-y-5">
          {/* RFID Manual Check-in */}
          {isAdmin && (
            <div className="gym-card">
              <div className="gym-card-title">Manual RFID Check-in / Check-out</div>
              <div className="flex flex-wrap gap-3 items-end">
                <div className="flex-1 min-w-48">
                  <label className="gym-label">RFID Tag ID</label>
                  <input className="gym-input" value={rfidInput} onChange={(e) => setRfidInput(e.target.value)}
                    placeholder="Enter RFID tag ID..." onKeyDown={(e) => e.key === 'Enter' && handleRfidCheckIn()} />
                </div>
                <button className="btn btn-success" onClick={handleRfidCheckIn}>✓ Check In</button>
                <button className="btn btn-secondary" onClick={handleRfidCheckOut}>⬡ Check Out</button>
              </div>
              {rfidMsg && (
                <div className="mt-3 px-4 py-2 rounded-xl text-sm" style={{ background: msgBg(rfidMsgType), border: `1px solid ${msgColor(rfidMsgType)}33`, color: msgColor(rfidMsgType) }}>
                  {rfidMsg}
                </div>
              )}
            </div>
          )}

          {/* Date Range Filter */}
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--gym-muted)' }}>🔍</span>
              <input className="gym-input pl-8 w-52" placeholder="Search member, RFID..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div>
              <label className="gym-label">From</label>
              <input type="date" className="gym-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="gym-label">To</label>
              <input type="date" className="gym-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            {(dateFrom || dateTo) && (
              <button className="btn btn-secondary" onClick={() => { setDateFrom(''); setDateTo(''); }}>✕ Clear</button>
            )}
            <div className="ml-auto text-sm" style={{ color: 'var(--gym-muted)' }}>
              {filtered.length} records
            </div>
          </div>

          <DataTable columns={memberColumns} data={filtered} loading={loading} rowKey="attendanceId" />
        </div>
      )}

      {/* ── Trainer Attendance Tab ── */}
      {tab === 1 && (
        <div className="space-y-5">
          {/* Trainer self check-in */}
          {isTrainer && (
            <div className="gym-card">
              <div className="gym-card-title">My Attendance</div>
              <div className="flex flex-wrap gap-3">
                <button className="btn btn-success" onClick={handleTrainerCheckIn}>✓ Check In</button>
                <button className="btn btn-secondary" onClick={handleTrainerCheckOut}>⬡ Check Out</button>
              </div>
              {tCheckMsg && (
                <div className="mt-3 px-4 py-2 rounded-xl text-sm" style={{ background: msgBg(tMsgType), border: `1px solid ${msgColor(tMsgType)}33`, color: msgColor(tMsgType) }}>
                  {tCheckMsg}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--gym-muted)' }}>🔍</span>
              <input className="gym-input pl-8 w-52" placeholder="Search trainer..." value={trainerSearch} onChange={(e) => setTrainerSearch(e.target.value)} />
            </div>
            <div>
              <label className="gym-label">From</label>
              <input type="date" className="gym-input" value={tDateFrom} onChange={(e) => setTDateFrom(e.target.value)} />
            </div>
            <div>
              <label className="gym-label">To</label>
              <input type="date" className="gym-input" value={tDateTo} onChange={(e) => setTDateTo(e.target.value)} />
            </div>
            {(tDateFrom || tDateTo) && (
              <button className="btn btn-secondary" onClick={() => { setTDateFrom(''); setTDateTo(''); }}>✕ Clear</button>
            )}
            <div className="ml-auto text-sm" style={{ color: 'var(--gym-muted)' }}>
              {filteredTrainer.length} records
            </div>
          </div>

          <DataTable columns={trainerColumns} data={filteredTrainer} loading={trainerLoading} rowKey="attendanceId" />
        </div>
      )}
    </div>
  );
}
