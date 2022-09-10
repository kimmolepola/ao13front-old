import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import * as atoms from '../../atoms';

export const useChannelOrdered = () => {
  const setChannelsOrdered = useSetRecoilState(atoms.channelsOrdered);

  const create = useCallback((peerConnection: any, receiveData: Function, mainUpdatePeers: Function) => {
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
      mainUpdatePeers();
    };

    channel.onmessage = ({ data }: any) => {
      receiveData(data);
    };

    return channel;
  }, [setChannelsOrdered]);

  return create;
};
