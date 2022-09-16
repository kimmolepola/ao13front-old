import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { chatMessageTimeToLive } from '../../Game/parameters';

import { logError } from '../utils';

import * as atoms from '../../atoms';
import * as types from '../../types';

export const useGameService = () => {
  const orderedChannels = useRecoilValue(atoms.channelsOrdered);
  const unorderedChannels = useRecoilValue(atoms.channelsUnordered);
  const objects = useRecoilValue(atoms.objects);
  const [objectIds, setObjectIds] = useRecoilState(atoms.objectIds);
  const [chatMessages, setChatMessages] = useRecoilState(atoms.chatMessages);

  const sendOnUnorderedChannels = useCallback((data: types.Controls) => {
    const stringData = JSON.stringify(data);
    unorderedChannels.forEach((x) => {
      try {
        x.send(stringData);
      } catch (error) {
        logError(error, data);
      }
    });
  }, [unorderedChannels]);

  const sendOnOrderedChannels = useCallback((data: types.ChatMessageFromClient) => {
    const dataString = JSON.stringify(data);
    orderedChannels.forEach((x) => {
      try {
        x.send(dataString);
      } catch (error) {
        logError(error, data);
      }
    });
  }, [orderedChannels]);

  const onReceiveData = (
    remoteId: string,
    data: types.NetDataFromMain,
  ) => {
    if (data.update) {
      objectIds.forEach((id) => {
        const o = objects.current?.[id];
        const u = data.update?.[id];
        if (o && u) {
          o.controlsUp += u[0] || 0;
          o.controlsDown += u[1] || 0;
          o.controlsLeft += u[2] || 0;
          o.controlsUp += u[3] || 0;
          o.rotationSpeed = u[4] || 0;
          o.speed = u[5] || 0;
          o.backendPositionX = u[6] || 0;
          o.backendPositionY = u[7] || 0;
          o.backendPositionZ = u[8] || 0;
          o.backendQuaternionX = u[9] || 0;
          o.backendQuaternionY = u[10] || 0;
          o.backendQuaternionZ = u[11] || 0;
          o.backendQuaternionW = u[12] || 0;
        }
      });
    } else if (data.allObjectIds) {
      setObjectIds(data.allObjectIds);
    } else if (data.chatMessageFromMain) {
      const message = {
        ...data.chatMessageFromMain,
        username: objects.current?.[remoteId]?.username || '',
      };
      setChatMessages([message, ...chatMessages]);
      setTimeout(
        () => setChatMessages((x) => x.filter((xx) => xx !== message)),
        chatMessageTimeToLive,
      );
    }
  };
  return { onReceiveData, sendOnOrderedChannels, sendOnUnorderedChannels };
};
