import { all, call, put, takeLatest } from "redux-saga/effects";
import {
  ActionType,
  FetchFailureAction,
  FetchStartAction,
  FetchSuccessAction,
  LogoutFailureAction,
  LogoutStartAction,
  LogoutSuccessAction,
} from "./actions";

function* fetchAppLogin(action: FetchStartAction) {
  try {
    const userInfo: Awaited<
      ReturnType<typeof window.api.appLogin.fetchUserInfo>
    > = yield call(window.api.appLogin.fetchUserInfo);
    yield put<FetchSuccessAction>({
      type: ActionType.fetchSuccess,
      payload: { appName: action.payload.appName, userInfo },
    });
  } catch (e) {
    yield put<FetchFailureAction>({
      type: ActionType.fetchFailure,
      payload: {
        appName: action.payload.appName,
        error: (e as Error).toString(),
      },
    });
  }
}
function* fetchAppLoginSaga() {
  yield takeLatest(ActionType.fetchStart, fetchAppLogin);
}

function* logout(action: LogoutStartAction) {
  try {
    yield call(window.api.appLogin.logout, action.payload.appName);
    yield put<LogoutSuccessAction>({
      type: ActionType.logoutSuccess,
      payload: { appName: action.payload.appName },
    });
  } catch (e) {
    yield put<LogoutFailureAction>({
      type: ActionType.logoutFailure,
      payload: {
        appName: action.payload.appName,
        error: (e as Error).toString(),
      },
    });
  }
}
function* logoutSaga() {
  yield takeLatest(ActionType.logoutStart, logout);
}

export function* saga() {
  yield all([fetchAppLoginSaga(), logoutSaga()]);
}
