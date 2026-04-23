import { apiClient, toForm } from './_apiClient';
export const getAllRfidTags     = () => apiClient.get('/RfidTag/GetAll');
export const getRfidTagById     = (id) => apiClient.get(`/RfidTag/GetById?id=${id}`);
// FIX: include rfid_number (custom physical tag number)
export const addRfidTag = (req, adminId) =>
  apiClient.post('/RfidTag/Add', toForm({
    p_issue_date:  req.p_issue_date,
    p_is_active:   req.p_is_active ?? 1,
    p_rfid_number: req.p_rfid_number || '',
    p_admin_id:    adminId,
    adminId:       adminId,
  }));
export const editRfidTag        = (req, adminId) => apiClient.post('/RfidTag/Edit', toForm({ ...req, adminId }));
export const deleteRfidTag      = (id, adminId)  => apiClient.post('/RfidTag/Delete', toForm({ id, adminId }));
export const assignRfidToMember = (rfidId, memberId, adminId) =>
  apiClient.post('/RfidTag/AssignToMember', toForm({ rfidId, memberId, adminId }));
export const getAllAttendance         = () => apiClient.get('/Attendance/GetAll');
export const getMemberAttendance     = (memberId) => apiClient.get(`/Attendance/GetByMember?memberId=${memberId}`);
export const getTodayAttendance      = () => apiClient.get('/Attendance/Today');
export const getAttendanceByDateRange = (dateFrom, dateTo) =>
  apiClient.get(`/Attendance/GetByDateRange?dateFrom=${dateFrom}&dateTo=${dateTo}`);
export const checkIn  = (rfidId) => apiClient.post('/Attendance/CheckIn', toForm({ rfidId }));
export const checkOut = (rfidId) => apiClient.post('/Attendance/CheckOut', toForm({ rfidId }));
export const tapRFID  = (rfidId) => checkIn(rfidId);
