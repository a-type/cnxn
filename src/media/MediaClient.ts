import { Instance as WebTorrentClass } from 'webtorrent';
import makeDebug from 'debug';
import { EventEmitter } from 'events';
import { RemoteMedia, SerializedRemoteMedia } from './RemoteMedia';
import { mediaStore } from '../storage/mediaStore';
import magnet from 'magnet-uri';

const debug = makeDebug('media');

export type MediaClientOptions = {
  webTorrent: WebTorrentClass;
};

/**
 * This client is responsible for managing all media in the
 * app, whether it's 'ours' or 'theirs.' These distinctions
 * don't matter as much when things are p2p.
 *
 * There are 2 layers of storage: in-memory cache and
 * persistent storage.
 */
export class MediaClient extends EventEmitter {
  private webTorrent: WebTorrentClass;
  private mediaCache = new Map<string, RemoteMedia>();
  private hydratingPromise: Promise<void>;

  constructor(options: MediaClientOptions) {
    super();

    this.webTorrent = options.webTorrent;

    // hydrate the media cache and begin seeding
    this.hydratingPromise = this.hydrate();
  }

  seedMedia = async (media: File | SerializedRemoteMedia) => {
    debug('seeding', media);
    if (media instanceof File) {
      // check cache
      return this.seed([media], media.name);
    } else {
      const cached = this.mediaCache.get(media.uri);
      if (cached) {
        return cached;
      }

      return this.seed(
        media.files.map(({ blob, name }) => new File([blob], name)),
        media.name,
      );
    }
  };

  getMedia = async (uri: string) => {
    debug('get media', uri);
    // as far as I know there's no better way to do this.

    await this.hydratingPromise;

    const cached = this.mediaCache.get(uri);
    if (cached) {
      debug('cache hit');
      return cached;
    }

    return new Promise<RemoteMedia>((resolve, reject) => {
      try {
        const torrent = this.webTorrent.add(uri, {}, (tor) => {
          const remoteMedia = new RemoteMedia(tor);
          this.cacheMedia(remoteMedia);
          resolve(remoteMedia);
        });
        torrent.on('error', reject);
      } catch (err) {
        reject(err);
      }
    });
  };

  private seed = async (files: File[], name: string) => {
    debug('seed', files, name);
    return new Promise<RemoteMedia>((resolve, reject) => {
      try {
        const torrent = this.webTorrent.seed(
          files,
          {
            name,
          },
          (tor) => {
            debug('seedMedia', name, tor);
            const seeded = new RemoteMedia(tor);
            this.emit('seedMedia', {
              remoteMedia: seeded,
            });
            this.cacheMedia(seeded);
            resolve(seeded);
          },
        );
        torrent.on('error', reject);
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  };

  private hydrate = async () => {
    const storedMedia = await mediaStore.list();
    for (const stored of Object.values(storedMedia)) {
      if (!this.mediaCache.has(stored.uri)) {
        try {
          await this.seed(
            stored.files.map(({ name, blob }) => new File([blob], name)),
            stored.name,
          );
        } catch (err) {
          console.warn('Error hydrating media torrent');
          console.warn(err);
        }
      }
    }
    debug(`hydrated ${Object.values(storedMedia).length} media items`);
  };

  private cacheMedia = async (media: RemoteMedia) => {
    debug('caching media', media);
    this.mediaCache.set(media.uri, media);
    mediaStore.store(media);
  };

  private evictMedia = async (mediaUri: string) => {
    this.mediaCache.delete(mediaUri);
    mediaStore.delete(mediaUri);
  };
}
