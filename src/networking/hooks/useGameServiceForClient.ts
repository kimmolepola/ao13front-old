import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { chatMessageTimeToLive } from '../../Game/parameters';

import { logError } from '../utils';

import * as atoms from '../../atoms';
import * as types from '../../types';

export const useGameServiceForClient = () => {
  const orderedChannels = useRecoilValue(atoms.channelsOrdered);
  const unorderedChannels = useRecoilValue(atoms.channelsUnordered);
  const objects = useRecoilValue(atoms.objects);
  const [objectIds, setObjectIds] = useRecoilState(atoms.objectIds);
  const [chatMessages, setChatMessages] = useRecoilState(atoms.chatMessages);

  const sendOnUnorderedChannels = useCallback((data: types.Controls) => {
    const stringData = JSON.stringify(data);
    unorderedChannels.forEach((x) => {
      try {
        x.channel.send(stringData);
      } catch (error) {
        logError(error, data);
      }
    });
  }, [unorderedChannels]);

  const sendOnOrderedChannels = useCallback((data: types.ChatMessageFromClient) => {
    const dataString = JSON.stringify(data);
    orderedChannels.forEach((x) => {
      try {
        x.channel.send(dataString);
      } catch (error) {
        logError(error, data);
      }
    });
  }, [orderedChannels]);

  const onReceiveData = (
    remoteId: string,
    data: types.NetData,
  ) => {
    switch (data.type) {
      case types.NetDataType.AllObjectIds:
        setObjectIds(data.ids);
        break;
      case types.NetDataType.Update: {
        objectIds.forEach((id) => {
          const o = objects.current?.[id];
          const u = data.data[id];
          if (o && u) {
            o.controlsUp += u.controlsUp || 0;
            o.controlsDown += u.controlsDown || 0;
            o.controlsLeft += u.controlsLeft || 0;
            o.controlsUp += u.controlsUp || 0;
            o.rotationSpeed = u.rotationSpeed || 0;
            o.speed = u.speed || 0;
            o.backendPositionX = u.positionX || 0;
            o.backendPositionY = u.positionY || 0;
            o.backendPositionZ = u.positionZ || 0;
            o.backendQuaternionX = u.quaternionX || 0;
            o.backendQuaternionY = u.quaternionY || 0;
            o.backendQuaternionZ = u.quaternionZ || 0;
            o.backendQuaternionW = u.quaternionW || 0;
          }
        });
        break;
      }
      case types.NetDataType.ChatMessageFromMain: {
        const message = {
          ...data,
          username: objects.current?.[remoteId]?.username || '',
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
  return { onReceiveData, sendOnOrderedChannels, sendOnUnorderedChannels };
};
