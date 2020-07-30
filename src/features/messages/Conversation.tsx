import * as React from 'react';
import { useSelector } from 'react-redux';
import { activeConversationSelector } from './messages';
import { activePeerSelector } from '../session/session';

export function Conversation() {
  const conversation = useSelector(activeConversationSelector);
  const peerId = useSelector(activePeerSelector);

  return (
    <div>
      <h2>Conversation with {peerId}</h2>
      <ul>
        {conversation.map((message) => (
          <li key={message.timestamp}>{message.text}</li>
        ))}
      </ul>
    </div>
  );
}
