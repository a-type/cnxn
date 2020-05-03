import { create } from 'ipfs';
import { libp2pBundle } from '../network/p2p';

export async function initIpfs() {
  const ipfs = await create({
    libp2p: libp2pBundle,
    EXPERIMENTAL: {
      pubsub: true,
      ipnsPubsub: true,
    },
  });

  return ipfs;
}
