declare module 'cids' {
  export class CID {
    constructor(baseEncodedString: string);
    constructor(buffer: Buffer);
    constructor(
      version: number,
      multicodec: string,
      multihash: Buffer,
      encoding?: string,
    );
    readonly version: number;
    readonly codec: string;
    readonly multibaseName: string;
    readonly buffer: Buffer;
    readonly prefix: string;
    toString(base?: string): string;
    toV0(): CID;
    toV1(): CID;
    toBaseEncodedString(base?: string): string;
    equals(cid: CID): boolean;
    static isCID(cid: any): boolean;
    static validateCID(cid: CID): void;
  }
  export default CID;
}
