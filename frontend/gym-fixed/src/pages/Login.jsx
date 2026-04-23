import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, setTheme } from '../actions';
import { ACTIONS, ROLES } from '../constants';
import * as api from '../services/api';

const GOOGLE_CLIENT_ID = '640348187758-vtlh95qtfc4edjtvst9bra0a0svc7e7n.apps.googleusercontent.com';

export default function Login() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { loading, error, user } = useSelector((s) => s.auth);
  const theme = useSelector((s) => s.ui.theme);

  const [form,      setForm]      = useState({ email: '', password: '' });
  const [showPass,  setShowPass]  = useState(false);
  const [fpStep,    setFpStep]    = useState(0);
  const [fpMethod,  setFpMethod]  = useState('sms');      // 'sms', 'email', 'whatsapp'
  const [fpCode,    setFpCode]    = useState('');
  const [fpNew,     setFpNew]     = useState('');
  const [fpLoading, setFpLoading] = useState(false);
  const [fpMsg,     setFpMsg]     = useState('');
  const [fpMsgType, setFpMsgType] = useState('info');
  const [gLoading,  setGLoading]  = useState(false);
  const [gError,    setGError]    = useState('');
  const [gEmail,    setGEmail]    = useState('');

  useEffect(() => { document.documentElement.setAttribute('data-theme', theme); }, [theme]);
  useEffect(() => { if (user) navigate('/dashboard'); }, [user, navigate]);

  const toggleTheme = () => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'));
  const isLight = theme === 'light';

  const handleGoogleCallback = useCallback(async (response) => {
    setGLoading(true); setGError('');
    try {
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      const { sub: providerUserId, email, name } = payload;
      const res  = await api.oauthLogin('Google', providerUserId, email, name);
      const data = res.data;
      if (data?.StatusCode === 200 && data?.ResultSet) {
        const { user: u, token } = data.ResultSet;
        const roleId = parseInt(u?.roleId || u?.RoleId || 3);
        const userObj = {
          userId:   u?.userId   || u?.UserId,
          username: u?.username || u?.Username || name,
          email:    u?.email    || u?.Email    || email,
          phone:    u?.phone    || u?.Phone,
          roleId,
          roleName: roleId === ROLES.ADMIN ? 'Admin' : roleId === ROLES.TRAINER ? 'Trainer' : 'Member',
          token,
        };
        localStorage.setItem('dts_gym_user', JSON.stringify(userObj));
        dispatch({ type: ACTIONS.LOGIN_SUCCESS, payload: userObj });
        dispatch({ type: ACTIONS.SHOW_TOAST, payload: { message: 'Welcome, ' + userObj.username + '!', type: 'success', id: Date.now() } });
      } else {
        setGError(data?.Result || 'Google sign-in failed.');
        if (data?.Result?.toLowerCase().includes('register first')) {
          setGEmail(email);
        }
      }
    } catch { setGError('Google sign-in failed. Please use email/password login instead.'); }
    finally { setGLoading(false); }
  }, [dispatch]);

  const initGoogleSignIn = useCallback(() => {
    if (!window.google) return;
    try {
      window.google.accounts.id.initialize({ client_id: GOOGLE_CLIENT_ID, callback: handleGoogleCallback, ux_mode: 'popup' });
      const btn = document.getElementById('google-signin-btn');
      if (btn) window.google.accounts.id.renderButton(btn, { theme: isLight ? 'outline' : 'filled_black', size: 'large', text: 'signin_with_google', width: 320, shape: 'rectangular' });
    } catch { setGError('Google Sign-In could not be initialised.'); }
  }, [handleGoogleCallback, isLight]);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client'; script.async = true; script.defer = true;
    script.onload = initGoogleSignIn; script.onerror = () => setGError('Failed to load Google Sign-In library.');
    document.head.appendChild(script);
    return () => { try { document.head.removeChild(script); } catch { } };
  }, [initGoogleSignIn]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.email.trim()) return;
    dispatch(loginUser(form.email.trim(), form.password));
  };

  // ─── FORGOT PASSWORD FLOW ──────────────────────────────────────────
  const openForgotModal = () => {
    if (!form.email.trim()) {
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: { message: 'Please enter your email or phone number first.', type: 'error', id: Date.now() } });
      return;
    }
    setFpStep(1);
  };

  const sendForgotCode = async () => {
    const identifier = form.email.trim();
    if (!identifier) {
      setFpMsg('Please enter your email or phone number in the login field first.');
      setFpMsgType('error');
      return;
    }
    setFpLoading(true);
    setFpMsg('');
    try {
      const res = await api.forgotPassword(identifier, fpMethod);
      const data = res.data;
      if (data.StatusCode === 200) {
        if (fpMethod === 'whatsapp' && data.ResultSet?.link) {
          window.open(data.ResultSet.link, '_blank');
        }
        setFpMsg(data.Result || 'OTP sent. Check your selected method.');
        setFpMsgType('success');
        setFpStep(2);
      } else {
        setFpMsg(data.Result || 'Unable to send OTP. Please try again.');
        setFpMsgType('error');
      }
    } catch {
      setFpMsg('Network error. Please try again.');
      setFpMsgType('error');
    }
    setFpLoading(false);
  };

  const verifyCode = async () => {
    if (!fpCode) return;
    setFpLoading(true); setFpMsg('');
    try {
      const res = await api.verifyResetCode(form.email.trim(), fpCode);
      const data = res.data;
      if (data.StatusCode === 200) {
        setFpMsg('Code verified! Enter your new password.');
        setFpMsgType('success');
        setFpStep(3);
      } else {
        setFpMsg(data.Result || 'Invalid or expired code.');
        setFpMsgType('error');
      }
    } catch {
      setFpMsg('Verification failed. Please try again.');
      setFpMsgType('error');
    }
    setFpLoading(false);
  };

  const resetPassword = async () => {
    if (!fpNew || fpNew.length < 6) {
      setFpMsg('Password must be at least 6 characters.');
      setFpMsgType('error');
      return;
    }
    setFpLoading(true); setFpMsg('');
    try {
      const res = await api.resetPassword(form.email.trim(), fpCode, fpNew);
      const data = res.data;
      if (data.StatusCode === 200) {
        setFpMsg('Password reset successful! You can now log in.');
        setFpMsgType('success');
        setTimeout(() => { setFpStep(0); setFpMsg(''); setFpCode(''); setFpNew(''); }, 2500);
      } else {
        setFpMsg(data.Result || 'Failed to reset password.');
        setFpMsgType('error');
      }
    } catch {
      setFpMsg('Reset failed. Please try again.');
      setFpMsgType('error');
    }
    setFpLoading(false);
  };

  const closeForgot = () => {
    setFpStep(0);
    setFpCode('');
    setFpNew('');
    setFpMsg('');
  };

  const msgColor = (t) => t === 'error' ? 'var(--gym-accent2)' : 'var(--gym-success)';

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: 'var(--gym-bg)', color: 'var(--gym-text)' }}>
      {/* Background layers unchanged */}
      <div className="fixed inset-0 pointer-events-none" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1600&q=80')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: isLight ? 0.04 : 0.08, filter: 'grayscale(60%)' }} />
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute rounded-full" style={{ width: 480, height: 480, top: '-120px', left: '-100px', background: 'radial-gradient(circle, rgba(232,255,71,0.07) 0%, transparent 70%)' }} />
        <div className="absolute rounded-full" style={{ width: 360, height: 360, bottom: '-80px', right: '-60px', background: 'radial-gradient(circle, rgba(71,200,255,0.06) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(var(--gym-border) 1px, transparent 1px), linear-gradient(90deg, var(--gym-border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <button onClick={toggleTheme} title={'Switch to ' + (isLight ? 'dark' : 'light') + ' mode'}
        className="fixed top-4 right-4 z-20 flex items-center justify-center w-10 h-10 rounded-xl"
        style={{ background: 'var(--gym-surface)', border: '1px solid var(--gym-border2)', color: 'var(--gym-text)', cursor: 'pointer', boxShadow: '0 2px 8px var(--gym-shadow)' }}>
        {isLight ? <MoonIcon /> : <SunIcon />}
      </button>

      <div className="relative w-full max-w-md rounded-2xl p-8 mx-4"
        style={{ background: isLight ? 'rgba(255,255,255,0.97)' : 'rgba(17,17,22,0.94)', border: '1px solid var(--gym-border)', boxShadow: isLight ? '0 24px 80px rgba(15,23,42,0.15)' : '0 24px 80px rgba(0,0,0,0.55)', backdropFilter: 'blur(18px)' }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-3 mb-4">
            <div style={{ color: 'var(--gym-accent)' }}>
              <svg viewBox="0 0 40 40" fill="none" width="38" height="38">
                <rect x="4"  y="15" width="6"  height="10" rx="2" fill="currentColor" opacity="0.9"/>
                <rect x="2"  y="13" width="4"  height="14" rx="2" fill="currentColor"/>
                <rect x="30" y="15" width="6"  height="10" rx="2" fill="currentColor" opacity="0.9"/>
                <rect x="34" y="13" width="4"  height="14" rx="2" fill="currentColor"/>
                <rect x="10" y="18" width="20" height="4"  rx="2" fill="currentColor" opacity="0.7"/>
              </svg>
            </div>
            <div>
              <div className="text-3xl leading-none tracking-widest" style={{ fontFamily: "'Bebas Neue', cursive", color: 'var(--gym-accent)' }}>DTS GYM</div>
              <div className="text-xs" style={{ color: 'var(--gym-muted)' }}>Elite Fitness Management</div>
            </div>
          </div>
          <h1 className="text-2xl tracking-widest leading-none mb-1" style={{ fontFamily: "'Bebas Neue', cursive" }}>Welcome Back</h1>
          <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>Sign in to DTS Gym Management Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="gym-label">Email or Phone Number</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gym-muted)', pointerEvents: 'none', display: 'flex', zIndex: 1 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </span>
              <input type="text" name="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="gym-input" required autoComplete="email" placeholder="Enter email or phone number" style={{ paddingLeft: 36, paddingRight: 12 }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="gym-label" style={{ margin: 0 }}>Password</label>
              <button type="button" onClick={openForgotModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gym-accent)', fontSize: 12, padding: 0 }}>Forgot Password?</button>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--gym-muted)', pointerEvents: 'none', display: 'flex', zIndex: 1 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
              </span>
              <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} className="gym-input" required autoComplete="current-password" placeholder="Enter your password" style={{ paddingLeft: 36, paddingRight: 40 }} />
              <button type="button" onClick={() => setShowPass((p) => !p)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--gym-muted)', cursor: 'pointer', display: 'flex' }}>
                {showPass ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex flex-col gap-2 p-4 rounded-xl text-sm" style={{ background: 'rgba(255,71,71,.08)', border: '1px solid rgba(255,71,71,.22)', color: 'var(--gym-accent2)' }}>
              <div className="flex items-center gap-2">
                <span>⚠</span> {error}
              </div>
              {(error.toLowerCase().includes('not registered') || error.toLowerCase().includes('account not found') || error.toLowerCase().includes('register first')) && (
                <Link 
                  to={`/register?email=${encodeURIComponent(form.email)}`} 
                  className="btn btn-secondary btn-sm mt-2 w-full justify-center"
                  style={{ background: 'rgba(255,71,71,.1)', color: 'var(--gym-accent2)', border: '1px solid var(--gym-accent2)' }}
                >
                  Register First
                </Link>
              )}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full justify-center py-3" style={{ fontFamily: "'Bebas Neue', cursive", letterSpacing: '0.1em', fontSize: '1.1rem' }}>
            {loading ? <svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
              : <><span>Sign In</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
          </button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px" style={{ background: 'var(--gym-border)' }} />
          <span className="text-xs" style={{ color: 'var(--gym-muted)' }}>or continue with</span>
          <div className="flex-1 h-px" style={{ background: 'var(--gym-border)' }} />
        </div>

        <div className="flex flex-col items-center gap-2">
          {gLoading ? <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--gym-muted)' }}><svg className="animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>Signing in with Google…</div>
            : <div id="google-signin-btn" />}
          {gError && (
            <div className="w-full flex flex-col gap-2 px-3 py-2 rounded-xl text-xs" style={{ background: 'rgba(255,71,71,.06)', border: '1px solid rgba(255,71,71,.2)', color: 'var(--gym-accent2)' }}>
              <div className="font-semibold">⚠ {gError}</div>
              {gError.toLowerCase().includes('register first') && (
                <Link 
                  to={`/register?email=${encodeURIComponent(gEmail || '')}`} 
                  className="btn btn-secondary btn-sm w-full justify-center mt-1"
                  style={{ background: 'rgba(255,71,71,.1)', color: 'var(--gym-accent2)', border: '1px solid var(--gym-accent2)', fontSize: '10px' }}
                >
                  Register First
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="mt-5 text-center space-y-3">
          <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>Don&apos;t have an account?{' '}<Link to="/register" style={{ color: 'var(--gym-accent)', fontWeight: 600, textDecoration: 'none' }}>Register first</Link></p>
          <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gym-muted)', fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {isLight ? <MoonIcon /> : <SunIcon />}
            <span>Switch to {isLight ? 'Dark' : 'Light'} Mode</span>
          </button>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {fpStep > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-sm rounded-2xl p-7" style={{ background: 'var(--gym-surface)', border: '1px solid var(--gym-border)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold tracking-widest" style={{ fontFamily: "'Bebas Neue', cursive", color: 'var(--gym-accent)' }}>
                {fpStep === 1 ? 'FORGOT PASSWORD' : fpStep === 2 ? 'ENTER RESET CODE' : 'NEW PASSWORD'}
              </h2>
              <button onClick={closeForgot} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gym-muted)', fontSize: 20 }}>✕</button>
            </div>

            {fpStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
                  We'll send a reset code for <strong style={{ color: 'var(--gym-text)' }}>{form.email}</strong> using the contact method you choose below.
                </p>
                <p className="text-xs italic" style={{ color: 'var(--gym-muted)' }}>
                  🔒 The code will be sent to the phone/email registered in our database.
                </p>

                <div>
                  <label className="gym-label">Receive OTP via</label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="delivery" value="sms" checked={fpMethod === 'sms'} onChange={() => setFpMethod('sms')} />
                      <span className="text-sm">📱 SMS</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="delivery" value="email" checked={fpMethod === 'email'} onChange={() => setFpMethod('email')} />
                      <span className="text-sm">📧 Email</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="delivery" value="whatsapp" checked={fpMethod === 'whatsapp'} onChange={() => setFpMethod('whatsapp')} />
                      <span className="text-sm">💬 WhatsApp</span>
                    </label>
                  </div>
                </div>

                {fpMsg && <p className="text-sm" style={{ color: msgColor(fpMsgType) }}>{fpMsg}</p>}

                <div className="flex gap-3">
                  <button className="btn btn-secondary flex-1" onClick={closeForgot}>Cancel</button>
                  <button className="btn btn-primary flex-1" onClick={sendForgotCode} disabled={fpLoading}>
                    {fpLoading ? 'Sending…' : 'Send Code'}
                  </button>
                </div>
              </div>
            )}

            {fpStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>
                  Enter the code sent to the contact associated with <strong style={{ color: 'var(--gym-text)' }}>{form.email}</strong>
                </p>
                <div>
                  <label className="gym-label">Reset Code</label>
                  <input
                    className="gym-input w-full text-center text-xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                    value={fpCode}
                    onChange={(e) => setFpCode(e.target.value.replace(/\D/g,'').slice(0,6))}
                  />
                </div>
                {fpMsg && <p className="text-sm" style={{ color: msgColor(fpMsgType) }}>{fpMsg}</p>}
                <div className="flex gap-3">
                  <button className="btn btn-secondary flex-1" onClick={() => setFpStep(1)}>Back</button>
                  <button className="btn btn-primary flex-1" onClick={verifyCode} disabled={fpLoading || fpCode.length < 4}>
                    {fpLoading ? 'Verifying…' : 'Verify Code'}
                  </button>
                </div>
              </div>
            )}

            {fpStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm" style={{ color: 'var(--gym-muted)' }}>Enter your new password below.</p>
                <div>
                  <label className="gym-label">New Password (min 6 chars)</label>
                  <input
                    className="gym-input w-full"
                    type="password"
                    placeholder="New password"
                    value={fpNew}
                    onChange={(e) => setFpNew(e.target.value)}
                  />
                </div>
                {fpMsg && <p className="text-sm" style={{ color: msgColor(fpMsgType) }}>{fpMsg}</p>}
                <div className="flex gap-3">
                  <button className="btn btn-secondary flex-1" onClick={closeForgot}>Cancel</button>
                  <button className="btn btn-primary flex-1" onClick={resetPassword} disabled={fpLoading}>
                    {fpLoading ? 'Resetting…' : 'Reset Password'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Icons unchanged
function EyeIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function EyeOffIcon() { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>; }
function SunIcon()    { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>; }
function MoonIcon()   { return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>; }