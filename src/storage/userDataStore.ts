export const userDataStore = {
  connections: {
    list: (): string[] => {
      const stored = localStorage.getItem('userData_connections');
      if (!stored) return [];
      try {
        return JSON.parse(stored);
      } catch (err) {
        console.error('UserData connections store corrupted: ', stored);
        return [];
      }
    },
    add: (address: string) => {
      const stored = localStorage.getItem('userData_connections');
      try {
        const parsed: string[] = stored ? JSON.parse(stored) : [];
        parsed.push(address);
        localStorage.setItem('userData_connections', JSON.stringify(parsed));
      } catch (err) {
        console.error('UserData connections store corrupted: ', stored);
      }
    },
  },
};
