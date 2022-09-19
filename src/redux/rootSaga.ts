import { all } from "redux-saga/effects";
import { saga as appLoginSaga } from "./appLogin/sagas";

export function* rootSaga() {
  yield all([appLoginSaga()]);
}
