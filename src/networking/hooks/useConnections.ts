import { useState, useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import * as hooks from '.';
import * as atoms from '../../atoms';
import * as types from '../../types';

export const useConnections = () => {
  const setOwnId = useSetRecoilState(atoms.ownId);
  const [peerConnections, setPeerConnections] = useState<types.PeerConnectionsDictionary>({});

  const { onReceiveMain } = hooks.useMain();
  const { connectToSignaler, disconnectFromSignaler, sendSignaling } = hooks.useSignaler();
  const connectToPeer = hooks.usePeerConnection();

  const onReceiveInit = useCallback((id: string) => {
    setOwnId(id);
  }, [setOwnId]);

  const onReceiveConnectToMain = useCallback((remoteId: string) => {
    const { peerConnection, handleSignaling } = connectToPeer(remoteId, sendSignaling);
    setPeerConnections((x) => ({ ...x, [remoteId]: { peerConnection, handleSignaling } }));
  }, [connectToPeer, setPeerConnections, sendSignaling]);

  const onReceiveSignaling = useCallback(async ({ remoteId, description, candidate }: types.Signaling) => {
    const { peerConnection, handleSignaling } = peerConnections[remoteId] || connectToPeer(remoteId, sendSignaling);
    setPeerConnections((x) => ({ ...x, [remoteId]: { peerConnection, handleSignaling } }));
    handleSignaling(description, candidate);
  }, [connectToPeer, peerConnections, setPeerConnections, sendSignaling]);

  const onReceivePeerDisconnected = useCallback((remoteId: string) => {
    peerConnections[remoteId]?.peerConnection.close();
    const newPeerConnections = { ...peerConnections };
    delete newPeerConnections[remoteId];
    setPeerConnections(newPeerConnections);
  }, [peerConnections, setPeerConnections]);

  const connect = useCallback(() => {
    connectToSignaler(
      onReceiveInit,
      onReceiveSignaling,
      onReceiveConnectToMain,
      onReceiveMain,
      onReceivePeerDisconnected,
    );
  }, [
    connectToSignaler,
    onReceiveInit,
    onReceiveSignaling,
    onReceiveConnectToMain,
    onReceiveMain,
    onReceivePeerDisconnected,
  ]);

  const disconnect = useCallback(() => {
    Object.values(peerConnections).forEach((x) => x.peerConnection.close());
    disconnectFromSignaler();
    setPeerConnections({});
  }, [peerConnections, setPeerConnections, disconnectFromSignaler]);

  return { connect, disconnect };
};
