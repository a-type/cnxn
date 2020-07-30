import * as React from 'react';
import { useSelector } from 'react-redux';
import { makeConversationSelector } from './messagesSlice';

export function Conversation({ userId }: { userId: string }) {
  const conversation = useSelector(makeConversationSelector(userId));

  return (
    <div>
      <h2>Conversation with {userId}</h2>
      <ul>
        {conversation.map((message) => (
          <li key={message.timestamp}>{message.text}</li>
        ))}
      </ul>
    </div>
  );
}
