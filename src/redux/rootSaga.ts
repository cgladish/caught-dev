import { all } from "redux-saga/effects";
import { saga as appLoginSaga } from "./appLogin/sagas";
import { saga as discordSaga } from "./discord/sagas";

export function* rootSaga() {
  yield all([appLoginSaga(), discordSaga()]);
}
