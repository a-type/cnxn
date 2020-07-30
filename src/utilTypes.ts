import { PayloadActionCreator } from '@reduxjs/toolkit';

export type ActionPayload<T> = T extends PayloadActionCreator<infer T>
  ? T
  : never;
