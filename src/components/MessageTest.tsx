import * as React from 'react';
import { CnxnClient } from '../p2p/CnxnClient';
import { HostedMedia } from '../p2p/HostedMedia';
import { StreamingMedia } from './StreamingMedia';

const client = new CnxnClient();

export function MessageTest() {
  const [messages, setMessages] = React.useState<string[]>([]);
  const [media, setMedia] = React.useState<HostedMedia[]>([]);

  React.useEffect(() => {
    client.on('message', (data) => {
      setMessages((cur) => [...cur, `${data.sender}: ${data.text}`]);
    });
    client.on('media', (data) => {
      setMedia((cur) => [...cur, data.media]);
    });
  }, []);

  const [text, setText] = React.useState('');

  const sendMessage = React.useCallback(() => {
    client.broadcast(text);
    setText('');
  }, [text]);

  const [peerAddr, setPeerAddr] = React.useState('');

  const connect = React.useCallback(() => {
    client.connect(peerAddr);
  }, [peerAddr]);

  const handleFile = React.useCallback(
    (ev: React.ChangeEvent<HTMLInputElement>) => {
      console.log('FILE');
      const file = ev.target?.files?.item(0);
      console.log(file);
      if (!file) return;
      client.post(file);
    },
    [],
  );

  return (
    <div>
      <div>ID: {client.id}</div>
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
        <input type="file" onChange={handleFile} />
      </div>
      <div>
        {messages.map((m) => (
          <div key={m}>{m}</div>
        ))}
      </div>
      <div>
        {media.map((m) => (
          <StreamingMedia media={m} key={m.address} />
        ))}
      </div>
    </div>
  );
}
