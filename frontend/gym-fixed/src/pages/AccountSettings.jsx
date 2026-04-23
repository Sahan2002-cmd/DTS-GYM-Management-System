// ============================================================
//  AccountSettings.jsx — Change Password & Delete Account
//  Both actions require OTP verification first.
// ============================================================
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { ACTIONS } from '../constants';
import * as api from '../services/api';

function EyeIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EyeOffIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>; }
function ShieldIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function TrashIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>; }
function LockIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>; }

export default function AccountSettings() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);

  // ── Shared OTP state ───────────────────────────────────────
  const [action, setAction] = useState(''); // 'password' or 'delete'
  const [step, setStep] = useState(0);      // 0=idle, 1=otp_sent, 2=otp_verified, 3=done
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');

  // ── Password state ──────────────────────────────────────────
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  // ── Delete state ────────────────────────────────────────────
  const [delLoading, setDelLoading] = useState(false);
  const [delConfirmText, setDelConfirmText] = useState('');

  const resetAll = () => {
    setAction('');
    setStep(0);
    setOtpCode('');
    setMsg('');
    setMsgType('info');
    setNewPassword('');
    setConfirmPassword('');
    setDelConfirmText('');
  };

  const msgColor = (t) => t === 'error' ? 'var(--gym-accent2)' : t === 'success' ? 'var(--gym-success)' : 'var(--gym-muted)';

  // ── Send OTP ───────────────────────────────────────────────
  const sendOtp = async (forAction) => {
    setAction(forAction);
    setOtpLoading(true);
    setMsg('');
    try {
      const res = await api.sendEditOtp(user.userId);
      const data = res.data;
      if (data?.StatusCode === 200) {
        setStep(1);
        setMsg('OTP sent to your registered phone number.');
        setMsgType('success');
      } else {
        setMsg(data?.Result || 'Could not send OTP. Please try again.');
        setMsgType('error');
      }
    } catch {
      setMsg('Network error. Please try again.');
      setMsgType('error');
    }
    setOtpLoading(false);
  };

  // ── Verify OTP ─────────────────────────────────────────────
  const verifyOtp = async () => {
    if (!otpCode || otpCode.length < 4) return;
    setOtpLoading(true);
    setMsg('');
    try {
      const phone = user.phone || '';
      const res = await api.verifyPhoneOtp(phone, otpCode);
      const data = res.data;
      if (data?.StatusCode === 200) {
        setStep(2);
        setMsg('✓ OTP verified! You may proceed.');
        setMsgType('success');
      } else {
        setMsg(data?.Result || 'Invalid or expired OTP.');
        setMsgType('error');
      }
    } catch {
      setMsg('Verification failed. Please try again.');
      setMsgType('error');
    }
    setOtpLoading(false);
  };

  // ── Change Password ────────────────────────────────────────
  const handleChangePassword = async () => {
    if (newPassword.length < 6) { setMsg('Password must be at least 6 characters.'); setMsgType('error'); return; }
    if (newPassword !== confirmPassword) { setMsg('Passwords do not match.'); setMsgType('error'); return; }

    setPwLoading(true);
    setMsg('');
    try {
      const identifier = user.email || user.phone || '';
      const res = await api.resetPassword(identifier, otpCode, newPassword);
      const data = res.data;
      if (data?.StatusCode === 200) {
        setStep(3);
        setMsg('Password changed successfully! Please log in again.');
        setMsgType('success');
        setTimeout(() => {
          localStorage.removeItem('dts_gym_user');
          dispatch({ type: ACTIONS.LOGOUT });
          navigate('/login');
        }, 2500);
      } else {
        setMsg(data?.Result || 'Failed to change password.');
        setMsgType('error');
      }
    } catch {
      setMsg('Network error. Please try again.');
      setMsgType('error');
    }
    setPwLoading(false);
  };

  // ── Delete Account ─────────────────────────────────────────
  const handleDeleteAccount = async () => {
    if (delConfirmText !== 'DELETE') {
      setMsg('Please type DELETE to confirm.');
      setMsgType('error');
      return;
    }
    setDelLoading(true);
    setMsg('');
    try {
      const res = await api.deleteUser(user.userId, user.userId);
      const data = res?.data;
      if (data?.StatusCode === 200) {
        setStep(3);
        setMsg('Account deleted. Redirecting…');
        setMsgType('success');
        setTimeout(() => {
          localStorage.removeItem('dts_gym_user');
          dispatch({ type: ACTIONS.LOGOUT });
          navigate('/');
        }, 2000);
      } else {
        setMsg(data?.Result || 'Failed to delete account.');
        setMsgType('error');
      }
    } catch {
      setMsg('Network error. Please try again.');
      setMsgType('error');
    }
    setDelLoading(false);
  };

  return (
    <div className="space-y-5">

      {/* ── Header ─────────────────────────────── */}
      <div className="page-header">
        <div>
          <div className="page-title">Account Settings</div>
          <div className="page-sub">Manage your password and account · {user?.email}</div>
        </div>
      </div>

      {/* ── User Info Card ─────────────────────── */}
      <div className="gym-card">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: 'rgba(71,200,255,.12)', color: 'var(--gym-accent3)', border: '2px solid rgba(71,200,255,.25)', fontFamily: "'Space Mono', monospace" }}>
            {(user?.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="text-lg font-bold" style={{ color: 'var(--gym-text)' }}>{user?.username}</div>
            <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>{user?.email} · {user?.phone || 'No phone'}</div>
          </div>
        </div>
      </div>

      {/* ── Change Password Section ────────────── */}
      <div className="gym-card">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(71,200,255,.1)', color: 'var(--gym-accent3)' }}><LockIcon /></div>
          <div>
            <div className="gym-card-title mb-0">Change Password</div>
            <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>Verify with OTP before changing your password</div>
          </div>
        </div>

        {action !== 'password' ? (
          <button className="btn btn-primary" onClick={() => sendOtp('password')} disabled={otpLoading}>
            {otpLoading && action === '' ? '…' : <><LockIcon /> Change Password</>}
          </button>
        ) : (
          <div className="space-y-4 p-4 rounded-xl" style={{ background: 'var(--gym-surface2)', border: '1px solid var(--gym-border)' }}>

            {/* Step 1: Enter OTP */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="text-sm" style={{ color: 'var(--gym-text2)' }}>
                  Enter the OTP sent to your registered phone:
                </div>
                <div className="flex gap-2">
                  <input
                    className="gym-input text-center text-xl tracking-[0.4em] flex-1"
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                  <button className="btn btn-primary flex-shrink-0" onClick={verifyOtp} disabled={otpLoading || otpCode.length < 4}>
                    {otpLoading ? '…' : 'Verify'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: New password */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(71,255,154,.06)', border: '1px solid rgba(71,255,154,.2)', color: 'var(--gym-success)' }}>
                  ✅ OTP verified. Enter your new password below.
                </div>
                <div>
                  <label className="gym-label">New Password (min 6 chars)</label>
                  <div className="relative">
                    <input type={showNew ? 'text' : 'password'} className="gym-input pr-10"
                      placeholder="Enter new password" value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowNew((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ background: 'none', border: 'none', color: 'var(--gym-muted)', cursor: 'pointer' }}>
                      {showNew ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="gym-label">Confirm Password</label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} className="gym-input pr-10"
                      placeholder="Confirm new password" value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)} />
                    <button type="button" onClick={() => setShowConfirm((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ background: 'none', border: 'none', color: 'var(--gym-muted)', cursor: 'pointer' }}>
                      {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-secondary" onClick={resetAll}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleChangePassword} disabled={pwLoading}>
                    {pwLoading ? 'Changing…' : 'Change Password'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Success */}
            {step === 3 && (
              <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(71,255,154,.08)', border: '1px solid rgba(71,255,154,.25)' }}>
                <div className="text-2xl mb-2">✅</div>
                <div className="text-sm font-medium" style={{ color: 'var(--gym-success)' }}>Password changed! Redirecting to login…</div>
              </div>
            )}

            {msg && action === 'password' && (
              <p className="text-sm" style={{ color: msgColor(msgType) }}>{msg}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Delete Account Section ─────────────── */}
      <div className="gym-card" style={{ border: '1px solid rgba(255,71,71,.15)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(255,71,71,.1)', color: 'var(--gym-accent2)' }}><TrashIcon /></div>
          <div>
            <div className="gym-card-title mb-0" style={{ color: 'var(--gym-accent2)' }}>Delete Account</div>
            <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>Permanently delete your account — this cannot be undone</div>
          </div>
        </div>

        {action !== 'delete' ? (
          <button className="btn btn-danger" onClick={() => sendOtp('delete')} disabled={otpLoading}>
            {otpLoading && action === '' ? '…' : <><TrashIcon /> Delete My Account</>}
          </button>
        ) : (
          <div className="space-y-4 p-4 rounded-xl" style={{ background: 'rgba(255,71,71,.03)', border: '1px solid rgba(255,71,71,.15)' }}>

            {/* Step 1: Enter OTP */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,71,71,.06)', border: '1px solid rgba(255,71,71,.2)', color: 'var(--gym-accent2)' }}>
                  ⚠ You are about to delete your account. Enter the OTP sent to your phone to confirm your identity.
                </div>
                <div className="flex gap-2">
                  <input
                    className="gym-input text-center text-xl tracking-[0.4em] flex-1"
                    placeholder="000000"
                    maxLength={6}
                    inputMode="numeric"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                  <button className="btn btn-primary flex-shrink-0" onClick={verifyOtp} disabled={otpLoading || otpCode.length < 4}>
                    {otpLoading ? '…' : 'Verify'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Confirm deletion */}
            {step === 2 && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl text-sm" style={{ background: 'rgba(255,71,71,.08)', border: '1px solid rgba(255,71,71,.2)', color: 'var(--gym-accent2)' }}>
                  ⚠ <strong>This action is permanent.</strong> All your data will be removed. Type <strong>DELETE</strong> below to confirm.
                </div>
                <div>
                  <label className="gym-label">Type DELETE to confirm</label>
                  <input className="gym-input" placeholder="DELETE" value={delConfirmText}
                    onChange={(e) => setDelConfirmText(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <button className="btn btn-secondary" onClick={resetAll}>Cancel</button>
                  <button className="btn btn-danger" onClick={handleDeleteAccount}
                    disabled={delLoading || delConfirmText !== 'DELETE'}>
                    {delLoading ? 'Deleting…' : '🗑️ Permanently Delete'}
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Deleted */}
            {step === 3 && (
              <div className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,71,71,.08)', border: '1px solid rgba(255,71,71,.25)' }}>
                <div className="text-2xl mb-2">🗑️</div>
                <div className="text-sm font-medium" style={{ color: 'var(--gym-accent2)' }}>Account deleted. Redirecting…</div>
              </div>
            )}

            {msg && action === 'delete' && (
              <p className="text-sm" style={{ color: msgColor(msgType) }}>{msg}</p>
            )}
          </div>
        )}
      </div>

      {/* ── Security Notice ────────────────────── */}
      <div className="gym-card" style={{ border: '1px solid rgba(71,200,255,.12)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(71,200,255,.1)', color: 'var(--gym-accent3)' }}><ShieldIcon /></div>
          <div>
            <div className="text-sm font-semibold" style={{ color: 'var(--gym-text)' }}>Security Information</div>
            <div className="text-xs mt-0.5" style={{ color: 'var(--gym-muted)' }}>
              All sensitive actions require OTP verification via your registered phone number.
              If you've lost access to your phone, contact the gym admin for help.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
