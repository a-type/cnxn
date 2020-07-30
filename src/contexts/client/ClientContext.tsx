import * as React from 'react';
import { CnxnClient } from '../../p2p/CnxnClient';
import { client } from '../../p2p/singleton';
import { useClientStateSubscriptions } from './useClientStateSubscriptions';
import { useBootstrapPeers } from './useBootstrapPeers';

export const ClientContext = React.createContext<{ client: CnxnClient }>({
  client,
});

export function ClientProvider({ children }: { children: React.ReactNode }) {
  useClientStateSubscriptions();
  useBootstrapPeers();

  return <ClientContext.Provider value={{ client }} children={children} />;
}

export function useClient() {
  const { client } = React.useContext(ClientContext);
  return client;
}
