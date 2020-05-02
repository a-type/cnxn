declare module 'kappa-view' {
  import KappaCore from 'kappa-core';

  export type View = any;
  function view(
    store: any,
    creator: (
      db: KappaCore,
    ) => {
      map(entries: any[], next: () => void): void;
      api: {
        [key: string]: any;
      };
    },
  ): View;

  export default view;
}
