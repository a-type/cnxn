import RAM from 'random-access-memory';
import Multifeed from 'multifeed';
import Kappa from 'kappa-core';
import Hypercore from 'hypercore';
import { Decentstack, DecentApplication } from 'decentstack';
import { EventEmitter } from 'events';

class ArrayStore extends EventEmitter implements DecentApplication {
  private storage: any;
  private feeds: any[] = [];
  private factory: any;
  private kappa: Kappa | null = null;

  constructor(storage: any, feeds: any[], factory: () => any) {
    super();

    this.storage = storage;
    this.feeds = feeds;
    this.factory = factory;

    for (const feed of feeds) {
      this.emit('feed', feed);
    }
  }

  mounted: DecentApplication['mounted'] = (stack, namespace) => {
    console.log(`Mounted to ${namespace}`);
    this.storage = new Multifeed(RAM, stack.key);
    this.kappa = new Kappa(null, { multifeed: this.storage });
  };

  share: DecentApplication['share'] = async (next) => {
    const snapshot = await this.readyFeeds();
    next(null, snapshot);
  };

  describe: DecentApplication['describe'] = async (
    { key, meta, resolve },
    next,
  ) => {
    const snapshot = await this.readyFeeds();
    if (snapshot.find((f) => f.key.hexSlice() === key)) {
      next(null, { origin: 'ArrayStore' });
    } else {
      // ignore
      next(null, null);
    }
  };

  hold: DecentApplication['hold'] = ({ key, meta }, next) => {
    next(null, false);
  };

  reject: DecentApplication['reject'] = ({ key, meta, resolve }, next) => {
    next(null, false);
  };

  store: DecentApplication['store'] = async ({ key, meta }, next) => {
    try {
      const feed = await new Promise((resolve, reject) =>
        this.resolve(key, (err, feed) => {
          if (err) return reject(err);
          resolve(feed);
        }),
      );
      if (!feed) {
        const f = this.factory(this.storage, key);
        this.feeds.push(f);
        this.emit('feed', f);
        next(null, f);
      } else {
        next(null, feed);
      }
    } catch (err) {
      next(err, null);
    }
  };

  resolve: DecentApplication['resolve'] = async (key, next) => {
    const snapshot = await this.readyFeeds();
    const feed = snapshot.find((f) => f.key.hexSlice() === key);
    next(null, feed);
  };

  close: DecentApplication['close'] = () => {
    console.log('Deallocating');
  };

  readyFeeds() {
    const snapshot = [...this.feeds];
    // waits for all feeds to be ready
    return new Promise<any[]>((resolve) => {
      let pending = snapshot.length;
      snapshot.forEach((feed) => {
        if (typeof feed.ready === 'function') {
          feed.ready(() => {
            if (!--pending) resolve(snapshot);
          });
        } else if (!--pending) resolve(snapshot);
      });
    });
  }
}

const exchangeKey = Buffer.alloc(32);
exchangeKey.write('communication-encryption-key');

// const stack = new Decentstack(exchangeKey, { live: true });
// stack.use(new ArrayStore());

// const stream = stack.replicate(true);
