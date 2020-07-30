import WebTorrent, { Instance as WebTorrentClass } from 'webtorrent';
import { EventEmitter } from 'events';
import { P2PClient } from './P2PClient';
import { MediaClient } from '../media/MediaClient';
import * as protocol from './protocol';
import makeDebug from 'debug';
import { Manifest } from '../types';

const debug = makeDebug('cnxn');

const SEED_KEY = 'cnxn_identity_seed';
const seed = localStorage.getItem(SEED_KEY) ?? undefined;

export class CnxnClient extends EventEmitter {
  private webTorrent: WebTorrentClass;
  private p2p: P2PClient;
  media: MediaClient;

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

  connect = async (id: string) => {
    await this.p2p.follow(id);
    debug('joinedPeer', id);
  };

  privateMessage = (peerId: string, text: string) => {
    debug('sending message', text, 'to', peerId);
    this.p2p.send(protocol.message({ text }), peerId);
  };

  broadcastMessage = (text: string) => {
    this.p2p.send(protocol.message({ text }));
    debug('broadcasted message', text);
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
        debug('saw message', peerId, packet.text);
        this.emit('message', {
          senderId: peerId,
          text: packet.text,
        });
        break;
      case protocol.ProtocolType.ManifestUpdate:
        debug('saw manifest', peerId, packet.manifest);
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
    debug('peerJoined', address);
    this.emit('peerJoined', address);
  };

  private handlePeerLeft = async (address: string) => {
    this.emit('peerLeft', address);
  };
}
