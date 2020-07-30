import * as React from 'react';
import { userDataStore } from '../../storage/userDataStore';
import { client } from '../../p2p/singleton';

export function useBootstrap() {
  React.useEffect(() => {
    (async () => {
      const connections = await userDataStore.connections.list();
      for (const id of connections) {
        client.connect(id);
      }
    })();

    // TODO: friendship flow
    // for now, add-back anyone who follows
    async function followBack(address: string) {
      client.connect(address);
      await userDataStore.connections.add(address);
      console.debug('followed back', address);
    }
    client.on('peerJoined', followBack);
    return () => {
      client.off('peerJoined', followBack);
    };
  }, []);
}
