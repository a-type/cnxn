import { Instance as WebTorrentClass, Torrent } from 'webtorrent';
import bencode from 'bencode';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import bs58Check from 'bs58check';
import ripemd160 from 'ripemd160';
import { EventEmitter } from 'events';
import makeDebug from 'debug';
import { Wire, Extension as BittorentExtension } from 'bittorrent-protocol';

const debug = makeDebug('p2p');

const EXT = 'cnxn_channel';
const PEER_TIMEOUT = 5 * 60 * 1000;
const SEED_PREFIX = '490a';
const ADDRESS_PREFIX = '55';

enum PacketType {
  Disconnect = 'x',
  Ping = 'p',
  Message = 'm',
}
const PACKETS = {
  DISCONNECT: { y: PacketType.Disconnect },
  PING: { y: PacketType.Ping },
};

type P2PClientOptions = {
  seed?: string;
  webTorrent: WebTorrentClass;
};

type PeerData = {
  publicKey: string;
  encryptionKey: string;
  lastSeen: number;
};

type BasicPacket = {
  y: PacketType;
  [key: string]: any;
};

type PreparedPacket = BasicPacket & {
  /** current time */
  t: number;
  /** identifier of sender */
  i: string;
  /** public key of sender */
  pk: string;
  /** encryption key of sender */
  ek: string;
  /** nonce */
  n: Uint8Array;
};

type SignedPacket = {
  /** signature */
  s: Uint8Array;
  /** payload */
  p: any;
};

type EncryptedPacket = {
  e: any;
  n: Uint8Array;
  ek: string;
};

/** TODO: use mnemonic instead? */
function generateSeed() {
  return bs58Check.encode(
    Buffer.concat([
      Buffer.from(SEED_PREFIX, 'hex'),
      Buffer.from(nacl.randomBytes(32)),
    ]),
  );
}

function generateKeyPair(seed: string) {
  return nacl.sign.keyPair.fromSeed(
    Uint8Array.from(bs58Check.decode(seed)).slice(2),
  );
}

function constructSeedBlob(address: string) {
  if (typeof File !== 'undefined') {
    return new File([address], address);
  } else {
    const buf = Buffer.from(address);
    // @ts-ignore
    buf.name = address;
    return buf;
  }
}

function encodeAddress(publicKey: string) {
  return bs58Check.encode(
    Buffer.concat([
      Buffer.from(ADDRESS_PREFIX, 'hex'),
      new ripemd160()
        .update(Buffer.from(nacl.hash(Uint8Array.from(Buffer.from(publicKey)))))
        .digest(),
    ]),
  );
}

function toHex(thing: Uint8Array) {
  return thing.reduce(function (memo, i) {
    return memo + ('0' + i.toString(16)).slice(-2);
  }, '');
}

function isEncryptedPacket(
  packet: EncryptedPacket | SignedPacket,
): packet is EncryptedPacket {
  return !!((packet as any).e && (packet as any).n && (packet as any).ek);
}

/**
 * Heavily inspired by Bugout. Built for symmetric P2P graph relationships.
 * Most of this code is translated from Bugout and I owe a great deal to its author,
 * Chris McCormick, for coming up with the way to do p2p protocols over webtorrent.
 *
 * The purpose of this rewrite is to remove the server-client concepts and replace
 * them with more symmetric peer-to-peer networking.
 *
 * Also missing from this base implementation is any notion of RPC. RPC is a special
 * class of message, so I've left that up to the user to implement on top of the
 * provided JSON messaging protocol.
 */
export class P2PClient extends EventEmitter {
  private webTorrent: WebTorrentClass;
  /** This torrent seeds our own presence in the network. Clients (or 'followers') can join this torrent to connect to us */
  private identityTorrent: Torrent;
  /** Likewise, we will be joining others' torrents to connect to them - these are stored here. */
  private followTorrents: Record<string, Torrent> = {};

