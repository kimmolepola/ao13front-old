import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import * as atoms from '../../atoms';
import * as types from '../../types';

export const useChannelOrdered = () => {
  const setChannelsOrdered = useSetRecoilState(atoms.channelsOrdered);

  const create = useCallback((
    remoteId: string,
    peerConnection: any,
    onReceiveData: (remoteId: string, data: any) => void,
    onChannelOpen: () => void,
  ) => {
    const channel = peerConnection.createDataChannel('orderedChannel', {
      ordered: true,
      negotiated: true,
      id: 1,
    });

    channel.onclose = () => {
      setChannelsOrdered((x) => x.filter(
        (xx) => xx !== channel,
      ));
    };

    channel.onopen = () => {
      setChannelsOrdered((x) => [...x, channel]);
      onChannelOpen();
    };

    channel.onmessage = ({ data }: { data: any }) => {
      onReceiveData(remoteId, data);
    };
  }, [setChannelsOrdered]);

  return create;
};
