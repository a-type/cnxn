import { initIpfs } from './data/ipfs';

export async function testing() {
  const ipfs = await initIpfs();

  const topic = 'mytopic';
  console.log('Subscribing to topic ' + topic);

  const { id: myId } = await ipfs.id();

  ipfs.pubsub.subscribe(topic, (msg: any) => {
    if (msg.from === myId) return;
    console.log(`Message from: ${msg.from}: ${msg.data.toString()}`);
  });

  const frame = () => {
    const rand = Math.random().toFixed(3);
    console.log('Sending: ' + rand);
    ipfs.pubsub.publish(topic, `${rand}!`);
    console.log(ipfs.pubsub.peers(topic));
    ipfs.swarm.peers().then(console.log);
  };

  setInterval(frame, 10000);
}
