import { all, call, put, takeLatest } from "redux-saga/effects";
import {
  ActionType,
  FetchStartAction,
  FetchSuccessAction,
  FetchFailureAction,
  SearchStartAction,
  SearchSuccessAction,
  SearchFailureAction,
  JumpStartAction,
  JumpSuccessAction,
  JumpFailureAction,
} from "./actions";

type FetchMessagesResult = Awaited<
  ReturnType<typeof window.api.messages.fetchMessages>
>;
function* fetch(action: FetchStartAction) {
  try {
    if (!action.payload.cursor) {
      const fetchedMessages: FetchMessagesResult = yield call(
        window.api.messages.fetchMessages,
        action.payload.preservationRuleId,
        action.payload.channelId
      );
      yield put<FetchSuccessAction>({
        type: ActionType.fetchSuccess,
        payload: {
          preservationRuleId: action.payload.preservationRuleId,
          channelId: action.payload.channelId,
          messagesResult: {
            data: fetchedMessages.data,
            isLastPageBefore: fetchedMessages.isLastPage,
            isLastPageAfter: false,
          },
        },
      });
    } else if (action.payload.cursor.before) {
      const fetchedMessages: FetchMessagesResult = yield call(
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
          messagesResult: {
            data: fetchedMessages.data,
            isLastPageBefore: fetchedMessages.isLastPage,
          },
        },
      });
    } else {
      const fetchedMessages: FetchMessagesResult = yield call(
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
          messagesResult: {
            data: fetchedMessages.data,
            isLastPageAfter: fetchedMessages.isLastPage,
          },
        },
      });
    }
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

function* jump(action: JumpStartAction) {
  try {
    const [fetchedMessagesBefore, fetchedMessagesAfter]: FetchMessagesResult[] =
      yield all([
        call(
          window.api.messages.fetchMessages,
          action.payload.message.preservationRuleId,
          action.payload.message.externalChannelId,
          { before: action.payload.message.id }
        ),
        call(
          window.api.messages.fetchMessages,
          action.payload.message.preservationRuleId,
          action.payload.message.externalChannelId,
          { after: action.payload.message.id }
        ),
      ]);
    yield put<JumpSuccessAction>({
      type: ActionType.jumpSuccess,
      payload: {
        preservationRuleId: action.payload.message.preservationRuleId,
        channelId: action.payload.message.externalChannelId,
        messagesResult: {
          data: [...fetchedMessagesBefore!.data, ...fetchedMessagesAfter!.data],
          isLastPageBefore: fetchedMessagesBefore!.isLastPage,
          isLastPageAfter: fetchedMessagesAfter!.isLastPage,
        },
      },
    });
  } catch (e) {
    yield put<JumpFailureAction>({
      type: ActionType.jumpFailure,
      payload: { error: (e as Error).toString() },
    });
  }
}
function* jumpSaga() {
  yield takeLatest(ActionType.jumpStart, jump);
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
  yield all([fetchSaga(), jumpSaga(), searchSaga()]);
}
