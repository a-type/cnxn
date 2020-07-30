import bs58Check from 'bs58check';
import ripemd160 from 'ripemd160';
import nacl from 'tweetnacl';

const SEED_PREFIX = '490a';
const ADDRESS_PREFIX = '55';

/** TODO: use mnemonic instead? */
export function generateSeed() {
  return bs58Check.encode(
    Buffer.concat([
      Buffer.from(SEED_PREFIX, 'hex'),
      Buffer.from(nacl.randomBytes(32)),
    ]),
  );
}

export function generateKeyPair(seed: string) {
  return nacl.sign.keyPair.fromSeed(
    Uint8Array.from(bs58Check.decode(seed)).slice(2),
  );
}

export function constructSeedBlob(address: string) {
  if (typeof File !== 'undefined') {
    return new File([address], address);
  } else {
    const buf = Buffer.from(address);
    // @ts-ignore
    buf.name = address;
    return buf;
  }
}

export function encodeAddress(publicKey: string) {
  return bs58Check.encode(
    Buffer.concat([
      Buffer.from(ADDRESS_PREFIX, 'hex'),
      new ripemd160()
        .update(Buffer.from(nacl.hash(Uint8Array.from(Buffer.from(publicKey)))))
        .digest(),
    ]),
  );
}

export function toHex(thing: Uint8Array) {
  return thing.reduce(function (memo, i) {
    return memo + ('0' + i.toString(16)).slice(-2);
  }, '');
}
