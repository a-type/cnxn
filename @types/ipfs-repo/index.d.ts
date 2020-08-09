declare module 'ipfs-repo' {
  import CID from 'cids';
  import { Datastore } from 'interface-datastore';
  import Multiaddr from 'multiaddr';
  import Block from 'ipld-block';

  export type Lock = any;
  export type Key = any;

  export type RepoOptions = {
    autoMigrate?: boolean;
    lock?: Lock | 'fs' | 'memory';
    storageBackends?: {
      root?: Datastore;
      blocks?: Datastore;
      keys?: Datastore;
      datastore?: Datastore;
    };
  };

  export type RepoInit = any;

  export type RepoKey = Buffer | string | Key;

  export class RepoBlocks {
    put(block: Block): Promise<void>;
    putMany(blocks: Iterable<Block> | AsyncIterable<Block>): Promise<void>;
    get(cid: CID): Promise<Buffer>;
  }

  export interface RepoConfig {
    set(value: any): Promise<void>;
    get(key: string): Promise<any>;
    get(): Promise<any>;
    exists(): Promise<boolean>;
  }

  export interface RepoVersion {
    get(): Promise<number>;
    set(number: number): Promise<void>;
  }

  export interface RepoApiAddr {
    get(): Promise<string>;
    set(value: string | Multiaddr): Promise<void>;
  }

  export type RepoStat = {
    numObjects: number;
    repoPath: string;
    repoSize: number;
    version: number;
    storageMax: number;
  };

  export class Repo {
    constructor(path: string, options: RepoOptions);
    init(config: RepoInit): Promise<void>;
    open(): Promise<void>;
    close(): Promise<void>;
    exists(): Promise<boolean>;

    // root repo (??)
    put(key: RepoKey, value: Buffer): Promise<void>;
    get(key: RepoKey): Promise<Buffer>;

    isInitialized(): Promise<boolean>;
    readonly blocks: RepoBlocks;
    readonly datastore: Datastore;
    readonly version: RepoVersion;
    readonly apiAddr: RepoApiAddr;

    stat(): Promise<RepoStat>;
  }

  export default Repo;
}

declare module 'ipfs-repo/src/lock' {
  import { Lock } from 'ipfs-repo';

  export default Lock;
}

declare module 'ipfs-repo/src/lock-memory' {
  import { Lock } from 'ipfs-repo';

  export default Lock;
}
