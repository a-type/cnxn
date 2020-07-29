import * as React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { peersState } from '../atoms/peers';
import { activePeerSelector } from '../atoms/session';

export function PeersList() {
  const peers = useRecoilValue(peersState);
  const setActivePeer = useSetRecoilState(activePeerSelector);

  return (
    <div>
      <h2>Peers</h2>
      <ul>
        {peers.map((peerId) => (
          <li key={peerId}>
            {peerId}{' '}
            <button onClick={() => setActivePeer(peerId)}>Select</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
