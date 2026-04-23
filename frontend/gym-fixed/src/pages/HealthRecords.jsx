// ============================================================
//  HealthRecords.jsx — PAR-Q Management (Admin & Trainer)
//  Allows filtering by member name or ID
// ============================================================
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllParQ, fetchTrainerMembersParQ } from '../actions/parqAction';
import { ROLES } from '../constants';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

export default function HealthRecords() {
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);
  const parqState = useSelector((s) => s.parq || {});
  
  // Get data based on user role
  const data = user?.roleId === ROLES.ADMIN ? parqState.all : parqState.members;
  const loading = user?.roleId === ROLES.ADMIN ? parqState.allLoading : parqState.membersLoading;
  
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    if (user?.roleId === ROLES.ADMIN) {
      dispatch(fetchAllParQ());
    } else if (user?.roleId === ROLES.TRAINER) {
      dispatch(fetchTrainerMembersParQ(user.userId));
    }
  }, [dispatch, user]);

  const filtered = (data || []).filter(r => 
    (`${r.firstName || ''} ${r.lastName || ''}`).toLowerCase().includes(search.toLowerCase()) ||
    (r.userId || '').toString().includes(search)
  );

  const columns = [
    { key: 'userId', label: 'Member ID', width: 100, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'userId', label: 'Member Name', render: (v, row) => <span className="font-bold">{`${row.firstName || ''} ${row.lastName || ''}`.trim() || '—'}</span> },
    { key: 'submitted_date', label: 'Submitted', render: (v) => v ? v.substring(0, 10) : '—' },
    { key: 'total_yes', label: 'Risk Flags', render: (v) => (
      <Badge variant={v > 0 ? 'inactive' : 'active'}>{v} High Risk</Badge>
    )},
    { key: '_view', label: 'Form', render: (_, row) => (
      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRecord(row)}>👁️ View Details</button>
    )}
  ];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <div className="page-title">Member Health Records</div>
          <div className="page-sub">Review and filter PAR-Q safety questionnaires</div>
        </div>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--gym-muted)' }}>🔍</span>
          <input
            className="gym-input pl-8 w-64"
            placeholder="Search by member name or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} rowKey="parqId" />

      {/* Details Modal */}
      <Modal 
        isOpen={!!selectedRecord} 
        onClose={() => setSelectedRecord(null)} 
        title={`PAR-Q Detail: ${selectedRecord?.firstName || ''} ${selectedRecord?.lastName || ''}`.trim()}
        maxWidth={600}
      >
        <div className="modal-body space-y-4">
          <div className="p-4 rounded-xl" style={{ background: 'var(--gym-surface2)', borderLeft: '4px solid var(--gym-accent)' }}>
            <div className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: 'var(--gym-muted)' }}>Summary</div>
            <div className="text-sm">Submission Date: {selectedRecord?.submitted_date}</div>
            <div className="text-sm font-bold mt-1" style={{ color: selectedRecord?.total_yes > 0 ? 'var(--gym-accent2)' : 'var(--gym-success)' }}>
              {selectedRecord?.total_yes > 0 ? '⚠️ High Risk - Manual Review Required' : '✅ Clear for Activity'}
            </div>
          </div>
          
          <div className="space-y-3">
             <div className="text-xs font-bold text-muted uppercase">Questionnaire Responses</div>
             <div className="grid gap-2 text-sm">
                {[
                  { q: 'Heart condition?', a: selectedRecord?.q1_heart_condition },
                  { q: 'Chest pain during activity?', a: selectedRecord?.q2_chest_pain_activity },
                  { q: 'Chest pain at rest?', a: selectedRecord?.q3_chest_pain_rest },
                  { q: 'Dizziness/Balance issues?', a: selectedRecord?.q4_dizziness },
                  { q: 'Bone/Joint problems?', a: selectedRecord?.q5_bone_joint },
                  { q: 'BP/Heart medication?', a: selectedRecord?.q6_bp_medication },
                  { q: 'Other medical reason?', a: selectedRecord?.q7_other_reason },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2 rounded bg-opacity-50" style={{ background: item.a ? 'rgba(255,100,100,.1)' : 'rgba(100,255,100,.1)' }}>
                    <span>{item.q}</span>
                    <Badge variant={item.a ? 'inactive' : 'active'}>{item.a ? 'YES' : 'NO'}</Badge>
                  </div>
                ))}
                {selectedRecord?.q7_other_details && (
                  <div className="p-2 border rounded mt-2 border-dashed border-gym">
                    <div className="text-xs uppercase font-bold text-muted mb-1">Details for "Other"</div>
                    <div className="text-sm">{selectedRecord.q7_other_details}</div>
                  </div>
                )}
             </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setSelectedRecord(null)}>Close</button>
        </div>
      </Modal>
    </div>
  );
}
