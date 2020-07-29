import { atom } from 'recoil';
import { Manifest } from '../types';

type ManifestsStoreShape = {
  [userId: string]: Manifest;
};

export const manifestsState = atom<ManifestsStoreShape>({
  key: 'manifests',
  default: {},
});
