declare module 'orbit-db' {
  import IPFS from 'ipfs';
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

  interface Store {
    load(amount?: number, fetchEntryTimeout?: any): Promise<void>;
    close(): Promise<void>;
    drop(): Promise<void>;
    readonly identity: Identity;
    readonly type: string;
    readonly id: string;
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

  interface KeyValueStore extends Store {
    put(key: string, value: any): Promise<string>;
    set(key: string, value: any): Promise<string>;
    get(key: string): any;
    del(key: string): Promise<string>;
    /** all loaded values */
    readonly all: Record<string, any>;
  }

  interface EventStore extends Store {
    add(event: any): Promise<string>;
    get(hash: string): any;
    iterator(options?: SequentialStoreIteratorOptions): RecordIterator;
  }

  interface FeedStore extends Store {
    add(data: any): Promise<string>;
    get(hash: string): any;
    remove(hash: string): Promise<any>;
    iterator(options?: SequentialStoreIteratorOptions): RecordIterator;
  }

  interface DocumentStore extends Store {
    put(doc: any): Promise<string>;
    get(key: string): any[];
    query(mapper: (doc: any) => boolean): any[];
    del(key: string): Promise<string>;
  }

  interface CounterStore extends Store {
    readonly value: number;
    inc(value?: number): Promise<string>;
  }

  class OrbitDB {
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
    feed(
      address: string,
      options?: Omit<OpenOptions, 'type'>,
    ): Promise<FeedStore>;
    docs(
      address: string,
      options?: OpenDocumentStoreOptions,
    ): Promise<DocumentStore>;
    docstore(
      address: string,
      options?: OpenDocumentStoreOptions,
    ): Promise<DocumentStore>;
    log(
      address: string,
      options?: Omit<OpenOptions, 'type'>,
    ): Promise<EventStore>;
    eventlog(
      address: string,
      options?: Omit<OpenOptions, 'type'>,
    ): Promise<EventStore>;
    keyvalue(
      address: string,
      options?: Omit<OpenOptions, 'type'>,
    ): Promise<KeyValueStore>;
    kvstore(
      address: string,
      options?: Omit<OpenOptions, 'type'>,
    ): Promise<KeyValueStore>;
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
