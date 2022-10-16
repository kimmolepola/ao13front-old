import { useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import * as atoms from '../../atoms';
import * as types from '../../types';

let socket: undefined | Socket & { auth: { [key: string]: any } };

export const useSignaler = () => {
  const user = useRecoilValue(atoms.user);
  const setConnectionMessage = useSetRecoilState(atoms.connectionMessage);

  const connectToSignaler = useCallback((
    onReceiveInit: (id: string) => void,
    onReceiveSignaling: (x: types.Signaling) => void,
    onReceiveConnectToMain: (remoteId: string) => void,
    onReceiveMain: (id: string) => void,
    onReceivePeerDisconnected: (remoteId: string) => void,
  ) => {
    socket = (() => {
      const s = io(
        process.env.NODE_ENV === 'production'
          ? `wss://${process.env.REACT_APP_BACKEND}`
          : `ws://${process.env.REACT_APP_BACKEND}`,
        {
          auth: {
            token: user?.token,
          },
        },
      ); console.log('--sSSSSSSSSSSSSSSSSSSSSSSSS:', s); return s;
    })();

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
      console.log('--conect to main');
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
  }, [setConnectionMessage, user?.token]);

  const disconnectFromSignaler = useCallback(() => {
    socket?.off('connect_error');
    socket?.off('connect');
    socket?.off('disconnect');
    socket?.off('nomain');
    socket?.off('fail');
    socket?.off('init');
    socket?.off('signaling');
    socket?.off('connectToMain');
    socket?.off('main');
    socket?.off('peerDisconnected');
    socket?.disconnect();
  }, []);

  const sendSignaling = useCallback(({ remoteId, description, candidate }: types.Signaling) => {
    console.log('--send signaling:', socket, remoteId, description, candidate);
    socket?.emit('signaling', { remoteId, candidate, description });
  }, []);

  return { connectToSignaler, disconnectFromSignaler, sendSignaling };
};
