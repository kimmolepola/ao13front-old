import { useCallback } from 'react';
import { useRecoilValue } from 'recoil';

import * as atoms from '../../../../atoms';
import * as types from '../../../../types';

export const useLoopForMain = () => {
  const objects = useRecoilValue(atoms.objects);

  const loop = useCallback(() => {
    const data: { [id: string]: types.UpdateObject } = {};
    for (let i = (objects.current || []).length; i > -1; i--) {
      const o = objects.current?.[i];
      if (o) {
        data[o.id] = {
          uScore: o.score,
          uControlsUp: o.controlsOverChannelsUp,
          uControlsDown: o.controlsOverChannelsDown,
          uControlsLeft: o.controlsOverChannelsLeft,
          uControlsRight: o.controlsOverChannelsRight,
          uRotationSpeed: o.rotationSpeed,
          uSpeed: o.speed,
          uPositionX: o.positionX,
          uPositionY: o.positionY,
          uPositionZ: o.positionZ,
          uQuaternionX: o.quaternionX,
          uQuaternionY: o.quaternionY,
          uQuaternionZ: o.quaternionZ,
          uQuaternionW: o.quaternionW,
        };
      }
    }
    return { loop };
  }, [objects]);
};
