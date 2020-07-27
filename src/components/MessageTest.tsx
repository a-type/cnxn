import * as React from 'react';
import { P2PClient } from '../p2p/P2PClient';

const p2p = new P2PClient();

export function MessageTest() {
  const [messages, setMessages] = React.useState<string[]>([]);

  React.useEffect(() => {
    p2p.on('message', (address, data) => {
      setMessages((cur) => [...cur, data.message]);
    });
  }, []);

  const [text, setText] = React.useState('');

  const sendMessage = React.useCallback(() => {
    p2p.send({ message: text });
    setText('');
  }, [text]);

  const [peerAddr, setPeerAddr] = React.useState('');

  const connect = React.useCallback(() => {
    p2p.follow(peerAddr);
    console.log(p2p.listTorrents());
  }, [peerAddr]);

  return (
    <div>
      <div>Address: {p2p.address}</div>
      <div>
        <span>Connect: </span>
        <input
          value={peerAddr}
          onChange={(ev) => setPeerAddr(ev.target.value)}
        />
        <button onClick={connect}>Connect</button>
      </div>
      <div>
        <input onChange={(ev) => setText(ev.target.value)} value={text} />
        <button onClick={sendMessage}>Send</button>
      </div>
      <div>
        {messages.map((m) => (
          <div key={m}>{m}</div>
        ))}
      </div>
    </div>
  );
}
