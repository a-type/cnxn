import * as React from 'react';
import { CnxnClient } from '../p2p/CnxnClient';
import { useSetRecoilState } from 'recoil';
import { messagesState } from '../atoms/messages';
import { peersState } from '../atoms/peers';

const client = new CnxnClient();

export const ClientContext = React.createContext<{ client: CnxnClient }>({
  client,
});

export function ClientProvider({ children }: { children: React.ReactNode }) {
  // wire up events to state management
  const setMessages = useSetRecoilState(messagesState);
  const setPeers = useSetRecoilState(peersState);

  React.useEffect(() => {
    function messageStateUpdater(data: { senderId: string; text: string }) {
      console.debug('Adding message:', data.text, 'from', data.senderId);
      setMessages((cur) => ({
        ...cur,
        [data.senderId]: {
          ...cur[data.senderId],
          history: [
            ...(cur[data.senderId]?.history ?? []),
            {
              text: data.text,
              timestamp: new Date().getTime(),
            },
          ],
        },
      }));
    }
    client.on('message', messageStateUpdater);

    function peerJoinedStateUpdater(peerId: string) {
      console.debug('Adding peer:', peerId);
      setPeers((cur) => {
        const set = new Set(cur);
        set.add(peerId);
        return Array.from(set);
      });
    }
    client.on('peerJoined', peerJoinedStateUpdater);

    function peerLeftStateUpdater(peerId: string) {
      console.debug('Removing peer:', peerId);
      setPeers((cur) => {
        const set = new Set(cur);
        set.delete(peerId);
        return Array.from(set);
      });
    }
    client.on('peerLeft', peerLeftStateUpdater);

    return function () {
      client.off('message', messageStateUpdater);
      client.off('peerJoined', peerJoinedStateUpdater);
      client.off('peerLeft', peerLeftStateUpdater);
    };
  }, [setMessages, setPeers]);

  return <ClientContext.Provider value={{ client }} children={children} />;
}

export function useClient() {
  const { client } = React.useContext(ClientContext);
  return client;
}
