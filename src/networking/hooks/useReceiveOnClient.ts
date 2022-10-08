import { RefObject } from 'react';
import { useRecoilState } from 'recoil';

import { chatMessageTimeToLive } from '../../parameters';

import * as atoms from '../../atoms';
import * as types from '../../types';
import * as gameHooks from '../../game/hooks';

export const useReceiveOnClient = (objectsRef: RefObject<types.GameObject[]>) => {
  const [chatMessages, setChatMessages] = useRecoilState(atoms.chatMessages);
  const { handleUpdateData, handleStateData } = gameHooks.useObjectsOnClient(objectsRef);

  const onReceive = (
    data: types.NetData,
  ) => {
    switch (data.type) {
      case types.NetDataType.STATE: {
        handleStateData(data);
        break;
      }
      case types.NetDataType.UPDATE: {
        handleUpdateData(data);
        break;
      }
      case types.NetDataType.CHATMESSAGE_MAIN: {
        const message = {
          ...data,
          username: (objectsRef.current || []).find((x) => x.id === data.userId)?.username || '',
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
