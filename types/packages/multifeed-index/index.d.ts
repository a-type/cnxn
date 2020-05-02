declare module 'multifeed-index' {
  import { EventEmitter } from 'events';
  import Multifeed from 'multifeed';

  export type Node = {
    key: string;
    seq: number;
    value: any;
  };

  class Index extends EventEmitter {
    ready(callback: () => void): void;
    pause(callback?: () => void): void;
    resume(): void;
    getState(): {
      state: 'indexing' | 'idle' | 'paused' | 'error';
      context: {
        totalBlocks: number;
        indexedBlocks: number;
        prevIndexedBlocks: number;
        indexStartTime: number;
        error: Error | null;
      };
    };
  }

  function index(options: {
    log: Multifeed;
    batch(nodes: Node[], next: () => void): void;
    maxBatch: number;
    version: number;
    clearIndex?(callback: () => void): void;
    storeState?(state: Buffer, callback: () => void): void;
    fetchState?(callback: (err: Error, state: Buffer) => void): void;
  }): Index;

  export default index;
}
