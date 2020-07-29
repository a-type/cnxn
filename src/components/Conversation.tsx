import * as React from 'react';
import { useRecoilValue } from 'recoil';
import { activeConversationSelector } from '../atoms/messages';

export function Conversation({ peerId }: { peerId: string }) {
  const conversation = useRecoilValue(activeConversationSelector);

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
