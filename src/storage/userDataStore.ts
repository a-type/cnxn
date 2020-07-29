import localForage from 'localforage';

const connections = localForage.createInstance({
  name: 'userData_connections',
});

export const userDataStore = {
  connections: {
    list: async (): Promise<string[]> => {
      const stored = await connections.getItem<string[]>('addresses');
      return stored || [];
    },
    add: async (address: string) => {
      const stored = await connections.getItem<string[]>('addresses');
      const set = new Set(stored || []);
      set.add(address);
      connections.setItem('addresses', Array.from(set));
    },
    remove: async (address: string) => {
      const stored = await connections.getItem<string[]>('addresses');
      connections.setItem(
        'addresses',
        stored.filter((a) => a !== address),
      );
    },
  },
};
