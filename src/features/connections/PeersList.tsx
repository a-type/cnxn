import * as React from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { useSelector, useDispatch } from 'react-redux';
import { selectConnections } from './connections';
import { setActivePeer } from '../session/session';

export function PeersList() {
  const peers = useSelector(selectConnections);
  const dispatch = useDispatch();

  const handlePeerClick = (peerId: string) => {
    dispatch(setActivePeer(peerId));
  };

  return (
    <div>
      <h2>Peers</h2>
      <ul>
        {peers.map((peerId) => (
          <li key={peerId}>
            {peerId}{' '}
            <button onClick={() => handlePeerClick(peerId)}>Select</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
