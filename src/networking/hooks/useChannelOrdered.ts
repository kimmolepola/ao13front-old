import { useCallback } from 'react';

import * as types from '../../types';

export const useChannelOrdered = () => {
  console.log('--useChannelOrdered');

  const create = useCallback((
    remoteId: string,
    peerConnection: RTCPeerConnection,
    onReceiveData: (data: types.NetData, remoteId: string) => void,
    onChannelOpen: (remoteId: string, channel: RTCDataChannel) => void,
    onChannelClosed: (remoteId: string, channel: RTCDataChannel) => void,
  ) => {
    const channel = peerConnection.createDataChannel('orderedChannel', {
      ordered: true,
      negotiated: true,
      id: 1,
    });

    channel.onclose = () => {
      onChannelClosed(remoteId, channel);
    };

    channel.onopen = () => {
      onChannelOpen(remoteId, channel);
    };

    channel.onmessage = ({ data }: { data: string }) => {
      onReceiveData(JSON.parse(data), remoteId);
    };
  }, []);

  return create;
};
