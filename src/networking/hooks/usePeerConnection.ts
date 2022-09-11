import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import * as atoms from '../../atoms';
import * as hooks from '.';
import * as types from '../../types';

export const usePeerConnection = () => {
  const setConnectionMessage = useSetRecoilState(atoms.connectionMessage);
  const createRTCPeerConnection = hooks.useRTCPeerConnection();
  const createOrderedChannel = hooks.useChannelOrdered();
  const createUnorderedChannel = hooks.useChannelUnordered();

  const connectToPeer = useCallback((
    remoteId: string,
    sendSignaling: (x: types.Signaling) => void,
    receiveData: Function,
    onChannelOpen: () => void,
    onPeerConnected: (remoteId: string) => void,
  ) => {
    setConnectionMessage(`connecting with peer ${remoteId}`);
    console.log('peer', remoteId, 'connecting');
    const peerConnection = createRTCPeerConnection(remoteId, onPeerConnected, sendSignaling);
    const orderedChannel = createOrderedChannel(peerConnection, receiveData, onChannelOpen);
    const unorderedChannel = createUnorderedChannel(peerConnection, receiveData);
    return ({ peerConnection, orderedChannel, unorderedChannel });
  }, [
    setConnectionMessage,
    createRTCPeerConnection,
    createOrderedChannel,
    createUnorderedChannel,
  ]);

  return connectToPeer;
};
