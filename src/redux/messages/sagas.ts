import { all, call, put, takeLatest } from "redux-saga/effects";
import {
  ActionType,
  FetchStartAction,
  FetchSuccessAction,
  FetchFailureAction,
  SearchStartAction,
  SearchSuccessAction,
  SearchFailureAction,
} from "./actions";

function* fetch(action: FetchStartAction) {
  try {
    const messagesResult: Awaited<
      ReturnType<typeof window.api.messages.fetchMessages>
    > = yield call(
      window.api.messages.fetchMessages,
      action.payload.preservationRuleId,
      action.payload.channelId,
      action.payload.cursor
    );
    yield put<FetchSuccessAction>({
      type: ActionType.fetchSuccess,
      payload: {
        preservationRuleId: action.payload.preservationRuleId,
        channelId: action.payload.channelId,
        messagesResult,
      },
    });
  } catch (e) {
    yield put<FetchFailureAction>({
      type: ActionType.fetchFailure,
      payload: { error: (e as Error).toString() },
    });
  }
}
function* fetchSaga() {
  yield takeLatest(ActionType.fetchStart, fetch);
}

function* search(action: SearchStartAction) {
  try {
    const searchResult: Awaited<
      ReturnType<typeof window.api.messages.searchMessages>
    > = yield call(
      window.api.messages.searchMessages,
      action.payload.preservationRuleId,
      action.payload.channelId,
      action.payload.filter,
      action.payload.before
    );
    yield put<SearchSuccessAction>({
      type: ActionType.searchSuccess,
      payload: {
        preservationRuleId: action.payload.preservationRuleId,
        channelId: action.payload.channelId,
        searchResult,
      },
    });
  } catch (e) {
    yield put<SearchFailureAction>({
      type: ActionType.searchFailure,
      payload: { error: (e as Error).toString() },
    });
  }
}
function* searchSaga() {
  yield takeLatest(ActionType.searchStart, search);
}

export function* saga() {
  yield all([fetchSaga(), searchSaga()]);
}
