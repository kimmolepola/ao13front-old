import { RefObject } from 'react';
import {
  atom,
} from 'recoil';

import * as types from './types';

export const turnCredentials = atom<{ username: string, password: string } | undefined>({
  key: 'turnCredentials',
  default: undefined,
});

export const score = atom<number>({
  key: 'score',
  default: 0,
});

export const windowHeight = atom<number>({
  key: 'windowHeight',
  default: window.innerHeight,
});

export const overlayInfotext = atom<RefObject<HTMLDivElement> | undefined>({
  key: 'overlayInfotext',
  default: undefined,
  dangerouslyAllowMutability: true,
});

export const chatMessages = atom<types.ChatMessage[]>({
  key: 'chatMessages',
  default: [],
});

export const objectIds = atom<string[]>({
  key: 'objectIds',
  default: [],
});

export const connectedIdsOnMain = atom<string[]>({
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
