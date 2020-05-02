declare module 'hypercore' {
  import { Stream } from 'stream';
  import { EventEmitter } from 'events';

  export type ValueEncoding = 'json' | 'utf-8' | 'binary';

  export type FeedOptions = {
    wait: boolean;
    timeout: number;
    valueEncoding: ValueEncoding;
  };

  export type FeedConstructorOptions = {
    createIfMissing: true; // create a new hypercore key pair if none was present in storage
    overwrite: false; // overwrite any old hypercore that might already exist
    valueEncoding: 'json' | 'utf-8' | 'binary'; // defaults to binary
    sparse: false; // do not mark the entire feed to be downloaded
    eagerUpdate: true; // always fetch the latest update that is advertised. default false in sparse mode.
    secretKey: buffer; // optionally pass the corresponding secret key yourself
    storeSecretKey: true; // if false, will not save the secret key
    storageCacheSize: 65536; // the # of entries to keep in the storage system's LRU cache (false or 0 to disable)
    onwrite: (index, data, peer, cb) => any; // optional hook called before data is written after being verified
    // (remember to call cb() at the end of your handler)
    stats: true; // collect network-related statistics,
    // Optionally use custom cryptography for signatures
    crypto: {
      sign(data, secretKey, cb: (err: any, signature: any) => any): any;
      verify(signature, data, key, cb: (err: any, valid: any) => any): any;
    };
    noiseKeyPair: { publicKey; secretKey }; // set a static key pair to use for Noise authentication when replicating
  };

  export class Feed extends EventEmitter {
    readonly noiseKeyPair: any;
    readonly live: boolean;
    readonly sparse: boolean;
    readonly length: number;
    readonly byteLength: number;
    readonly maxRequests: number;
    readonly key: any;
    readonly discoveryKey: any;
    readonly secretKey: any;
    readonly bitfield: any;
    readonly tree: any;
    readonly writable: any;
    readonly readable: boolean;
    readonly downloading: boolean;
    readonly uploading: boolean;
    readonly allowPush: boolean;
    readonly peers: any[];
    readonly ifAvailable: any;
    readonly extensions: any;
    readonly crypto: any;

    constructor(
      storageLocation: string | null,
      key?: Buffer,
      options?: FeedConstructorOptions,
    );
    constructor(
      storageLocation: string | null,
      options?: FeedConstructorOptions,
    );

    get remoteLength(): number;
    get stats(): {
      peers: any;
      totals: any;
    };

    registerExtension(name: string, handlers: any): any;

    setDownloading(downloading: boolean): void;

    setUploading(uploading: boolean): void;

    append(data: any, callback?: (err?: Error, seq: number) => void): void;

    get(
      index: number,
      options: FeedOptions,
      callback: (...args: any[]) => void,
    ): void;
    get(index: number, callback: (...args: any[]) => void): void;

    getBatch(
      start: number,
      end: number,
      options: FeedOptions,
      callback: (...args: any[]) => void,
    ): any;
    getBatch(start: number, end: number, callback: any): any;

    head(options: FeedOptions, callback: any): any;
    head(callback: any): any;

    download(range?: any, callback?: any): any;

    undownload(range: any): any;

    signature(index: number, callback: any): any;
    signature(callback: any): any;

    verify(index: number, signature: any, callback: any): any;

    rootHashes(index: number, callback: any): any;

    downloaded(start?: number, end?: number): number;

    has(index: number): boolean;
    has(start: number, end: number): boolean;

    clear(start: number, end?: number, callback?: any): void;
    clear(start: number, callback: any): void;

    seek(byteOffset: number, callback: any): any;

    update(minLength: number, callback: any): any;

    createReadStream(options: {
      start: number;
      end: number;
      snapshot: boolean;
      tail: boolean;
      live: boolean;
      timeout: number;
      wait: boolean;
    }): Stream;

    createWriteStream(): Stream;

    replicate(
      isInitiator: boolean,
      opts?: {
        live?: boolean;
        ack?: boolean;
        download?: boolean;
        upload?: boolean;
        encrypted?: boolean;
        noise?: boolean;
        keyPair?: { publicKey: any; secretKey: any };
        onauthenticate?: (remotePublicKey: any, done: any) => void;
      },
    ): Stream;

    close(callback?: (err?: any) => void): void;

    destroyStorage(callback?: (err?: any) => void): void;

    audit(callback?: () => void): void;
  }

  function hypercore(
    storageLocation: string | null,
    key?: Buffer,
    options?: FeedConstructorOptions,
  ): Feed;
  function hypercore(
    storageLocation: string | null,
    options?: FeedConstructorOptions,
  ): Feed;

  export default hypercore;
}
