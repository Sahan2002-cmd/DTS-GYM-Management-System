import { apiClient, toForm } from './_apiClient';
 
// ── TRAINERS ──────────────────────────────────────────────
export const getAllTrainers      = () => apiClient.get('/Trainer/GetAll');
//export const getTrainerById      = (id) => apiClient.get(`/Trainer/GetByUserId?id=${id}`);
export const getTrainerById = (id) => apiClient.get(`/Trainer/GetById?id=${id}`);
export const getTrainerByUserId  = (userId) => apiClient.get(`/Trainer/GetByUserId?userId=${userId}`);
export const addTrainer          = (req, adminId) => apiClient.post('/Trainer/Add', toForm({ ...req, adminId, p_admin_id: adminId }));
export const editTrainer         = (req, adminId) => apiClient.post('/Trainer/Edit', toForm({ ...req, adminId, p_admin_id: adminId }));
export const deleteTrainer       = (id, adminId)  => apiClient.post('/Trainer/Delete', toForm({ id, adminId, p_admin_id: adminId }));
 
// ── TRAINER ASSIGNMENTS ───────────────────────────────────
export const getAllAssignments         = () => apiClient.get('/TrainerAssignment/GetAll');
export const getAssignmentsByMember   = (memberId)  => apiClient.get(`/TrainerAssignment/GetByMember?memberId=${memberId}`);
export const getAssignmentsByTrainer  = (trainerId) => apiClient.get(`/TrainerAssignment/GetByTrainer?trainerId=${trainerId}`);
export const addAssignment            = (req, adminId) => apiClient.post('/TrainerAssignment/Add', toForm({ ...req, adminId }));
export const deleteAssignment         = (id, adminId)  => apiClient.post('/TrainerAssignment/Delete', toForm({ id, adminId }));
export const updateAssignmentStatus   = (id, status, adminId) => apiClient.post('/TrainerAssignment/UpdateStatus', toForm({ id, status, adminId }));
 
// ── TRAINER TIME SLOTS ────────────────────────────────────
export const getAllTrainerTimeslots    = () => apiClient.get('/TrainerTimeSlot/GetAll');
export const getTrainerTimeslots      = (trainerId) => apiClient.get(`/TrainerTimeSlot/GetByTrainer?trainerId=${trainerId}`);
export const addTrainerTimeslot       = (req) => apiClient.post('/TrainerTimeSlot/Add', toForm(req));
export const approveTrainerTimeslot   = (id, isActive, adminId) => apiClient.post('/TrainerTimeSlot/ApproveOrReject', toForm({ id, isActive, adminId }));
export const deleteTrainerTimeslot    = (id, adminId) => apiClient.post('/TrainerTimeSlot/Delete', toForm({ id, adminId }));
 
// ── TRAINER ATTENDANCE ────────────────────────────────────
export const getAllTrainerAttendance      = () => apiClient.get('/TrainerAttendance/GetAll');
export const getTrainerAttendanceByTrainer = (trainerId) => apiClient.get(`/TrainerAttendance/GetByTrainer?trainerId=${trainerId}`);
export const getTodayTrainerAttendance   = () => apiClient.get('/TrainerAttendance/Today');
export const getTrainerAttendanceByDateRange = (dateFrom, dateTo) =>
  apiClient.get(`/TrainerAttendance/GetByDateRange?dateFrom=${dateFrom}&dateTo=${dateTo}`);
export const trainerCheckIn  = (trainerId) => apiClient.post('/TrainerAttendance/CheckIn', toForm({ trainerId }));
export const trainerCheckOut = (trainerId) => apiClient.post('/TrainerAttendance/CheckOut', toForm({ trainerId }));
// Returns array of trainer IDs who are available right now (server-side check)
export const getAvailableNow = () => apiClient.get('/Trainer/GetAvailableNow');