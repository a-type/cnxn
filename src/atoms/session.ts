import { atom, selector } from 'recoil';

export const sessionState = atom<{ activePeer: string | null }>({
  key: 'session',
  default: { activePeer: null },
});

export const activePeerSelector = selector<string | null>({
  key: 'ActivePeer',
  get: ({ get }) => {
    const session = get(sessionState);
    return session.activePeer;
  },
  set: ({ set }, value) => {
    set(sessionState, (existing) => ({
      ...existing,
      activePeer: value,
    }));
  },
});
