declare module 'kappa-core' {
  import Feed from 'hypercore';

  export class KappaCore extends Feed {
    constructor(
      storageLocation: string | null,
      key?: Buffer,
      options?: FeedConstructorOptions & {
        multifeed: any;
      },
    );
    constructor(
      storageLocation: string | null,
      options?: FeedConstructorOptions & {
        multifeed: any;
      },
    );

    [viewName: string]: any;
  }

  export default KappaCore;
}
