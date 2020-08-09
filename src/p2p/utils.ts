import migrate from 'localstorage-level-migration';

// this is needed for orbitdb... for some reason.
export function migrateRawKeyPair(pair: {
  publicKey: string;
  privateKey: string;
}) {
  localStorage.setItem('/keys/migrate', JSON.stringify(pair));
  return migrate('/keys/migrate');
}
