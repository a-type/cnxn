import {
  IPFS,
  create as createIpfs,
  PubSubMessage,
  Connection,
  PubSub,
} from 'ipfs';
import { EventEmitter } from 'events';
import makeDebug from 'debug';
import { Manifest } from '../types';
import * as protocol from './protocol';
import { join as pathJoin } from 'path';
import OrbitDB, { DocumentStore } from 'orbit-db';
import Identities from 'orbit-db-identity-provider';
import { migrateRawKeyPair } from './utils';

const debug = makeDebug('cnxn');

export type CnxnOptions = {
  publicKey?: string;
  privateKey?: string;
};

export class CnxnClient<
  TProfile extends Object = any,
  TVault extends Object = any
> extends EventEmitter {
  private _ipfs: IPFS | null = null;
  private _orbit: OrbitDB | null = null;
  private _initializedPromise: Promise<void>;

  private _manifestStorage = new Map<string, DocumentStore<Manifest>>();

  constructor(options: CnxnOptions) {
    super();

    this._initializedPromise = this.initialize(options);
  }

  get id() {
    return this._orbit?.id;
  }

  // Public API

  /**
   * Broadcast a message to all listeners of a topic
   */
  broadcast = async (topic: string, message: any) => {
    await this._initializedPromise;
    this._ipfs!.pubsub.publish(topic, message);
  };

  /**
   * Send a message to a specific user
   */
  send = async (userId: string, message: any) => {
    // TODO: get public key of other user
    // TODO: broadcast message encrypted with public key
    throw new Error('Not yet implemented');
  };

  /**
   * Begin serving a file to connected peers
   */
  addFile = async (
    file: File | Buffer | string,
    options?: {
      path?: string;
      fileName?: string;
    },
  ) => {
    const fileName =
      options?.fileName || (file instanceof File ? file.name : undefined);
    if (!fileName) {
      // TODO: generate name?
      throw new Error(
        `Tried to add file which was not a File instance and no fileName was provided`,
      );
    }

    await this._initializedPromise;
    // add file to IPFS
    const hosted = await this._ipfs!.files.write(
      pathJoin(options?.path ?? '', fileName),
      file,
      {
        parents: true,
      },
    );
    // pin file
    await this._ipfs!.pin.add(hosted.cid);
    // return cid and size
    // TODO: wrap in abstraction?
    return hosted;
  };

  /**
   * Stop serving a file to connected peers
   */
  removeFile = async (fileId: string) => {
    await this._initializedPromise;
    await this._ipfs!.pin.rm(fileId);
    // TODO: broadcast unpin to peers?
  };

  /**
   * Download a file from the network
   */
  getFile = async (fileId: string) => {
    await this._initializedPromise;
    const iterable = this._ipfs!.files.read(fileId);
    const chunks = [];
    for await (const chunk of iterable) {
      chunks.push(chunk);
    }
    return Buffer.concat(chunks);
  };

  /**
   * Update public profile data and send to peers
   */
  setProfile = async (profileData: TProfile) => {
    const fileData = await this.addFile(JSON.stringify(profileData));
    // update manifest
    const existingManifest = await this.getLocalManifest();
    existingManifest.profileCid = fileData.cid;
    await this.storeLocalManifest(existingManifest);
  };

  /**
   * Retrieve current profile data for a user
   */
  getProfile = async (userId: string): Promise<TProfile | null> => {
    const manifest = await this.getManifest(userId);
    if (!manifest.profileCid) {
      return null;
    }

    const profileBuffer = await this.getFile(manifest.profileCid);
    const profileString = profileBuffer.toString();
    debug('profile read', profileString);
    const profileJson = JSON.parse(profileString);
    this.emit('profile', {
      profile: profileJson as TProfile,
    });
    return profileJson as TProfile;
  };

  /**
   * Retrieve the current profile of the local user
   */
  getLocalProfile = async (): Promise<TProfile | null> => {
    await this._initializedPromise;
    return this.getProfile(this.id!);
  };

  /**
   * Set vault (private) data for the local user
   */
  setVault = async (vaultData: TVault) => {
    // TODO FIXME: encrypt!
    const fileData = await this.addFile(JSON.stringify(vaultData));
    // update manifest
    const existingManifest = await this.getLocalManifest();
    existingManifest.vaultCid = fileData.cid;
    await this.storeLocalManifest(existingManifest);
  };

  /**
   * Get vault (private) data for the local user
   */
  getVault = async (): Promise<TVault | null> => {
    const manifest = await this.getLocalManifest();
    if (!manifest.vaultCid) {
      return null;
    }

    const vaultBuffer = await this.getFile(manifest.vaultCid);
    const vaultString = vaultBuffer.toString();
    const vaultJson = JSON.parse(vaultString);
    // TODO FIXME: decrypt!
    this.emit('vault', {
      vault: vaultJson as TVault,
    });
    return vaultJson as TVault;
  };

  /**
   * Joins a pubsub topic and introduces this user to their peers on
   * that topic
   */
  joinTopic = async (topic: string) => {
    await this._initializedPromise;
    this._ipfs!.pubsub.subscribe(topic, this.handleTopicMessage);
    // introduce ourselves
    const myAddress = await this.getLocalManifestAddress();
    this.broadcast(
      topic,
      protocol.introduction({
        address: myAddress,
        id: this.id!,
      }),
    );
  };

  // Private API

  private initialize = async (options: CnxnOptions = {}) => {
    this._ipfs = await createIpfs({
      EXPERIMENTAL: {
        pubsub: true,
      },
      relay: {
        enabled: true,
        hop: {
          enabled: true,
          active: true,
        },
      },
      libp2p: {
        config: {
          dht: {
            enabled: true,
            clientMode: true,
          },
        },
      },
    });

    const orbitOptions =
      options.privateKey && options.publicKey
        ? {
            identity: Identities.createIdentity({
              id: 'local-id',
              migrate: migrateRawKeyPair({
                privateKey: options.privateKey,
                publicKey: options.publicKey,
              }),
            }),
          }
        : {};

    this._orbit = OrbitDB.createInstance(this._ipfs, {
      ...orbitOptions,
    });
    const myManifest = await this._orbit.docs<Manifest>('manifest');
    await myManifest.load();
    this._manifestStorage.set(this._orbit.id, myManifest);

    this.joinTopic(this._orbit.id);
    this._ipfs.libp2p.connectionManager.on(
      'peer:connect',
      this.handlePeerConnect,
    );

    debug('ready');
    this.emit('ready');
  };

  private getLocalManifestAddress = async (): Promise<string> => {
    await this._initializedPromise;
    const myManifestStore = this._manifestStorage.get(this.id!);
    return myManifestStore!.address;
  };

  private getManifest = async (userId: string): Promise<Manifest> => {
    const myManifestStore = this._manifestStorage.get(userId);
    const [myManifest] = myManifestStore ? myManifestStore.get('manifest') : [];
    if (myManifest) return myManifest;
    return {
      _id: userId,
      lastModified: new Date().getTime(),
      profileCid: null,
      vaultCid: null,
    };
  };

  private getLocalManifest = async () => {
    await this._initializedPromise;
    return this.getManifest(this.id!);
  };

  private storeLocalManifest = async (manifest: Manifest) => {
    await this._initializedPromise;
    const myManifestStore = this._manifestStorage.get(this.id!);
    myManifestStore!.put(manifest, { pin: true });
  };

  private handleTopicMessage = (message: PubSubMessage) => {
    const protocolPacket = protocol.toProtocolPacket(message.data);

    if (!protocolPacket) {
      debug('ignoring non-protocol message', message.data);
      return;
    }

    switch (protocolPacket.type) {
      case protocol.ProtocolType.Introduction:
        this.handleIntroduction(protocolPacket, message);
        break;
      case protocol.ProtocolType.Message:
        this.handleMessage(protocolPacket, message);
        break;
      case protocol.ProtocolType.Greeting:
        this.handleGreeting(protocolPacket, message);
        break;
    }

    if (message.topicIDs.includes(this.id!)) {
      this.handleSelfTopicMessage(message);
    } else {
      this.handleOtherTopicMessage(message);
    }
  };

  private handleSelfTopicMessage = (message: PubSubMessage) => {
    debug('[pubsub] self topic', message);
  };

  private handleOtherTopicMessage = (message: PubSubMessage) => {
    debug('[pubsub] other topic', message);
  };

  private handleIntroduction = async (
    packet: protocol.IntroductionPacket,
    originalMessage: PubSubMessage,
  ) => {
    debug('got introduction', packet);
    await this._initializedPromise;

    // add user's manifest as a readable db
    const manifestDb = await this._orbit!.docs<Manifest>(packet.address);
    this._manifestStorage.set(packet.id, manifestDb);
    await manifestDb.load();

    // respond with a greeting to the sender (todo: not broadcast?)
    const myAddress = await this.getLocalManifestAddress();
    for (const topic of originalMessage.topicIDs) {
      this.broadcast(
        topic,
        protocol.greeting({
          id: this.id!,
          address: myAddress,
          to: packet.id,
        }),
      );
    }
  };

  private handleGreeting = async (
    packet: protocol.GreetingPacket,
    originalMessage: PubSubMessage,
  ) => {
    debug('got greeting', packet);
    await this._initializedPromise;

    // ignore greetings for other people
    if (packet.to !== this.id!) {
      debug("ignoring someone else's greeting", packet.to);
      return;
    }

    // add user's manifest as a readable db
    const manifestDb = await this._orbit!.docs<Manifest>(packet.address);
    this._manifestStorage.set(packet.id, manifestDb);
    await manifestDb.load();
  };

  private handleMessage = (
    packet: protocol.MessagePacket,
    originalMessage: PubSubMessage,
  ) => {
    debug('got message', packet);
    this.emit('message', {
      text: packet.text,
      from: originalMessage.from,
    });
  };

  private handlePeerConnect = async (connection: Connection) => {
    debug('peer connect', connection.remotePeer);
  };
}
