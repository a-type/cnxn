declare module 'decentstack' {
  import { EventEmitter } from 'events';
  import { Stream } from 'stream';
  import { Hypercore } from 'hypercore';

  export type NodeCallback<T> = (error: Error | null, thing?: T) => void;

  interface Context {
    /** hex-string representation of core key */
    key: string;
    /** metadata from previous middleware */
    meta: any;
    /** get the core described by key */
    resolve: () => Promise<Hypercore>;
  }

  export interface DecentApplication {
    mounted(stack: any, namespace: string): void;
    share(next: NodeCallback<any[]>): void;
    describe(context: Context, next: NodeCallback<any>): void;
    hold(context: Context, next: NodeCallback<boolean>): void;
    reject(context: Context, next: NodeCallback<boolean>): void;
    store(context: Context, next: NodeCallback<any>): void;
    resolve(key: any, next: NodeCallback<any>): void;
    close(): void;
  }

  export type Snapshot = {
    /** shared keys as hex-strings */
    keys: string[];
    /** decorated metadata, array is same length as keys and mapped by index */
    meta: any[];
  };

  export type Channel = any;
  export type Substream = any;

  export class PeerConnection {
    /** copy of initiator flag during instantiation */
    readonly initiator: boolean;
    /** current connection state */
    readonly state: 'init' | 'active' | 'dead';
    /** hypercore-protocol instance */
    readonly steream: any;
    /** list of currently active replication streams via hypercore-protocol Channel or virtual substreams */
    readonly activeChannels: (Channel | Substream)[];
    /** list of actively replicating core keys */
    readonly activeKeys: string[];
    readonly exchangeExt: {
      offeredKeys: Record<string, string[]>;
      requestedKeys: Record<string, string[]>;
      remoteOfferedKeys: Record<string, string[]>;
    };
    readonly stats: {
      snapshotsRecv: number;
      requestsSent: number;
      requestsRecv: number;
      channelesOpened: number;
      channelesClosed: number;
      snapshotsSent: number;
    };

    /**
     * Initializes a new PeerConnection instance, can be used stand-alone without the replication manager for unit-tests or a single-connection IPC client.
     */
    constructor(
      initiator: boolean,
      exchangeKey: string | Buffer,
      opts?: {
        onmanifest(snapshot: Snapshot, self: PeerConnection): any;
        onrequest(request: any, self: PeerConnection): any;
        onstatechange(
          newState: any,
          prevState: any,
          error: Error | null,
          peer: any,
        ): any;
        onreplicating(key: string, self: PeerConnection): any;
        onopen(self: PeerConnection): any;
        onclose(error: Error | null, self: PeerConnection): any;
        onextension(id: string, msg: any, self: PeerConnection): any;
      },
    );

    /**
     * Registers an Peer Specific hypercore extension that will be available only to this peer.
     */
    registerExtension(
      name: string,
      impl: {
        onmessage: (message: any, peer: any) => any;
        encoding: string | object;
      },
    ): {
      name: string;
      broadcast: (message: any) => any;
      send: (message: any, peer: any) => any;
      destroy: () => any;
      encoding: string | object;
      onmessage: (message: any, peer: any) => any;
    };
    registerExtension(impl: {
      onmessage: (message: any, peer: any) => any;
      name: string;
      encoding: string | object;
    }): {
      name: string;
      broadcast: (message: any) => any;
      send: (message: any, peer: any) => any;
      destroy: () => any;
      encoding: string | object;
      onmessage: (message: any, peer: any) => any;
    };

    joinFeed: any;
    sendManifest: any;
    sendRequest: any;
    isActive: any;
    kill: any;
  }

  export class Decentstack extends EventEmitter {
    constructor(
      exchangeKey: string,
      options?: {
        /** stay open after first exchange finished and continue streaming data */
        live?: boolean;
        /** turn off automatic exchange initiation on connect. When off, you have to initiate it manually with stack.startConversation */
        noTalk?: boolean;
        /** Force all replication streams to be tunneled through virtual substreams (hypercore-v7 compatibility) */
        useVirtual?: boolean;
      },
    );

    readonly key: Buffer;
    readonly closed: boolean;

    /**
     * Appends middleware to the stack denoted by namespace. Decentstack can handle multiple stacks in parallell, if a single stack for some reason is unfeasible, then sort your middleware into separate namespaces.
     */
    use(namespace: string, app: DecentApplication): void;
    use(app: DecentApplication): void;

    /**
     * Same as Decentstack#use() except prepends your app to the beginning of the stack instead of appending it to the end.
     */
    prepend(namespace: string, app: DecentApplication): void;
    prepend(app: DecentApplication): void;

    /**
     * Generates a snapshot of current shares by iterates through the stack invoking share, decorate and hold methods on middleware returns a promise of a snapshot
     */
    snapshot(
      keys: string[],
      namespace: string,
      callback?: NodeCallback<Snapshot>,
    ): Promise<Snapshot>;
    snapshot(
      namespace: string,
      callback?: NodeCallback<Snapshot>,
    ): Promise<Snapshot>;
    snapshot(callback?: NodeCallback<Snapshot>): Promise<Snapshot>;

    /**
     * Queries the stack for a given namespace iterating through all middleware implementing the describe method, and returns the final merged properties.
     */
    collectMeta(
      keyOrFeed: string | Buffer | Hypercore,
      namespace: string,
      callback: NodeCallback<any>,
    ): Promise<any>;
    collectMeta(
      keyorFeed: string | Buffer | Hypercore,
      callback: NodeCallback<any>,
    ): Promise<any>;

    /**
     * Runs the list of keys through all middleware implementing the reject method. Useful to for unit-testing middleware, usually invoked when initiating the Accept process
     */
    accept(
      snapshot: Snapshot,
      namespace: string,
      callback: NodeCallback<any>,
    ): Promise<any>;
    accept(snapshot: Snapshot, callback: NodeCallback<any>): Promise<any>;

    /**
     * Runs the snapshot through all middleware implementing the store method. Useful to for unit-testing middleware, usually used internally during Accept phase
     */
    store(
      snapshot: Snapshot,
      namespace: string,
      callback: NodeCallback<string[]>,
    ): Promise<string[]>;
    store(
      snapshot: Snapshot,
      callback: NodeCallback<string[]>,
    ): Promise<string[]>;

    /**
     * Compatibility function, same as handleConnection but returns only the stream from the PeerConnection instance.
     */
    replicate(initiator: boolean, options?: any): Stream;

    /**
     * Instantiates a new instance of PeerConnection and registers it with the replication manager.
     */
    handleConnection(
      initiator: boolean,
      remoteStream: Stream,
      options?: any,
    ): PeerConnection;
    handleConnection(initiator: boolean, options?: any): PeerConnection;

    /**
     * Tells the manager to close all peer connections and notifies all middleware that the stack is destined for the garbage collector.
     */
    close(error: Error, callback: NodeCallback<any>): Promise<void>;
    close(callback: NodeCallback<any>): Promise<void>;

    /**
     * Registers an stack-wide hypercore extension that will be available all connected Peers
     */
    registerExtension(
      name: string,
      impl: {
        onmessage: (message: any, peer: any) => any;
        encoding: string | object;
      },
    ): {
      name: string;
      broadcast: (message: any) => any;
      send: (message: any, peer: any) => any;
      destroy: () => any;
      encoding: string | object;
      onmessage: (message: any, peer: any) => any;
    };
    registerExtension(impl: {
      onmessage: (message: any, peer: any) => any;
      name: string;
      encoding: string | object;
    }): {
      name: string;
      broadcast: (message: any) => any;
      send: (message: any, peer: any) => any;
      destroy: () => any;
      encoding: string | object;
      onmessage: (message: any, peer: any) => any;
    };
  }

  function decent(): Decentstack;
  export default decent;
}
