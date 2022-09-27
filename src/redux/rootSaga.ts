import { all } from "redux-saga/effects";
import { saga as appLoginSaga } from "./appLogin/sagas";
import { saga as discordSaga } from "./discord/sagas";
import { saga as messagesSaga } from "./messages/sagas";
import { saga as preservationRulesSaga } from "./preservationRules/sagas";

export function* rootSaga() {
  yield all([
    appLoginSaga(),
    discordSaga(),
    messagesSaga(),
    preservationRulesSaga(),
  ]);
}
