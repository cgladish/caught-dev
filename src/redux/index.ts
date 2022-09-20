import { configureStore } from "@reduxjs/toolkit";
import { initialRootState } from "./rootState";
import createSagaMiddleware from "redux-saga";
import { rootSaga } from "./rootSaga";
import { rootReducer } from "./rootReducer";

export * from "./rootState";
export * from "./dispatch";
export * from "./types";

const sagaMiddleware = createSagaMiddleware();
export const store = configureStore({
  reducer: rootReducer,
  preloadedState: initialRootState,
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    sagaMiddleware,
  ],
});
sagaMiddleware.run(rootSaga);
