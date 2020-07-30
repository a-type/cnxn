import * as React from 'react';
import { Manifest } from '../../types';
import { useDispatch } from 'react-redux';
import { addMessage } from '../../features/messages/messages';
import {
  addConnection,
  removeConnection,
} from '../../features/connections/connections';
import { setUserManifest } from '../../features/manifests/manifests';
import { client } from '../../p2p/singleton';

export function useClientStateSubscriptions() {
  // wire up events to state management
  const dispatch = useDispatch();

  React.useEffect(() => {
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

    function peerLeftStateUpdater(peerId: string) {
      console.debug('Removing peer:', peerId);
      dispatch(removeConnection(peerId));
    }
    client.on('peerLeft', peerLeftStateUpdater);

    function manifestUpdater(data: Manifest) {
      console.debug('Storing manifest:', data);
      dispatch(setUserManifest(data));
    }
    client.on('manifest', manifestUpdater);

    return function () {
      client.off('message', messageStateUpdater);
      client.off('peerJoined', peerJoinedStateUpdater);
      client.off('peerLeft', peerLeftStateUpdater);
      client.off('manifest', manifestUpdater);
    };
  }, [dispatch]);
}
