import { RefObject } from 'react';
import { useSetRecoilState } from 'recoil';

import { chatMessageTimeToLive } from '../../parameters';
import * as gameHooks from '../../game/hooks';

import * as atoms from '../../atoms';
import * as types from '../../types';
import * as hooks from '.';

export const useReceiveOnMain = (objectsRef: RefObject<types.GameObject[]>) => {
  const { sendOrdered } = hooks.useSendFromMain();
  const setChatMessages = useSetRecoilState(atoms.chatMessages);
  const { handleReceiveControlsData } = gameHooks.useObjectsOnMain(objectsRef);

  const onReceive = (
    data: types.NetData,
    remoteId: string,
  ) => {
    switch (data.type) {
      case types.NetDataType.CONTROLS: {
        handleReceiveControlsData(data, remoteId);
        break;
      }
      case types.NetDataType.CHATMESSAGE_CLIENT: {
        const message = {
          message: data.message,
          userId: remoteId,
          messageId: remoteId + Date.now().toString(),
          username: objectsRef.current?.find((x) => x.id === remoteId)?.username || '',
        };
        sendOrdered({ ...message, type: types.NetDataType.CHATMESSAGE_MAIN });
        setChatMessages((x) => [message, ...x]);
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
