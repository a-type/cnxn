import { Torrent } from 'webtorrent';
import { EventEmitter } from 'events';

export type SerializedRemoteMedia = {
  files: {
    name: string;
    blob: Blob;
  }[];
  name: string;
  uri: string;
};

/**
 * Represents media backed by a Torrent. Generally this will
 * be any media hosted by other users.
 */
export class RemoteMedia extends EventEmitter {
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

  get uri() {
    return this.torrent.magnetURI;
  }

  get files() {
    return this.torrent.files;
  }

  get progress() {
    return this.torrent.progress;
  }

  serialize = async (): Promise<SerializedRemoteMedia> => {
    const files = await Promise.all<{ name: string; blob: Blob }>(
      this.torrent.files.map((file) => {
        return new Promise((resolve, reject) => {
          file.getBlob((err, blob) => {
            if (err) {
              reject(err instanceof Error ? err : new Error(err));
            } else {
              resolve({
                name: file.name,
                blob: blob!,
              });
            }
          });
        });
      }),
    );

    return {
      files,
      name: this.name,
      uri: this.uri,
    };
  };
}
