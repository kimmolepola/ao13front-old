import { useCallback } from 'react';

import * as types from '../../types';

export const useChannelUnordered = () => {
  const create = useCallback((
    remoteId: string,
    peerConnection: RTCPeerConnection,
    receiveData: (data: types.NetData, remoteId: string) => void,
    onChannelOpen: (remoteId: string, channel: RTCDataChannel) => void,
    onChannelClosed: (remoteId: string, channel: RTCDataChannel) => void,
  ) => {
    const channel = peerConnection.createDataChannel('unorderedChannel', {
      ordered: false,
      negotiated: true,
      id: 0,
    });

    channel.onclose = () => {
      onChannelClosed(remoteId, channel);
    };

    channel.onopen = () => {
      onChannelOpen(remoteId, channel);
    };

    channel.onmessage = ({ data }: any) => {
      receiveData(data, remoteId);
    };

    return channel;
  }, []);

  return create;
};
