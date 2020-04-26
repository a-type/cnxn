import { Store, KeyValueStore } from 'orbit-db';
import { User } from '../types/models';

export class StoreCache<S extends Store = Store> {
  private cache: Record<string, S> = {};

  get(key: string) {
    return this.cache[key] || null;
  }

  put(key: string, store: S) {
    this.cache[key] = store;
  }

  async evict(key: string) {
    const store = this.cache[key];
    if (!store) {
      return;
    }
    await store.close();
    delete this.cache[key];
  }
}

export const usersCache = new StoreCache<KeyValueStore<User>>();
