export enum ProtocolType {
  Message,
  Introduction,
  Greeting,
}

export type MessagePacket = {
  type: ProtocolType.Message;
  text: string;
};

export type IntroductionPacket = {
  type: ProtocolType.Introduction;
  address: string;
  id: string;
};

export type GreetingPacket = {
  type: ProtocolType.Greeting;
  address: string;
  id: string;
  to: string;
};

export type ProtocolPacket =
  | MessagePacket
  | IntroductionPacket
  | GreetingPacket;

export function message(data: Omit<MessagePacket, 'type'>): MessagePacket {
  return {
    type: ProtocolType.Message,
    ...data,
  };
}

export function introduction(
  data: Omit<IntroductionPacket, 'type'>,
): IntroductionPacket {
  return {
    type: ProtocolType.Introduction,
    ...data,
  };
}

export function greeting(data: Omit<GreetingPacket, 'type'>): GreetingPacket {
  return {
    type: ProtocolType.Greeting,
    ...data,
  };
}

export function toProtocolPacket(data: any): ProtocolPacket | null {
  if (data.type !== undefined) {
    return data as ProtocolPacket;
  }
  return null;
}
