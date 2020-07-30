import { Manifest } from '../../types';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../store/store';

type ManifestsStoreShape = {
  [userId: string]: Manifest;
};

export const manifestsSlice = createSlice({
  name: 'manifests',
  initialState: {} as ManifestsStoreShape,
  reducers: {
    setUserManifest: (state, action: PayloadAction<Manifest>) => {
      state[action.payload.id] = action.payload;
      return state;
    },
  },
});

export const manifestsReducer = manifestsSlice.reducer;

export const { setUserManifest } = manifestsSlice.actions;

export const createUserManifestSelector = (userId: string) => (
  state: RootState,
) => state.manifests[userId] ?? null;
