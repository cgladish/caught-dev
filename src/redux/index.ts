import {
  configureStore,
  createSerializableStateInvariantMiddleware,
  isPlain,
} from "@reduxjs/toolkit";
import { initialRootState } from "./rootState";
import createSagaMiddleware from "redux-saga";
import { rootSaga } from "./rootSaga";
import { rootReducer } from "./rootReducer";

export * from "./rootState";
export * from "./dispatch";
export * from "./types";

const sagaMiddleware = createSagaMiddleware();
const serializableMiddleware = createSerializableStateInvariantMiddleware({
  isSerializable: (value: any) => value instanceof Date || isPlain(value),
});
export const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialRootState,
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware({ serializableCheck: false }),
    sagaMiddleware,
    serializableMiddleware,
  ],
});
sagaMiddleware.run(rootSaga);
