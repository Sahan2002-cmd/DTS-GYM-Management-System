import { ACTIONS } from '../constants';
import * as api from '../services/equipmentApi';
import { showToast } from './uiAction';
import { isSuccess, getErrorMsg } from '../utils';

export const fetchExercises = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_EXERCISES_REQUEST });
  try {
    const res = await api.getExerciseCatalog();
    dispatch({ type: ACTIONS.FETCH_EXERCISES_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_EXERCISES_FAILURE }); }
};

export const addExercise = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.addExercise(req, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Exercise added!', 'success'));
      dispatch(fetchExercises());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to add exercise', 'error')); }
  return false;
};

export const deleteExercise = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.deleteExercise(id, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Exercise deleted', 'success'));
      dispatch(fetchExercises());
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to delete exercise', 'error')); }
};
