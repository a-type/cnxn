import * as React from 'react';
import { useSelector } from 'react-redux';
import { connectionsSelector } from './connectionsSlice';

export function PeersList({
  onPeerClicked,
}: {
  onPeerClicked: (id: string) => any;
}) {
  const peers = useSelector(connectionsSelector);

  return (
    <div>
      <h2>Peers</h2>
      <ul>
        {peers.map((peerId) => (
          <li key={peerId}>
            {peerId}{' '}
            <button onClick={() => onPeerClicked(peerId)}>Select</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
