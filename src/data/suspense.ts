import { getClient } from './client';
import { KeyValueStore } from 'orbit-db';
import { User } from '../types/models';

enum SuspenseStatus {
  Pending,
  Error,
  Success,
}

export type SuspenseKeyValue<S extends Object> = {
  read(): S;
  put<K extends keyof S>(key: K, value: S[K]): Promise<string>;
  del<K extends keyof S>(key: K): Promise<string>;
  onStale(handler: () => void): void;
  offStale(handler: () => void): void;
};

export function fetchUser(address: string): SuspenseKeyValue<User> {
  let status: SuspenseStatus = SuspenseStatus.Pending;
  let error: Error | null = null;
  let store: KeyValueStore<User>;

  const readyPromise = getClient()
    .then((client) =>
      client.keyvalue<User>(address, {
        accessController: {
          write: [client.identity.id],
        },
      }),
    )
    .then((s) => {
      store = s;
      console.log('Store loading into memory');
      return store.load();
    })
    .then(() => {
      status = SuspenseStatus.Success;
    })
    .catch((e) => {
      status = SuspenseStatus.Error;
      error = e;
    });

  return {
    read() {
      switch (status) {
        case SuspenseStatus.Pending:
          throw readyPromise;
        case SuspenseStatus.Error:
          throw error;
        case SuspenseStatus.Success:
          // won't be null if we're here.
          return store?.all as User;
      }
    },
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
