import { useCallback } from 'react';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';

import { saveGameState } from '../services/gameObject.service';

import * as hooks from '.';
import * as atoms from '../../atoms';
import * as types from '../../types';

export const useConnections = () => {
  const setOwnId = useSetRecoilState(atoms.ownId);
  const objects = useRecoilValue(atoms.objects);
  const main = useRecoilValue(atoms.main);
  const [peerConnections, setPeerConnections] = useRecoilState(atoms.peerConnections);

  const { onReceiveMain } = hooks.useMain();
  const connectToSignaler = hooks.useSignaler();
  const connectToPeer = hooks.usePeerConnection();

  const handleDeleteId = useCallback((delId: string) => {
    delete objects.current?.[delId];
    const newPeerConnections = { ...peerConnections };
    delete newPeerConnections[delId];
    setPeerConnections(newPeerConnections);
  }, [objects, peerConnections, setPeerConnections]);

  const onReceiveInit = useCallback((id: string) => {
    setOwnId(id);
  }, [setOwnId]);

  const onReceiveConnectToMain = useCallback((remoteId: string, sendSignaling: (x: types.Signaling) => void) => {
    const peerConnection = connectToPeer(remoteId, sendSignaling);
    setPeerConnections((x) => ({ ...x, [remoteId]: peerConnection }));
  }, [connectToPeer, setPeerConnections]);

  const onReceiveSignaling = useCallback(async (
    { remoteId, description, candidate }: types.Signaling,
    sendSignaling: (x: types.Signaling) => void,
  ) => {
    let peerConnection = peerConnections[remoteId];
    if (!peerConnection) {
      peerConnection = connectToPeer(remoteId, sendSignaling);
      setPeerConnections((x) => ({ ...x, [remoteId]: peerConnection }));
    }
    try {
      if (description) {
        await peerConnection.setRemoteDescription(description);
        if (description.type === 'offer') {
          await peerConnection.setLocalDescription();
          sendSignaling({
            remoteId,
            description: peerConnection.localDescription,
          });
        }
      } else if (candidate) {
        await peerConnection.addIceCandidate(candidate);
      }
    } catch (err) {
      console.error(err);
    }
  }, [connectToPeer, peerConnections, setPeerConnections]);

  const onReceivePeerDisconnected = useCallback((remoteId: string) => {
    if (main) {
      saveGameState(Object.keys(objects).map((x) => ({ playerId: x, score: objects.current?.[x]?.score })));
    }
    peerConnections[remoteId]?.close();
    handleDeleteId(remoteId);
  }, [handleDeleteId, main, objects, peerConnections]);

  const connect = useCallback(() => {
    const { disconnectFromSignaler } = connectToSignaler(
      onReceiveInit,
      onReceiveSignaling,
      onReceiveConnectToMain,
      onReceiveMain,
      onReceivePeerDisconnected,
    );

    const disconnect = () => {
      Object.values(peerConnections).forEach((x) => x.close());
      disconnectFromSignaler();
      setPeerConnections({});
    };

    return disconnect;
  }, [
    connectToSignaler,
    onReceiveConnectToMain,
    onReceiveInit,
    onReceiveMain,
    onReceivePeerDisconnected,
    onReceiveSignaling,
    peerConnections,
    setPeerConnections,
  ]);

  return connect;
};
