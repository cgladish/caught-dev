import { all, call, put, takeLatest } from "redux-saga/effects";
import {
  ActionType,
  FetchStartAction,
  FetchSuccessAction,
  FetchFailureAction,
} from "./actions";

function* fetch(action: FetchStartAction) {
  try {
    const channels: Awaited<
      ReturnType<typeof window.api.channels.fetchChannels>
    > = yield call(
      window.api.channels.fetchChannels,
      action.payload.appName,
      action.payload.channelIds
    );
    yield put<FetchSuccessAction>({
      type: ActionType.fetchSuccess,
      payload: {
        appName: action.payload.appName,
        preservationRuleId: action.payload.preservationRuleId,
        channels,
      },
    });
  } catch (e) {
    yield put<FetchFailureAction>({
      type: ActionType.fetchFailure,
      payload: {
        appName: action.payload.appName,
        preservationRuleId: action.payload.preservationRuleId,
        error: (e as Error).toString(),
      },
    });
  }
}
function* fetchSaga() {
  yield takeLatest(ActionType.fetchStart, fetch);
}

export function* saga() {
  yield all([fetchSaga()]);
}
