import { apiClient, toForm } from './_apiClient';
 
// GET /Member/GetAll
export const getAllMembers = () => apiClient.get('/Member/GetAll');
 
// GET /Member/GetById?id=
export const getMemberById = (id) => apiClient.get(`/Member/GetById?id=${id}`);
 
// GET /Member/GetByUserId?userId=
export const getMemberByUserId = (userId) => apiClient.get(`/Member/GetByUserId?userId=${userId}`);
 
// POST /Member/Add → MemberRequestModel fields + adminId
export const addMember = (req, adminId) =>
  apiClient.post('/Member/Add', toForm({ ...req, adminId }));
 
// POST /Member/Edit → MemberRequestModel fields + adminId
export const editMember = (req, adminId) =>
  apiClient.post('/Member/Edit', toForm({ ...req, adminId }));
 
// POST /Member/Delete → id, adminId
export const deleteMember = (id, adminId) =>
  apiClient.post('/Member/Delete', toForm({ id, adminId }));