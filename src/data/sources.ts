import { getClient } from './client';
import { User } from '../types/models';
import { usersCache } from './cache';

export async function preloadUser(address: string) {
  const client = await getClient();
  const users = await client.keyvalue<User>(address, {
    accessController: {
      write: [client.identity.id],
    },
  });
  await users.load();
  usersCache.put(address, users);
}

export function getUserStore(address: string) {
  const store = usersCache.get(address);

  if (!store) {
    // just-in-time loading
    throw preloadUser(address);
  }

  return store;
}

export function closeUserStore(address: string) {
  return usersCache.evict(address);
}
