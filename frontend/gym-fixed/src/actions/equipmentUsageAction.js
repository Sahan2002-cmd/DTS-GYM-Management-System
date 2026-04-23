import { ACTIONS } from '../constants';
import * as api from '../services/equipmentApi';

export const fetchLiveEquipmentUsage = () => async (dispatch) => {
  dispatch({ type: ACTIONS.FETCH_EQUIPMENT_USAGE_REQUEST });
  try {
    const res = await api.getLiveEquipmentUsage();
    dispatch({ type: ACTIONS.FETCH_EQUIPMENT_USAGE_SUCCESS, payload: res.data?.ResultSet || [] });
  } catch { dispatch({ type: ACTIONS.FETCH_EQUIPMENT_USAGE_FAILURE }); }
};

// Alias
export const getLiveEquipmentUsage = fetchLiveEquipmentUsage;
