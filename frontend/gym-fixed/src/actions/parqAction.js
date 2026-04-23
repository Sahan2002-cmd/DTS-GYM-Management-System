import { ACTIONS } from '../constants';
import * as api    from '../services/parqApi';
import { showToast } from './uiAction';
import { isSuccess, getErrorMsg } from '../utils';

// ── Fetch all PAR-Q records  (Admin) ───────────────────────────
export const fetchAllParQ = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_PARQ_REQUEST });
  try {
    const res = await api.getAllParQ();
    dispatch({
      type:    ACTIONS.FETCH_PARQ_SUCCESS,
      payload: res.data?.ResultSet || [],
    });
  } catch {
    dispatch({ type: ACTIONS.FETCH_PARQ_FAILURE });
    dispatch(showToast('Failed to load PAR-Q records', 'error'));
  }
};

// ── Fetch own PAR-Q  (Member) ──────────────────────────────────
export const fetchMyParQ = (userId) => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_MY_PARQ_REQUEST });
  try {
    const res = await api.getParQByUserId(userId);
    dispatch({
      type:    ACTIONS.FETCH_MY_PARQ_SUCCESS,
      payload: res.data?.ResultSet || null,
    });
  } catch {
    dispatch({ type: ACTIONS.FETCH_MY_PARQ_FAILURE });
  }
};

// ── Fetch PAR-Q for trainer's members  (Trainer) ───────────────
export const fetchTrainerMembersParQ = (trainerId) => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_TRAINER_PARQ_REQUEST });
  try {
    const res = await api.getParQByTrainerId(trainerId);
    dispatch({
      type:    ACTIONS.FETCH_TRAINER_PARQ_SUCCESS,
      payload: res.data?.ResultSet || [],
    });
  } catch {
    dispatch({ type: ACTIONS.FETCH_TRAINER_PARQ_FAILURE });
    dispatch(showToast('Failed to load member health records', 'error'));
  }
};

// ── Save PAR-Q  (Member submits / updates) ─────────────────────
export const saveParQ = (userId, answers) => async (dispatch) => {
  try {
    console.log('Sending PAR-Q data:', { userId, answers });
    const res = await api.saveParQ(userId, answers);
    console.log('Full PAR-Q Response:', res);
    console.log('Response Data:', res.data);
    
    if (isSuccess(res.data)) {
      dispatch(showToast('Health questionnaire saved ✓', 'success'));
      dispatch(fetchMyParQ(userId));
      return true;
    } else {
      const errorMsg = res.data?.Message || res.data?.message || 'Backend returned: ' + JSON.stringify(res.data);
      console.error('PAR-Q Save Error - Full Response:', res.data);
      console.error('PAR-Q Save Error Message:', errorMsg);
      dispatch(showToast(errorMsg, 'error'));
    }
  } catch (err) {
    console.error('PAR-Q Save Exception:', err);
    console.error('Exception Details:', {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
    });
    dispatch(showToast('Failed to save PAR-Q: ' + (err.response?.data?.Message || err.message || 'Unknown error'), 'error'));
  }
  return false;
};