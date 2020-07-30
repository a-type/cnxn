import { all } from 'redux-saga/effects';
import { manifestBroadcastRoot } from './manifestBroadcast';

export function* rootSaga() {
  yield all([manifestBroadcastRoot()]);
}
