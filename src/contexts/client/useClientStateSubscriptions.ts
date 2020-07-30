import * as React from 'react';
import { Manifest } from '../../types';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../features/messages/messagesSlice';
import {
  addConnection,
  removeConnection,
} from '../../features/connections/connectionsSlice';
import { setUserManifest } from '../../features/manifests/manifestsSlice';
import { client } from '../../p2p/singleton';

export function useClientStateSubscriptions() {
  // wire up events to state management
  const dispatch = useDispatch();

  React.useEffect(() => {
    console.info('Bootstrapping state subscriptions');
    function messageStateUpdater(data: { senderId: string; text: string }) {
      console.debug('Adding message:', data.text, 'from', data.senderId);
      dispatch(
        addMessage({
          senderId: data.senderId,
          message: {
            text: data.text,
            timestamp: new Date().getTime(),
          },
        }),
      );
    }
    client.on('message', messageStateUpdater);

    function peerJoinedStateUpdater(peerId: string) {
      console.debug('Adding peer:', peerId);
      dispatch(addConnection(peerId));
    }
    client.on('peerJoined', peerJoinedStateUpdater);
    client.on('joinedPeer', peerJoinedStateUpdater);

    function peerLeftStateUpdater(peerId: string) {
      console.debug('Removing peer:', peerId);
      dispatch(removeConnection(peerId));
    }
    client.on('peerLeft', peerLeftStateUpdater);

    function manifestUpdater(data: { manifest: Manifest }) {
      console.debug('Storing manifest:', data);
      dispatch(setUserManifest(data.manifest));
    }
    client.on('manifest', manifestUpdater);

    return function () {
      client.off('message', messageStateUpdater);
      client.off('peerJoined', peerJoinedStateUpdater);
      client.off('joinedPeer', peerJoinedStateUpdater);
      client.off('peerLeft', peerLeftStateUpdater);
      client.off('manifest', manifestUpdater);
    };
  }, [dispatch]);
}
