import { ACTIONS } from '../constants';
import * as api from '../services/trainerApi';
import { showToast } from './uiAction';
import { isSuccess, getErrorMsg } from '../utils';

export const fetchTrainers = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_TRAINERS_REQUEST });
  try {
    const res = await api.getAllTrainers();
    dispatch({ type: ACTIONS.FETCH_TRAINERS_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch {
    dispatch({ type: ACTIONS.FETCH_TRAINERS_FAILURE });
    dispatch(showToast('Failed to load trainers', 'error'));
  }
};

export const addTrainer = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.addTrainer(req, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Trainer created!', 'success'));
      dispatch(fetchTrainers());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to add trainer', 'error')); }
  return false;
};

export const editTrainer = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.editTrainer(req, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Trainer updated!', 'success'));
      dispatch(fetchTrainers());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update trainer', 'error')); }
  return false;
};

export const deleteTrainer = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.deleteTrainer(id, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Trainer deleted', 'success'));
      dispatch(fetchTrainers());
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to delete trainer', 'error')); }
};

export const fetchAvailableNow = () => async (dispatch) => {
  try {
    const res = await api.getAvailableNow();
    const ids = res.data?.ResultSet || [];
    dispatch({ type: 'SET_AVAILABLE_TRAINER_IDS', payload: ids });
  } catch {
    dispatch({ type: 'SET_AVAILABLE_TRAINER_IDS', payload: [] });
  }
};