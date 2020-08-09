declare module 'level' {
  import { LevelUp } from 'levelup';

  const level: (name: string) => LevelUp;

  export default level;
}
