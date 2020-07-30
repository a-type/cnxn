import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';

export const connectionsSlice = createSlice({
  name: 'connections',
  initialState: [] as string[],
  reducers: {
    addConnection: (state, action: PayloadAction<string>) => {
      const set = new Set(state);
      set.add(action.payload);
      return Array.from(set);
    },
    removeConnection: (state, action: PayloadAction<string>) => {
      const set = new Set(state);
      set.delete(action.payload);
      return Array.from(set);
    },
  },
});

export const connectionsReducer = connectionsSlice.reducer;

export const { addConnection, removeConnection } = connectionsSlice.actions;

export const selectConnections = (state: RootState) => state.connections;
