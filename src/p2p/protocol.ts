import { Manifest } from '../types';

export enum ProtocolType {
  Message,
  ManifestUpdate,
}

export type MessagePacket = {
  type: ProtocolType.Message;
  text: string;
};

export type ManifestPacket = {
  type: ProtocolType.ManifestUpdate;
  manifest: Manifest;
};

export type ProtocolPacket = MessagePacket | ManifestPacket;

export function message(data: Omit<MessagePacket, 'type'>): MessagePacket {
  return {
    type: ProtocolType.Message,
    ...data,
  };
}

export function manifestUpdate(
  data: Omit<ManifestPacket, 'type'>,
): ManifestPacket {
  return {
    type: ProtocolType.ManifestUpdate,
    ...data,
  };
}

export function toProtocolPacket(data: any): ProtocolPacket | null {
  if (data.type !== undefined) {
    return data as ProtocolPacket;
  }
  return null;
}
