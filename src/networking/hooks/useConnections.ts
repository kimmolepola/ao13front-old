import { useState, useCallback, RefObject } from 'react';
import { useSetRecoilState } from 'recoil';

import * as gameHooks from '../../game/hooks';
import * as hooks from '.';
import * as atoms from '../../atoms';
import * as types from '../../types';

export const useConnections = (objectsRef: RefObject<types.GameObject[]>) => {
  const setOwnId = useSetRecoilState(atoms.ownId);
  const [peerConnections, setPeerConnections] = useState<types.PeerConnectionsDictionary>({});

  const { handleQuitForObjectsOnClient } = gameHooks.useObjectsOnClient(objectsRef);
  const { onReceiveMain, handleQuitForObjectsOnMain } = hooks.useMain(objectsRef);
  const { connectToSignaler, disconnectFromSignaler, sendSignaling } = hooks.useSignaler();
  const connectToPeer = hooks.usePeerConnection(objectsRef);

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

  const disconnect = useCallback(async () => {
    handleQuitForObjectsOnClient();
    await handleQuitForObjectsOnMain();
    Object.values(peerConnections).forEach((x) => x.peerConnection.close());
    disconnectFromSignaler();
    setPeerConnections({});
  }, [
    peerConnections,
    setPeerConnections,
    disconnectFromSignaler,
    handleQuitForObjectsOnClient,
    handleQuitForObjectsOnMain,
  ]);

  return { connect, disconnect };
};
