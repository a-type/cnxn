import WebTorrent, { Instance as WebTorrentClass } from 'webtorrent';
import { EventEmitter } from 'events';
import { P2PClient } from './P2PClient';
import { MediaClient } from './MediaClient';
import * as protocol from './protocol';
import makeDebug from 'debug';
import { HostedMedia } from './HostedMedia';
import { Manifest } from '../types';

const debug = makeDebug('cnxn');

const SEED_KEY = 'cnxn_identity_seed';
const seed = localStorage.getItem(SEED_KEY) ?? undefined;

export class CnxnClient extends EventEmitter {
  private webTorrent: WebTorrentClass;
  private p2p: P2PClient;
  private media: MediaClient;
  private mediaCache = new Map<string, HostedMedia>();

  constructor() {
    super();
    debug('constructing new client');

    this.webTorrent = new WebTorrent();
    this.p2p = new P2PClient({ webTorrent: this.webTorrent, seed });
    this.media = new MediaClient({ webTorrent: this.webTorrent });

    // store the seed to persist identity
    localStorage.setItem(SEED_KEY, this.p2p.seed);

    // subscribe to service events
    this.p2p.on('message', this.handleP2PPacket);
    this.p2p.on('seen', this.handlePeer);
    this.p2p.on('leave', this.handlePeerLeft);
  }

  get id() {
    return this.p2p.address;
  }

  connect = (id: string) => {
    this.p2p.follow(id);
  };

  privateMessage = (peerId: string, text: string) => {
    debug('sending message', text, 'to', peerId);
    this.p2p.send(protocol.message({ text }), peerId);
  };

  broadcastMessage = (text: string) => {
    this.p2p.send(protocol.message({ text }));
  };

  uploadMedia = async (media: File) => {
    const hosted = await this.media.hostMedia([media], media.name);
    this.mediaCache.set(hosted.address, hosted);
    debug('hosted media', hosted.address, media.name);
    return hosted;
  };

  getMedia = async (uri: string) => {
    const cached = this.mediaCache.get(uri);
    if (cached) {
      debug('got cached media', cached.address, cached.name);
      return cached;
    }

    const hosted = await this.media.getMedia(uri);
    this.mediaCache.set(hosted.address, hosted);
    debug('downloaded media', hosted.address, hosted.name);
    return hosted;
  };

  broadcastManifest = async (manifest: Manifest) => {
    this.p2p.send(
      protocol.manifestUpdate({
        manifest,
      }),
    );
    debug('broadcasted manifest update', manifest);
    // causes a loop! think this through!
    // this.emit('manifest', manifest);
  };

  private handleP2PPacket = (peerId: string, data: any) => {
    // TODO: instead of just naively emitting all messages,
    // we will establish a protocol on top of the messages
    // and interpret that here - some messages will instruct
    // the client to perform operations instead of being
    // relevant to the user.
    const packet = protocol.toProtocolPacket(data);

    if (!packet) {
      debug('Ignoring non-protocol packet', data, 'from', peerId);
      return;
    }

    switch (packet.type) {
      case protocol.ProtocolType.Message:
        this.emit('message', {
          senderId: peerId,
          text: packet.text,
        });
        break;
      case protocol.ProtocolType.ManifestUpdate:
        this.emit('manifest', {
          senderId: peerId,
          manifest: packet.manifest,
        });
        break;
      default:
        debug('Unrecognized protocol packet type', data, 'from', peerId);
        break;
    }
  };

  private handlePeer = async (address: string) => {
    this.emit('peerJoined', address);
    debug('peerJoined', address);
  };

  private handlePeerLeft = async (address: string) => {
    this.emit('peerLeft', address);
  };
}
