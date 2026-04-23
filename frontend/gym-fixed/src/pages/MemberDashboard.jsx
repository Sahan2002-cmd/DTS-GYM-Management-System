// ============================================================
//  MemberDashboard.jsx
//  Changes in this version:
//    • Duplicate BMI card REMOVED (WellnessHub already shows it)
//    • AI chat now supports Claude / Gemini / ChatGPT toggle
//    • All existing features preserved
// ============================================================
import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchSchedulesByMember, fetchSubscriptions, fetchPaymentsByMember,
  fetchMemberAttendance, fetchTrainers, fetchAssignments,
  fetchTimeslots, addSchedule, fetchTrainerTimeslots, showToast, fetchPlans,
} from '../actions';
import { fetchMyParQ, saveParQ } from '../actions/parqAction';
import { formatDate, formatCurrency, sumBy, getImgUrl } from '../utils';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import WellnessHub from '../components/member/WellnessHub';
import TrainerRequestPanel from '../components/member/TrainerRequestPanel';
import CashPaymentRequestCard from '../components/member/CashPaymentRequestCard';
import {
  createCashPaymentRequest, createTrainerRequest, confirmCashPaymentOtp,
  getCashPaymentRequests, getTrainerRequests, subscribeWorkflowStore,
} from '../utils/workflowStore';
import * as api from '../services/api';

// ── Small helpers ────────────────────────────────────────────
function FieldGroup({ label, children }) {
  return <div><label className="gym-label">{label}</label>{children}</div>;
}
function CalIcon()     { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function CardPayIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>; }
function RfidIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><rect x="2" y="5" width="14" height="14" rx="2"/><path d="M18 8a4 4 0 010 8"/><path d="M21 5a7 7 0 010 14"/></svg>; }
function HeartIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>; }

function MiniStat({ label, value, sub, color, icon }) {
  return (
    <div className="stat-card" style={{ cursor: 'default' }}>
      <div className="absolute top-3 right-3" style={{ color, opacity: 0.7 }}>{icon}</div>
      <div className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: 'var(--gym-muted)' }}>{label}</div>
      <div className="text-2xl sm:text-3xl font-bold leading-none mb-1" style={{ color, fontFamily: "'Space Mono', monospace" }}>{value}</div>
      <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>{sub}</div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-30" style={{ background: color }} />
    </div>
  );
}

// ── AI configuration ─────────────────────────────────────────
const AI_SYSTEM = `You are a certified gym nutrition and fitness advisor for DTS Gym.
ONLY answer questions about diet, nutrition, meal plans, workouts, exercise, fitness, gym,
weight loss, muscle gain, supplements, and sports health.
If the user asks about anything else, politely say you can only help with gym and health topics.
Keep answers practical, concise, and motivating.`;

const AI_PROVIDERS = [
  { id: 'claude',  label: 'Claude',  color: '#d97706', envKey: 'VITE_ANTHROPIC_KEY' },
  { id: 'gemini',  label: 'Gemini',  color: '#2563eb', envKey: 'VITE_GEMINI_KEY'    },
  { id: 'chatgpt', label: 'ChatGPT', color: '#16a34a', envKey: 'VITE_OPENAI_KEY'    },
];

