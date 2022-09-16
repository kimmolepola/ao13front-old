import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import * as atoms from '../../atoms';

export const useChannelUnordered = () => {
  const setChannelsUnordered = useSetRecoilState(atoms.channelsUnordered);

  const create = useCallback((
    remoteId: string,
    peerConnection: any,
    receiveData: (remoteId: string, data: any) => void,
  ) => {
    const channel = peerConnection.createDataChannel('unorderedChannel', {
      ordered: false,
      negotiated: true,
      id: 0,
    });

    channel.onclose = () => {
      setChannelsUnordered((x) => x.filter(
        (xx) => xx !== channel,
      ));
    };

    channel.onopen = () => {
      setChannelsUnordered((x) => [...x, channel]);
    };

    channel.onmessage = ({ data }: any) => {
      receiveData(remoteId, data);
    };

    return channel;
  }, [setChannelsUnordered]);

  return create;
};
