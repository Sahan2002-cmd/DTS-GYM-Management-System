import { ACTIONS } from '../constants';
import * as api from '../services/scheduleApi';
import { showToast } from './uiAction';
import { isSuccess, getErrorMsg } from '../utils';

export const fetchSchedules = (memberId, trainerId) => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_SCHEDULES_REQUEST });
  try {
    let res;
    if (memberId)       res = await api.getSchedulesByMember(memberId);
    else if (trainerId) res = await api.getSchedulesByTrainer(trainerId);
    else                res = await api.getAllSchedules();
    dispatch({ type: ACTIONS.FETCH_SCHEDULES_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch {
    dispatch({ type: ACTIONS.FETCH_SCHEDULES_FAILURE });
    dispatch(showToast('Failed to load schedules', 'error'));
  }
};

export const fetchSchedulesByMember  = (memberId)  => fetchSchedules(memberId, null);
export const fetchSchedulesByTrainer = (trainerId) => fetchSchedules(null, trainerId);

export const addSchedule = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.addSchedule(req, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Schedule created!', 'success'));
      dispatch(fetchSchedules());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to create schedule', 'error')); }
  return false;
};

export const editSchedule = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.editSchedule(req, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Schedule updated!', 'success'));
      dispatch(fetchSchedules());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update schedule', 'error')); }
  return false;
};

export const updateScheduleStatus = (scheduleId, status, reason) => async (dispatch) => {
  try {
    const res = await api.updateScheduleStatus(scheduleId, status, reason);
    if (isSuccess(res.data)) {
      dispatch(showToast('Status updated!', 'success'));
      dispatch(fetchSchedules());
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update status', 'error')); }
};

export const deleteSchedule = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.deleteSchedule(id, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Schedule deleted', 'success'));
      dispatch(fetchSchedules());
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to delete schedule', 'error')); }
};
