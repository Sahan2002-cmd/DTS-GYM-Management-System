import { ACTIONS } from '../constants';
import * as api from '../services/trainerApi';
import { showToast } from './uiAction';
import { isSuccess, getErrorMsg } from '../utils';

export const fetchAssignments = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_ASSIGNMENTS_REQUEST });
  try {
    const res = await api.getAllAssignments();
    dispatch({ type: ACTIONS.FETCH_ASSIGNMENTS_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch {
    dispatch({ type: ACTIONS.FETCH_ASSIGNMENTS_FAILURE });
    dispatch(showToast('Failed to load assignments', 'error'));
  }
};

export const addAssignment = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.addAssignment(req, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Trainer assigned!', 'success'));
      dispatch(fetchAssignments());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to assign trainer', 'error')); }
  return false;
};

export const deleteAssignment = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.deleteAssignment(id, adminId);
    if (isSuccess(res.data)) {
      dispatch({ type: ACTIONS.DELETE_ASSIGNMENT_SUCCESS, payload: id });
      dispatch(showToast('Assignment removed', 'success'));
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to remove assignment', 'error')); }
};

export const updateAssignmentStatus = (id, status, adminId) => async (dispatch) => {
  try {
    const res = await api.updateAssignmentStatus(id, status, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast(`Assignment ${status}!`, 'success'));
      dispatch(fetchAssignments());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update assignment status', 'error')); }
  return false;
};

export const addTrainerAssignmentByMember = (req) => async (dispatch) => {
  try {
    const res = await api.addAssignment(req);
    if (isSuccess(res.data)) {
      dispatch(showToast('Trainer request sent!', 'success'));
      dispatch(fetchAssignments());
      return true;
    } else {
      dispatch(showToast(getErrorMsg(res.data), 'error'));
    }
  } catch {
    dispatch(showToast('Failed to request trainer', 'error'));
  }
  return false;
};
