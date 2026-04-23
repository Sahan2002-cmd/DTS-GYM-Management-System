import { combineReducers } from 'redux';
import { ACTIONS } from '../constants';
import parq from './parqReducer';
const authInitial = { user: null, loading: false, error: null };
export const authReducer = (state = authInitial, action) => {
  switch (action.type) {
    case ACTIONS.LOGIN_REQUEST: return { ...state, loading: true, error: null };
    case ACTIONS.LOGIN_SUCCESS: return { ...state, loading: false, user: action.payload, error: null };
    case ACTIONS.LOGIN_FAILURE: return { ...state, loading: false, error: action.payload };
    case ACTIONS.LOGOUT:        return { ...authInitial };
    default: return state;
  }
};
const savedTheme = localStorage.getItem('dts_theme') || 'dark';
const uiInitial  = { toasts: [], currentUserId: null, theme: savedTheme };
export const uiReducer = (state = uiInitial, action) => {
  switch (action.type) {
    case ACTIONS.SHOW_TOAST:          return { ...state, toasts: [...state.toasts, action.payload] };
    case ACTIONS.HIDE_TOAST:          return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    case ACTIONS.SET_CURRENT_USER_ID: return { ...state, currentUserId: String(action.payload) };
    case ACTIONS.LOGIN_SUCCESS:       return { ...state, currentUserId: String(action.payload.userId) };
    case ACTIONS.LOGOUT:              return { ...uiInitial, theme: state.theme };
    case 'SET_AVAILABLE_TRAINER_IDS':
      return { ...state, trainers: { ...state.trainers, availableNowIds: action.payload } };
    case ACTIONS.SET_THEME:
      localStorage.setItem('dts_theme', action.payload);
      return { ...state, theme: action.payload };
    default: return state;
  }
};
const listInitial = { data: [], loading: false, error: false };
const makeList = (req, ok, fail, del, key) => (state = listInitial, action) => {
  switch (action.type) {
    case req:  return { ...state, loading: true, error: false };
    case ok:   return { ...state, loading: false, data: Array.isArray(action.payload) ? action.payload : [] };
    case fail: return { ...state, loading: false, error: true };
    case del:  return key ? { ...state, data: state.data.filter((i) => String(i[key]) !== String(action.payload)) } : state;
    default: return state;
  }
};


const rootReducer = combineReducers({
  auth:             authReducer,
  ui:               uiReducer,
  users:            makeList(ACTIONS.FETCH_USERS_REQUEST,             ACTIONS.FETCH_USERS_SUCCESS,             ACTIONS.FETCH_USERS_FAILURE,           ACTIONS.DELETE_USER_SUCCESS,         'userId'),
  members:          makeList(ACTIONS.FETCH_MEMBERS_REQUEST,           ACTIONS.FETCH_MEMBERS_SUCCESS,           ACTIONS.FETCH_MEMBERS_FAILURE,         ACTIONS.DELETE_MEMBER_SUCCESS,       'memberId'),
  trainers:         makeList(ACTIONS.FETCH_TRAINERS_REQUEST,          ACTIONS.FETCH_TRAINERS_SUCCESS,          ACTIONS.FETCH_TRAINERS_FAILURE),
  plans:            makeList(ACTIONS.FETCH_PLANS_REQUEST,             ACTIONS.FETCH_PLANS_SUCCESS,             ACTIONS.FETCH_PLANS_FAILURE),
  subscriptions:    makeList(ACTIONS.FETCH_SUBSCRIPTIONS_REQUEST,     ACTIONS.FETCH_SUBSCRIPTIONS_SUCCESS,     ACTIONS.FETCH_SUBSCRIPTIONS_FAILURE,   ACTIONS.DELETE_SUBSCRIPTION_SUCCESS, 'subscriptionId'),
  payments:         makeList(ACTIONS.FETCH_PAYMENTS_REQUEST,          ACTIONS.FETCH_PAYMENTS_SUCCESS,          ACTIONS.FETCH_PAYMENTS_FAILURE),
  schedules:        makeList(ACTIONS.FETCH_SCHEDULES_REQUEST,         ACTIONS.FETCH_SCHEDULES_SUCCESS,         ACTIONS.FETCH_SCHEDULES_FAILURE),
  timeslots:        makeList(ACTIONS.FETCH_TIMESLOTS_REQUEST,         ACTIONS.FETCH_TIMESLOTS_SUCCESS,         ACTIONS.FETCH_TIMESLOTS_FAILURE),
  trainerTimeslots: makeList(ACTIONS.FETCH_TRAINER_TIMESLOTS_REQUEST, ACTIONS.FETCH_TRAINER_TIMESLOTS_SUCCESS, ACTIONS.FETCH_TRAINER_TIMESLOTS_FAILURE),
  assignments:      makeList(ACTIONS.FETCH_ASSIGNMENTS_REQUEST,       ACTIONS.FETCH_ASSIGNMENTS_SUCCESS,       ACTIONS.FETCH_ASSIGNMENTS_FAILURE,     ACTIONS.DELETE_ASSIGNMENT_SUCCESS,   'assignmentId'),
  workouts:         makeList(ACTIONS.FETCH_WORKOUTS_REQUEST,          ACTIONS.FETCH_WORKOUTS_SUCCESS,          ACTIONS.FETCH_WORKOUTS_FAILURE),
  exercises:        makeList(ACTIONS.FETCH_EXERCISES_REQUEST,         ACTIONS.FETCH_EXERCISES_SUCCESS,         ACTIONS.FETCH_EXERCISES_FAILURE),
  attendance:       makeList(ACTIONS.FETCH_ATTENDANCE_REQUEST,        ACTIONS.FETCH_ATTENDANCE_SUCCESS,        ACTIONS.FETCH_ATTENDANCE_FAILURE),
  allAttendance:    makeList(ACTIONS.FETCH_ALL_ATTENDANCE_REQUEST,    ACTIONS.FETCH_ALL_ATTENDANCE_SUCCESS,    ACTIONS.FETCH_ALL_ATTENDANCE_FAILURE),
  equipment:        makeList(ACTIONS.FETCH_EQUIPMENT_REQUEST,         ACTIONS.FETCH_EQUIPMENT_SUCCESS,         ACTIONS.FETCH_EQUIPMENT_FAILURE),
  equipmentUsage:   makeList(ACTIONS.FETCH_EQUIPMENT_USAGE_REQUEST,   ACTIONS.FETCH_EQUIPMENT_USAGE_SUCCESS,   ACTIONS.FETCH_EQUIPMENT_USAGE_FAILURE),
  rfidTags:         makeList(ACTIONS.FETCH_RFID_REQUEST,              ACTIONS.FETCH_RFID_SUCCESS,              ACTIONS.FETCH_RFID_FAILURE),
  parq,
});
export default rootReducer;
