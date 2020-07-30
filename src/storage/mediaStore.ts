import localForage from 'localforage';
import { RemoteMedia, SerializedRemoteMedia } from '../media/RemoteMedia';

const media = localForage.createInstance({
  name: 'media',
});

export const mediaStore = {
  store: async (item: RemoteMedia) => {
    await media.setItem(item.uri, item.serialize());
  },
  get: async (uri: string) => {
    const serialized = await media.getItem<SerializedRemoteMedia>(uri);
    return serialized || null;
  },
  list: async () => {
    const all: Record<string, SerializedRemoteMedia> = {};
    await media.iterate<SerializedRemoteMedia, void>((value, key) => {
      all[key] = value;
    });
    return all;
  },
  delete: async (uri: string) => {
    await media.removeItem(uri);
  },
};
