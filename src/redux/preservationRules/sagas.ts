import { all, call, put, takeLatest } from "redux-saga/effects";
import {
  ActionType,
  FetchStartAction,
  FetchSuccessAction,
  FetchFailureAction,
  CreateStartAction,
  CreateSuccessAction,
  CreateFailureAction,
  UpdateStartAction,
  UpdateSuccessAction,
  UpdateFailureAction,
  DeleteFailureAction,
  DeleteStartAction,
  DeleteSuccessAction,
} from "./actions";

function* fetchPreservationRules(action: FetchStartAction) {
  try {
    const preservationRules: Awaited<
      ReturnType<typeof window.api.preservationRules.fetchPreservationRules>
    > = yield call(
      window.api.preservationRules.fetchPreservationRules,
      action.payload.appName
    );
    yield put<FetchSuccessAction>({
      type: ActionType.fetchSuccess,
      payload: { appName: action.payload.appName, preservationRules },
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
function* fetchPreservationRulesSaga() {
  yield takeLatest(ActionType.fetchStart, fetchPreservationRules);
}

function* createPreservationRule(action: CreateStartAction) {
  try {
    const preservationRule: Awaited<
      ReturnType<typeof window.api.preservationRules.createPreservationRule>
    > = yield call(
      window.api.preservationRules.createPreservationRule,
      action.payload.preservationRule
    );
    yield put<CreateSuccessAction>({
      type: ActionType.createSuccess,
      payload: { appName: action.payload.appName, preservationRule },
    });
  } catch (e) {
    yield put<CreateFailureAction>({
      type: ActionType.createFailure,
      payload: {
        appName: action.payload.appName,
        error: (e as Error).toString(),
      },
    });
  }
}
function* createPreservationRuleSaga() {
  yield takeLatest(ActionType.createStart, createPreservationRule);
}

function* updatePreservationRule(action: UpdateStartAction) {
  try {
    const preservationRule: Awaited<
      ReturnType<typeof window.api.preservationRules.updatePreservationRule>
    > = yield call(
      window.api.preservationRules.updatePreservationRule,
      action.payload.preservationRuleId,
      action.payload.preservationRule
    );
    yield put<UpdateSuccessAction>({
      type: ActionType.updateSuccess,
      payload: { appName: action.payload.appName, preservationRule },
    });
  } catch (e) {
    yield put<UpdateFailureAction>({
      type: ActionType.updateFailure,
      payload: {
        appName: action.payload.appName,
        preservationRuleId: action.payload.preservationRuleId,
        error: (e as Error).toString(),
      },
    });
  }
}
function* updatePreservationRuleSaga() {
  yield takeLatest(ActionType.updateStart, updatePreservationRule);
}

function* deletePreservationRule(action: DeleteStartAction) {
  try {
    yield call(
      window.api.preservationRules.deletePreservationRule,
      action.payload.preservationRuleId
    );
    yield put<DeleteSuccessAction>({
      type: ActionType.deleteSuccess,
      payload: {
        appName: action.payload.appName,
        preservationRuleId: action.payload.preservationRuleId,
      },
    });
  } catch (e) {
    yield put<DeleteFailureAction>({
      type: ActionType.deleteFailure,
      payload: {
        appName: action.payload.appName,
        preservationRuleId: action.payload.preservationRuleId,
        error: (e as Error).toString(),
      },
    });
  }
}
function* deletePreservationRuleSaga() {
  yield takeLatest(ActionType.deleteStart, deletePreservationRule);
}

export function* saga() {
  yield all([
    fetchPreservationRulesSaga(),
    createPreservationRuleSaga(),
    updatePreservationRuleSaga(),
    deletePreservationRuleSaga(),
  ]);
}
