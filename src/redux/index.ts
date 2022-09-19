import { configureStore } from "@reduxjs/toolkit";
import { applyMiddleware, combineReducers, Dispatch as _Dispatch } from "redux";
import { initialRootState } from "./rootState";
import { Action as AppLoginAction } from "./appLogin/actions";
import { reducer as appLoginReducer } from "./appLogin/reducer";
import createSagaMiddleware from "redux-saga";
import { rootSaga } from "./rootSaga";

export * from "./rootState";
export * from "./types";

const rootReducer = combineReducers({
  appLogin: appLoginReducer,
});

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

export type Dispatch = _Dispatch<AppLoginAction>;
