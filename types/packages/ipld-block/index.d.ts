declare module 'ipld-block' {
  import CID from 'cids';

  class Block {
    constructor(data: Buffer, cid: any);
    readonly data: Buffer;
    readonly cid: CID;
  }

  export default Block;
}
