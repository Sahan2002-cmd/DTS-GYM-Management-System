import { ACTIONS, ROLES } from '../constants';
import * as api from '../services/authApi';
import { showToast } from './uiAction';

// Login with phone number (sent as p_phone to backend)
// actions/authActions.js
export const loginUser = (email, password) => async (dispatch) => {
  dispatch({ type: ACTIONS.LOGIN_REQUEST });
  try {
    const res = await api.loginUser(email, password);
    const data = res.data;
    if (data?.StatusCode === 200 && data?.ResultSet) {
      const { user, token } = data.ResultSet;
      localStorage.setItem('dts_gym_user', JSON.stringify({ ...user, token }));
      dispatch({ type: ACTIONS.LOGIN_SUCCESS, payload: user });
      dispatch({ type: ACTIONS.SHOW_TOAST, payload: { message: `Welcome ${user.firstName || user.username}!`, type: 'success' } });
    } else {
      dispatch({ type: ACTIONS.LOGIN_FAILURE, payload: data?.Result || 'Login failed' });
    }
  } catch (err) {
    dispatch({ type: ACTIONS.LOGIN_FAILURE, payload: err.response?.data?.Result || 'Network error' });
  }
};

export const restoreSession = () => (dispatch) => {
  try {
    const stored = localStorage.getItem('dts_gym_user');
    if (stored) dispatch({ type: ACTIONS.LOGIN_SUCCESS, payload: JSON.parse(stored) });
  } catch { /* ignore */ }
};

export const logoutUser = () => (dispatch) => {
  localStorage.removeItem('dts_gym_user');
  dispatch({ type: ACTIONS.LOGOUT });
};
