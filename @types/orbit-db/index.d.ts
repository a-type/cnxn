declare module 'orbit-db' {
  import { IPFS } from 'ipfs';
  import { EventEmitter } from 'events';

  type Keystore = any;
  type Cache = any;
  // { id: string }
  type Identity = any;

  export type CreateInstanceOptions = {
    directory?: string;
    peerId?: string;
    keystore?: Keystore;
    cache?: Cache;
    identity?: Identity;
    offline?: boolean;
  };

  export type CreateOptions = {
    accessController?: {
      write: string[];
    };
    overwrite?: boolean;
    replicate?: boolean;
  };

  export type OpenOptions = {
    localOnly?: boolean;
    overwrite?: boolean;
    replicate?: boolean;
    accessController?: {
      write?: string[];
    };
  } & ({ create: true; type: string } | { create?: false; type?: string });

  export type OpenDocumentStoreOptions = Omit<OpenOptions, 'type'> & {
    indexBy?: string;
  };

  export type SequentialStoreIteratorOptions = {
    gt?: string;
    gte?: string;
    lt?: string;
    lte?: string;
    limit: number;
    reverse?: boolean;
  };

  // not sure what this is yet.
  export type RecordIterator = {
    collect(): any[];
  };

  interface StoreConstructor {
    new (): Store;
  }

  export interface Store {
    load(amount?: number, fetchEntryTimeout?: any): Promise<void>;
    close(): Promise<void>;
    drop(): Promise<void>;
    readonly identity: Identity;
    readonly type: string;
    readonly id: string;
    readonly address: string;
    /**
     * Available events:
     * - replicated
     * - replicate
     * - replicate.progress
     * - load
     * - load.progress
     * - ready
     * - write
     * - peer
     * - closed
     */
    events: EventEmitter;
  }

  export interface KeyValueStore<S extends Object = {}> extends Store {
    put<K extends keyof S>(key: K, value: S[K]): Promise<string>;
    set<K extends keyof S>(key: K, value: S[K]): Promise<string>;
    get<K extends keyof S>(key: K): S[K];
    del(key: keyof S): Promise<string>;
    /** all loaded values */
    readonly all: S;
  }

  export interface EventStore<E = any> extends Store {
    add(event: E): Promise<string>;
    get(hash: string): E;
    iterator(options?: SequentialStoreIteratorOptions): RecordIterator;
  }

  export interface FeedStore<E = any> extends Store {
    add(data: E): Promise<string>;
    get(hash: string): E;
    remove(hash: string): Promise<E>;
    iterator(options?: SequentialStoreIteratorOptions): RecordIterator;
  }

  export interface DocumentStore<D = any> extends Store {
    put(doc: D, options?: any): Promise<string>;
    get(key: string): D[];
    query(mapper: (doc: D) => boolean): D[];
    del(key: string): Promise<string>;
  }

  export interface CounterStore extends Store {
    readonly value: number;
    inc(value?: number): Promise<string>;
  }

  export class OrbitDB {
    readonly id: string;
    readonly identity: Identity;

    /** creates a new database */
    create(name: string, type: string, options?: CreateOptions): Promise<Store>;

    /**
     * @returns OrbitDB address
     */
    determineAddress(
      name: string,
      type: string,
      options?: CreateOptions,
    ): Promise<string>;

    /** opens an existing databse (or creates it with the 'create' option) */
    open(address: string, options?: OpenOptions): Promise<Store>;
    feed<E = any>(
      address: string,
      options?: Omit<OpenOptions, 'type'>,
    ): Promise<FeedStore<E>>;
    docs<D = any>(
      address: string,
      options?: OpenDocumentStoreOptions,
    ): Promise<DocumentStore<D>>;
    log<E = any>(
      address: string,
      options?: Omit<OpenOptions, 'type'>,
    ): Promise<EventStore<E>>;
    keyvalue<V = any>(
      address: string,
      options?: Omit<OpenOptions, 'type'>,
    ): Promise<KeyValueStore<V>>;
    counter(
      address: string,
      options?: Omit<OpenOptions, 'type'>,
    ): Promise<CounterStore>;

    disconnect(): Promise<void>;
    stop(): Promise<void>;

    static createInstance(ipfs: IPFS, options?: CreateInstanceOptions): OrbitDB;
    static readonly databaseTypes: string[];
    static isValidType(type: string): boolean;
    static addDatabaseType(type: string, store: Store): void;
    static getDatabaseTypes(): {
      [type: string]: StoreConstructor;
    };
    static isValidAddress(address: string): boolean;
    static parseAddress(address: string): any; // TODO
  }

  export default OrbitDB;
}