  /** seed to generate identity keypair */
  seed: string;
  /** persistent identity keypair */
  private keyPair: nacl.SignKeyPair;
  /** per-session encyrption key pair */
  private encryptionKeyPair: nacl.BoxKeyPair;
  /** public key used to connect to this peer */
  publicKey: string;
  /** encryption public key used to verify message contents from this peer */
  encryptionKey: string;

  /** registry of all connected peers this session */
  private clients: Record<string, PeerData> = {};

  /** registry of all messages seen this session */
  private seenMessages: Record<string, number> = {};

  private lastPeerCount: number | null = null;

  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(options: P2PClientOptions) {
    super();

    this.webTorrent = options.webTorrent;
    this.seed = options.seed || generateSeed();
    this.keyPair = generateKeyPair(this.seed);
    this.encryptionKeyPair = nacl.box.keyPair();

    this.publicKey = bs58.encode(Buffer.from(this.keyPair.publicKey));
    this.encryptionKey = bs58.encode(
      Buffer.from(this.encryptionKeyPair.publicKey),
    );

    // start seeding our own torrent
    this.identityTorrent = this.joinTorrent(this.address);

    // begin heartbeat
    this.heartbeat();
  }

  get address() {
    return encodeAddress(this.publicKey);
  }

  follow = (peerAddress: string) => {
    // don't join duplicates
    if (this.followTorrents[peerAddress]) return;
    this.followTorrents[peerAddress] = this.joinTorrent(peerAddress);
    debug('started following', peerAddress);
  };

