import { useRecoilState, useRecoilValue } from 'recoil';

import { chatMessageTimeToLive } from '../../Game/parameters';

import * as atoms from '../../atoms';
import * as types from '../../types';

export const useReceiveOnClient = () => {
  const objects = useRecoilValue(atoms.objects);
  const [chatMessages, setChatMessages] = useRecoilState(atoms.chatMessages);

  const onReceive = (
    data: types.NetData,
  ) => {
    switch (data.type) {
      case types.NetDataType.State: {
        const deleteIndexes = [];
        for (let i = (objects.current || []).length - 1; i > -1; i--) {
          const o = (objects.current || [])[i];
          const s = data.data[o.id];
          if (!s) {
            deleteIndexes.push(i);
          } else {
            o.username = s.sUsername;
          }
        }
        deleteIndexes.forEach((i) => {
          objects.current?.splice(i, 1);
        });

        Object.values(data.data).forEach((s) => {
          if (objects.current) {
            if (!objects.current.some((x) => x.id === s.sId)) {
              objects.current.push({
                id: s.sId,
                username: s.sUsername,
                score: s.sScore,
                controlsUp: 0,
                controlsDown: 0,
                controlsLeft: 0,
                controlsRight: 0,
                controlsOverChannelsUp: 0,
                controlsOverChannelsDown: 0,
                controlsOverChannelsLeft: 0,
                controlsOverChannelsRight: 0,
                rotationSpeed: s.sRotationSpeed,
                speed: s.sSpeed,
                positionX: s.sPositionX,
                positionY: s.sPositionY,
                positionZ: s.sPositionZ,
                quaternionX: s.sQuaternionX,
                quaternionY: s.sQuaternionY,
                quaternionZ: s.sQuaternionY,
                quaternionW: s.sQuaternionW,
                backendPositionX: s.sPositionX,
                backendPositionY: s.sPositionY,
                backendPositionZ: s.sPositionZ,
                backendQuaternionX: s.sQuaternionX,
                backendQuaternionY: s.sQuaternionY,
                backendQuaternionZ: s.sQuaternionZ,
                backendQuaternionW: s.sQuaternionW,
              });
            }
          }
        });
        break;
      }
      case types.NetDataType.Update: {
        if (objects.current) {
          for (let i = (objects.current).length; i > 0; i--) {
            const o = (objects.current)[i];
            const u = data.data[o.id];
            if (u) {
              o.score = u.uScore;
              o.controlsOverChannelsUp += u.uControlsUp || 0;
              o.controlsDown += u.uControlsDown || 0;
              o.controlsLeft += u.uControlsLeft || 0;
              o.controlsUp += u.uControlsUp || 0;
              o.rotationSpeed = u.uRotationSpeed || 0;
              o.speed = u.uSpeed || 0;
              o.backendPositionX = u.uPositionX || 0;
              o.backendPositionY = u.uPositionY || 0;
              o.backendPositionZ = u.uPositionZ || 0;
              o.backendQuaternionX = u.uQuaternionX || 0;
              o.backendQuaternionY = u.uQuaternionY || 0;
              o.backendQuaternionZ = u.uQuaternionZ || 0;
              o.backendQuaternionW = u.uQuaternionW || 0;
            }
          }
        }
        break;
      }
      case types.NetDataType.ChatMessageFromMain: {
        const message = {
          ...data,
          username: (objects.current || []).find((x) => x.id === data.userId)?.username || '',
        };
        setChatMessages([message, ...chatMessages]);
        setTimeout(
          () => setChatMessages((x) => x.filter((xx) => xx !== message)),
          chatMessageTimeToLive,
        );
        break;
      }
      default:
        break;
    }
  };
  return { onReceive };
};
