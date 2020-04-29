import { mnemonicToSeed } from 'bip39';
import hdkey from '@herajs/hdkey';
import Identities from 'orbit-db-identity-provider';
import migrate from 'localstorage-level-migration';

const keyMigrationPath = '/keys/migrate';

export async function generateKeyPair(mnemonic: string, password?: string) {
  const seed = await mnemonicToSeed(mnemonic, password);
  const key = hdkey.fromMasterSeed(seed);
  console.debug(key.privateKey);
  console.debug(key.publicKey);
  return key;
}

export async function importKeyPairToOrbitDBIdentity(key: {
  publicKey: string;
  privateKey: string;
}) {
  // first write to localstorage
  localStorage.setItem(keyMigrationPath, JSON.stringify(key));

  return Identities.createIdentity({
    id: 'local-id',
    migrate: migrate(keyMigrationPath),
  });
}
