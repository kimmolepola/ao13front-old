import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import * as atoms from '../../atoms';
import * as types from '../../types';

const emptyFn = () => { console.log('--empty function'); };

export const useSignaler = () => {
  const user = useRecoilValue(atoms.user);
  const setConnectionMessage = useSetRecoilState(atoms.connectionMessage);

  const [onReceiveInitFn, setOnReceiveInitFn] = useState<(id: string) => void>(() => emptyFn);
  const [onReceiveSignalingFn, setOnReceiveSignalingFn] = useState<(x: types.Signaling) => void>(() => emptyFn);
  const [onReceiveConnectToMainFn, setOnReceiveConnectToMainFn] = useState<(remoteId: string) => void>(() => emptyFn);
  const [onReceiveMainFn, setOnReceiveMainFn] = useState<(id: string) => void>(() => emptyFn);
  const [onReceivePeerDisconnectedFn, setOnReceivePeerDisconnectedFn] = useState<(remoteId: string) => void>(() => emptyFn);
  const [sendSignalingFn, setSendSignalingFn] = useState<({ remoteId, description, candidate }: types.Signaling) => void>(
    () => () => { console.log('--empty function sendSignaling'); });
  const [disconnectFromSignalerFn, setDisconnectFromSignalerFn] = useState<() => void>(() => emptyFn);

  useEffect(() => {
    const socket = io(
      process.env.NODE_ENV === 'production'
        ? `wss://${process.env.REACT_APP_BACKEND}`
        : `ws://${process.env.REACT_APP_BACKEND}`,
      {
        auth: {
          token: user?.token,
        },
      },
    );
    console.log('--socket:', socket);

    socket.on('connect_error', (err: any) => {
      console.error(err);
    });

    socket.on('connect', () => {
      setConnectionMessage('signaling socket connected');
      console.log('signaling socket connected');
    });

    socket.on('disconnect', () => {
      setConnectionMessage('signaling socket disconnected');
      console.log('signaling socket disconnected');
    });

    socket.on('nomain', () => {
      setConnectionMessage(
        'game host disconnected, no other available hosts found, please try again later',
      );
      console.log('game host disconnected');
    });

    socket.on('fail', (reason: any) => {
      console.log('signaling socket fail, reason:', reason);
    });

    socket.on('init', (id: string) => {
      onReceiveInitFn(id);
      console.log('own id:', id);
    });

    socket.on('signaling', ({
      id: remoteId,
      description,
      candidate,
    }: {
      id: string,
      description?: RTCSessionDescription,
      candidate?: RTCIceCandidate,
    }) => {
      onReceiveSignalingFn({ remoteId, description, candidate });
      console.log('--on receive signaling');
    });

    socket.on('connectToMain', (remoteId: string) => {
      onReceiveConnectToMainFn(remoteId);
      console.log('--conect to main');
    });

    socket.on('main', (id: string) => {
      onReceiveMainFn(id);
      console.log('you are main');
    });

    socket.on('peerDisconnected', (remoteId: any) => {
      onReceivePeerDisconnectedFn(remoteId);
      setConnectionMessage(`peer ${remoteId} disconnected`);
      console.log('peer', remoteId, 'disconnected');
    });

    const sendSignaling = ({ remoteId, description, candidate }: types.Signaling) => {
      console.log('--send signaling:', socket, remoteId, description, candidate);
      socket?.emit('signaling', { remoteId, candidate, description });
    };

    const disconnectFromSignaler = () => {
      socket?.disconnect();
    };

    setSendSignalingFn(() => sendSignaling);
    setDisconnectFromSignalerFn(() => disconnectFromSignaler);

    return () => {
      socket.off('connect_error');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('nomain');
      socket.off('fail');
      socket.off('init');
      socket.off('signaling');
      socket.off('connectToMain');
      socket.off('main');
      socket.off('peerDisconnected');
      socket.disconnect();
    };
  }, [
    onReceiveConnectToMainFn,
    onReceiveInitFn,
    onReceiveMainFn,
    onReceivePeerDisconnectedFn,
    onReceiveSignalingFn,
    setConnectionMessage,
    user?.token,
  ]);

  const connectToSignaler = useCallback((
    onReceiveInit: (id: string) => void,
    onReceiveSignaling: (x: types.Signaling) => void,
    onReceiveConnectToMain: (remoteId: string) => void,
    onReceiveMain: (id: string) => void,
    onReceivePeerDisconnected: (remoteId: string) => void,
  ) => {
    setOnReceiveInitFn(() => onReceiveInit);
    setOnReceiveSignalingFn(() => onReceiveSignaling);
    setOnReceiveConnectToMainFn(() => onReceiveConnectToMain);
    setOnReceiveMainFn(() => onReceiveMain);
    setOnReceivePeerDisconnectedFn(() => onReceivePeerDisconnected);
  }, []);

  return { connectToSignaler, disconnectFromSignaler: disconnectFromSignalerFn, sendSignaling: sendSignalingFn };
};
