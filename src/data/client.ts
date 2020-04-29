import OrbitDB from 'orbit-db';
import { create } from 'ipfs';
import { Identity } from 'orbit-db-identity-provider';
import { ManualPromise } from '../utils/ManualPromise';

const clientPromise = new ManualPromise<OrbitDB>();

export async function createClient({ identity }: { identity: Identity }) {
  const node = await create({
    repo: './ipfs',
    EXPERIMENTAL: { pubsub: true },
    relay: { enabled: true, hop: { enabled: true, active: true } },
  });

  const orbitdb = await OrbitDB.createInstance(node, {
    identity,
  });
  console.log(orbitdb.id);

  clientPromise.resolve(orbitdb);

  return orbitdb;
}

/**
 * This async function won't return until the user has logged in.
 */
export function getClient() {
  return clientPromise;
}
