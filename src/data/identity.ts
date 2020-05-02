import { mnemonicToSeed } from 'bip39';
import hdkey from '@herajs/hdkey';

export async function generateKeyPair(mnemonic: string, password?: string) {
  const seed = await mnemonicToSeed(mnemonic, password);
  const key = hdkey.fromMasterSeed(seed);
  return key;
}
