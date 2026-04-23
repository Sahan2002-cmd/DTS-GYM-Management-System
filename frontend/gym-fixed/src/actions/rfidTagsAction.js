import { ACTIONS } from '../constants';
import * as api from '../services/rfidApi';
import { showToast } from './uiAction';
import { isSuccess, getErrorMsg } from '../utils';

export const fetchRfidTags = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_RFID_REQUEST });
  try {
    const res = await api.getAllRfidTags();
    dispatch({ type: ACTIONS.FETCH_RFID_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch {
    dispatch({ type: ACTIONS.FETCH_RFID_FAILURE });
    dispatch(showToast('Failed to load RFID tags', 'error'));
  }
};

export const addRfidTag = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.addRfidTag(req, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('RFID tag added!', 'success'));
      dispatch(fetchRfidTags());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to add RFID tag', 'error')); }
  return false;
};

export const assignRfidToMember = (rfidId, memberId, adminId) => async (dispatch) => {
  try {
    const res = await api.assignRfidToMember(rfidId, memberId, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('RFID assigned to member!', 'success'));
      dispatch(fetchRfidTags());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to assign RFID', 'error')); }
  return false;
};

export const deleteRfidTag = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.deleteRfidTag(id, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('RFID tag deleted', 'success'));
      dispatch(fetchRfidTags());
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to delete RFID tag', 'error')); }
};
