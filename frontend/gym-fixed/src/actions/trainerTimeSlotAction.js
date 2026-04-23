import { ACTIONS } from '../constants';
import * as api from '../services/scheduleApi';
import { showToast } from './uiAction';
import { isSuccess, getErrorMsg } from '../utils';

export const fetchTrainerTimeslots = (trainerId) => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_TRAINER_TIMESLOTS_REQUEST });
  try {
    const res = trainerId
      ? await api.getTrainerTimeslots(trainerId)
      : await api.getAllTrainerTimeslots();
    dispatch({ type: ACTIONS.FETCH_TRAINER_TIMESLOTS_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_TRAINER_TIMESLOTS_FAILURE }); }
};

export const addTrainerTimeslot = (req) => async (dispatch) => {
  try {
    const res = await api.addTrainerTimeslot(req);
    if (isSuccess(res.data)) {
      dispatch(showToast('Timeslot request submitted!', 'success'));
      dispatch(fetchTrainerTimeslots());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to request timeslot', 'error')); }
  return false;
};


export const approveTrainerTimeslot = (p_trainer_timeslot_id, p_is_active, p_admin_id) => async (dispatch) => {
  try {
    const res = await api.approveTrainerTimeslot(p_trainer_timeslot_id, p_is_active, p_admin_id);
    if (isSuccess(res.data)) {
      dispatch(showToast(p_is_active === 1 ? 'Timeslot approved!' : 'Timeslot rejected', 'success'));
      dispatch(fetchTrainerTimeslots());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update timeslot', 'error')); }
  return false;
};

export const deleteTrainerTimeslot = (p_trainer_timeslot_id, p_admin_id) => async (dispatch) => {
  try {
    const res = await api.deleteTrainerTimeslot(p_trainer_timeslot_id, p_admin_id);
    if (isSuccess(res.data)) {
      dispatch(showToast('Timeslot deleted!', 'success'));
      dispatch(fetchTrainerTimeslots());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to delete timeslot', 'error')); }
  return false;
};