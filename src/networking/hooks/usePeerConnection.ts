import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import * as atoms from '../../atoms';
import * as hooks from '.';
import * as types from '../../types';

export const usePeerConnection = () => {
  const main = useRecoilValue(atoms.main);
  const setConnectionMessage = useSetRecoilState(atoms.connectionMessage);
  const createRTCPeerConnection = hooks.useRTCPeerConnection();
  const createOrderedChannel = hooks.useChannelOrdered();
  const createUnorderedChannel = hooks.useChannelUnordered();
  const { onReceiveDataMain } = hooks.useGameServiceMain();
  const { onReceiveData } = hooks.useGameService();

  const connectToPeer = useCallback((
    remoteId: string,
    sendSignaling: (x: types.Signaling) => void,
    onChannelOpen: () => void,
    onPeerConnected: (remoteId: string) => void,
  ) => {
    setConnectionMessage(`connecting with peer ${remoteId}`);
    console.log('peer', remoteId, 'connecting');
    const peerConnection = createRTCPeerConnection(remoteId, onPeerConnected, sendSignaling);
    if (main) {
      createOrderedChannel(remoteId, peerConnection, onReceiveDataMain, onChannelOpen);
      createUnorderedChannel(remoteId, peerConnection, onReceiveDataMain);
    } else {
      createOrderedChannel(remoteId, peerConnection, onReceiveData, onChannelOpen);
      createUnorderedChannel(remoteId, peerConnection, onReceiveData);
    }
    return ({ peerConnection });
  }, [
    main,
    setConnectionMessage,
    createRTCPeerConnection,
    createOrderedChannel,
    createUnorderedChannel,
    onReceiveDataMain,
    onReceiveData,
  ]);

  return connectToPeer;
};
