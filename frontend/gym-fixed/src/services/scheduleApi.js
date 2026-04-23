import { apiClient, toForm } from './_apiClient';
export const getAllTimeslots  = () => apiClient.get('/TimeSlot/GetAll');
export const getTimeslotById  = (id) => apiClient.get(`/TimeSlot/GetById?id=${id}`);
// FIX: send fields explicitly so MVC binding works
export const addTimeslot = (req, adminId) =>
  apiClient.post('/TimeSlot/Add', toForm({ p_starttime: req.p_starttime, p_endtime: req.p_endtime, adminId }));
export const editTimeslot  = (req, adminId) => apiClient.post('/TimeSlot/Edit', toForm({ ...req, adminId }));
export const deleteTimeslot = (id, adminId) => apiClient.post('/TimeSlot/Delete', toForm({ id, adminId }));
export const getAllSchedules       = () => apiClient.get('/Schedule/GetAll');
export const getScheduleById       = (id) => apiClient.get(`/Schedule/GetById?id=${id}`);
export const getSchedulesByMember  = (memberId)  => apiClient.get(`/Schedule/GetByMember?memberId=${memberId}`);
export const getSchedulesByTrainer = (trainerId) => apiClient.get(`/Schedule/GetByTrainer?trainerId=${trainerId}`);
export const getSchedulesByDate    = (scheduleDate) => apiClient.get(`/Schedule/GetByDate?scheduleDate=${scheduleDate}`);
export const addSchedule           = (req, adminId) => apiClient.post('/Schedule/Add', toForm({ ...req, adminId }));
export const editSchedule          = (req, adminId) => apiClient.post('/Schedule/Edit', toForm({ ...req, adminId }));
// FIX: also pass optional cancellation reason
export const updateScheduleStatus  = (scheduleId, status, reason) =>
  apiClient.post('/Schedule/UpdateStatus', toForm({ scheduleId, status, ...(reason ? { reason } : {}) }));
export const deleteSchedule        = (id, adminId) => apiClient.post('/Schedule/Delete', toForm({ id, adminId }));
export const getAllTrainerTimeslots = () => apiClient.get('/TrainerTimeSlot/GetAll');
export const getTrainerTimeslots   = (trainerId) => apiClient.get(`/TrainerTimeSlot/GetByTrainer?trainerId=${trainerId}`);

export const addTrainerTimeslot = (req) => apiClient.post('/TrainerTimeSlot/Add', toForm(req));

export const approveTrainerTimeslot = (p_trainer_timeslot_id, p_is_active, p_admin_id) =>
  apiClient.post('/TrainerTimeSlot/ApproveOrReject', toForm({ p_trainer_timeslot_id, p_is_active, p_admin_id }));
export const deleteTrainerTimeslot = (p_trainer_timeslot_id, p_admin_id) => 
  apiClient.post('/TrainerTimeSlot/Delete', toForm({ p_trainer_timeslot_id, p_admin_id }));