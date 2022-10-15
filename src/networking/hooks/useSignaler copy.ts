import { useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import * as atoms from '../../atoms';
import * as types from '../../types';

export const useSignaler = () => {
  const user = useRecoilValue(atoms.user);
  const setConnectionMessage = useSetRecoilState(atoms.connectionMessage);
  const [signaler, setSignaler] = useState<Socket>();

  const connectToSignaler = useCallback((
    onReceiveInit: (id: string) => void,
    onReceiveSignaling: (x: types.Signaling) => void,
    onReceiveConnectToMain: (remoteId: string) => void,
    onReceiveMain: (id: string) => void,
    onReceivePeerDisconnected: (remoteId: string) => void,
  ) => {
    const socket = io(
      process.env.NODE_ENV === 'production'
        ? `wss://${process.env.REACT_APP_BACKEND}`
        : `ws://${process.env.REACT_APP_BACKEND}`,
      {
        auth: {
          token: user ? user.token : null,
        },
      },
    );
    setSignaler(socket);

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
      onReceiveInit(id);
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
      onReceiveSignaling({ remoteId, description, candidate });
    });

    socket.on('connectToMain', (remoteId: string) => {
      onReceiveConnectToMain(remoteId);
    });

    socket.on('main', (id: string) => {
      onReceiveMain(id);
      console.log('you are main');
    });

    socket.on('peerDisconnected', (remoteId: any) => {
      onReceivePeerDisconnected(remoteId);
      setConnectionMessage(`peer ${remoteId} disconnected`);
      console.log('peer', remoteId, 'disconnected');
    });
  }, [setConnectionMessage, user]);

  const sendSignaling = useCallback(({ remoteId, description, candidate }: types.Signaling) => {
    signaler?.emit('signaling', { remoteId, candidate, description });
  }, [signaler]);

  const disconnectFromSignaler = useCallback(() => {
    signaler?.disconnect();
  }, [signaler]);

  return { connectToSignaler, disconnectFromSignaler, sendSignaling };
};
