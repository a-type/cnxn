declare module 'bugout' {
  import { EventEmitter } from 'events';

  type MethodRegisterFn<IncomingArgs, ReplyArgs = IncomingArgs> = {
    (
      address: string,
      args: IncomingArgs,
      reply: (response: ReplyArgs) => void,
    ): void;
  };

  type BugoutOptions = {
    seed?: string;
    announce?: string[];
  };

  type MethodDescription<InputArgs, ResponseArgs> = {
    input: InputArgs;
    response: ResponseArgs;
  };

  type MethodConfig = {
    [methodName: string]: MethodDescription;
  };

  type PeerRecord = {
    /** encryption key of peer */
    ek: string;
    /** public key of peer */
    pk: string;
    /** last time seen (epoch ms) */
    last: number;
  };

  class Bugout<
    MethodConfig extends MethodDescription = any
  > extends EventEmitter {
    constructor(addr?: BugoutOptions | string, options?: BugoutOptions);

    /** registers a remote API a peer can invoke */
    register<MethodName extends keyof MethodConfig>(
      methodName: MethodName,
      method: MethodRegisterFn<
        MethodConfig[MethodName]['input'],
        MethodConfig[MethodName]['response']
      >,
    ): void;

    /** the seed can be used to recreate the server's key in a new instance */
    seed: string;

    /** the public connection key for this server */
    address(): string;

    /** sends a freeform message */
    send(message: any): void;

    /** invokes an API method on the remote server */
    rpc<MethodName extends keyof MethodConfig>(
      methodName: MethodName,
      input: MethodConfig[MethodName]['input'],
      responseHandler: (result: MethodConfig[MethodName]['response']) => void,
    ): void;

    /** close the channel */
    close(): void;

    peers: Record<string, PeerRecord>;
  }

  export default Bugout;
}
