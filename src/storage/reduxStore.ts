import localForage from 'localforage';

export const reduxStore = localForage.createInstance({
  name: 'cnxn_redux',
});
