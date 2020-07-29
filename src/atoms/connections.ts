import { atom } from 'recoil';

export const connectionsState = atom({
  key: 'connections',
  default: [] as string[],
});
