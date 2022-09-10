import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import * as atoms from '../../atoms';

export const useChannelUnordered = () => {
  const setChannelsUnordered = useSetRecoilState(atoms.channelsUnordered);

  const create = useCallback((peerConnection: any, receiveData: Function) => {
    const channel = peerConnection.createDataChannel('unorderedChannel', {
      ordered: false,
      negotiated: true,
      id: 0,
    });

    channel.onclose = () => {
      setChannelsUnordered((x) => x.filter(
        (xx: any) => xx !== channel,
      ));
    };

    channel.onopen = () => {
      setChannelsUnordered((x) => [...x, channel]);
    };

    channel.onmessage = ({ data }: any) => {
      receiveData(data);
    };

    return channel;
  }, [setChannelsUnordered]);

  return create;
};
