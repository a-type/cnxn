import Libp2p from 'libp2p';
import WebSockets from 'libp2p-websockets';
import SECIO from 'libp2p-secio';
import MPLEX from 'libp2p-mplex';
import Bootstrap from 'libp2p-bootstrap';
import WebRTC from 'libp2p-webrtc-star';
import PubSubPeerDiscovery from 'libp2p-pubsub-peer-discovery';
import GossipSub from 'libp2p-gossipsub';
import KadDHT from 'libp2p-kad-dht';
import pipe from 'it-pipe';

export async function createNode() {
  const node = await Libp2p.create({
    modules: {
      transport: [WebSockets, WebRTC],
      connEncryption: [SECIO],
      streamMuxer: [MPLEX],
      pubsub: GossipSub,
      peerDiscovery: [Bootstrap, PubSubPeerDiscovery],
      dht: KadDHT,
    },
    config: {
      pubsub: {
        enabled: true,
        emitSelf: true,
      },
      relay: {
        // Circuit Relay options (this config is part of libp2p core configurations)
        enabled: true, // Allows you to dial and accept relayed connections. Does not make you a relay.
        hop: {
          enabled: true, // Allows you to be a relay for other peers
          active: true, // You will attempt to dial destination peers if you are not connected to them
        },
      },
      dht: {
        kBucketSize: 20,
        enabled: false,
        randomWalk: {
          enabled: false,
        },
      },
      peerDiscovery: {
        autoDial: true,
        [Bootstrap.tag]: {
          enabled: false,
          list: [
            '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
            '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
            '/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
            '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
            '/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
            '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
            '/dns4/ams-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLer265NRgSp2LA3dPaeykiS1J6DifTC88f5uVQKNAd',
            '/dns4/lon-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLMeWqB7YGVLJN3pNLQpmmEk35v6wYtsMGLzSr5QBU3',
            '/dns4/sfo-3.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLPppuBtQSGwKDZT2M73ULpjvfd3aZ6ha4oFGL1KrGM',
            '/dns4/sgp-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLSafTMBsPKadTEgaXctDQVcqN88CNLHXMkTNwMKPnu',
            '/dns4/nyc-1.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLueR4xBeUbY9WZ9xGUUxunbKWcrNFTDAadQJmocnWm',
            '/dns4/nyc-2.bootstrap.libp2p.io/tcp/443/wss/p2p/QmSoLV4Bbm51jM9C4gDYZQ9Cy3U6aXMJDAbzgu2fzaDs64',
            '/dns4/node0.preload.ipfs.io/tcp/443/wss/p2p/QmZMxNdpMkewiVZLMRxaNxUeZpDUb34pWjZ1kZvsd16Zic',
            '/dns4/node1.preload.ipfs.io/tcp/443/wss/p2p/Qmbut9Ywz9YEDrz8ySBSgWyJk41Uvm2QJPhwDJzJyGFsD6',
          ],
        },
        [PubSubPeerDiscovery.tag]: {
          interval: 5000,
          topics: ['cnxn._peer-discovery._p2p._pubsub'],
          listenOnly: false,
        },
        [WebRTC.tag]: {
          enabled: true,
        },
      },
      EXPERIMENTAL: {
        pubsub: true,
      },
    },
    metrics: {
      enabled: true,
    },
  });

  return node;
}

export async function initializeNetwork() {
  const node = await createNode();

  // Add the signaling server address, along with our PeerId to our multiaddrs list
  // libp2p will automatically attempt to dial to the signaling server so that it can
  // receive inbound connections from other peers
  const webrtcAddr = '/ip4/127.0.0.1/tcp/9090/wss/p2p-webrtc-star';
  node.peerInfo.multiaddrs.add(webrtcAddr);

  node.on('peer:discovery', (peer: any) => {
    console.log(`Discovered %s`, peer.id.toB58String());
  });
  node.on('peer:connect', async (peer: any) => {
    console.log(`Connected to %s`, peer.id.toB58String());

    const { stream } = await node.dialProtocol(peer, 'protocolName');

    pipe(['hey, Im ' + node.peerInfo.id.toB58String()], stream);
  });

  await node.start();

  console.log(`My ID is %s`, node.peerInfo.id.toB58String());

  (window as any)['node'] = node;

  node.handle('protocolName', ({ stream }: any) => {
    pipe(stream, async function (source) {
      for await (const msg of source) {
        console.log(msg.toString());
      }
    });
  });

  return node;
}
