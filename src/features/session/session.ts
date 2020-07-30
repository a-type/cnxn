import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';

export const sessionSlice = createSlice({
  name: 'session',
  initialState: { activePeer: null } as { activePeer: string | null },
  reducers: {
    setActivePeer: (state, action) => {
      state.activePeer = action.payload;
      return state;
    },
  },
});

export const sessionReducer = sessionSlice.reducer;

export const { setActivePeer } = sessionSlice.actions;

export const activePeerSelector = (state: RootState) =>
  state.session?.activePeer;
