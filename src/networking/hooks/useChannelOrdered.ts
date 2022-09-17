import { useCallback } from 'react';

import * as types from '../../types';

export const useChannelOrdered = () => {
  const create = useCallback((
    remoteId: string,
    peerConnection: RTCPeerConnection,
    onReceiveData: (remoteId: string, data: types.NetData) => void,
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

    channel.onmessage = ({ data }: { data: types.NetData }) => {
      onReceiveData(remoteId, data);
    };
  }, []);

  return create;
};
