import { useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import * as atoms from '../../atoms';
import * as types from '../../types';
import * as hooks from '.';

export const usePeerConnection = () => {
  const main = useRecoilValue(atoms.main);
  const setConnectionMessage = useSetRecoilState(atoms.connectionMessage);
  const setChannelsOrdered = useSetRecoilState(atoms.channelsOrdered);
  const setChannelsUnordered = useSetRecoilState(atoms.channelsUnordered);
  const createRTCPeerConnection = hooks.useRTCPeerConnection();
  const createOrderedChannel = hooks.useChannelOrdered();
  const createUnorderedChannel = hooks.useChannelUnordered();
  const { onReceiveData: onReceiveDataForMain } = hooks.useGameServiceForMain();
  const { onReceiveData: onReceiveDataForClient } = hooks.useGameServiceForClient();

  const onChannelOrderedOpen = useCallback((remoteId: string, channel: RTCDataChannel) => {
    setChannelsOrdered((x) => [...x, { remoteId, channel }]);
  }, [setChannelsOrdered]);

  const onChannelOrderedClosed = useCallback((remoteId: string) => {
    setChannelsOrdered((x) => x.filter(
      (xx) => xx.remoteId !== remoteId,
    ));
  }, [setChannelsOrdered]);

  const onChannelUnorderedOpen = useCallback((remoteId: string, channel: RTCDataChannel) => {
    setChannelsUnordered((x) => [...x, { remoteId, channel }]);
  }, [setChannelsUnordered]);

  const onChannelUnorderedClosed = useCallback((remoteId: string) => {
    setChannelsUnordered((x) => x.filter(
      (xx) => xx.remoteId !== remoteId,
    ));
  }, [setChannelsUnordered]);

  const connectToPeer = useCallback((
    remoteId: string,
    sendSignaling: (x: types.Signaling) => void,
  ) => {
    setConnectionMessage(`connecting with peer ${remoteId}`);
    console.log('peer', remoteId, 'connecting');
    const peerConnection = createRTCPeerConnection(remoteId, sendSignaling);
    if (main) {
      createOrderedChannel(remoteId, peerConnection, onReceiveDataForMain, onChannelOrderedOpen, onChannelOrderedClosed);
      createUnorderedChannel(remoteId, peerConnection, onReceiveDataForMain, onChannelUnorderedOpen, onChannelUnorderedClosed);
    } else {
      createOrderedChannel(remoteId, peerConnection, onReceiveDataForClient, onChannelOrderedOpen, onChannelOrderedClosed);
      createUnorderedChannel(remoteId, peerConnection, onReceiveDataForClient, onChannelUnorderedOpen, onChannelUnorderedClosed);
    }
    return (peerConnection);
  }, [
    main,
    setConnectionMessage,
    createRTCPeerConnection,
    createOrderedChannel,
    createUnorderedChannel,
    onReceiveDataForMain,
    onReceiveDataForClient,
    onChannelOrderedOpen,
    onChannelOrderedClosed,
    onChannelUnorderedOpen,
    onChannelUnorderedClosed,
  ]);

  return connectToPeer;
};
