declare module 'libp2p' {
  import { Stream } from 'stream';
  import { EventEmitter } from 'events';

  export type Libp2pOptions = {
    peerInfo: any;
    peerBook: any;
    modules: {
      transport: any[];
      connEncryption: any[];
      streamMuxer: any[];
      pubsub: any;
      peerDiscovery: any[];
      dht: any;
    };
    config: {
      pubsub?: {
        enabled?: boolean;
        emitSelf?: boolean;
        [key: string]: any;
      };
      relay?: {
        enabled?: boolean;
        hop?: {
          enabled?: boolean;
          active?: boolean;
        };
        [key: string]: any;
      };
      dht?: {
        enabled?: boolean;
        kBucketSize?: number;
        randomWalk?: {
          enabled?: boolean;
          [key: string]: any;
        };
        [key: string]: any;
      };
      peerDiscovery?: {
        autoDial?: boolean;
        [key: string]: any;
      };
      EXPERIMENTAL?: {
        pubsub?: boolean;
      };
    };
    metrics?: {
      enabled?: boolean;
    };
  };

  export class Libp2p extends EventEmitter {
    constructor(options: Libp2pOptions);
    static create(options: Libp2pOptions): any;
    readonly peerInfo: any;
    start(): Promise<void>;
    handle(protocol: string, cb: (ev: { stream: Stream }) => any): void;
    dialProtocol(peer: any, protocolName: string): Promise<{ stream: Stream }>;
  }

  export default Libp2p;
}