  destroy = () => {
    // stop heartbeat
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    // send disconnect to all peers
    this.sendPacket(PACKETS.DISCONNECT);

    // stop seeding the torrent
    return new Promise((resolve, reject) => {
      this.webTorrent.remove(this.identityTorrent, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  };

  countConnections = () => {
    const peerCount = this.identityTorrent.numPeers;
    if (peerCount !== this.lastPeerCount) {
      this.lastPeerCount = peerCount;
      this.emit('connections', peerCount);
    }
    return this.lastPeerCount;
  };

  ping = () => {
    this.sendPacket(PACKETS.PING);
  };

  send = (message: any, address?: string) => {
    debug('send', message, address);
    const packet = this.makePacket({
      y: PacketType.Message,
      v: JSON.stringify(message),
    });
    if (address) {
      // encrypt the packet so only the peer can see it
      if (this.clients[address]) {
        this.sendRaw(
          this.encryptPacket(packet, this.clients[address].publicKey),
        );
      } else {
        throw new Error(
          `Cannot send message to ${address}, not peered to them.`,
        );
      }
    } else {
      // broadcast
      this.sendRaw(packet);
    }
  };

  private joinTorrent = (address: string) => {
    const blob = constructSeedBlob(address);

    const torrent = this.webTorrent.seed(
      blob,
      {
        name: address,
      },
      (tor) => {
        debug('joinTorrent', address, tor);
        this.emit('joinTorrent', address, tor);
      },
    );

    torrent.on('wire', (wire) => this.attach(wire, address));

    return torrent;
  };

  private attach = (wire: Wire, identifier?: string) => {
    debug('saw wire', wire.peerId, identifier);

    if (!identifier) {
      debug('no identifier for wire', wire.peerId);
      return;
    }

    wire.use(this.createExtension(identifier, wire));
  };

  /** TODO: understand this better. */
  private createExtension = (identifier: string, wire: any) => {
    const client = this;

    class Extension implements BittorentExtension {
      private wire: Wire;
      private client = client;

      name = EXT;

      constructor(wire: Wire) {
        this.wire = wire;
        // TODO: sign handshake to prove key custody
        (wire as any).extendedHandshake.id = identifier;
        (wire as any).extendedHandshake.pk = client.publicKey;
        (wire as any).extendedHandshake.ek = client.encryptionKey;
      }

      onExtendedHandshake = (handshake: Record<string, any>) => {
        debug(
          'wire extended handshake',
          encodeAddress(handshake.pk.toString()),
          this.wire.peerId,
          handshake,
        );
        this.client.emit(
          'wireseen',
          this.client.identityTorrent.numPeers,
          this.wire,
        );
        this.client.countConnections();
        // TODO: check signature and drop on failure
        this.client.onSawPeer(handshake.pk.toString(), handshake.ek.toString());
      };

      onMessage = (message: any) => {
        this.client.onMessage(identifier, this.wire, message);
      };
    }
    // @ts-ignore
    Extension.prototype.name = EXT;
    return Extension;
  };

  private removePeer = (peerAddress: string) => {
    delete this.clients[peerAddress];
    this.emit('left', peerAddress);
  };

  private heartbeat = () => {
    const interval = 30000;
    this.heartbeatInterval = setInterval(() => {
      this.ping();

      // remove peers we haven't heard from in a while
      const time = new Date().getTime();
      for (const [peerAddress, peerData] of Object.entries(this.clients)) {
        if (peerData.lastSeen + PEER_TIMEOUT < time) {
          this.emit('timeout', encodeAddress(peerData.publicKey));
          this.removePeer(peerAddress);
        }
      }
    }, interval);
  };

  private makePacket = (packet: BasicPacket) => {
    const prepared: PreparedPacket = {
      t: new Date().getTime(),
      i: this.address,
      pk: this.publicKey,
      ek: this.encryptionKey,
      n: nacl.randomBytes(8),
      ...packet,
    };

    const encoded = bencode.encode(prepared);
    const signed: SignedPacket = {
      /** signature */
      s: nacl.sign.detached(encoded, this.keyPair.secretKey),
      /** payload */
      p: encoded,
    };
    return bencode.encode(signed);
  };

  // CAREFUL - not sure if this is safe for all circumstances. I'm using it for logging right now.
  private decodePacket = (packet: PreparedPacket): PreparedPacket => {
    return Object.entries(packet).reduce<Record<string, any>>(
      (decoded, [key, value]) => {
        if (typeof value === 'number') {
          decoded[key] = value;
        } else {
          decoded[key] = value.toString();
        }
        return decoded;
      },
      {},
    ) as PreparedPacket;
  };

  /** encrypts a packet with our secret key and the public key of a peer before sending */
  private encryptPacket = (packet: Uint8Array, peerPublicKey: string) => {
    const peerAddress = encodeAddress(peerPublicKey);
    const peer = this.clients[peerAddress];
    if (!peer) {
      throw new Error(
        `Could not send packet to ${peerAddress} - not peered to them!`,
      );
    }

    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const encrypted: EncryptedPacket = {
      /** nonce */
      n: nonce,
      /** our public encryption key */
      ek: bs58.encode(Buffer.from(this.encryptionKeyPair.publicKey)),
      /** encrypted payload */
      e: nacl.box(
        packet,
        nonce,
        bs58.decode(peer.encryptionKey),
        this.encryptionKeyPair.secretKey,
      ),
    };
    const encoded = bencode.encode(encrypted);
    return encoded;
  };

  private sendPacket = (packet: any) => {
    this.sendRaw(this.makePacket(packet));
  };

  private sendEncryptedPacket = (packet: any, peerPublicKey: string) => {
    this.sendRaw(this.encryptPacket(this.makePacket(packet), peerPublicKey));
  };

  private sendRaw = (raw: any) => {
    // TODO: understand this better, maybe migrate to use documented APIs.
    const wires: Wire[] = (this.identityTorrent as any).wires;
    for (const wire of wires) {
      const extendedHandshake = (wire as any).peerExtendedHandshake;
      if (
        extendedHandshake &&
        extendedHandshake.m &&
        extendedHandshake.m[EXT]
      ) {
        wire.extended(EXT, raw);
      }
    }
    const hash = toHex(nacl.hash(raw).slice(16));
    debug('sent', hash, 'to', wires.length, 'peers');
  };

  private onMessage = (senderAddress: string, wire: Wire, message: any) => {
    const hash = toHex(nacl.hash(message).slice(16));
    const time = new Date().getTime();
    debug(
      'raw message from',
      senderAddress,
      'len',
      message.length,
      'hash',
      hash,
    );
    if (!this.seenMessages[hash]) {
      const decoded: EncryptedPacket | SignedPacket = bencode.decode(message);
      let unpacked: SignedPacket | null = null;
      // encrypted packet?
      if (isEncryptedPacket(decoded)) {
        const encryptionKey = decoded.ek.toString();
        debug('message encrypted with', encryptionKey, decoded);
        const decrypted = nacl.box.open(
          decoded.e,
          decoded.n,
          bs58.decode(encryptionKey),
          this.encryptionKeyPair.secretKey,
        );

        if (decrypted) {
          unpacked = bencode.decode(Buffer.from(decrypted));
        } else {
          debug('decryption failed', decoded);
          unpacked = null;
        }
      } else {
        // we know this is a basic packet
        unpacked = decoded;
      }

      if (!unpacked) {
        debug('ignoring malformed or failed packet', decoded);
        return;
      }

      if (!unpacked.p) {
        debug('ignoring packet without paylaod', decoded);
        return;
      }

      debug('unpacked message', unpacked);
      const packet: PreparedPacket = bencode.decode(unpacked.p);
      const publicKey = packet.pk.toString();
      const address = encodeAddress(publicKey);
      const id = packet.i.toString();
      const checkSignature = nacl.sign.detached.verify(
        unpacked.p,
        unpacked.s,
        bs58.decode(publicKey),
      );
      // TODO: consider this requirement - does this mean we can't gossip packets from
      // mutual friends?
      const checkId = id === senderAddress;
      const checkTime = packet.t + PEER_TIMEOUT > time;
      debug('packet', this.decodePacket(packet));

      if (checkSignature && checkId && checkTime) {
        // message is authenticated
        const encryptionKey = packet.ek.toString();
        this.onSawPeer(publicKey, encryptionKey);
        // check packet types
        const packetType = packet.y.toString();
        if (packetType === PacketType.Message) {
          const messageString = packet.v.toString();
          let messageJson: any = null;
          try {
            messageJson = JSON.parse(messageString);
          } catch (err) {
            debug('Malformed message JSON:', messageString);
          }
          if (messageJson) {
            debug('message', address, messageJson, packet);
            this.emit('message', address, messageJson, packet);
          }
        } else if (packetType === PacketType.Ping) {
          debug('ping from', address);
          this.emit('ping', address);
        } else if (packetType === PacketType.Disconnect) {
          debug('disconnected from', address);
          this.removePeer(address);
        } else {
          debug('unknown packet type: ', packetType);
        }
      } else {
        debug(
          'dropping bad packet',
          hash,
          'checkSig',
          checkSignature,
          'checkId',
          checkId,
          'checkTime',
          checkTime,
          'senderAddress',
          senderAddress,
          'id',
          id,
          'publicKey',
          publicKey,
        );
      }

      // gossip all new messages to peers
      // FIXME: research flood attack mitigation
      this.sendRaw(message);
    } else {
      // seen this message
      debug('already saw message', hash);
    }
    this.seenMessages[hash] = time;
  };

  private onSawPeer = (publicKey: string, encryptionKey: string) => {
    const address = encodeAddress(publicKey);
    debug('saw peer', address, encryptionKey);
    const time = new Date().getTime();

    // ignore self
    if (address !== this.address) {
      // have we seen this peer recently?
      if (
        !this.clients[address] ||
        this.clients[address].lastSeen + PEER_TIMEOUT < time
      ) {
        this.clients[address] = {
          encryptionKey,
          publicKey,
          lastSeen: time,
        };
        debug('it was a new peer', address);
        this.emit('seen', address);
        // send a confirmation ping
        this.sendPacket(PACKETS.PING);

        // TODO: is this the best place to follow back?
        this.follow(address);
      } else {
        debug('it was an old peer', address);
        this.clients[address].encryptionKey = encryptionKey;
        this.clients[address].lastSeen = time;
      }
    } else {
      debug('it was self', address);
    }
  };
}
