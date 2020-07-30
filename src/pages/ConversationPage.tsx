import * as React from 'react';
import { Conversation } from '../features/messages/Conversation';
import { RouteComponentProps } from 'react-router-dom';

export function ConversationPage(
  props: RouteComponentProps<{ userId: string }>,
) {
  return <Conversation userId={props.match.params.userId} />;
}
