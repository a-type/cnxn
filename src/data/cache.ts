export class StoreCache<S> {
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
    delete this.cache[key];
  }
}
