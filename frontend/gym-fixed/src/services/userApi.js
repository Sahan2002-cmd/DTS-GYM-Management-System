import { apiClient, toForm } from './_apiClient';

export const getAllUsers = () => apiClient.get('/User/GetAll');
export const getUserById = (id) => apiClient.get(`/User/GetById?id=${id}`);

// ── REGISTER: payload already contains p_ prefixed keys
export const registerUser = (payload) =>
  apiClient.post('/User/Register', toForm({ 
    ...payload, 
    p_role_id: parseInt(payload.p_role_id) || 3 
  }));

// ── EDIT USER
export const editUser = (req, adminId) =>
  apiClient.post('/User/Edit', toForm({ ...req, p_admin_id: adminId ?? req.p_admin_id }));

export const deleteUser = (id, adminId) =>
  apiClient.post('/User/Delete', toForm({ id, adminId }));

// ── APPROVE USER – FIXED: use query parameters (not form body) to match backend
export const approveUser = (userId, adminId, newStatus, roleId, firstName = '', lastName = '') =>
  apiClient.post(
    `/User/ApproveUser?userId=${userId}&adminId=${adminId}&newStatus=${encodeURIComponent(newStatus)}&roleId=${roleId}&firstName=${encodeURIComponent(firstName)}&lastName=${encodeURIComponent(lastName)}`
  );

export const getPendingUsers = () => apiClient.get('/User/GetPending');