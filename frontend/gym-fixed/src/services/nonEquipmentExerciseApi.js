import { apiClient, toForm } from './_apiClient';

// GET /NonEquipmentExercise/GetAll
export const getAllNonEquipmentExercises = () => apiClient.get('/NonEquipmentExercise/GetAll');

// GET /NonEquipmentExercise/GetBySchedule?scheduleId=
export const getNonEquipmentBySchedule = (scheduleId) =>
  apiClient.get(`/NonEquipmentExercise/GetBySchedule?scheduleId=${scheduleId}`);

// POST /NonEquipmentExercise/Add — FIX: explicit p_ keys for MVC binding
export const addNonEquipmentExercise = (req, adminId) =>
  apiClient.post('/NonEquipmentExercise/Add', toForm({
    p_schedule_id: req.p_schedule_id,
    p_exercise_id: req.p_exercise_id,
    p_sets:        req.p_sets || '',
    p_reps:        req.p_reps || '',
    p_sub_status:  req.p_sub_status || 'pending',
    p_admin_id:    adminId,
  }));

// POST /NonEquipmentExercise/Edit
export const editNonEquipmentExercise = (req, adminId) =>
  apiClient.post('/NonEquipmentExercise/Edit', toForm({ ...req, adminId, p_admin_id: adminId }));

// POST /NonEquipmentExercise/UpdateStatus → useId, status
export const updateNonEquipmentStatus = (useId, status) =>
  apiClient.post('/NonEquipmentExercise/UpdateStatus', toForm({ useId, status }));

// POST /NonEquipmentExercise/Delete
export const deleteNonEquipmentExercise = (id, adminId) =>
  apiClient.post('/NonEquipmentExercise/Delete', toForm({ id, adminId }));

// POST /NonEquipmentExercise/Approve — for exercise approval workflow
export const approveNonEquipmentExercise = (useId, approvalStatus, adminId) =>
  apiClient.post('/NonEquipmentExercise/Approve', toForm({ useId, approvalStatus, adminId }));
