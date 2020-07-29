import localForage from 'localforage';
import { Manifest } from '../types';

const manifests = localForage.createInstance({
  name: 'cnxn_manifests',
});

export const manifestStore = {
  get: async (id: string) => manifests.getItem<Manifest>(id),
  put: async (manifest: Manifest) => manifests.setItem(manifest.id, manifest),
};
