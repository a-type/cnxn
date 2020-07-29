import * as React from 'react';
import { PeersList } from './PeersList';
import { ComposeForm } from './ComposeForm';
import { Conversation } from './Conversation';
import { useClient } from '../contexts/ClientContext';
import { useRecoilValue } from 'recoil';
import { activePeerSelector } from '../atoms/session';

export function MessageTest() {
  const client = useClient();
  const activePeer = useRecoilValue(activePeerSelector);

  function addPeer(id: string) {
    client.connect(id);
  }

  function sendMessage(text: string) {
    if (activePeer) {
      client.broadcast(text);
    }
  }

  return (
    <div>
      <div>ID: {client.id}</div>
      <PeersList />
      <div>Add peer</div>
      <ComposeForm onSend={addPeer} />
      {activePeer && (
        <div>
          <Conversation peerId={activePeer} />
          <ComposeForm onSend={sendMessage} />
        </div>
      )}
    </div>
  );
}
