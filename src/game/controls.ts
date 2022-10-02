import { RefObject } from 'react';
import * as types from '../types';

export const handlePressed = (key: types.Keys, id: string | undefined, objects: RefObject<types.GameObject[]>) => {
  const o = objects.current?.find((x) => x.id === id);
  if (id && o && !o.keyDowns.includes(key)) {
    o.keyDowns.push(key);
  }
};

export const handleReleased = (key: types.Keys, id: string | undefined, objects: RefObject<types.GameObject[]>) => {
  const o = objects.current?.find((x) => x.id === id);
  if (id && o) {
    const index = o.keyDowns.findIndex((x: types.Keys) => x === key);
    if (index !== -1) o.keyDowns.splice(index, 1);
  }
};
