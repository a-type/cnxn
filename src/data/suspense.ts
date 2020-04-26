import * as React from 'react';
import { User } from '../types/models';
import { getUserStore } from './sources';
import { Store } from 'orbit-db';

export type SuspenseKeyValue<S extends Object> = {
  data: S;
  put<K extends keyof S>(key: K, value: S[K]): Promise<string>;
  del<K extends keyof S>(key: K): Promise<string>;
};

function useStoreUpdates(store: Store) {
  const [refreshKey, setRefreshKey] = React.useState(0);
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

  return refreshKey;
}

export function useUser(address: string): SuspenseKeyValue<User> {
  const store = getUserStore(address);

  useStoreUpdates(store);

  return {
    data: store.all,
    put<K extends keyof User>(key: K, value: User[K]) {
      return store.put(key, value);
    },
    del<K extends keyof User>(key: K) {
      return store.del(key);
    },
  };
}
