import { ACTIONS } from '../constants';
import * as api from '../services/paymentApi';
import { showToast } from './uiAction';
import { isSuccess, getErrorMsg } from '../utils';

export const fetchPayments = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_PAYMENTS_REQUEST });
  try {
    const res = await api.getAllPayments();
    dispatch({ type: ACTIONS.FETCH_PAYMENTS_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch {
    dispatch({ type: ACTIONS.FETCH_PAYMENTS_FAILURE });
    dispatch(showToast('Failed to load payments', 'error'));
  }
};

// FIX: member-scoped payments
export const fetchPaymentsByMember = (memberId) => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_PAYMENTS_REQUEST });
  try {
    const res = await api.getPaymentsByMember(memberId);
    dispatch({ type: ACTIONS.FETCH_PAYMENTS_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_PAYMENTS_FAILURE }); }
};

export const addCashPayment = (req, adminId) => async (dispatch) => {
  try {
    const res = await api.addCashPayment(req, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Cash payment recorded!', 'success'));
      dispatch(fetchPayments());
      return true;   // FIX: was returning res.data (object) which broke receipt display
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to record payment', 'error')); }
  return false;
};

export const updatePaymentStatus = (paymentId, status, adminId) => async (dispatch) => {
  try {
    const res = await api.updatePaymentStatus(paymentId, status, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Payment status updated!', 'success'));
      dispatch(fetchPayments());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to update payment', 'error')); }
  return false;
};

export const refundPayment = (paymentId, adminId) => async (dispatch) => {
  try {
    const res = await api.refundPayment(paymentId, adminId);
    if (isSuccess(res.data)) {
      dispatch(showToast('Payment refunded!', 'success'));
      dispatch(fetchPayments());
      return true;
    } else dispatch(showToast(getErrorMsg(res.data), 'error'));
  } catch { dispatch(showToast('Failed to refund payment', 'error')); }
  return false;
};

export const downloadReceipt = (paymentId) => async (dispatch) => {
  try {
    const res = await api.getPaymentReceipt(paymentId);
    if (res.data?.StatusCode === 200 && res.data?.ResultSet) {
      const b64 = res.data.ResultSet;
      const byteChars = atob(b64);
      const byteArr = new Uint8Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteArr[i] = byteChars.charCodeAt(i);
      const blob = new Blob([byteArr], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `receipt_${paymentId}.pdf`; a.click();
      URL.revokeObjectURL(url);
      dispatch(showToast('Receipt downloaded!', 'success'));
    } else dispatch(showToast('Could not get receipt', 'error'));
  } catch { dispatch(showToast('Failed to download receipt', 'error')); }
};
