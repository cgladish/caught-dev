import { all, call, put, takeLatest } from "redux-saga/effects";
import {
  ActionType,
  FetchChannelFailureAction,
  FetchChannelsStartAction,
  FetchChannelSuccessAction,
  FetchDmChannelsFailureAction,
  FetchDmChannelsStartAction,
  FetchDmChannelsSuccessAction,
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
      payload: { error: (e as Error).toString() },
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
      payload: {
        guildId: action.payload.guildId,
        channels: channels.map(({ guild_id, ...rest }) => ({
          guildId: guild_id,
          ...rest,
        })),
      },
    });
  } catch (e) {
    yield put<FetchChannelFailureAction>({
      type: ActionType.fetchChannelsFailure,
      payload: {
        guildId: action.payload.guildId,
        error: (e as Error).toString(),
      },
    });
  }
}
function* fetchChannelsSaga() {
  yield takeLatest(ActionType.fetchChannelsStart, fetchChannels);
}

function* fetchDmChannels(action: FetchDmChannelsStartAction) {
  try {
    const dmChannels: Awaited<
      ReturnType<typeof window.api.discord.fetchDmChannels>
    > = yield call(window.api.discord.fetchDmChannels);
    yield put<FetchDmChannelsSuccessAction>({
      type: ActionType.fetchDmChannelsSuccess,
      payload: { dmChannels },
    });
  } catch (e) {
    yield put<FetchDmChannelsFailureAction>({
      type: ActionType.fetchDmChannelsFailure,
      payload: { error: (e as Error).toString() },
    });
  }
}
function* fetchDmChannelsSaga() {
  yield takeLatest(ActionType.fetchDmChannelsStart, fetchDmChannels);
}

export function* saga() {
  yield all([fetchGuildsSaga(), fetchChannelsSaga(), fetchDmChannelsSaga()]);
}
