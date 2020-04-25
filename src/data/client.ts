import OrbitDB from 'orbit-db';
import { create } from 'ipfs';

async function createClient() {
  const node = await create({
    repo: './ipfs',
    EXPERIMENTAL: { pubsub: true },
    relay: { enabled: true, hop: { enabled: true, active: true } },
  });

  const orbitdb = await OrbitDB.createInstance(node);
  console.log(orbitdb.id);

  return orbitdb;
}

const clientPromise = createClient();

export function getClient() {
  return clientPromise;
}
