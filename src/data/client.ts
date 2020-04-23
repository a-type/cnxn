import OrbitDB from 'orbit-db';
import { create } from 'ipfs';

export async function createClient() {
  const node = await create({
    preload: { enabled: false },
    repo: './ipfs',
    EXPERIMENTAL: { pubsub: true },
    config: {
      Bootstrap: [],
      Addresses: { Swarm: [] },
    },
  });

  const orbitdb = await OrbitDB.createInstance(node);
  console.log(orbitdb.id);

  const defaultOptions = {
    accessController: {
      write: [orbitdb.identity.id],
    },
  };

  const documentStoreOptions = {
    ...defaultOptions,
    indexBy: 'hash',
  };

  // creates a new document database
  const pieces = await orbitdb.docs('pieces', documentStoreOptions);
  // loads the database contents into memory
  await pieces.load();

  const user = await orbitdb.kvstore('user', defaultOptions);
  await user.load();
  await user.set('pieces', pieces.id);

  console.log(`Pieces: ${pieces.id}`);

  return {
    node,
    pieces,
    user,
  };
}
