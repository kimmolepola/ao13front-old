import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { chatMessageTimeToLive } from '../../Game/parameters';

import { logError } from '../utils';

import * as atoms from '../../atoms';
import * as types from '../../types';

export const useGameServiceMain = () => {
  const orderedChannels = useRecoilValue(atoms.channelsOrdered);
  const unorderedChannels = useRecoilValue(atoms.channelsUnordered);
  const objects = useRecoilValue(atoms.objects);
  const [chatMessages, setChatMessages] = useRecoilState(atoms.chatMessages);

  const sendOnUnorderedChannels = useCallback((data: types.Update) => {
    const stringData = JSON.stringify(data);
    unorderedChannels.forEach((x) => {
      try {
        x.send(stringData);
      } catch (error) {
        logError(error, data);
      }
    });
  }, [unorderedChannels]);

  const sendOnOrderedChannels = useCallback((data: types.ChatMessageFromMain | types.AllObjectIds) => {
    const dataString = JSON.stringify(data);
    orderedChannels.forEach((x) => {
      try {
        x.send(dataString);
      } catch (error) {
        logError(error, data);
      }
    });
  }, [orderedChannels]);

  const onReceiveDataMain = (
    remoteId: string,
    data: types.NetDataFromClient,
  ) => {
    if (data.controls) {
      const o = objects.current?.[remoteId];
      if (o) {
        o.controlsUp += data.controls[0] || 0;
        o.controlsDown += data.controls[1] || 0;
        o.controlsLeft += data.controls[2] || 0;
        o.controlsRight += data.controls[3] || 0;
        o.controlsOverChannelsUp += data.controls[0] || 0;
        o.controlsOverChannelsDown += data.controls[1] || 0;
        o.controlsOverChannelsLeft += data.controls[2] || 0;
        o.controlsOverChannelsRight += data.controls[3] || 0;
      }
    } else if (data.chatMessageFromClient) {
      const message = {
        ...data.chatMessageFromClient,
        id: Date.now().toString(),
        userId: remoteId,
        username: objects.current?.[remoteId]?.username || '',
      };
      sendOnOrderedChannels(message);
      setChatMessages([message, ...chatMessages]);
      setTimeout(
        () => setChatMessages((x) => x.filter((xx) => xx !== message)),
        chatMessageTimeToLive,
      );
    }
  };
  return { onReceiveDataMain, sendOnOrderedChannels, sendOnUnorderedChannels };
};
