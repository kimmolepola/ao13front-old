import {
  atom,
} from 'recoil';

export const objects = atom<{ [id: string]: { username: string, score: number } }>({
  key: "objects",
  default: {},
})

export const ownId = atom<string | undefined>({
  key: 'ownId',
  default: undefined,
});

export const main = atom<string | undefined>({
  key: 'main',
  default: undefined,
});

export const remotes = atom<{ [id: string]: { peerConnection: any, orderedChannel: any, unorderedChannel: any }; }>({
  key: 'remotes',
  default: {},
});

export const channelsOrdered = atom<any[]>({
  key: 'channelsOrdered',
  default: [],
});

export const channelsUnordered = atom<any[]>({
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
