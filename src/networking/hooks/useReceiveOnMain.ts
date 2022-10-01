import { useSetRecoilState, useRecoilValue } from 'recoil';

import { chatMessageTimeToLive } from '../../parameters';

import * as atoms from '../../atoms';
import * as types from '../../types';
import * as hooks from '.';

export const useReceiveOnMain = () => {
  const { sendOrdered } = hooks.useSendFromMain();
  const objects = useRecoilValue(atoms.objects);
  const setChatMessages = useSetRecoilState(atoms.chatMessages);

  const onReceive = (
    data: types.NetData,
    remoteId: string,
  ) => {
    switch (data.type) {
      case types.NetDataType.CONTROLS: {
        const o = objects.current?.find((x) => x.id === remoteId);
        if (o) {
          o.controlsUp += data.data.up || 0;
          o.controlsDown += data.data.down || 0;
          o.controlsLeft += data.data.left || 0;
          o.controlsRight += data.data.right || 0;
          o.controlsOverChannelsUp += data.data.up || 0;
          o.controlsOverChannelsDown += data.data.down || 0;
          o.controlsOverChannelsLeft += data.data.left || 0;
          o.controlsOverChannelsRight += data.data.right || 0;
        }
        break;
      }
      case types.NetDataType.CHATMESSAGE_CLIENT: {
        const message = {
          message: data.message,
          userId: remoteId,
          messageId: remoteId + Date.now().toString(),
          username: objects.current?.find((x) => x.id === remoteId)?.username || '',
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
