import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import * as atoms from '../../atoms';

export const useChannelOrdered = () => {
  const setChannelsOrdered = useSetRecoilState(atoms.channelsOrdered);

  const create = useCallback((peerConnection: any, receiveData: Function, onChannelOpen: () => void) => {
    const channel = peerConnection.createDataChannel('orderedChannel', {
      ordered: true,
      negotiated: true,
      id: 1,
    });

    channel.onclose = () => {
      setChannelsOrdered((x) => x.filter(
        (xx: any) => xx !== channel,
      ));
    };

    channel.onopen = () => {
      setChannelsOrdered((x) => [...x, channel]);
      onChannelOpen();
    };

    channel.onmessage = ({ data }: any) => {
      receiveData(data);
    };

    return channel;
  }, [setChannelsOrdered]);

  return create;
};
