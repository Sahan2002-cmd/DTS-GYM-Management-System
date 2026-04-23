import { ACTIONS } from '../constants';
import * as api from '../services/userApi';
import { showToast } from './uiAction';
import { isSuccess, getErrorMsg } from '../utils';

export const fetchUsers = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_USERS_REQUEST });
  try {
    const res = await api.getAllUsers();
    dispatch({ type: ACTIONS.FETCH_USERS_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch {
    dispatch({ type: ACTIONS.FETCH_USERS_FAILURE });
    dispatch(showToast('Failed to load users', 'error'));
  }
};

export const editUserAction = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.editUser(req, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('User updated', 'success'));
      dispatch(fetchUsers());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update user', 'error')); }
  return false;
};

export const deleteUser = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.deleteUser(id, adminId);
    if (isSuccess(res.data)) {
      dispatch({ type: ACTIONS.DELETE_USER_SUCCESS, payload: id });
      dispatch(showToast('User deleted', 'success'));
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to delete user', 'error')); }
};

// ✅ FIX: added roleId param — backend ApproveUser requires it as non-nullable int
export const approveUserAction = (userId, adminId, newStatus, roleId) => async (dispatch) => {
  try {
    const res = await api.approveUser(userId, adminId, newStatus, roleId);
    if (isSuccess(res.data)) {
      dispatch(showToast(`User ${newStatus}`, 'success'));
      dispatch(fetchUsers());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update user status', 'error')); }
  return false;
};