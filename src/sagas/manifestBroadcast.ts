import { takeLatest, call } from 'redux-saga/effects';
import { setUserManifest } from '../features/manifests/manifests';
import { client } from '../p2p/singleton';

/**
 * Listens to changes in the active user's manifest and broadcasts them to peers
 */
function* manifestBroadcast(action: ReturnType<typeof setUserManifest>) {
  console.log(action);
  if (action.payload.id === client.id) {
    yield call(client.broadcastManifest, action.payload);
  }
}

export function* manifestBroadcastRoot() {
  yield takeLatest(setUserManifest.type, manifestBroadcast);
}
console.log(setUserManifest.type);
