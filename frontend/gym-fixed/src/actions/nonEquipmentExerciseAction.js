import { ACTIONS } from '../constants';
import * as api from '../services/nonEquipmentExerciseApi';
import { showToast } from './uiAction';
import { isSuccess, getErrorMsg } from '../utils';

export const fetchWorkouts = (scheduleId) => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_WORKOUTS_REQUEST });
  try {
    const res = scheduleId
      ? await api.getNonEquipmentBySchedule(scheduleId)
      : await api.getAllNonEquipmentExercises();
    dispatch({ type: ACTIONS.FETCH_WORKOUTS_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_WORKOUTS_FAILURE }); }
};

export const addWorkout = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.addNonEquipmentExercise(req, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Workout added!', 'success'));
      dispatch(fetchWorkouts());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to add workout', 'error')); }
  return false;
};

export const deleteWorkout = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.deleteNonEquipmentExercise(id, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Workout deleted', 'success'));
      dispatch(fetchWorkouts());
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to delete workout', 'error')); }
};

export const editWorkout = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.editNonEquipmentExercise(req, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Workout updated!', 'success'));
      dispatch(fetchWorkouts());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update workout', 'error')); }
  return false;
};

export const approveExercise = (useId, status, adminId) => async (dispatch) => {
  try {
    const res = await api.approveNonEquipmentExercise(useId, status, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast(`Exercise ${status}!`, 'success'));
      dispatch(fetchWorkouts());
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update exercise', 'error')); }
};
