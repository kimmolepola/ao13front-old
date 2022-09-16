import { useCallback } from 'react';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';

import { saveGameState } from '../services/gameObject.service';

import * as hooks from '.';
import * as atoms from '../../atoms';
import * as types from '../../types';

export const useConnections = (mainUpdatePeers: Function) => {
  const setOwnId = useSetRecoilState(atoms.ownId);
  const objects = useRecoilValue(atoms.objects);
  const [objectIds, setObjectIds] = useRecoilState(atoms.objectIds);
  const [main, setMain] = useRecoilState(atoms.main);
  const [remotes, setRemotes] = useRecoilState(atoms.remotes);

  const connectToSignaler = hooks.useSignaler();
  const connectToPeer = hooks.usePeerConnection();

  const handleDeleteId = useCallback((delId: string) => {
    delete objects.current?.[delId];
    const newRemotes = { ...remotes };
    delete newRemotes[delId];
    setRemotes(newRemotes);
  }, [objects, remotes, setRemotes]);

  const mainHandleNewId = useCallback(async (newId: string) => {
    if (!objectIds.includes(newId)) {
      setObjectIds([...objectIds, newId]);
      // CREATE OBJECT HERE ?
      // const { data } = await getGameObject(newId);
      // if (data && objects.current) {
      // objects.current[newId] = data;
      // }
    }
  }, [objectIds, setObjectIds]);

  const onChannelOpen = useCallback(() => {
    mainUpdatePeers();
  }, [mainUpdatePeers]);

  const onPeerConnected = useCallback((remoteId: string) => {
    if (main) {
      mainHandleNewId(remoteId);
    }
  }, [main, mainHandleNewId]);

  const onReceiveInit = useCallback((id: string) => {
    setOwnId(id);
  }, [setOwnId]);

  const onReceiveMain = useCallback((id: string) => {
    setMain(true);
    mainHandleNewId(id);
  }, [mainHandleNewId, setMain]);

  const onReceiveConnectToMain = useCallback((remoteId: string, sendSignaling: (x: types.Signaling) => void) => {
    const remote = connectToPeer(remoteId, sendSignaling, onChannelOpen, onPeerConnected);
    setRemotes((x) => ({ ...x, [remoteId]: remote }));
  }, [connectToPeer, onChannelOpen, onPeerConnected, setRemotes]);

  const onReceiveSignaling = useCallback(async (
    { remoteId, description, candidate }: types.Signaling,
    sendSignaling: (x: types.Signaling) => void,
  ) => {
    let remote = remotes[remoteId];
    if (!remote) {
      remote = connectToPeer(remoteId, sendSignaling, onChannelOpen, onPeerConnected);
      setRemotes((x) => ({ ...x, [remoteId]: remote }));
    }
    const { peerConnection } = remote;
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
  }, [connectToPeer, onChannelOpen, onPeerConnected, remotes, setRemotes]);

  const onReceivePeerDisconnected = useCallback((remoteId: string) => {
    if (main) {
      saveGameState(Object.keys(objects).map((x) => ({ playerId: x, score: objects.current?.[x]?.score })));
    }
    remotes[remoteId]?.peerConnection.close();
    handleDeleteId(remoteId);
  }, [handleDeleteId, main, objects, remotes]);

  const connect = useCallback(() => {
    const { disconnectFromSignaler } = connectToSignaler(
      onReceiveInit,
      onReceiveSignaling,
      onReceiveConnectToMain,
      onReceiveMain,
      onReceivePeerDisconnected,
    );

    const disconnect = () => {
      Object.values(remotes).forEach((x) => x.peerConnection.close());
      disconnectFromSignaler();
      setRemotes({});
    };

    return disconnect;
  }, [connectToSignaler, onReceiveConnectToMain, onReceiveInit, onReceiveMain, onReceivePeerDisconnected, onReceiveSignaling, remotes, setRemotes]);

  return connect;
};
