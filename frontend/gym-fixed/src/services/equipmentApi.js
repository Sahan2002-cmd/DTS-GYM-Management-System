import { apiClient, toForm } from './_apiClient';
 
// ── EQUIPMENT ─────────────────────────────────────────────
export const getAllEquipment  = () => apiClient.get('/Equipment/GetAll');
export const getEquipmentById  = (id) => apiClient.get(`/Equipment/GetById?id=${id}`);
export const addEquipment      = (req, adminId) => apiClient.post('/Equipment/Add', toForm({ ...req, adminId, p_admin_id: adminId }));
export const editEquipment     = (req, adminId) => apiClient.post('/Equipment/Edit', toForm({ ...req, adminId, p_admin_id: adminId }));
export const deleteEquipment   = (id, adminId)  => apiClient.post('/Equipment/Delete', toForm({ id, adminId, p_admin_id: adminId }));
 
// ── EQUIPMENT ASSIGNMENTS ─────────────────────────────────
export const getAllEquipmentAssignments           = () => apiClient.get('/EquipmentAssignment/GetAll');
export const getEquipmentAssignmentsBySchedule    = (scheduleId) => apiClient.get(`/EquipmentAssignment/GetBySchedule?scheduleId=${scheduleId}`);
export const getEquipmentAssignmentsByMember      = (memberId)   => apiClient.get(`/EquipmentAssignment/GetByMember?memberId=${memberId}`);
export const addEquipmentAssignment               = (req, adminId) => apiClient.post('/EquipmentAssignment/Add', toForm({ ...req, adminId }));
export const editEquipmentAssignment              = (req, adminId) => apiClient.post('/EquipmentAssignment/Edit', toForm({ ...req, adminId }));
export const deleteEquipmentAssignment            = (id, adminId)  => apiClient.post('/EquipmentAssignment/Delete', toForm({ id, adminId }));
 
// ── EQUIPMENT USAGE LOG (Live RFID Tracking) ──────────────
export const getAllEquipmentUsageLogs  = () => apiClient.get('/EquipmentUsageLog/GetAll');
export const getEquipmentUsageByMember = (memberId) => apiClient.get(`/EquipmentUsageLog/GetByMember?memberId=${memberId}`);
export const getLiveEquipmentUsage     = () => apiClient.get('/EquipmentUsageLog/ActiveLogs');
export const startEquipmentUsage       = (req) => apiClient.post('/EquipmentUsageLog/Start', toForm(req));
export const endEquipmentUsage         = (logId, endtime, actualMins) =>
  apiClient.post('/EquipmentUsageLog/End', toForm({ logId, endtime, actualMins }));
 
// ── EXERCISE CATALOG ──────────────────────────────────────
export const getExerciseCatalog  = () => apiClient.get('/Exercise/GetAll');
export const getExerciseById     = (id) => apiClient.get(`/Exercise/GetById?id=${id}`);
export const addExercise         = (req, adminId) => apiClient.post('/Exercise/Add', toForm({ ...req, adminId }));
export const editExercise        = (req, adminId) => apiClient.post('/Exercise/Edit', toForm({ ...req, adminId }));
export const deleteExercise      = (id, adminId)  => apiClient.post('/Exercise/Delete', toForm({ id, adminId }));
 
// ── DEVICES ───────────────────────────────────────────────
export const getDevices    = () => apiClient.get('/Device/GetAll');
export const addDevice     = (req, adminId) => apiClient.post('/Device/Add', toForm({ ...req, adminId }));
export const editDevice    = (req, adminId) => apiClient.post('/Device/Edit', toForm({ ...req, adminId }));
export const deleteDevice  = (id, adminId)  => apiClient.post('/Device/Delete', toForm({ id, adminId }));

// ── NOTIFICATIONS ─────────────────────────────────────────
export const runExpiryCheck        = (adminId) => apiClient.get(`/Notification/RunExpiryCheck?adminId=${adminId}`);
export const runIncompleteSchedule = (adminId) => apiClient.get(`/Notification/RunIncompleteSchedule?adminId=${adminId}`);
