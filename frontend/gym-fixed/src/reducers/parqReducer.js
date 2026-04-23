import { ACTIONS } from '../constants';

const init = {
  // Admin: all records
  all:     [],
  allLoading: false,

  // Member: own record
  mine:    null,
  myLoading: false,

  // Trainer: assigned members' records
  members: [],
  membersLoading: false,
};

export default function parqReducer(state = init, action) {
  switch (action.type) {

    // ── Admin ────────────────────────────────────────────────
    case ACTIONS.FETCH_PARQ_REQUEST:
      return { ...state, allLoading: true };
    case ACTIONS.FETCH_PARQ_SUCCESS:
      return { ...state, allLoading: false, all: action.payload };
    case ACTIONS.FETCH_PARQ_FAILURE:
      return { ...state, allLoading: false };

    // ── Member own ───────────────────────────────────────────
    case ACTIONS.FETCH_MY_PARQ_REQUEST:
      return { ...state, myLoading: true };
    case ACTIONS.FETCH_MY_PARQ_SUCCESS:
      return { ...state, myLoading: false, mine: action.payload };
    case ACTIONS.FETCH_MY_PARQ_FAILURE:
      return { ...state, myLoading: false };

    // ── Trainer ──────────────────────────────────────────────
    case ACTIONS.FETCH_TRAINER_PARQ_REQUEST:
      return { ...state, membersLoading: true };
    case ACTIONS.FETCH_TRAINER_PARQ_SUCCESS:
      return { ...state, membersLoading: false, members: action.payload };
    case ACTIONS.FETCH_TRAINER_PARQ_FAILURE:
      return { ...state, membersLoading: false };

    default:
      return state;
  }
}

// ─── Add these keys to your ACTIONS constants ─────────────────
// FETCH_PARQ_REQUEST / SUCCESS / FAILURE
// FETCH_MY_PARQ_REQUEST / SUCCESS / FAILURE
// FETCH_TRAINER_PARQ_REQUEST / SUCCESS / FAILURE