import { apiClient, toForm } from './_apiClient';

export const getAllComplaints = () =>
  apiClient.get('/Complaint/GetAll');

export const getComplaintById = (id) =>
  apiClient.get(`/Complaint/GetById?id=${id}`);

export const getMyComplaints = (userId) =>
  apiClient.get(`/Complaint/GetByUser?userId=${userId}`);

export const addComplaint = (data) =>
  apiClient.post('/Complaint/Add', toForm(data));

export const updateComplaintStatus = (id, status, adminId) =>
  apiClient.post(
    `/Complaint/UpdateStatus?complaintId=${id}&status=${encodeURIComponent(status)}&adminId=${adminId}`
  );

export const addComplaintRating = (id, rating) =>
  apiClient.post(`/Complaint/AddRating?complaintId=${id}&rating=${rating}`);