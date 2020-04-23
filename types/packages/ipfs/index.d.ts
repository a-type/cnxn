declare module 'ipfs' {
  import Repo from 'ipfs-repo';
  import Block from 'ipld-block';
  import PeerId from 'peer-id';
  import multiaddr from 'multiaddr';
  import CID from 'cids';
  import { EventEmitter } from 'events';

  type Multiaddr = ReturnType<typeof multiaddr>;

  type FlexibleCID = CID | Buffer | string;

  export type NodeOptions = {
    repo?: string | Repo;
    repoAutoMigrate?: boolean;
    init?:
      | boolean
      | {
          emptyRepo?: boolean;
          bits?: number;
          privateKey?: string | PeerId;
          pass?: string;
          profiles?: Array<any>;
          allowNew?: boolean;
        };
    start?: boolean;
    pass?: string | null;
    silent?: boolean;
    relay?: {
      enabled?: boolean;
      hop: {
        enabled?: boolean;
        active?: boolean;
      };
    };
    offline?: boolean;
    preload?: {
      enabled?: boolean;
      addresses?: Multiaddr[];
    };
    EXPERIMENTAL?: {
      pubsub?: boolean;
      ipnsPubsub?: boolean;
      sharding?: boolean;
    };
    config?: any;
    ipld?: any;
    libp2p?: any;
  };

  export type DAGNode = any;

  export interface DAG {
    /**
     * Store an IPLD format node
     * @example
     * const obj = { simple: 'object' }
     * const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha3-512' })
     * console.log(cid.toString())
     * // zBwWX9ecx5F4X54WAjmFLErnBT6ByfNxStr5ovowTL7AhaUR98RWvXPS1V3HqV1qs3r5Ec5ocv7eCdbqYQREXNUfYNuKG
     */
    put(
      dagNode: DAGNode,
      options?: {
        format?: string;
        hashAlg?: string;
        cid?: FlexibleCID;
        pin?: boolean;
      },
    ): Promise<CID>; // TODO: CID or string?

    /**
     * Retrieve an IPLD format node
     * @example
     * // example obj
     * const obj = {
     *   a: 1,
     *   b: [1, 2, 3],
     *   c: {
     *     ca: [5, 6, 7],
     *     cb: 'foo'
     *   }
     * }
     * const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' })
     * console.log(cid.toString())
     * // zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5
     * async function getAndLog(cidPath) {
     *   const result = await ipfs.dag.get(cidPath)
     *   console.log(result.value)
     * }
     * await getAndLog('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5/a')
     * // Logs:
     * // 1
     * await getAndLog('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5/b')
     * // Logs:
     * // [1, 2, 3]
     * await getAndLog('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5/c')
     * // Logs:
     * // {
     * //   ca: [5, 6, 7],
     * //   cb: 'foo'
     * // }
     * await getAndLog('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5/c/ca/1')
     * // Logs:
     * // 6
     */
    get(
      cid: FlexibleCID,
      path?: string,
      options?: { localResolve?: boolean },
    ): Promise<any>;

    /**
     * Enumerate all the entries in a graph
     * @example
     * // example obj
     * const obj = {
     *   a: 1,
     *   b: [1, 2, 3],
     *   c: {
     *     ca: [5, 6, 7],
     *     cb: 'foo'
     *   }
     * }
     * const cid = await ipfs.dag.put(obj, { format: 'dag-cbor', hashAlg: 'sha2-256' })
     * console.log(cid.toString())
     * // zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5
     * const result = await ipfs.dag.tree('zdpuAmtur968yprkhG9N5Zxn6MFVoqAWBbhUAkNLJs2UtkTq5')
     * console.log(result)
     * // Logs:
     * // a
     * // b
     * // b/0
     * // b/1
     * // b/2
     */
    tree(
      cid: FlexibleCID,
      path?: string,
      options?: { recursive?: boolean },
    ): Promise<string[]>;
  }

  export interface Bitswap {
    /** Returns the wantlist, optionally filtered by peer ID */
    wantlist(peerId?: string): Promise<CID[]>;
    /**
     * Show diagnostic information on the bitswap agent.
     * https://github.com/ipfs/js-ipfs/blob/master/docs/core-api/BITSWAP.md#bitswapstat
     */
    stat(): any;
  }

  export interface Blocks {
    get(cid: CID | string | Buffer): Promise<Block>;
    put(
      block: Buffer | Block,
      options?: {
        cid?: FlexibleCID;
        format?: string;
        mhtype?: string;
        mhlen?: string;
      },
    ): Promise<Block>;
    rm(
      cid: FlexibleCID,
      options?: {
        force?: boolean;
        quiet?: boolean;
      },
    ): Promise<{ hash: string; error?: string }>;
    stat(cid: FlexibleCID): Promise<any>;
  }

  export class IPFS {
    start(): Promise<void>;
    stop(): Promise<void>;
    add(buffer: Buffer): Promise<any>;

    id(): Promise<{
      id: string;
      publicKey: string;
      addresses: Multiaddr[];
      agentVersion: string;
      protocolVersion: string;
    }>;
    version(): Promise<any>;
    dns(domain: string, options?: { recursive?: boolean }): Promise<string>;
    ping(
      peerId: string,
      options?: { count?: number },
    ): AsyncIterable<{
      success: boolean;
      time: number;
      text: string;
    }>;
    resolve(
      name: string,
      options?: { recursive?: boolean; cidBase?: string },
    ): Promise<string>;

    dag: DAG;
    bitswap: Bitswap;
    // TODO:
    bootstrap: any;
    config: any;
    dht: any;
    files: any;
    key: any;
    name: any;
    object: any;
    pin: any;
    pubsub: any;
    refs: any;
    repo: any;
    stats: any;
    swarm: any;
  }

  export function create(options: NodeOptions): Promise<IPFS>;

  // TODO...
  export type crypto = any;
  export type isIPFS = any;
  export type Buffer = any;
  export type PeerInfo = any;
  export type multibase = any;
  export type multihash = any;
  export type multihashing = any;
  export type multicodec = any;

  export default {
    crypto,
    isIPFS,
    Buffer,
    PeerInfo,
    multibase,
    multihash,
    multihashing,
    multicodec,
    CID,
    PeerId,
    multiaddr,
  };
}
