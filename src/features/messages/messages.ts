import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';
import { activePeerSelector } from '../session/session';

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

export const messagesSlice = createSlice({
  name: 'messages',
  initialState: {} as MessagesStoreShape,
  reducers: {
    addMessage: (
      state,
      action: PayloadAction<{ senderId: string; message: Message }>,
    ) => {
      const senderId = action.payload.senderId;
      state[senderId] = state[senderId] ?? {};
      state[senderId].history = state[senderId].history ?? [];
      state[senderId].history.push(action.payload.message);
      return state;
    },
  },
});

export const messagesReducer = messagesSlice.reducer;

export const { addMessage } = messagesSlice.actions;

export const activeConversationSelector = (state: RootState) => {
  const activeUserId = activePeerSelector(state);
  if (!activeUserId) return [];
  return state.messages[activeUserId]?.history ?? [];
};
