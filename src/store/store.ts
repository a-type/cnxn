import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import { connectionsReducer } from '../features/connections/connections';
import { manifestsReducer } from '../features/manifests/manifests';
import { messagesReducer } from '../features/messages/messages';
import { sessionReducer } from '../features/session/session';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from '../sagas/root';

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: {
    connections: connectionsReducer,
    manifests: manifestsReducer,
    messages: messagesReducer,
    session: sessionReducer,
  },
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
