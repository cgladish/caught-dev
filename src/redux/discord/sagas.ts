import {
  actionChannel,
  all,
  call,
  put,
  take,
  takeLatest,
} from "redux-saga/effects";
import {
  ActionType,
  FetchChannelFailureAction,
  FetchChannelsStartAction,
  FetchChannelSuccessAction,
  FetchGuildsFailureAction,
  FetchGuildsStartAction,
  FetchGuildsSuccessAction,
} from "./actions";

function* fetchGuilds(action: FetchGuildsStartAction) {
  try {
    const guilds: Awaited<ReturnType<typeof window.api.discord.fetchGuilds>> =
      yield call(window.api.discord.fetchGuilds);
    yield put<FetchGuildsSuccessAction>({
      type: ActionType.fetchGuildsSuccess,
      payload: { guilds },
    });
  } catch (e) {
    yield put<FetchGuildsFailureAction>({
      type: ActionType.fetchGuildsFailure,
      payload: { error: e as Error },
    });
  }
}
function* fetchGuildsSaga() {
  yield takeLatest(ActionType.fetchGuildsStart, fetchGuilds);
}

function* fetchChannels(action: FetchChannelsStartAction) {
  try {
    const channels: Awaited<
      ReturnType<typeof window.api.discord.fetchChannels>
    > = yield call(window.api.discord.fetchChannels, action.payload.guildId);
    yield put<FetchChannelSuccessAction>({
      type: ActionType.fetchChannelsSuccess,
      payload: { guildId: action.payload.guildId, channels },
    });
  } catch (e) {
    yield put<FetchChannelFailureAction>({
      type: ActionType.fetchChannelsFailure,
      payload: { guildId: action.payload.guildId, error: e as Error },
    });
  }
}
function* fetchChannelsSaga() {
  // @ts-ignore
  const channel = yield actionChannel(ActionType.fetchChannelsStart);
  while (true) {
    const { payload } = yield take(channel);
    yield call(fetchChannels, payload);
  }
}

export function* saga() {
  yield all([fetchGuildsSaga(), fetchChannelsSaga()]);
}
