import { ACTIONS } from '../constants';

export const showToast = (message, type = 'info') => ({
  type: ACTIONS.SHOW_TOAST,
  payload: { message, type, id: Date.now() },
});

export const hideToast = (id) => ({ type: ACTIONS.HIDE_TOAST, payload: id });

export const setTheme = (theme) => ({ type: ACTIONS.SET_THEME, payload: theme });
