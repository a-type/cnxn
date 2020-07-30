import { Instance as WebTorrentClass } from 'webtorrent';
import makeDebug from 'debug';
import { EventEmitter } from 'events';
import { HostedMedia } from './HostedMedia';

const debug = makeDebug('media');

export type MediaClientOptions = {
  webTorrent: WebTorrentClass;
};

/**
 * This client is responsible for publishing and consuming
 * media content. It does not store published or retrieved
 * content statefully.
 */
export class MediaClient extends EventEmitter {
  private webTorrent: WebTorrentClass;

  constructor(options: MediaClientOptions) {
    super();

    this.webTorrent = options.webTorrent;
  }

  hostMedia = (media: File[], name: string) => {
    debug('host media', media, name);
    return new Promise<HostedMedia>((resolve) => {
      this.webTorrent.seed(
        media,
        {
          name,
        },
        (tor) => {
          debug('hostMedia', name, tor);
          this.emit('hostMedia', name, tor);
          resolve(new HostedMedia(tor));
        },
      );
    });
  };

  getMedia = (address: string) => {
    debug('get media', address);
    return new Promise<HostedMedia>((resolve) => {
      this.webTorrent.add(address, {}, (tor) => {
        // here the file should be ready, if I read the docs right
        resolve(new HostedMedia(tor));
      });
    });
  };
}
