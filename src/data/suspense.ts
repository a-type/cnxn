import * as React from 'react';
import { getClient } from './client';
import { KeyValueStore } from 'orbit-db';
import { User } from '../types/models';
import { getUserStore } from './sources';

enum SuspenseStatus {
  Pending,
  Error,
  Success,
}

export type SuspenseKeyValue<S extends Object> = {
  data: S;
  put<K extends keyof S>(key: K, value: S[K]): Promise<string>;
  del<K extends keyof S>(key: K): Promise<string>;
  onStale(handler: () => void): void;
  offStale(handler: () => void): void;
};

export function useUser(address: string): SuspenseKeyValue<User> {
  const store = getUserStore(address);

  const [_refreshKey, setRefreshKey] = React.useState(0);
  React.useEffect(() => {
    const onChange = () => {
      setRefreshKey((cur) => (cur + 1) % 2);
    };
    store.events.on('replicated', onChange);
    store.events.on('write', onChange);
    return () => {
      store.events.off('replicated', onChange);
      store.events.off('write', onChange);
    };
  }, [store]);

  return {
    data: store.all,
    put<K extends keyof User>(key: K, value: User[K]) {
      return store.put(key, value);
    },
    del<K extends keyof User>(key: K) {
      return store.del(key);
    },
    onStale(handler) {
      store.events.on('replicated', handler);
      store.events.on('write', handler);
    },
    offStale(handler) {
      store.events.off('replicated', handler);
      store.events.off('write', handler);
    },
  };
}
