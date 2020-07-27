declare module 'bs58check' {
  const bs58check: {
    decode(encoded: string): Buffer;
    encode(decoded: Buffer): string;
  };

  export default bs58check;
}
