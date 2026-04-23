import { apiClient, toForm } from './_apiClient';

// ── IMAGE UPLOAD ───────────────────────────────────────────────────────────
export const uploadUserImage = (file) => {
  const fd = new FormData();
  fd.append('file', file);
  return apiClient.post('/User/UploadImage', fd, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
};

// ── SIGN IN ────────────────────────────────────────────────────────────────
export const loginUser = (emailOrPhone, password) =>
  apiClient.post('/User/Login', toForm({ p_email: emailOrPhone, p_password_hash: password }));

// ── OAUTH ──────────────────────────────────────────────────────────────────
export const oauthLogin = (providerName, providerUserId, email, name) =>
  apiClient.post('/User/OAuthLogin', toForm({ providerName, providerUserId, email, name }));

// ── REGISTER ───────────────────────────────────────────────────────────────
export const registerUser = (payload) =>
  apiClient.post('/User/Register', toForm(payload));

// ── FORGOT PASSWORD — 3-step ───────────────────────────────────────────────
export const forgotPassword = (identifier, deliveryMethod = 'sms') =>
  apiClient.post(
    `/User/ForgotPassword?identifier=${encodeURIComponent(identifier)}&deliveryMethod=${deliveryMethod}`
  );

export const verifyResetCode = (phone, code) =>
  apiClient.post(
    `/User/VerifyResetCode?phone=${encodeURIComponent(phone)}&code=${encodeURIComponent(code)}`
  );

export const resetPassword = (identifier, code, newPassword) =>
  apiClient.post(
    `/User/ResetPassword` +
    `?identifier=${encodeURIComponent(identifier)}` +
    `&code=${encodeURIComponent(code)}` +
    `&newPassword=${encodeURIComponent(newPassword)}`
  );

// ── PHONE OTP — Registration ───────────────────────────────────────────────
export const sendPhoneOtp = (phone) =>
  apiClient.post(`/User/SendPhoneOtp?phone=${encodeURIComponent(phone)}`);

export const verifyPhoneOtp = (phone, code) =>
  apiClient.post(
    `/User/VerifyPhoneOtp?phone=${encodeURIComponent(phone)}&code=${encodeURIComponent(code)}`
  );

// ── PHONE OTP — Edit Profile ───────────────────────────────────────────────
export const sendEditOtp = (userId) =>
  apiClient.post(`/User/SendEditOtp?userId=${userId}`);

// ── ADMIN — STATUS ─────────────────────────────────────────────────────────
export const approveUser = (userId, adminId, newStatus, roleId,
                             firstName = '', lastName = '') =>
  apiClient.post(
    `/User/ApproveUser?userId=${userId}&adminId=${adminId}` +
    `&newStatus=${encodeURIComponent(newStatus)}&roleId=${roleId}` +
    `&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`
  );

export const changeUserStatus = (userId, adminId, newStatus) =>
  apiClient.post(
    `/User/ChangeUserStatus?userId=${userId}&adminId=${adminId}` +
    `&newStatus=${encodeURIComponent(newStatus)}`
  );

export const changeLinkedStatus = (userId, adminId, tableName, newStatus) =>
  apiClient.post(
    `/User/ChangeLinkedStatus?userId=${userId}&adminId=${adminId}` +
    `&tableName=${encodeURIComponent(tableName)}&newStatus=${encodeURIComponent(newStatus)}`
  );