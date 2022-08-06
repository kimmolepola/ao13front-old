import {
  atom,
} from 'recoil';

export const user = atom<{
  token: string | undefined,
  username: string,
  score: number
} | undefined>({
  key: 'user',
  default: undefined,
});

export const somethingElse = {};
