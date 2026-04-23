// ============================================================
//  Payments.jsx — Cash + Card payments with receipt generation
// ============================================================
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments, addCashPayment, updatePaymentStatus, refundPayment, downloadReceipt, fetchSubscriptions, showToast } from '../actions';
import DataTable from '../components/DataTable';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { formatDate, formatCurrency, sumBy } from '../utils';
import { ROLES } from '../constants';
import { completeCashPaymentRequest, confirmCashPaymentOtp, downloadReceiptHtml, generateCashPaymentOtp, getCashPaymentRequests, rejectCashPaymentRequest, subscribeWorkflowStore } from '../utils/workflowStore';

function FieldGroup({ label, children }) {
  return <div><label className="gym-label">{label}</label>{children}</div>;
}

const initCash = { p_subscription_id: '', p_amount: '' };

export default function Payments() {
  const dispatch        = useDispatch();
  const { data, loading } = useSelector((s) => s.payments);
  const subscriptions   = useSelector((s) => s.subscriptions.data);
  const adminId         = useSelector((s) => s.ui.currentUserId);
  const user            = useSelector((s) => s.auth.user);
  const isAdmin         = user?.roleId === ROLES.ADMIN;

  const [showCash,    setShowCash]    = useState(false);
  const [cashForm,    setCashForm]    = useState(initCash);
  const [saving,      setSaving]      = useState(false);
  const [search,      setSearch]      = useState('');
  const [typeFilter,  setTypeFilter]  = useState('all');
  const [statFilter,  setStatFilter]  = useState('all');
  const [showReceipt, setShowReceipt] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [cashRequests, setCashRequests] = useState([]);
  const [cashOtpInputs, setCashOtpInputs] = useState({});

  useEffect(() => {
    dispatch(fetchPayments());
    dispatch(fetchSubscriptions());
  }, [dispatch]);

  useEffect(() => {
    const syncCashRequests = () => setCashRequests(getCashPaymentRequests());
    syncCashRequests();
    return subscribeWorkflowStore(syncCashRequests);
  }, []);

  const handleCashAdd = async () => {
    if (!cashForm.p_subscription_id || !cashForm.p_amount) return;
    setSaving(true);
    const ok = await dispatch(addCashPayment(cashForm, adminId));
    setSaving(false);
    if (ok) {
      setReceiptData({
        receiptNo:      'RCP-' + Date.now(),
        date:           new Date().toLocaleString(),
        subscriptionId: cashForm.p_subscription_id,
        amount:         cashForm.p_amount,
        paymentType:    'Cash',
        status:         'Completed',
        generatedBy:    'DTS Gym Management',
        emailMessage:   'Receipt marked for member email delivery.',
      });
      setShowCash(false);
      setCashForm(initCash);
      setShowReceipt(true);
    }
  };

  const handleGenerateOtp = (requestId) => {
    const updated = generateCashPaymentOtp(requestId);
    if (updated?.generatedOtp) {
      setCashOtpInputs((current) => ({ ...current, [requestId]: updated.generatedOtp }));
    }
  };

  const handleRejectCashRequest = (requestId) => {
    rejectCashPaymentRequest(requestId, 'Admin rejected this counter payment request.');
  };

  const handleConfirmCashRequest = async (request) => {
    const otpInput = cashOtpInputs[request.id] || '';
    const verified = confirmCashPaymentOtp(request.id, otpInput, 'admin');

    if (!verified.ok) {
      dispatch(showToast(verified.message, 'error'));
      return;
    }
    if (!request.memberConfirmedAt) {
      dispatch(showToast('Waiting for the member to confirm the OTP first.', 'error'));
      return;
    }

    setSaving(true);
    const ok = await dispatch(addCashPayment({
      p_subscription_id: request.subscriptionId,
      p_amount: request.amount,
    }, adminId));
    setSaving(false);

    if (!ok) return;

    const receipt = {
      receiptNo: `RCP-${Date.now()}`,
      date: new Date().toLocaleString(),
      subscriptionId: request.subscriptionId,
      amount: request.amount,
      paymentType: 'Cash',
      status: 'Completed',
      generatedBy: 'DTS Gym Management',
      memberName: request.memberName,
      emailMessage: `Receipt prepared for ${request.memberEmail || 'the member email'} and ready to download.`,
    };

    completeCashPaymentRequest(request.id, receipt);
    setReceiptData(receipt);
    setShowReceipt(true);
  };

  const printReceipt = () => {
    if (!receiptData) return;
    const w = window.open('', '_blank');
    const html = [
      '<!DOCTYPE html><html><head><title>Receipt</title>',
      '<style>',
      'body{font-family:monospace;max-width:400px;margin:40px auto;padding:20px;border:1px solid #ccc}',
      'h2{text-align:center;letter-spacing:4px}',
      '.line{border-top:1px dashed #ccc;margin:10px 0}',
      '.row{display:flex;justify-content:space-between;margin:6px 0}',
      '.total{font-size:1.4em;font-weight:bold}',
      '.footer{text-align:center;margin-top:20px;font-size:0.8em;color:#666}',
      '</style></head><body>',
      '<h2>DTS GYM</h2>',
      '<p style="text-align:center;color:#666">Payment Receipt</p>',
      '<div class="line"></div>',
      '<div class="row"><span>Receipt No:</span><strong>' + receiptData.receiptNo + '</strong></div>',
      '<div class="row"><span>Date:</span><span>' + receiptData.date + '</span></div>',
      '<div class="row"><span>Subscription ID:</span><span>#' + receiptData.subscriptionId + '</span></div>',
      '<div class="row"><span>Payment Type:</span><span>' + receiptData.paymentType + '</span></div>',
      '<div class="row"><span>Status:</span><span>' + receiptData.status + '</span></div>',
      '<div class="line"></div>',
      '<div class="row total"><span>AMOUNT PAID:</span><span>LKR ' + parseFloat(receiptData.amount || 0).toFixed(2) + '</span></div>',
      '<div class="line"></div>',
      '<div class="footer">Thank you for your payment!<br>' + receiptData.generatedBy + '</div>',
      '</body></html>',
    ].join('');
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const handleApprove = (id) => dispatch(updatePaymentStatus(id, 'completed', adminId));
  const handleReject  = (id) => dispatch(updatePaymentStatus(id, 'failed', adminId));
  const handleRefund  = (id) => {
    if (window.confirm('Refund payment #' + id + '? This cannot be undone.'))
      dispatch(refundPayment(id, adminId));
  };
  const handleReceipt = (id) => dispatch(downloadReceipt(id));

  let filtered = data;
  if (search)               filtered = filtered.filter((p) =>
    String(p.paymentId).includes(search) ||
    (p.memberName || '').toLowerCase().includes(search.toLowerCase()) ||
    String(p.subscriptionId).includes(search)
  );
  if (typeFilter !== 'all') filtered = filtered.filter((p) => (p.payment_type || '').toLowerCase() === typeFilter);
  if (statFilter !== 'all') filtered = filtered.filter((p) => (p.payment_status || '').toLowerCase() === statFilter);

  const totalRevenue   = sumBy(data.filter((p) => (p.payment_status || '').toLowerCase() === 'completed'), 'paymentAmount');
  const pendingCount   = data.filter((p) => (p.payment_status || '').toLowerCase() === 'pending').length;
  const completedCount = data.filter((p) => (p.payment_status || '').toLowerCase() === 'completed').length;
  const cardCount      = data.filter((p) => (p.payment_type || '').toLowerCase() === 'card').length;
  const cashCount      = data.filter((p) => (p.payment_type || '').toLowerCase() === 'cash').length;

  const statusVariant = (s) => {
    const l = (s || '').toLowerCase();
    if (l === 'completed') return 'active';
    if (l === 'pending')   return 'pending';
    if (l === 'failed')    return 'inactive';
    if (l === 'refunded')  return 'info';
    return 'default';
  };

  const columns = [
    { key: 'paymentId',     label: 'ID',     width: 60, render: (v) => <span className="id-chip">#{v}</span> },
    { key: 'memberName',    label: 'Member', render: (v) => <span className="font-medium" style={{ color: 'var(--gym-text)' }}>{v || '—'}</span> },
    { key: 'planType',      label: 'Plan',   render: (v) => v || '—' },
    { key: 'paymentAmount', label: 'Amount', render: (v) => <span className="font-mono font-bold" style={{ color: 'var(--gym-accent)' }}>{formatCurrency(v)}</span> },
    { key: 'payment_type',  label: 'Type',   render: (v) => (
      <span className="flex items-center gap-1">
        {(v || '').toLowerCase() === 'card' ? '💳' : '💵'}
        <span style={{ color: (v || '').toLowerCase() === 'card' ? 'var(--gym-accent3)' : 'var(--gym-success)' }}>{v}</span>
      </span>
    )},
    { key: 'payment_status', label: 'Status', render: (v) => <Badge variant={statusVariant(v)}>{v || 'pending'}</Badge> },
    { key: 'payment_date',   label: 'Date',   render: (v) => <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>{v ? v.substring(0, 10) : '—'}</span> },
    ...(isAdmin ? [{
      key: '_actions', label: 'Actions', render: (_, row) => {
        const st = (row.payment_status || '').toLowerCase();
        return (
          <div className="flex gap-1 flex-wrap">
            {st === 'pending'   && <button className="btn btn-secondary btn-sm" style={{ color: 'var(--gym-success)' }} onClick={() => handleApprove(row.paymentId)}>✓ Approve</button>}
            {st === 'pending'   && <button className="btn btn-danger btn-sm" onClick={() => handleReject(row.paymentId)}>✕ Reject</button>}
            {st === 'completed' && <button className="btn btn-secondary btn-sm" onClick={() => handleRefund(row.paymentId)}>↩ Refund</button>}
            <button className="btn btn-secondary btn-sm" onClick={() => handleReceipt(row.paymentId)}>🧾 Receipt</button>
          </div>
        );
      }
    }] : [{ key: '_rec', label: '', render: (_, row) => (
      <button className="btn btn-secondary btn-sm" onClick={() => handleReceipt(row.paymentId)}>🧾 Receipt</button>
    )}]),
  ];

  return (
    <div className="space-y-5">
      <div className="page-header">
        <div>
          <div className="page-title">Payments</div>
          <div className="page-sub">{data.length} total · {completedCount} completed · {pendingCount} pending</div>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowCash(true)}>+ Add Cash Payment</button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(totalRevenue), color: 'var(--gym-accent)' },
          { label: 'Completed',     value: completedCount, color: 'var(--gym-success)' },
          { label: 'Pending',       value: pendingCount,   color: 'var(--gym-warning)' },
          { label: 'Card / Cash',   value: cardCount + ' / ' + cashCount, color: 'var(--gym-accent3)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-4 text-center">
            <div className="text-xs mb-1" style={{ color: 'var(--gym-muted)', letterSpacing: '0.1em' }}>{label.toUpperCase()}</div>
            <div className="text-xl font-bold" style={{ color, fontFamily: "'Space Mono', monospace" }}>{value}</div>
          </div>
        ))}
      </div>

      {isAdmin && (
        <div className="gym-card">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div>
              <div className="gym-card-title mb-0">Cash Payment Requests</div>
              <div className="text-xs mt-0.5" style={{ color: 'var(--gym-muted)' }}>
                Counter payments now require an OTP from both the member and admin before the cash record is finalized.
              </div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(255,179,71,.12)', color: 'var(--gym-warning)' }}>
              {cashRequests.filter((request) => request.status !== 'completed').length} open
            </span>
          </div>

          {cashRequests.length === 0 ? (
            <div className="text-sm" style={{ color: 'var(--gym-muted)' }}>No cash requests have been submitted yet.</div>
          ) : (
            <div className="space-y-3">
              {cashRequests.map((request) => (
                <div key={request.id} className="p-4 rounded-2xl" style={{ background: 'var(--gym-surface2)', border: '1px solid var(--gym-border)' }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="text-sm font-semibold" style={{ color: 'var(--gym-text)' }}>{request.memberName}</div>
                      <div className="text-xs mt-1" style={{ color: 'var(--gym-muted)' }}>
                        {request.memberEmail || request.memberPhone || 'Member contact unavailable'} · {request.planLabel || `Subscription #${request.subscriptionId}`}
                      </div>
                    </div>
                    <Badge variant={request.status === 'completed' ? 'active' : request.status === 'rejected' ? 'inactive' : 'pending'}>
                      {request.status.replace('_', ' ')}
                    </Badge>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-3 mt-4">
                    {[
                      ['Amount', `LKR ${parseFloat(request.amount || 0).toFixed(2)}`],
                      ['OTP', request.generatedOtp || 'Not generated'],
                      ['Member', request.memberConfirmedAt ? 'Verified' : 'Waiting'],
                      ['Admin', request.adminConfirmedAt ? 'Verified' : 'Waiting'],
                    ].map(([label, value]) => (
                      <div key={label} className="p-3 rounded-xl text-xs" style={{ background: 'var(--gym-surface)' }}>
                        <div style={{ color: 'var(--gym-muted)' }}>{label}</div>
                        <div className="font-medium mt-1" style={{ color: 'var(--gym-text)' }}>{value}</div>
                      </div>
                    ))}
                  </div>

                  {request.status === 'pending' && (
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <button className="btn btn-primary btn-sm" onClick={() => handleGenerateOtp(request.id)}>Generate OTP</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleRejectCashRequest(request.id)}>Reject</button>
                    </div>
                  )}

                  {request.status === 'otp_generated' && (
                    <div className="mt-4 space-y-3">
                      <div className="grid sm:grid-cols-[1fr_auto] gap-3 items-end">
                        <div>
                          <label className="gym-label">Admin OTP Confirmation</label>
                          <input
                            className="gym-input font-mono tracking-[0.25em]"
                            inputMode="numeric"
                            maxLength={6}
                            value={cashOtpInputs[request.id] || ''}
                            onChange={(e) => setCashOtpInputs((current) => ({
                              ...current,
                              [request.id]: e.target.value.replace(/\D/g, '').slice(0, 6),
                            }))}
                            placeholder="000000"
                          />
                        </div>
                        <button className="btn btn-primary" disabled={(cashOtpInputs[request.id] || '').length !== 6 || saving || !request.memberConfirmedAt} onClick={() => handleConfirmCashRequest(request)}>
                          {saving ? 'Recording...' : 'Confirm & Record'}
                        </button>
                      </div>
                      {!request.memberConfirmedAt && (
                        <div className="text-xs px-3 py-2 rounded-xl" style={{ background: 'rgba(71,200,255,.08)', color: 'var(--gym-accent3)' }}>
                          Waiting for the member to confirm the OTP from their dashboard before this cash payment can be recorded.
                        </div>
                      )}
                    </div>
                  )}

                  {request.status === 'completed' && request.receipt && (
                    <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
                      <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>{request.receipt.emailMessage}</div>
                      <button className="btn btn-secondary btn-sm" onClick={() => downloadReceiptHtml(request.receipt)}>Download Receipt</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs" style={{ color: 'var(--gym-muted)' }}>🔍</span>
          <input className="gym-input pl-8 w-48" placeholder="Search member, ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="gym-input w-36" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Types</option>
          <option value="cash">Cash 💵</option>
          <option value="card">Card 💳</option>
        </select>
        <select className="gym-input w-36" value={statFilter} onChange={(e) => setStatFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      <DataTable columns={columns} data={filtered} loading={loading} rowKey="paymentId" />

      {/* Add Cash Payment Modal */}
      <Modal isOpen={showCash} onClose={() => setShowCash(false)} title="ADD CASH PAYMENT" maxWidth={440}>
        <div className="modal-body space-y-4">
          <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(39,174,96,.08)', border: '1px solid rgba(39,174,96,.2)', color: 'var(--gym-success)' }}>
            💵 Recording a cash payment received at gym counter
          </div>
          <FieldGroup label="Subscription *">
            <select className="gym-input" value={cashForm.p_subscription_id}
              onChange={(e) => setCashForm((f) => ({ ...f, p_subscription_id: e.target.value }))}>
              <option value="">Select subscription...</option>
              {subscriptions.map((s) => (
                <option key={s.subscriptionId} value={s.subscriptionId}>
                  #{s.subscriptionId} — {s.memberName || 'Member #' + s.memberId} ({s.planType})
                </option>
              ))}
            </select>
          </FieldGroup>
          <FieldGroup label="Amount (LKR) *">
            <input className="gym-input font-mono" type="number" min="0" step="0.01"
              value={cashForm.p_amount}
              onChange={(e) => setCashForm((f) => ({ ...f, p_amount: e.target.value }))}
              placeholder="5000.00" />
          </FieldGroup>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowCash(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleCashAdd} disabled={saving}>
            {saving ? 'Saving...' : '💵 Record Cash Payment'}
          </button>
        </div>
      </Modal>

      {/* Receipt Modal */}
      <Modal isOpen={showReceipt} onClose={() => setShowReceipt(false)} title="💵 PAYMENT RECEIPT" maxWidth={440}>
        {receiptData && (
          <div className="modal-body space-y-3">
            <div className="p-5 rounded-2xl text-center" style={{ background: 'linear-gradient(135deg,rgba(71,255,154,.08),rgba(71,200,255,.05))', border: '1px solid rgba(71,255,154,.2)' }}>
              <div className="text-3xl mb-2">✅</div>
              <div className="text-xl font-bold" style={{ color: 'var(--gym-success)', fontFamily: "'Bebas Neue',cursive", letterSpacing: '0.1em' }}>PAYMENT CONFIRMED</div>
              <div className="text-2xl font-bold mt-2" style={{ color: 'var(--gym-text)', fontFamily: "'Space Mono',monospace" }}>
                LKR {parseFloat(receiptData.amount || 0).toFixed(2)}
              </div>
            </div>
            <div className="space-y-2">
              {[
                ['Receipt No',      receiptData.receiptNo],
                ['Date & Time',     receiptData.date],
                ['Subscription ID', '#' + receiptData.subscriptionId],
                ['Payment Method',  receiptData.paymentType],
                ['Status',          receiptData.status],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center p-3 rounded-xl" style={{ background: 'var(--gym-surface2)' }}>
                  <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>{k}</span>
                  <span className="text-sm font-semibold" style={{ color: 'var(--gym-text)' }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="p-3 rounded-xl text-xs text-center" style={{ background: 'rgba(71,200,255,.06)', color: 'var(--gym-muted)', border: '1px solid rgba(71,200,255,.15)' }}>
              🏋️ Thank you! Your payment has been recorded by {receiptData.generatedBy}
            </div>
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowReceipt(false)}>Close</button>
          <button className="btn btn-secondary" onClick={() => receiptData && downloadReceiptHtml(receiptData)}>Download</button>
          <button className="btn btn-primary" onClick={printReceipt}>🖨️ Print Receipt</button>
        </div>
      </Modal>
    </div>
  );
}
