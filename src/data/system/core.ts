import hyperswarm from 'hyperswarm-web';
import { createHash } from 'crypto';
import { Duplex } from 'stream';

class FakeStream extends Duplex {
  private message: string;

  constructor(message: string) {
    super();
    this.message = message;
    console.log('initalized with message ' + message);
  }

  _read(size: number) {
    const read = this.message.substr(0, size);
    this.message = this.message.substr(size);
    if (!read) return;
    this.push(read);
  }

  _write(chunk: any, encoding: string, next: () => void) {
    console.log(chunk.toString());
    next();
  }
}

export function connect() {
  const swarm = hyperswarm({
    wsProxy: 'ws://localhost:4977',
  });

  const topic = createHash('sha256').update('my-hyperswarm-topic').digest();

  console.log('Joining ' + topic);
  swarm.join(topic);

  const fakeStream = new FakeStream('hello ' + Math.random().toFixed(3));

  swarm.on('connection', (socket: any, details: any) => {
    console.log('new connection!', details);

    socket.pipe(fakeStream).pipe(socket);
  });
}
