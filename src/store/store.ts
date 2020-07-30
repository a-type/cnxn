import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers,
} from '@reduxjs/toolkit';
import { connectionsReducer } from '../features/connections/connectionsSlice';
import { manifestsReducer } from '../features/manifests/manifestsSlice';
import { messagesReducer } from '../features/messages/messagesSlice';
import { mediaReducer } from '../features/media/mediaSlice';
import createSagaMiddleware from 'redux-saga';
import { rootSaga } from '../sagas/root';
import { persistReducer, persistStore } from 'redux-persist';
import { reduxStore } from '../storage/reduxStore';

const rootReducer = combineReducers({
  connections: connectionsReducer,
  manifests: manifestsReducer,
  messages: messagesReducer,
  media: mediaReducer,
});

const persistConfig = {
  key: 'root',
  storage: reduxStore,
};

const persistingReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: persistingReducer,
  middleware: [sagaMiddleware],
});

sagaMiddleware.run(rootSaga);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
