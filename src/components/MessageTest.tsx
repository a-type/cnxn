import * as React from 'react';
import { PeersList } from '../features/connections/PeersList';
import { ComposeForm } from './ComposeForm';
import { Conversation } from '../features/messages/Conversation';
import { client } from '../p2p/singleton';

export function MessageTest() {
  function addPeer(id: string) {
    client.connect(id);
  }

  function sendMessage(text: string) {
    client.broadcastMessage(text);
  }

  return (
    <div>
      <div>ID: {client.id}</div>
      <PeersList />
      <div>Add peer</div>
      <ComposeForm onSend={addPeer} />
      <div>
        <Conversation />
        <ComposeForm onSend={sendMessage} />
      </div>
    </div>
  );
}
