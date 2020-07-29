import { atom, selectorFamily, selector } from 'recoil';
import { activePeerSelector } from './session';

export type Message = {
  text: string;
  /** epoch ms */
  timestamp: number;
};

type MessagesStoreShape = {
  [senderId: string]: {
    history: Message[];
  };
};

export const messagesState = atom<MessagesStoreShape>({
  key: 'messages',
  default: {},
});

export const conversationSelector = selectorFamily<Message[], string>({
  key: 'ConversationSelector',
  get: (senderId: string) => ({ get }): Message[] => {
    const allMessages = get(messagesState);
    return allMessages[senderId]?.history ?? [];
  },
  set: (senderId: string) => ({ set }, newValue) => {
    set(messagesState, (prev) => ({
      ...prev,
      [senderId]: newValue,
    }));
  },
});

export const activeConversationSelector = selector<Message[]>({
  key: 'ActiveConversationSelector',
  get: ({ get }): Message[] => {
    const allMessages = get(messagesState);
    const activePeer = get(activePeerSelector);
    if (!activePeer) return [];
    return allMessages[activePeer]?.history ?? [];
  },
});
