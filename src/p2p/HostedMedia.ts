import { Torrent } from 'webtorrent';
import { EventEmitter } from 'events';

export class HostedMedia extends EventEmitter {
  private torrent: Torrent;

  constructor(torrent: Torrent) {
    super();

    this.torrent = torrent;
    this.torrent.on('done', () => {
      this.emit('done');
    });
  }

  get name() {
    return this.torrent.name;
  }

  get address() {
    return this.torrent.magnetURI;
  }

  get files() {
    return this.torrent.files;
  }

  get progress() {
    return this.torrent.progress;
  }

  unpublish() {
    this.torrent.destroy();
  }
}
