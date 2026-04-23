import { ACTIONS } from '../constants';
import * as api from '../services/rfidApi';
import { showToast } from './uiAction';
import { isSuccess } from '../utils';

// Member-scoped (own attendance records)
export const fetchMemberAttendance = (memberId) => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_ATTENDANCE_REQUEST });
  try {
    const res = await api.getMemberAttendance(memberId);
    dispatch({ type: ACTIONS.FETCH_ATTENDANCE_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_ATTENDANCE_FAILURE }); }
};

// Full list (admin/trainer) 
export const fetchAttendance = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_ALL_ATTENDANCE_REQUEST });
  try {
    const res = await api.getAllAttendance();
    dispatch({ type: ACTIONS.FETCH_ALL_ATTENDANCE_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_ALL_ATTENDANCE_FAILURE }); }
};

export const tapRFID = (rfidId) => async (dispatch) => {
  try {
    const res = await api.tapRFID(rfidId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Attendance recorded!', 'success'));
      return res.data;
    } else dispatch(showToast(res.data?.Result || 'RFID not recognised', 'error'));
  } catch { dispatch(showToast('Failed to record attendance', 'error')); }
  return false;
};
