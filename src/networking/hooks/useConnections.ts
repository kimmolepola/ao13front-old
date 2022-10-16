import { useCallback, RefObject } from 'react';
import { useSetRecoilState } from 'recoil';

import * as gameHooks from '../../game/hooks';
import * as hooks from '.';
import * as atoms from '../../atoms';
import * as types from '../../types';

const peerConnections: types.PeerConnectionsDictionary = {};

export const useConnections = (objectsRef: RefObject<types.GameObject[]>) => {
  const setOwnId = useSetRecoilState(atoms.ownId);

  const { handleQuitForObjectsOnClient } = gameHooks.useObjectsOnClient(objectsRef);
  const { onReceiveMain, handleQuitOnMain } = hooks.useMain(objectsRef);
  const { connectToSignaler, disconnectFromSignaler, sendSignaling } = hooks.useSignaler();
  const connectToPeer = hooks.usePeerConnection(objectsRef);

  const onReceiveInit = useCallback((id: string) => {
    setOwnId(id);
  }, [setOwnId]);

  const onReceiveConnectToMain = useCallback((remoteId: string) => {
    console.log('--onreceiveconnecttomain, remoteId:', remoteId);
    peerConnections[remoteId] = connectToPeer(remoteId, sendSignaling);
  }, [connectToPeer, sendSignaling]);

  const onReceiveSignaling = useCallback(async ({ remoteId, description, candidate }: types.Signaling) => {
    console.log('--onreceivesignaling:', remoteId, description, candidate);
    const { peerConnection, handleSignaling } = peerConnections[remoteId] || connectToPeer(remoteId, sendSignaling);
    if (!peerConnections[remoteId]) {
      peerConnections[remoteId] = { peerConnection, handleSignaling };
    }
    handleSignaling(description, candidate);
  }, [connectToPeer, sendSignaling]);

  const onReceivePeerDisconnected = useCallback((remoteId: string) => {
    peerConnections[remoteId]?.peerConnection.close();
    delete peerConnections[remoteId];
  }, []);

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
    await handleQuitOnMain();
    Object.values(peerConnections).forEach((x) => x.peerConnection.close());
    disconnectFromSignaler();
    const remoteIds = Object.keys(peerConnections);
    remoteIds.forEach((x) => {
      delete peerConnections[x];
    });
    setOwnId(undefined);
  }, [
    disconnectFromSignaler,
    handleQuitForObjectsOnClient,
    handleQuitOnMain,
    setOwnId,
  ]);

  return { connect, disconnect };
};
