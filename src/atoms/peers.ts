import { atom } from 'recoil';

export const peersState = atom<string[]>({
  key: 'peers',
  default: [],
});
