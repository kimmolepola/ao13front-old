import { RefObject } from 'react';
import {
  atom,
} from 'recoil';

import * as types from './types';

export const chatMessages = atom<types.ChatMessage[]>({
  key: 'chatMessages',
  default: [],
});

export const objectIds = atom<string[]>({
  key: 'objectIds',
  default: [],
});

export const objects = atom<RefObject<{ [id: string]: types.GameObject }>>({
  key: 'objects',
  default: undefined,
  dangerouslyAllowMutability: true,
});

export const connectedIds = atom<string[]>({
  key: 'connectedIds',
  default: [],
});

export const ownId = atom<string | undefined>({
  key: 'ownId',
  default: undefined,
});

export const main = atom<boolean>({
  key: 'main',
  default: false,
});

export const peerConnections = atom<{ [id: string]: RTCPeerConnection }>({
  key: 'peerConnections',
  default: {},
});

export const channelsOrdered = atom<{ remoteId: string, channel: RTCDataChannel }[]>({
  key: 'channelsOrdered',
  default: [],
});

export const channelsUnordered = atom<{ remoteId: string, channel: RTCDataChannel }[]>({
  key: 'channelsUnordered',
  default: [],
});

export const connectionMessage = atom<string | undefined>({ key: 'connectionMessage', default: undefined });

export const user = atom<{
  token: string | undefined,
  username: string,
  score: number
} | undefined>({
  key: 'user',
  default: undefined,
});
