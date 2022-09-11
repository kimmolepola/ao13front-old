import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { saveGameState, getGameObject } from '../services/gameObject.service';

import * as hooks from '.';
import * as atoms from '../../atoms';
import * as types from '../../types';

export const useConnections = (receiveData: Function, mainUpdatePeers: Function) => {
  const [ownId, setOwnId] = useRecoilState(atoms.ownId);
  const [main, setMain] = useRecoilState(atoms.main);
  const [objects, setObjects] = useRecoilState(atoms.objects);
  const [remotes, setRemotes] = useRecoilState(atoms.remotes);

  const connectToSignaler = hooks.useSignaler();
  const connectToPeer = hooks.usePeerConnection();

  const handleDeleteId = useCallback((delId: string) => {
    const newObjects = { ...objects };
    const newRemotes = { ...remotes };
    delete newObjects[delId];
    delete newRemotes[delId];
    setObjects(newObjects);
    setRemotes(newRemotes);
  }, [objects, remotes, setObjects, setRemotes]);

  const mainHandleNewId = useCallback(async (newId: string) => {
    if (!objects[newId]) {
      const { data } = await getGameObject(newId);
      if (data) {
        setObjects((x) => ({ ...x, [newId]: data }));
      }
    }
  }, [objects, setObjects]);

  const onChannelOpen = useCallback(() => {
    mainUpdatePeers();
  }, [mainUpdatePeers]);

  const onPeerConnected = useCallback((remoteId: string) => {
    if (main && main === ownId) {
      mainHandleNewId(remoteId);
    }
  }, [main, mainHandleNewId, ownId]);

  const onReceiveInit = useCallback((id: string) => {
    setOwnId(id);
  }, [setOwnId]);

  const onReceiveMain = useCallback((id: string) => {
    setMain(id);
    mainHandleNewId(id);
  }, [mainHandleNewId, setMain]);

  const onReceiveConnectToMain = useCallback((remoteId: string, sendSignaling: (x: types.Signaling) => void) => {
    setMain(remoteId);
    const remote = connectToPeer(remoteId, sendSignaling, receiveData, onChannelOpen, onPeerConnected);
    setRemotes((x) => ({ ...x, [remoteId]: remote }));
  }, [connectToPeer, onChannelOpen, onPeerConnected, receiveData, setMain, setRemotes]);

  const onReceiveSignaling = useCallback(async (
    { remoteId, description, candidate }: types.Signaling,
    sendSignaling: (x: types.Signaling) => void,
  ) => {
    let remote = remotes[remoteId];
    if (!remote) {
      remote = connectToPeer(remoteId, sendSignaling, receiveData, onChannelOpen, onPeerConnected);
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
  }, [connectToPeer, onChannelOpen, onPeerConnected, receiveData, remotes, setRemotes]);

  const onReceivePeerDisconnected = useCallback((remoteId: string) => {
    if (main && main === ownId) {
      saveGameState(Object.keys(objects).map((x) => ({ playerId: x, score: objects[x].score })));
    }
    remotes[remoteId]?.peerConnection.close();
    handleDeleteId(remoteId);
  }, [handleDeleteId, main, objects, ownId, remotes]);

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
