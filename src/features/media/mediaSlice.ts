import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type MediaStoreShape = {
  remoteMedia: string[];
};

export const mediaSlice = createSlice({
  name: 'media',
  initialState: {
    remoteMedia: [],
  } as MediaStoreShape,
  reducers: {
    addMedia: (state, action: PayloadAction<{ uri: string }>) => {
      const set = new Set(state.remoteMedia);
      set.add(action.payload.uri);
      state.remoteMedia = Array.from(set);
      return state;
    },
    removeMedia: (state, action: PayloadAction<{ uri: string }>) => {
      const set = new Set(state.remoteMedia);
      set.delete(action.payload.uri);
      state.remoteMedia = Array.from(set);
      return state;
    },
  },
});

export const mediaReducer = mediaSlice.reducer;

export const { addMedia, removeMedia } = mediaSlice.actions;
