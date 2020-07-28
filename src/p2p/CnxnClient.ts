import WebTorrent, { Instance as WebTorrentClass } from 'webtorrent';
import { EventEmitter } from 'events';
import { userDataStore } from '../storage/userDataStore';
import { P2PClient } from './P2PClient';
import { MediaClient } from './MediaClient';
import * as protocol from './protocol';
import makeDebug from 'debug';
import { MediaCache } from './MediaCache';

const debug = makeDebug('cnxn');

const SEED_KEY = 'cnxn_identity_seed';
const seed = localStorage.getItem(SEED_KEY) ?? undefined;

export class CnxnClient extends EventEmitter {
  private webTorrent: WebTorrentClass;
  private p2p: P2PClient;
  private media: MediaClient;
  private mediaCache: MediaCache = new MediaCache();

  constructor() {
    super();

    this.webTorrent = new WebTorrent();
    this.p2p = new P2PClient({ webTorrent: this.webTorrent, seed });
    this.media = new MediaClient({ webTorrent: this.webTorrent });

    // store the seed to persist identity
    localStorage.setItem(SEED_KEY, this.p2p.seed);

    // subscribe to service events
    this.p2p.on('message', this.handleP2PPacket);
    this.p2p.on('seen', this.handlePeer);

    // try to connect to all peers we know of
    this.restorePeerConnections();
  }

  get id() {
    return this.p2p.address;
  }

  connect = (id: string) => {
    this.p2p.follow(id);
    // this is probably abusing this method - but it works for now
    this.handlePeer(id);
  };

  message = (peerId: string, text: string) => {
    this.p2p.send(protocol.message(text), peerId);
  };

  broadcast = (text: string) => {
    this.p2p.send(protocol.message(text));
  };

  post = async (media: File) => {
    const hosted = await this.media.hostMedia([media], media.name);
    console.log('hosted media:', hosted.address);
    this.p2p.send(protocol.mediaBroadcast(hosted.address));
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
          sender: peerId,
          text: packet.text,
        });
        break;
      case protocol.ProtocolType.MediaBroadcast:
        this.downloadMedia(packet.address, peerId);
        break;
      default:
        debug('Unrecognized protocol packet type', data, 'from', peerId);
        break;
    }
  };

  private downloadMedia = async (address: string, publisherId: string) => {
    const mediaObject = await this.media.getMedia(address);
    this.mediaCache.add(publisherId, mediaObject);
    this.emit('media', {
      sender: publisherId,
      media: mediaObject,
    });
  };

  private handlePeer = async (address: string) => {
    await userDataStore.connections.add(address);
  };

  private restorePeerConnections = async () => {
    const connections = userDataStore.connections.list();
    for (const id of connections) {
      this.p2p.follow(id);
    }
  };
}
