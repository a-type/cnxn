import { HostedMedia } from './HostedMedia';

export class MediaCache {
  private cache: { [peerId: string]: HostedMedia[] } = {};

  add = (peerId: string, media: HostedMedia) => {
    this.cache[peerId] = this.cache[peerId] || [];
    this.cache[peerId].push(media);
  };

  get = (peerId: string) => {
    return this.cache[peerId] || [];
  };

  remove = (peerId: string, media: HostedMedia) => {
    if (!this.cache[peerId]) return;

    this.cache[peerId] = this.cache[peerId].filter((m) => m !== media);
    if (this.cache[peerId].length === 0) {
      delete this.cache[peerId];
    }
  };
}
