import { takeLatest, call, select } from 'redux-saga/effects';
import {
  setUserManifest,
  createUserManifestSelector,
} from '../features/manifests/manifestsSlice';
import { client } from '../p2p/singleton';
import { addConnection } from '../features/connections/connectionsSlice';

/**
 * Listens to changes in the active user's manifest and broadcasts them to peers
 */
function* manifestChangeBroadcast(action: ReturnType<typeof setUserManifest>) {
  if (action.payload.id === client.id) {
    yield call(client.broadcastManifest, action.payload);
  }
}

function* peerJoinedBroadcast(action: ReturnType<typeof addConnection>) {
  const manifest = yield select(createUserManifestSelector(client.id));

  // TODO: directly to peer.
  console.info('Broadcasting manifest on peer joined');
  yield call(client.broadcastManifest, {
    preferredName: 'Anonymous',
    ...manifest,
  });
}

export function* manifestBroadcastRoot() {
  yield takeLatest(setUserManifest.type, manifestChangeBroadcast);
  yield takeLatest(addConnection.type, peerJoinedBroadcast);
}
