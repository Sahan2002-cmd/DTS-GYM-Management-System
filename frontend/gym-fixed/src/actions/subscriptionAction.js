import { ACTIONS } from '../constants';
import * as api from '../services/paymentApi';
import { showToast } from './uiAction';
import { isSuccess, getErrorMsg } from '../utils';

export const fetchSubscriptions = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_SUBSCRIPTIONS_REQUEST });
  try {
    const res = await api.getAllSubscriptions();
    dispatch({ type: ACTIONS.FETCH_SUBSCRIPTIONS_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch {
    dispatch({ type: ACTIONS.FETCH_SUBSCRIPTIONS_FAILURE });
    dispatch(showToast('Failed to load subscriptions', 'error'));
  }
};
export const addSubscription = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.addSubscription(req, adminId);
    if (isSuccess(res.data)) { dispatch(showToast('Subscription created!', 'success')); dispatch(fetchSubscriptions()); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to add subscription', 'error')); }
  return false;
};
export const editSubscription = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.editSubscription(req, adminId);
    if (isSuccess(res.data)) { dispatch(showToast('Subscription updated!', 'success')); dispatch(fetchSubscriptions()); return true; }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update subscription', 'error')); }
  return false;
};
export const deactivateSubscription = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.deactivateSubscription(id, adminId);
    if (isSuccess(res.data)) { dispatch(showToast('Subscription deactivated', 'success')); dispatch(fetchSubscriptions()); }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to deactivate', 'error')); }
};
// FIX: activate subscription
export const activateSubscription = (id, adminId) => async (dispatch) => {
  try {
    const res = await api.activateSubscription(id, adminId);
    if (isSuccess(res.data)) { dispatch(showToast('Subscription activated!', 'success')); dispatch(fetchSubscriptions()); }
    else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to activate', 'error')); }
};