async function callAI(provider, messages, systemPrompt) {
  const claudeKey  = import.meta.env?.VITE_ANTHROPIC_KEY || '';
  const geminiKey  = import.meta.env?.VITE_GEMINI_KEY    || '';
  const openaiKey  = import.meta.env?.VITE_OPENAI_KEY    || '';

  // ── Claude ───────────────────────────────────────────────
  if (provider === 'claude') {
    if (!claudeKey) return '⚠️ Claude API key missing. Add VITE_ANTHROPIC_KEY to your .env file.';
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: systemPrompt,
        messages,
      }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      return `Claude error: ${e?.error?.message || res.status}`;
    }
    const data = await res.json();
    return data.content?.[0]?.text || 'No response.';
  }

  // ── Gemini ───────────────────────────────────────────────
  if (provider === 'gemini') {
    if (!geminiKey) return '⚠️ Gemini API key missing. Add VITE_GEMINI_KEY to your .env file.';
    // Gemini uses a different message format — inject system as first user message
    const geminiContents = [
      { role: 'user',  parts: [{ text: systemPrompt }] },
      { role: 'model', parts: [{ text: 'Understood. I will only answer gym and health questions.' }] },
      ...messages.map((m) => ({
        role:  m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
    ];
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: geminiContents }),
      },
    );
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      return `Gemini error: ${e?.error?.message || res.status}`;
    }
    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Gemini.';
  }

  // ── ChatGPT (OpenAI) ─────────────────────────────────────
  if (provider === 'chatgpt') {
    if (!openaiKey) return '⚠️ ChatGPT API key missing. Add VITE_OPENAI_KEY to your .env file.';
    const oaiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content })),
    ];
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey}`,
      },
      body: JSON.stringify({ model: 'gpt-4o-mini', max_tokens: 600, messages: oaiMessages }),
    });
    if (!res.ok) {
      const e = await res.json().catch(() => ({}));
      return `ChatGPT error: ${e?.error?.message || res.status}`;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response from ChatGPT.';
  }

  return 'Unknown AI provider.';
}

// ── PAR-Q questions ──────────────────────────────────────────
const PARQ_QUESTIONS = [
  { key: 'p_q1', label: 'Has a doctor ever said that you have a heart condition AND that you should only do physical activity recommended by a doctor?' },
  { key: 'p_q2', label: 'Do you feel pain in your chest when you do physical activity?' },
  { key: 'p_q3', label: 'In the past month, have you had chest pain when you were NOT doing physical activity?' },
  { key: 'p_q4', label: 'Do you lose your balance because of dizziness or do you ever lose consciousness?' },
  { key: 'p_q5', label: 'Do you have a bone or joint problem (e.g. back, knee or hip) that could be made worse by a change in your physical activity?' },
  { key: 'p_q6', label: 'Is your doctor currently prescribing drugs (e.g. water pills) for your blood pressure or heart condition?' },
  { key: 'p_q7', label: 'Do you know of any other reason why you should not do physical activity?' },
];

function ParQCard({ parq, onOpen }) {
  const hasFlag  = parq?.has_risk_flag;
  const submitted = !!parq;
  return (
    <div className="gym-card" style={{ border: hasFlag ? '1px solid rgba(255,71,71,.25)' : submitted ? '1px solid rgba(71,255,154,.2)' : '1px solid var(--gym-border)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: hasFlag ? 'rgba(255,71,71,.1)' : submitted ? 'rgba(71,255,154,.1)' : 'rgba(71,200,255,.1)', color: hasFlag ? 'var(--gym-accent2)' : submitted ? 'var(--gym-success)' : 'var(--gym-accent3)' }}>
            <HeartIcon />
          </div>
          <div>
            <div className="gym-card-title mb-0">⚕️ Health Questionnaire (PAR-Q)</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--gym-muted)' }}>
              {submitted
                ? hasFlag
                  ? '⚠️ Health flags noted — please consult your trainer'
                  : '✅ Completed — no flags detected'
                : 'Optional but recommended before starting your program'}
            </div>
          </div>
        </div>
        <button onClick={onOpen} className="btn btn-secondary btn-sm flex-shrink-0">
          {submitted ? '✏️ Update' : '+ Complete'}
        </button>
      </div>
      {submitted && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PARQ_QUESTIONS.map((q, i) => (
            <div key={q.key} className="flex items-center gap-1.5 p-2 rounded-lg"
              style={{ background: parq[q.key.replace('p_', '')] ? 'rgba(255,71,71,.08)' : 'var(--gym-surface2)' }}>
              <span className="text-xs" style={{ color: parq[q.key.replace('p_', '')] ? 'var(--gym-accent2)' : 'var(--gym-muted)' }}>
                {parq[q.key.replace('p_', '')] ? '⚠' : '✓'}
              </span>
              <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>Q{i + 1}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────
export default function MemberDashboard() {
  const dispatch         = useDispatch();
  const navigate         = useNavigate();
  const user             = useSelector((s) => s.auth.user);
  const schedules        = useSelector((s) => s.schedules.data);
  const subscriptions    = useSelector((s) => s.subscriptions.data);
  const attendance       = useSelector((s) => s.attendance.data);
  const trainers         = useSelector((s) => s.trainers.data);
  const assignments      = useSelector((s) => s.assignments.data);
  const payments         = useSelector((s) => s.payments.data);
  const timeslots        = useSelector((s) => s.timeslots.data);
  const trainerTimeslots = useSelector((s) => s.trainerTimeslots?.data || []);
  const myParQ           = useSelector((s) => s.parq?.mine || null);

  // ── Modal flags ───────────────────────────────────────────
  const [showProfile,  setShowProfile]  = useState(false);
  const [showPayment,  setShowPayment]  = useState(false);
  const [showReqSched, setShowReqSched] = useState(false);
  const [showAllPay,   setShowAllPay]   = useState(false);
  const [showParQ,     setShowParQ]     = useState(false);
  const [paymentMode,  setPaymentMode]  = useState('card');

  // ── Workflow state ────────────────────────────────────────
  const [trainerRequests, setTrainerRequests] = useState([]);
  const [cashRequests,    setCashRequests]    = useState([]);

  // ── Profile edit ──────────────────────────────────────────
  const [editMode,   setEditMode]   = useState(false);
  const [editForm,   setEditForm]   = useState({});
  const [editSaving, setEditSaving] = useState(false);
  const [editError,  setEditError]  = useState('');

  // ── Payment ───────────────────────────────────────────────
  const [payForm, setPayForm] = useState({
    subscriptionId: '', amount: '', customerEmail: '',
    cardNumber: '', cardHolder: '', bankName: '',
    expMonth: '', expYear: '', cvc: '',
  });
  const [payLoading, setPayLoading] = useState(false);
  const [payMsg,     setPayMsg]     = useState('');
  const [payError,   setPayError]   = useState('');

  // ── RFID ──────────────────────────────────────────────────
  const [rfidInput,   setRfidInput]   = useState('');
  const [rfidLoading, setRfidLoading] = useState(false);
  const [rfidMsg,     setRfidMsg]     = useState('');
  const [rfidError,   setRfidError]   = useState('');
  const rfidRef = useRef(null);

  // ── BMI state (used only for passing to WellnessHub as initial values) ──
  const [bmiH, setBmiH] = useState('');
  const [bmiW, setBmiW] = useState('');

  // ── AI chat ───────────────────────────────────────────────
  const [showAI,      setShowAI]      = useState(false);
  const [aiProvider,  setAiProvider]  = useState('claude');   // 'claude' | 'gemini' | 'chatgpt'
  const [aiInput,     setAiInput]     = useState('');
  const [aiMsgs,      setAiMsgs]      = useState([]);
  const [aiLoading,   setAiLoading]   = useState(false);
  const aiEndRef = useRef(null);

  // ── Schedule request ──────────────────────────────────────
  const [schedForm,   setSchedForm]   = useState({ p_trainer_id: '', p_timeslot_id: '', p_schedule_date: '' });
  const [schedSaving, setSchedSaving] = useState(false);

  // ── PAR-Q form ────────────────────────────────────────────
  const initParQ = () => ({
    p_q1: false, p_q2: false, p_q3: false, p_q4: false,
    p_q5: false, p_q6: false, p_q7: false,
    p_q7_details: '', p_physician_clearance: false,
  });
  const [parqForm,   setParqForm]   = useState(initParQ());
  const [parqSaving, setParqSaving] = useState(false);

  // ── Data fetch ────────────────────────────────────────────
  useEffect(() => {
    if (user?.userId) {
      dispatch(fetchSchedulesByMember(user.userId));
      dispatch(fetchSubscriptions());
      dispatch(fetchPaymentsByMember(user.userId));
      dispatch(fetchMemberAttendance(user.userId));
      dispatch(fetchTrainers());
      dispatch(fetchAssignments());
      dispatch(fetchTimeslots());
      dispatch(fetchTrainerTimeslots());
      dispatch(fetchMyParQ(user.userId));
      dispatch(fetchPlans());
    }
  }, [dispatch, user]);

  // ── Workflow store sync ───────────────────────────────────
  useEffect(() => {
    if (!user?.userId) return undefined;
    const sync = () => {
      setTrainerRequests(getTrainerRequests().filter((r) => String(r.memberId) === String(user.userId)));
      setCashRequests(getCashPaymentRequests().filter((r) => String(r.memberId) === String(user.userId)));
    };
    sync();
    return subscribeWorkflowStore(sync);
  }, [user?.userId]);

  // ── Pre-fill PAR-Q from existing record ──────────────────
  useEffect(() => {
    if (myParQ) {
      setParqForm({
        p_q1: !!myParQ.q1_heart_condition,
        p_q2: !!myParQ.q2_chest_pain_activity,
        p_q3: !!myParQ.q3_chest_pain_rest,
        p_q4: !!myParQ.q4_dizziness,
        p_q5: !!myParQ.q5_bone_joint,
        p_q6: !!myParQ.q6_bp_medication,
        p_q7: !!myParQ.q7_other_reason,
        p_q7_details:        myParQ.q7_other_details || '',
        p_physician_clearance: !!myParQ.physician_clearance,
      });
    }
  }, [myParQ]);

  useEffect(() => { aiEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMsgs]);

  // ── Derived data ──────────────────────────────────────────
  const mySubscriptions   = subscriptions.filter((s) => String(s.memberId) === String(user?.userId));
  const activeSub         = mySubscriptions.find((s) => s.is_active || s.isActive);
  const myPayments        = payments;
  const pendingSessions   = schedules.filter((s) => s.status === 'Pending');
  const scheduledSessions = schedules.filter((s) => s.status === 'Scheduled');
  const recentAttendance  = (attendance || []).slice(0, 6);
  const myAssignments     = assignments.filter((a) => String(a.memberId) === String(user?.userId));
  const myTrainers        = trainers.filter((t) =>
    myAssignments.some((a) => String(a.trainerId) === String(t.trainerId) || String(a.trainer_Id) === String(t.trainerId))
  );

  const statusVariant = (s) => s === 'Scheduled' ? 'confirmed' : s === 'Cancelled' ? 'inactive' : 'pending';
  const displayedPayments = showAllPay ? myPayments : myPayments.slice(0, 5);

  // ── Handlers ──────────────────────────────────────────────
  const openProfile = () => {
    setEditMode(false); setEditError('');
    setEditForm({
      p_user_id:     user.userId,
      p_admin_id:    user.userId,
      p_username:    user.username || '',
      p_phone:       user.phone   || '',
      p_blood_group: '',
      p_height:      '',
      p_weight:      '',
      p_fitness_goal:'',
    });
    setShowProfile(true);
  };

  const handleSaveProfile = async () => {
    if (editForm.p_phone && editForm.p_phone.length !== 10) {
      setEditError('Phone must be exactly 10 digits.'); return;
    }
    setEditSaving(true); setEditError('');
    try {
      const res = await api.editUser(editForm, user.userId);
      if (res.data?.StatusCode === 200) {
        await api.editMember({
          p_blood_group:  editForm.p_blood_group,
          p_height:       editForm.p_height,
          p_weight:       editForm.p_weight,
          p_fitness_goal: editForm.p_fitness_goal,
          p_admin_id:     user.userId,
        }, user.userId);
        // Sync WellnessHub initial values
        if (editForm.p_height) setBmiH(editForm.p_height);
        if (editForm.p_weight) setBmiW(editForm.p_weight);
        setEditMode(false);
      } else { setEditError(res.data?.Result || 'Update failed.'); }
    } catch { setEditError('Could not connect.'); }
    setEditSaving(false);
  };

  const openPayment = () => {
    setPaymentMode('card');
    setPayForm({
      subscriptionId: activeSub?.subscriptionId || '',
      amount:         activeSub?.price          || '',
      customerEmail:  user?.email               || '',
      cardNumber: '', cardHolder: '', bankName: '',
      expMonth: '', expYear: '', cvc: '',
    });
    setPayMsg(''); setPayError(''); setShowPayment(true);
  };

  const handleCardPayment = async () => {
    if (!payForm.subscriptionId || !payForm.amount || payForm.cardNumber.replace(/\s/g,'').length !== 16) {
      setPayError('Please fill all required fields (card number must be 16 digits).'); return;
    }
    setPayLoading(true); setPayError(''); setPayMsg('');
    try {
      const res = await api.initiateCardPayment({
        subscriptionId: payForm.subscriptionId,
        amount:         payForm.amount,
        customerEmail:  payForm.customerEmail,
      });
      if (res.data?.StatusCode === 200 || res.data?.StatusCode === 201) {
        setPayMsg('Payment initiated! Check your email for confirmation.');
        setTimeout(() => setShowPayment(false), 3000);
      } else { setPayError(res.data?.Result || 'Payment initiation failed.'); }
    } catch { setPayError('Could not connect to payment server.'); }
    setPayLoading(false);
  };

  const handleCashPaymentRequest = () => {
    if (!payForm.subscriptionId || !payForm.amount) {
      setPayError('Select a subscription and amount before sending a cash payment request.');
      return;
    }
    const existing = cashRequests.find(
      (r) => String(r.subscriptionId) === String(payForm.subscriptionId) &&
             ['pending', 'otp_generated'].includes(r.status)
    );
    if (existing) {
      setPayError('You already have a cash payment request waiting for admin confirmation.');
      return;
    }
    createCashPaymentRequest({
      memberId:       user.userId,
      memberName:     user.username || user.email || `Member #${user.userId}`,
      memberEmail:    user.email   || '',
      memberPhone:    user.phone   || '',
      subscriptionId: payForm.subscriptionId,
      amount:         payForm.amount,
      planLabel:      activeSub?.planType || `Subscription #${payForm.subscriptionId}`,
    });
    setPayError('');
    setPayMsg('Cash payment request sent. Meet the admin counter to continue with OTP verification.');
    dispatch(showToast('Cash payment request sent to admin!', 'success'));
    setTimeout(() => setShowPayment(false), 1200);
  };

  const handleMemberCashOtpConfirm = (request, otp) => {
    const result = confirmCashPaymentOtp(request.id, otp, 'member');
    if (result.ok) dispatch(showToast('Cash payment OTP confirmed!', 'success'));
    else           dispatch(showToast(result.message, 'error'));
  };

  const handleRfidScan = async () => {
    const tag = rfidInput.trim();
    if (!tag) { setRfidError('Please enter your RFID tag ID.'); return; }
    setRfidLoading(true); setRfidMsg(''); setRfidError('');
    try {
      const res = await api.tapRFID(tag);
      if (res?.data?.StatusCode === 200 || res === true) {
        setRfidMsg('RFID scanned! Your session has started.'); setRfidInput('');
        dispatch(fetchMemberAttendance(user.userId));
      } else { setRfidError('RFID tag not recognised. Contact the gym.'); }
    } catch { setRfidError('Could not connect to the RFID server.'); }
    setRfidLoading(false);
  };

  const handleSaveParQ = async () => {
    setParqSaving(true);
    const ok = await dispatch(saveParQ(user.userId, parqForm));
    setParqSaving(false);
    if (ok) setShowParQ(false);
  };

  // ── AI message sender (multi-provider) ───────────────────
  const sendAIMessage = async () => {
    const txt = aiInput.trim();
    if (!txt || aiLoading) return;
    const newMsgs = [...aiMsgs, { role: 'user', content: txt }];
    setAiMsgs(newMsgs); setAiInput(''); setAiLoading(true);
    try {
      const reply = await callAI(aiProvider, newMsgs, AI_SYSTEM);
      setAiMsgs((m) => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setAiMsgs((m) => [...m, { role: 'assistant', content: 'Connection error. Check your network and API key.' }]);
    }
    setAiLoading(false);
  };

  const handleRequestSchedule = async () => {
    if (!schedForm.p_trainer_id || !schedForm.p_timeslot_id || !schedForm.p_schedule_date) return;
    setSchedSaving(true);
    const ok = await dispatch(addSchedule({
      ...schedForm,
      p_member_id: user.userId,
      p_rfid_id:   activeSub?.rfid_Id || '',
      p_status:    'Pending',
    }, user.userId));
    setSchedSaving(false);
    if (ok) { setShowReqSched(false); setSchedForm({ p_trainer_id: '', p_timeslot_id: '', p_schedule_date: '' }); }
  };

  const handleTrainerRequest = (trainer) => {
    const existing = trainerRequests.find((r) => String(r.trainerId) === String(trainer.trainerId));
    if (existing?.status === 'pending') {
      dispatch(showToast('That trainer request is already waiting for approval.', 'error')); return;
    }
    if (myAssignments.some((a) => String(a.trainerId || a.trainer_Id) === String(trainer.trainerId))) {
      dispatch(showToast('This trainer is already assigned to you.', 'success')); return;
    }
    createTrainerRequest({
      memberId:    user.userId,
      memberName:  user.username || user.email || `Member #${user.userId}`,
      memberEmail: user.email   || '',
      memberPhone: user.phone   || '',
      trainerId:        trainer.trainerId,
      trainerUserId:    trainer.userId || trainer.trainerId,
      trainerName:      trainer.username,
      trainerEmail:     trainer.email || '',
      trainerProfileSnapshot: {
        gender:         trainer.gender         || '',
        experience:     trainer.experience_years || '',
        qualifications: trainer.qualifications || trainer.bio || '',
      },
    });
    dispatch(showToast(`Trainer request sent to ${trainer.username}.`, 'success'));
  };

  // ── Render ────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="text-3xl sm:text-4xl tracking-widest leading-none" style={{ fontFamily: "'Bebas Neue', cursive", color: 'var(--gym-text)' }}>
            Welcome, <span style={{ color: 'var(--gym-success)' }}>{user?.username}</span>
          </div>
          <div className="text-xs mt-1" style={{ color: 'var(--gym-muted)' }}>Member Portal — DTS GYM · {user?.email}</div>
        </div>
        <button onClick={openProfile}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150 hover:-translate-y-0.5"
          style={{ background: 'var(--gym-surface)', border: '1px solid var(--gym-border)', color: 'var(--gym-text)' }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base font-bold overflow-hidden"
            style={{ background: 'rgba(71,255,154,0.2)', color: 'var(--gym-success)', border: '1.5px solid rgba(71,255,154,0.4)', fontFamily: "'Space Mono', monospace" }}>
            {user?.profile_image ? (
              <img src={getImgUrl(user.profile_image)} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              (user?.username || user?.email || 'M').charAt(0).toUpperCase()
            )}
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-sm font-semibold">{user?.username}</div>
            <div className="text-xs" style={{ color: 'var(--gym-success)' }}>Member · Edit Profile</div>
          </div>
          <span style={{ color: 'var(--gym-muted)' }}>→</span>
        </button>
      </div>

      {/* ── Stat Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <MiniStat label="Subscription" value={activeSub ? 'Active' : 'None'} sub={activeSub ? `Expires ${formatDate(activeSub.end_date)}` : 'No active plan'} color={activeSub ? 'var(--gym-success)' : 'var(--gym-warning)'} icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>} />
        <MiniStat label="My Sessions" value={schedules.length} sub={`${scheduledSessions.length} confirmed · ${pendingSessions.length} pending`} color="var(--gym-accent3)" icon={<CalIcon />} />
        <MiniStat label="Attendance" value={recentAttendance.length} sub="Check-ins recorded" color="var(--gym-success)" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>} />
        <MiniStat label="My Trainers" value={myTrainers.length} sub="Assigned to you" color="var(--gym-accent)" icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>} />
      </div>

      {/* ── PAR-Q Health Card ────────────────────────────── */}
      <ParQCard parq={myParQ} onOpen={() => setShowParQ(true)} />

      {/* ── RFID Scanner ─────────────────────────────────── */}
      <div className="gym-card" style={{ border: '1px solid rgba(71,200,255,0.2)', background: 'rgba(71,200,255,0.03)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(71,200,255,0.15)', color: 'var(--gym-accent3)' }}><RfidIcon /></div>
          <div>
            <div className="gym-card-title mb-0" style={{ color: 'var(--gym-accent3)' }}>Start Your Workout</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--gym-muted)' }}>Scan your RFID card or enter tag ID below.</div>
          </div>
        </div>
        <div className="flex gap-2">
          <div style={{ position: 'relative', flex: 1 }}>
            <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gym-accent3)', opacity: 0.6, pointerEvents: 'none' }}><RfidIcon /></span>
            <input ref={rfidRef} type="text" className="gym-input" style={{ paddingLeft: 40 }} placeholder="Scan card or enter tag ID…"
              value={rfidInput} onChange={(e) => { setRfidInput(e.target.value); setRfidError(''); setRfidMsg(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleRfidScan()} disabled={rfidLoading} />
          </div>
          <button onClick={handleRfidScan} disabled={rfidLoading || !rfidInput.trim()} className="btn btn-primary flex-shrink-0">
            {rfidLoading ? '…' : <><RfidIcon /><span className="ml-1">CHECK IN</span></>}
          </button>
        </div>
        {rfidMsg   && <div className="mt-2 px-3 py-2 rounded-xl text-sm" style={{ background: 'rgba(71,255,154,.08)', border: '1px solid rgba(71,255,154,.25)', color: 'var(--gym-success)' }}>{rfidMsg}</div>}
        {rfidError && <div className="mt-2 px-3 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,71,71,.08)', border: '1px solid rgba(255,71,71,.22)', color: 'var(--gym-accent2)' }}>⚠ {rfidError}</div>}
      </div>

      {/* ── Main Grid ────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* My Sessions */}
        <div className="gym-card">
          <div className="flex items-center justify-between mb-4">
            <div className="gym-card-title mb-0">My Sessions</div>
            <button className="btn btn-primary btn-sm" onClick={() => setShowReqSched(true)}>+ Request</button>
          </div>
          {schedules.length === 0 ? (
            <div className="py-10 text-center text-sm" style={{ color: 'var(--gym-muted)' }}>No sessions booked yet</div>
          ) : (
            <div className="space-y-2">
              {schedules.slice(0, 5).map((s) => (
                <div key={s.scheduleId} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--gym-surface2)' }}>
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.status === 'Scheduled' ? 'var(--gym-success)' : s.status === 'Cancelled' ? 'var(--gym-accent2)' : 'var(--gym-warning)' }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate" style={{ color: 'var(--gym-text)' }}>Session #{s.scheduleId}</div>
                    <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>{formatDate(s.scheduleDate)}</div>
                  </div>
                  <Badge variant={statusVariant(s.status)}>{s.status || 'Pending'}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions + Subscription */}
        <div className="space-y-4">
          <div className="gym-card">
            <div className="gym-card-title">Quick Actions</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: <CalIcon />,     label: 'Book Session',  action: () => setShowReqSched(true),  color: 'var(--gym-accent3)' },
                { icon: <CardPayIcon />, label: 'Pay Now',       action: openPayment,                  color: 'var(--gym-warning)' },
                { icon: <HeartIcon />,   label: 'PAR-Q Health',  action: () => setShowParQ(true),      color: myParQ?.has_risk_flag ? 'var(--gym-accent2)' : 'var(--gym-success)' },
                { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M6 4v16M18 4v16M2 9h4M18 9h4M2 15h4M18 15h4M6 9h12M6 15h12"/></svg>, label: 'My Workouts', route: '/workouts', color: 'var(--gym-success)' },
              ].map(({ icon, label, route, color, action }) => (
                <button key={label} onClick={() => action ? action() : navigate(route)}
                  className="flex items-center gap-2 p-3 rounded-xl w-full text-left transition-all duration-150"
                  style={{ background: 'var(--gym-surface2)', border: '1px solid var(--gym-border)' }}>
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: color + '18', color }}>{icon}</span>
                  <span className="text-xs sm:text-sm font-medium" style={{ color: 'var(--gym-text2)' }}>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="gym-card">
            <div className="gym-card-title">My Subscription</div>
            {activeSub ? (
              <div className="p-4 rounded-xl" style={{ background: 'rgba(71,255,154,.06)', border: '1px solid rgba(71,255,154,.15)' }}>
                <div className="text-xs tracking-widest uppercase mb-1" style={{ color: 'var(--gym-muted)' }}>Active Plan</div>
                <div className="text-xl font-bold mb-1" style={{ color: 'var(--gym-success)', fontFamily: "'Bebas Neue', cursive" }}>{activeSub.planType || `Plan #${activeSub.planId}`}</div>
                <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>{formatDate(activeSub.startDate)} → {formatDate(activeSub.end_date)}</div>
                {activeSub.price && (
                  <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: '1px solid rgba(71,255,154,0.15)' }}>
                    <span className="text-sm font-bold" style={{ color: 'var(--gym-success)' }}>{formatCurrency(activeSub.price)}</span>
                    <button onClick={openPayment} className="btn btn-sm" style={{ background: 'rgba(71,255,154,0.12)', color: 'var(--gym-success)', border: '1px solid rgba(71,255,154,0.25)' }}>💳 Pay Now</button>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,179,71,.06)', border: '1px solid rgba(255,179,71,.15)' }}>
                <div className="text-sm mb-1" style={{ color: 'var(--gym-muted)' }}>No active subscription</div>
                <div className="text-xs" style={{ color: 'var(--gym-warning)' }}>Contact admin to subscribe</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trainer Request Panel removed from here (now in Sidebar -> Our Trainers) */}

      {/* ── Wellness Hub (BMI + Calorie + Water — no duplicate) ── */}
      <WellnessHub initialHeight={bmiH} initialWeight={bmiW} />

      {/* ── Cash Payment Request Card ─────────────────────── */}
      <CashPaymentRequestCard requests={cashRequests} onConfirmOtp={handleMemberCashOtpConfirm} />

      {/* ── Payments ──────────────────────────────────────── */}
      <div className="gym-card">
        <div className="flex items-center justify-between mb-4">
          <div><div className="gym-card-title mb-0">💳 My Payments</div><div className="text-xs mt-0.5" style={{ color: 'var(--gym-muted)' }}>Your payment history</div></div>
          <button onClick={openPayment} className="btn btn-primary btn-sm"><CardPayIcon /> Pay Now</button>
        </div>
        {myPayments.length === 0 ? (
          <div className="py-8 text-center"><div className="text-sm" style={{ color: 'var(--gym-muted)' }}>No payment records yet</div></div>
        ) : (
          <>
            <div className="space-y-2">
              {displayedPayments.map((p) => (
                <div key={p.paymentId} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--gym-surface2)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(71,200,255,0.15)', color: 'var(--gym-accent3)' }}><CardPayIcon /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: 'var(--gym-text)' }}>Payment #{p.paymentId}</div>
                    <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>{formatDate(p.payment_date)}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold" style={{ color: 'var(--gym-success)' }}>{formatCurrency(p.paymentAmount)}</div>
                    <Badge variant={p.payment_status === 'completed' ? 'active' : p.payment_status === 'pending' ? 'pending' : 'inactive'}>{p.payment_status || 'pending'}</Badge>
                  </div>
                </div>
              ))}
            </div>
            {myPayments.length > 5 && (
              <button onClick={() => setShowAllPay((v) => !v)} className="btn btn-secondary w-full justify-center mt-3 btn-sm">
                {showAllPay ? 'Show less' : `Show all ${myPayments.length} payments`}
              </button>
            )}
          </>
        )}
      </div>

      {/* ── Help & Contact ────────────────────────────────── */}
      <div className="gym-card">
        <div className="gym-card-title">🆘 Help &amp; Contact</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {myTrainers.length > 0 ? myTrainers.map((t) => (
            <div key={t.trainerId} className="p-4 rounded-xl" style={{ background: 'var(--gym-surface2)', border: '1px solid var(--gym-border)' }}>
              <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--gym-accent3)' }}>Your Trainer</div>
              <div className="font-semibold text-sm" style={{ color: 'var(--gym-text)' }}>{t.username}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--gym-muted)' }}>{t.email || 'Contact via front desk'}</div>
            </div>
          )) : (
            <div className="p-4 rounded-xl" style={{ background: 'var(--gym-surface2)' }}>
              <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>No trainer assigned yet.</div>
            </div>
          )}
          <div className="p-4 rounded-xl" style={{ background: 'var(--gym-surface2)', border: '1px solid var(--gym-border)' }}>
            <div className="text-xs font-bold tracking-widest uppercase mb-2" style={{ color: 'var(--gym-warning)' }}>Gym Admin</div>
            <div className="font-semibold text-sm" style={{ color: 'var(--gym-text)' }}>DTS Gym Management</div>
            <div className="text-xs mt-1" style={{ color: 'var(--gym-muted)' }}>admin@dtsgym.lk</div>
          </div>
        </div>
        <div className="mt-3 p-3 rounded-xl text-xs" style={{ background: 'rgba(71,200,255,.06)', border: '1px solid rgba(71,200,255,.15)', color: 'var(--gym-muted)' }}>
          💡 For urgent issues visit the front desk or call during gym hours (6AM–10PM).
        </div>
      </div>

      {/* ── Attendance ────────────────────────────────────── */}
      <div className="gym-card">
        <div className="flex items-center justify-between mb-4">
          <div className="gym-card-title mb-0">📋 My Attendance</div>
          <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'var(--gym-surface2)', color: 'var(--gym-muted)' }}>{(attendance || []).length} records</span>
        </div>
        {(attendance || []).length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: 'var(--gym-muted)' }}>No attendance records yet. Use RFID to check in.</div>
        ) : (
          <div className="space-y-2">
            {(attendance || []).slice(0, 10).map((a) => (
              <div key={a.attendanceId} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--gym-surface2)' }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.check_out_time ? 'var(--gym-muted)' : 'var(--gym-success)' }} />
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--gym-text)' }}>{a.check_out_time ? 'Checked Out' : '🟢 Currently Inside'}</div>
                  <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>{formatDate(a.check_in_time)}</div>
                </div>
                <div className="text-xs font-mono text-right" style={{ color: 'var(--gym-muted)' }}>
                  {a.check_in_time?.substring(11,16)}{a.check_out_time ? ` → ${a.check_out_time.substring(11,16)}` : ''}
                </div>
                <Badge variant={a.check_out_time ? 'inactive' : 'active'}>{a.check_out_time ? 'Left' : 'Inside'}</Badge>
              </div>
            ))}
            {(attendance || []).length > 10 && (
              <div className="text-center text-xs pt-1" style={{ color: 'var(--gym-muted)' }}>Showing last 10 of {(attendance || []).length} check-ins</div>
            )}
          </div>
        )}
      </div>

      {/* ── Activities ────────────────────────────────────── */}
      <div className="gym-card">
        <div className="flex items-center justify-between mb-4">
          <div className="gym-card-title mb-0">🏃 My Activities</div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/schedules')}>View All →</button>
        </div>
        {schedules.length === 0 ? (
          <div className="py-8 text-center text-sm" style={{ color: 'var(--gym-muted)' }}>No activities recorded yet.</div>
        ) : (
          <div className="space-y-2">
            {schedules.slice(0, 8).map((s) => (
              <div key={s.scheduleId} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'var(--gym-surface2)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: s.status === 'Scheduled' ? 'rgba(71,255,154,0.15)' : 'rgba(255,179,71,0.15)', color: s.status === 'Scheduled' ? 'var(--gym-success)' : 'var(--gym-warning)' }}>
                  <CalIcon />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium" style={{ color: 'var(--gym-text)' }}>Session #{s.scheduleId}{s.trainerName ? ` · ${s.trainerName}` : ''}</div>
                  <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>{formatDate(s.scheduleDate)}{s.starttime ? ` · ${s.starttime}–${s.endtime}` : ''}</div>
                </div>
                <Badge variant={s.status === 'Scheduled' ? 'confirmed' : s.status === 'Cancelled' ? 'inactive' : 'pending'}>{s.status || 'Pending'}</Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── AI Floating Button ────────────────────────────── */}
      <button onClick={() => setShowAI((v) => !v)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-2xl transition-all duration-200 hover:scale-110 z-50"
        style={{ background: 'linear-gradient(135deg,#b47fff,#47c8ff)', boxShadow: '0 8px 32px rgba(180,127,255,.4)' }}
        title="AI Fitness Advisor">🤖</button>

      {/* ── AI Chat Panel (Multi-Provider) ───────────────── */}
      {showAI && (
        <div className="fixed bottom-24 right-6 w-80 rounded-2xl overflow-hidden shadow-2xl z-50"
          style={{ background: 'var(--gym-surface)', border: '1px solid rgba(180,127,255,.3)', height: 460, display: 'flex', flexDirection: 'column' }}>

          {/* Header */}
          <div className="px-4 pt-3 pb-2" style={{ background: 'linear-gradient(135deg,rgba(180,127,255,.15),rgba(71,200,255,.1))', borderBottom: '1px solid var(--gym-border)' }}>
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="font-semibold text-sm" style={{ color: 'var(--gym-text)' }}>🤖 AI Fitness Advisor</div>
                <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>Gym &amp; health topics only</div>
              </div>
              <button onClick={() => setShowAI(false)} style={{ color: 'var(--gym-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18 }}>✕</button>
            </div>
            {/* Provider selector */}
            <div className="flex gap-1">
              {AI_PROVIDERS.map((p) => (
                <button key={p.id} onClick={() => setAiProvider(p.id)}
                  style={{
                    flex: 1, padding: '3px 0', borderRadius: 8, fontSize: 10, fontWeight: 700,
                    border: `1px solid ${aiProvider === p.id ? p.color : 'transparent'}`,
                    background: aiProvider === p.id ? p.color + '22' : 'var(--gym-surface2)',
                    color: aiProvider === p.id ? p.color : 'var(--gym-muted)',
                    cursor: 'pointer',
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {aiMsgs.length === 0 && (
              <div className="text-xs text-center py-4" style={{ color: 'var(--gym-muted)' }}>
                Ask about diet plans, workouts, nutrition…
              </div>
            )}
            {aiMsgs.map((m, i) => (
              <div key={i}
                className={`text-xs p-2 rounded-xl max-w-[90%] ${m.role === 'user' ? 'ml-auto' : ''}`}
                style={{ background: m.role === 'user' ? 'rgba(71,200,255,.15)' : 'var(--gym-surface2)', color: 'var(--gym-text)', border: '1px solid var(--gym-border)' }}>
                {m.content}
              </div>
            ))}
            {aiLoading && <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>Thinking…</div>}
            <div ref={aiEndRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 p-3" style={{ borderTop: '1px solid var(--gym-border)' }}>
            <input className="gym-input flex-1 text-xs" placeholder="Ask a health question…" value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendAIMessage()} />
            <button className="btn btn-primary btn-sm" onClick={sendAIMessage} disabled={aiLoading}>↑</button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════
          MODALS
      ════════════════════════════════════════════════════ */}

      {/* ── PAR-Q Modal ──────────────────────────────────── */}
      <Modal isOpen={showParQ} onClose={() => setShowParQ(false)} title="⚕️ PHYSICAL ACTIVITY READINESS (PAR-Q)" maxWidth={540}>
        <div className="modal-body space-y-4">
          <div className="p-3 rounded-xl text-xs" style={{ background: 'rgba(71,200,255,.06)', border: '1px solid rgba(71,200,255,.15)', color: 'var(--gym-muted)' }}>
            ℹ️ This is a health screening questionnaire. It's <strong>optional</strong> and helps your trainer plan safe workouts for you.
            Answer honestly — your answers are visible only to your trainer and gym admin.
          </div>
          <div className="space-y-3">
            {PARQ_QUESTIONS.map((q, i) => (
              <div key={q.key} className="p-3 rounded-xl" style={{ background: 'var(--gym-surface2)', border: parqForm[q.key] ? '1px solid rgba(255,71,71,.2)' : '1px solid var(--gym-border)' }}>
                <div className="flex items-start justify-between gap-3">
                  <div className="text-sm flex-1" style={{ color: 'var(--gym-text2)' }}>
                    <span className="font-bold mr-1" style={{ color: 'var(--gym-muted)' }}>Q{i + 1}.</span>{q.label}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    {[['Yes', true], ['No', false]].map(([lbl, val]) => (
                      <button key={lbl} onClick={() => setParqForm((f) => ({ ...f, [q.key]: val }))}
                        className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                        style={{
                          background: parqForm[q.key] === val ? (val ? 'rgba(255,71,71,.2)' : 'rgba(71,255,154,.15)') : 'var(--gym-surface)',
                          color:      parqForm[q.key] === val ? (val ? 'var(--gym-accent2)' : 'var(--gym-success)')      : 'var(--gym-muted)',
                          border:    `1px solid ${parqForm[q.key] === val ? (val ? 'rgba(255,71,71,.3)' : 'rgba(71,255,154,.3)') : 'var(--gym-border)'}`,
                        }}>
                        {lbl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {parqForm.p_q7 && (
              <div>
                <label className="gym-label">Please describe the other reason:</label>
                <textarea className="gym-input resize-none" rows={2} placeholder="Describe any other health concerns…"
                  value={parqForm.p_q7_details} onChange={(e) => setParqForm((f) => ({ ...f, p_q7_details: e.target.value }))} />
              </div>
            )}
            <div className="p-3 rounded-xl" style={{ background: 'var(--gym-surface2)', border: '1px solid var(--gym-border)' }}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm" style={{ color: 'var(--gym-text2)' }}>I have received physician clearance to participate in physical activity.</div>
                <div className="flex gap-2 flex-shrink-0">
                  {[['Yes', true], ['No', false]].map(([lbl, val]) => (
                    <button key={lbl} onClick={() => setParqForm((f) => ({ ...f, p_physician_clearance: val }))}
                      className="px-3 py-1 rounded-lg text-xs font-bold transition-all"
                      style={{
                        background: parqForm.p_physician_clearance === val ? 'rgba(71,255,154,.15)' : 'var(--gym-surface)',
                        color:      parqForm.p_physician_clearance === val ? 'var(--gym-success)'    : 'var(--gym-muted)',
                        border:    `1px solid ${parqForm.p_physician_clearance === val ? 'rgba(71,255,154,.3)' : 'var(--gym-border)'}`,
                      }}>
                      {lbl}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          {PARQ_QUESTIONS.some((q) => parqForm[q.key]) && (
            <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,71,71,.06)', border: '1px solid rgba(255,71,71,.2)', color: 'var(--gym-accent2)' }}>
              ⚠️ You answered <strong>Yes</strong> to one or more questions. Please consult your doctor before starting intense exercise, and inform your trainer.
              {!parqForm.p_physician_clearance && ' Consider obtaining physician clearance.'}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowParQ(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSaveParQ} disabled={parqSaving}>
            {parqSaving ? 'Saving…' : myParQ ? '✓ Update PAR-Q' : '✓ Submit PAR-Q'}
          </button>
        </div>
      </Modal>

      {/* ── Profile Modal ─────────────────────────────────── */}
      <Modal isOpen={showProfile} onClose={() => setShowProfile(false)} title="MY PROFILE" maxWidth={440}>
        {!editMode ? (
          <div className="modal-body space-y-3">
            <div className="flex flex-col items-center py-4">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-bold mb-3 overflow-hidden"
                style={{ background: 'rgba(71,255,154,0.15)', color: 'var(--gym-success)', border: '2px solid rgba(71,255,154,0.3)', fontFamily: "'Space Mono', monospace" }}>
                {user?.profile_image ? (
                  <img src={user.profile_image.startsWith('http') ? user.profile_image : `${import.meta.env.VITE_API_BASE || ''}${user.profile_image}`} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  (user?.username || 'M').charAt(0).toUpperCase()
                )}
              </div>
              <div className="text-lg font-bold" style={{ color: 'var(--gym-text)' }}>{user?.username}</div>
              <Badge variant="active" className="mt-1">Member</Badge>
            </div>
            {[['Email', user?.email], ['Phone', user?.phone || '—'], ['User ID', user?.userId]].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'var(--gym-surface2)' }}>
                <div className="text-xs font-medium" style={{ color: 'var(--gym-muted)' }}>{k}</div>
                <div className="text-sm font-semibold" style={{ color: 'var(--gym-text)' }}>{v}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="modal-body space-y-4">
            <FieldGroup label="Username"><input className="gym-input" value={editForm.p_username} onChange={(e) => setEditForm((f) => ({ ...f, p_username: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Phone (10 digits)"><input className="gym-input" type="tel" maxLength={10} value={editForm.p_phone} onChange={(e) => setEditForm((f) => ({ ...f, p_phone: e.target.value.replace(/\D/g,'').slice(0,10) }))} /></FieldGroup>
            <FieldGroup label="Email (cannot be changed)"><input className="gym-input" value={user?.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} /></FieldGroup>
            <div className="grid grid-cols-2 gap-3">
              <FieldGroup label="Blood Group">
                <select className="gym-input" value={editForm.p_blood_group} onChange={(e) => setEditForm((f) => ({ ...f, p_blood_group: e.target.value }))}>
                  <option value="">Select…</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bg) => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </FieldGroup>
              <FieldGroup label="Fitness Goal"><input className="gym-input" value={editForm.p_fitness_goal} onChange={(e) => setEditForm((f) => ({ ...f, p_fitness_goal: e.target.value }))} placeholder="e.g. Lose weight" /></FieldGroup>
              <FieldGroup label="Height (cm)"><input className="gym-input" type="number" value={editForm.p_height} onChange={(e) => setEditForm((f) => ({ ...f, p_height: e.target.value }))} /></FieldGroup>
              <FieldGroup label="Weight (kg)"><input className="gym-input" type="number" value={editForm.p_weight} onChange={(e) => setEditForm((f) => ({ ...f, p_weight: e.target.value }))} /></FieldGroup>
            </div>
            {editError && <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,71,71,.08)', color: 'var(--gym-accent2)' }}>⚠ {editError}</div>}
          </div>
        )}
        <div className="modal-footer">
          {editMode ? (
            <>
              <button className="btn btn-secondary" onClick={() => setEditMode(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveProfile} disabled={editSaving}>{editSaving ? 'Saving…' : 'Save Profile'}</button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => setShowProfile(false)}>Close</button>
              <button className="btn btn-primary" onClick={() => setEditMode(true)}>✏️ Edit Profile</button>
            </>
          )}
        </div>
      </Modal>

      {/* ── Payment Modal ─────────────────────────────────── */}
      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="💳 PAYMENT" maxWidth={460}>
        <div className="modal-body space-y-4">
          <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'var(--gym-surface2)' }}>
            {[['card','Card'],['cash','Cash']].map(([mode, label]) => (
              <button key={mode} className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{ background: paymentMode === mode ? 'var(--gym-surface)' : 'transparent', color: paymentMode === mode ? 'var(--gym-text)' : 'var(--gym-muted)' }}
                onClick={() => { setPaymentMode(mode); setPayError(''); setPayMsg(''); }}>
                {label}
              </button>
            ))}
          </div>
          {paymentMode === 'cash' && (
            <div className="p-4 rounded-2xl text-sm" style={{ background: 'rgba(255,179,71,.08)', border: '1px solid rgba(255,179,71,.2)', color: 'var(--gym-warning)' }}>
              Submit the request here, meet the admin with cash, then both member and admin must confirm the same OTP before the receipt is generated.
            </div>
          )}
          <div className="p-5 rounded-2xl" style={{ background: 'linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)', border: '1px solid rgba(71,200,255,0.2)' }}>
            <div className="font-mono text-base tracking-[.2em] mb-1" style={{ color: 'rgba(255,255,255,.8)' }}>{payForm.cardNumber || '•••• •••• •••• ••••'}</div>
            <div className="flex gap-4 text-xs" style={{ color: 'rgba(255,255,255,.5)' }}><span>{payForm.cardHolder || 'CARDHOLDER'}</span><span>{payForm.expMonth || 'MM'}/{payForm.expYear || 'YY'}</span></div>
          </div>
          <FieldGroup label="Card Number *"><input className="gym-input font-mono tracking-widest" type="text" maxLength={19} placeholder="•••• •••• •••• ••••" value={payForm.cardNumber} onChange={(e) => { const r = e.target.value.replace(/\D/g,'').slice(0,16); setPayForm((f) => ({ ...f, cardNumber: r.match(/.{1,4}/g)?.join(' ') || r })); }} /></FieldGroup>
          <FieldGroup label="Cardholder Name *"><input className="gym-input" type="text" placeholder="Name on card" value={payForm.cardHolder} onChange={(e) => setPayForm((f) => ({ ...f, cardHolder: e.target.value }))} /></FieldGroup>
          <FieldGroup label="Bank Name"><input className="gym-input" type="text" placeholder="e.g. Commercial Bank" value={payForm.bankName} onChange={(e) => setPayForm((f) => ({ ...f, bankName: e.target.value }))} /></FieldGroup>
          <div className="grid grid-cols-3 gap-3">
            <FieldGroup label="Month (MM)"><input className="gym-input font-mono" type="text" maxLength={2} placeholder="MM" value={payForm.expMonth} onChange={(e) => setPayForm((f) => ({ ...f, expMonth: e.target.value.replace(/\D/,'').slice(0,2) }))} /></FieldGroup>
            <FieldGroup label="Year (YY)"><input className="gym-input font-mono" type="text" maxLength={2} placeholder="YY" value={payForm.expYear} onChange={(e) => setPayForm((f) => ({ ...f, expYear: e.target.value.replace(/\D/,'').slice(0,2) }))} /></FieldGroup>
            <FieldGroup label="CVC *"><input className="gym-input font-mono" type="password" maxLength={4} placeholder="•••" value={payForm.cvc} onChange={(e) => setPayForm((f) => ({ ...f, cvc: e.target.value.replace(/\D/,'').slice(0,4) }))} /></FieldGroup>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldGroup label="Subscription ID"><input className="gym-input" type="number" value={payForm.subscriptionId} onChange={(e) => setPayForm((f) => ({ ...f, subscriptionId: e.target.value }))} /></FieldGroup>
            <FieldGroup label="Amount (LKR)"><input className="gym-input" type="number" step="0.01" value={payForm.amount} onChange={(e) => setPayForm((f) => ({ ...f, amount: e.target.value }))} placeholder="0.00" /></FieldGroup>
          </div>
          <FieldGroup label="Email for Receipt"><input className="gym-input" type="email" value={payForm.customerEmail} onChange={(e) => setPayForm((f) => ({ ...f, customerEmail: e.target.value }))} /></FieldGroup>
          {paymentMode === 'cash' && (
            <button className="btn btn-primary w-full justify-center" onClick={handleCashPaymentRequest}>Request Cash Payment</button>
          )}
          {payError && <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'rgba(255,71,71,.08)', color: 'var(--gym-accent2)' }}>⚠ {payError}</div>}
          {payMsg   && <div className="px-3 py-2 rounded-xl text-sm" style={{ background: 'rgba(71,255,154,.08)', color: 'var(--gym-success)' }}>✅ {payMsg}</div>}
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowPayment(false)}>Cancel</button>
          {paymentMode === 'cash' && <span className="text-xs flex-1 text-right" style={{ color: 'var(--gym-muted)' }}>Use the cash request button above.</span>}
          <button className="btn btn-primary" onClick={handleCardPayment} disabled={payLoading}>{payLoading ? 'Processing…' : '💳 Initiate Payment'}</button>
        </div>
      </Modal>

      {/* ── Request Session Modal ─────────────────────────── */}
      <Modal isOpen={showReqSched} onClose={() => setShowReqSched(false)} title="REQUEST A SESSION" maxWidth={440}>
        <div className="modal-body space-y-4">
          <FieldGroup label="Trainer *">
            <select className="gym-input" value={schedForm.p_trainer_id} onChange={(e) => setSchedForm((f) => ({ ...f, p_trainer_id: e.target.value }))}>
              <option value="">Select trainer…</option>
              {(myTrainers.length > 0 ? myTrainers : trainers.filter((t) => (t.status || 'active') === 'active')).map((t) => (
                <option key={t.trainerId} value={t.trainerId}>{t.username}</option>
              ))}
            </select>
          </FieldGroup>
          <FieldGroup label="Time Slot *">
            <select className="gym-input" value={schedForm.p_timeslot_id} onChange={(e) => setSchedForm((f) => ({ ...f, p_timeslot_id: e.target.value }))}>
              <option value="">Select slot…</option>
              {timeslots.map((ts) => <option key={ts.timeslot_Id} value={ts.timeslot_Id}>{ts.starttime} – {ts.endtime}</option>)}
            </select>
          </FieldGroup>
          <FieldGroup label="Date *">
            <input className="gym-input" type="date" value={schedForm.p_schedule_date} min={new Date().toISOString().split('T')[0]} onChange={(e) => setSchedForm((f) => ({ ...f, p_schedule_date: e.target.value }))} />
          </FieldGroup>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setShowReqSched(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleRequestSchedule} disabled={schedSaving}>{schedSaving ? 'Requesting…' : 'Request Session'}</button>
        </div>
      </Modal>

    </div>
  );
}