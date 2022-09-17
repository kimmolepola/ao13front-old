import { useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import * as atoms from '../../atoms';
import * as types from '../../types';

export const useSignaler = () => {
  const user = useRecoilValue(atoms.user);
  const setConnectionMessage = useSetRecoilState(atoms.connectionMessage);

  const connectToSignaler = useCallback((
    onReceiveInit: (id: string) => void,
    onReceiveSignaling: (
      x: types.Signaling,
      sendSignaling: (x: types.Signaling) => void,
    ) => void,
    onReceiveConnectToMain: (
      remoteId: string,
      sendSignaling: (x: types.Signaling) => void,
    ) => void,
    onReceiveMain: (id: string) => void,
    onReceivePeerDisconnected: (remoteId: string) => void,
  ) => {
    const signaler = io(
      process.env.NODE_ENV === 'production'
        ? `wss://${process.env.REACT_APP_BACKEND}`
        : `ws://${process.env.REACT_APP_BACKEND}`,
      {
        auth: {
          token: user ? user.token : null,
        },
      },
    );

    const sendSignaling = useCallback(({ remoteId, description, candidate }: types.Signaling) => {
      signaler.emit('signaling', { remoteId, candidate, description });
    }, [signaler]);

    const disconnectFromSignaler = useCallback(() => {
      signaler.disconnect();
    }, [signaler]);

    signaler.on('connect_error', (err: any) => {
      console.error(err);
    });

    signaler.on('connect', () => {
      setConnectionMessage('signaling socket connected');
      console.log('signaling socket connected');
    });

    signaler.on('disconnect', () => {
      setConnectionMessage('signaling socket disconnected');
      console.log('signaling socket disconnected');
    });

    signaler.on('nomain', () => {
      setConnectionMessage(
        'game host disconnected, no other available hosts found, please try again later',
      );
      console.log('game host disconnected');
    });

    signaler.on('fail', (reason: any) => {
      console.log('signaling socket fail, reason:', reason);
    });

    signaler.on('init', (id: string) => {
      onReceiveInit(id);
      console.log('own id:', id);
    });

    signaler.on('signaling', ({
      id: remoteId,
      description,
      candidate,
    }: {
      id: string,
      description?: any,
      candidate?: any
    }) => {
      onReceiveSignaling({ remoteId, description, candidate }, sendSignaling);
    });

    signaler.on('connectToMain', (remoteId: string) => {
      onReceiveConnectToMain(remoteId, sendSignaling);
    });

    signaler.on('main', (id: string) => {
      onReceiveMain(id);
      console.log('you are main');
    });

    signaler.on('peerDisconnected', (remoteId: any) => {
      // onReceivePeerDisconnected(remoteId);
      setConnectionMessage(`peer ${remoteId} disconnected`);
      console.log('peer', remoteId, 'disconnected');
    });

    return { disconnectFromSignaler };
  }, [setConnectionMessage, user]);

  return connectToSignaler;
};
