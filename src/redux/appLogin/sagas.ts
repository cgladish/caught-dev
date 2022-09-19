import { call, put, takeLatest } from "redux-saga/effects";
import {
  ActionType,
  FetchFailureAction,
  FetchStartAction,
  FetchSuccessAction,
} from "./actions";

function* fetchAppLogin(action: FetchStartAction) {
  try {
    const userInfo: Awaited<
      ReturnType<typeof window.api.appLogin.fetchUserInfo>
    > = yield call(window.api.appLogin.fetchUserInfo, action.payload.appName);
    yield put<FetchSuccessAction>({
      type: ActionType.fetchSuccess,
      payload: { appName: action.payload.appName, userInfo },
    });
  } catch (e) {
    yield put<FetchFailureAction>({
      type: ActionType.fetchFailure,
      payload: { appName: action.payload.appName, error: e as Error },
    });
  }
}

export function* saga() {
  yield takeLatest(ActionType.fetchStart, fetchAppLogin);
}
