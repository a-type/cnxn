export enum ProtocolType {
  Message,
  MediaBroadcast,
}

export type Message = {
  type: ProtocolType.Message;
  text: string;
};

export type MediaBroadcast = {
  type: ProtocolType.MediaBroadcast;
  address: string;
};

export type ProtocolPacket = Message | MediaBroadcast;

export function message(text: string): Message {
  return {
    type: ProtocolType.Message,
    text,
  };
}

export function mediaBroadcast(address: string): MediaBroadcast {
  return {
    type: ProtocolType.MediaBroadcast,
    address,
  };
}

export function toProtocolPacket(data: any): ProtocolPacket | null {
  if (data.type !== undefined) {
    return data as ProtocolPacket;
  }
  return null;
}
