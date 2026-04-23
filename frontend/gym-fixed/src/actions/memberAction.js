import { ACTIONS } from '../constants';
import * as api from '../services/memberApi';
import { showToast } from './uiAction';
import { isSuccess, getErrorMsg } from '../utils';

export const fetchMembers = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_MEMBERS_REQUEST });
  try {
    const res = await api.getAllMembers();
    dispatch({ type: ACTIONS.FETCH_MEMBERS_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch {
    dispatch({ type: ACTIONS.FETCH_MEMBERS_FAILURE });
    dispatch(showToast('Failed to load members', 'error'));
  }
};

export const addMember = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.addMember(req, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Member created!', 'success'));
      dispatch(fetchMembers());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to add member', 'error')); }
  return false;
};

export const editMember = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.editMember(req, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Member updated!', 'success'));
      dispatch(fetchMembers());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update member', 'error')); }
  return false;
};

export const deleteMember = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.deleteMember(id, adminId);
    if (isSuccess(res.data)) {
      dispatch({ type: ACTIONS.DELETE_MEMBER_SUCCESS, payload: id });
      dispatch(showToast('Member deleted', 'success'));
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to delete member', 'error')); }
};
