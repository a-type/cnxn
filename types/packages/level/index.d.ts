declare module 'level' {
  import {
    AbstractLevelDOWN,
    AbstractOptions,
    AbstractGetOptions,
    AbstractBatch,
  } from 'abstract-leveldown';

  type Values<S> = S[keyof S];

  interface LevelWithPromises<S extends Record<string, any>>
    extends AbstractLevelDOWN<keyof S, Values<S>> {
    readonly location: string;
    readonly prefix: string;
    readonly version: string | number;
    destroy(location: string, cb: (err: Error | undefined) => void): void;
    destroy(
      location: string,
      prefix: string,
      cb: (err: Error | undefined) => void,
    ): void;
    get<K extends keyof S>(key: K, options?: AbstractGetOptions): Promise<S[K]>;
    put<K extends keyof S>(
      key: K,
      value: S[K],
      options?: AbstractOptions,
    ): Promise<void>;
    del<K extends keyof S>(key: K, options?: AbstractOptions): Promise<void>;
  }

  const LevelConstructor: {
    new <S extends Record<string, any>>(location: string): LevelWithPromises<S>;
    <S extends Record<string, any>>(location: string): LevelWithPromises<S>;
  };

  export default LevelConstructor;
}
