import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { chatMessageTimeToLive } from '../../Game/parameters';

import { logError } from '../utils';

import * as atoms from '../../atoms';
import * as types from '../../types';

export const useGameServiceForMain = () => {
  const orderedChannels = useRecoilValue(atoms.channelsOrdered);
  const unorderedChannels = useRecoilValue(atoms.channelsUnordered);
  const objects = useRecoilValue(atoms.objects);
  const [chatMessages, setChatMessages] = useRecoilState(atoms.chatMessages);

  const sendOnUnorderedChannels = useCallback((data: types.Update) => {
    const stringData = JSON.stringify(data);
    unorderedChannels.forEach((x) => {
      try {
        x.channel.send(stringData);
      } catch (error) {
        logError(error, data);
      }
    });
  }, [unorderedChannels]);

  const sendOnOrderedChannels = useCallback((data: types.ChatMessageFromMain | types.AllObjectIds) => {
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
      case types.NetDataType.Controls: {
        const o = objects.current?.[remoteId];
        if (o) {
          o.controlsUp += data.up || 0;
          o.controlsDown += data.down || 0;
          o.controlsLeft += data.left || 0;
          o.controlsRight += data.right || 0;
          o.controlsOverChannelsUp += data.up || 0;
          o.controlsOverChannelsDown += data.down || 0;
          o.controlsOverChannelsLeft += data.left || 0;
          o.controlsOverChannelsRight += data.right || 0;
        }
        break;
      }
      case types.NetDataType.ChatMessageFromClient: {
        const message = {
          message: data.message,
          id: Date.now().toString(),
          userId: remoteId,
          username: objects.current?.[remoteId]?.username || '',
        };
        sendOnOrderedChannels({ ...message, type: types.NetDataType.ChatMessageFromMain });
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
