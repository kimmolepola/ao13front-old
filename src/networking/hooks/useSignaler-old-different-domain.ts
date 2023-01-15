import { useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import * as atoms from '../../atoms';
import * as types from '../../types';

let socket: undefined | Socket & { auth: { [key: string]: any } };

export const useSignaler = () => {
  console.log('--useSignaler');

  const user = useRecoilValue(atoms.user);
  const setConnectionMessage = useSetRecoilState(atoms.connectionMessage);

  console.log('NODE_ENV:', process.env.NODE_ENV);

  const url = process.env.NODE_ENV === 'production'
    ? `http://${process.env.REACT_APP_BACKEND}`
    : `http://${process.env.REACT_APP_BACKEND}`;

  console.log('--socket.io connect to:', url);

  const connectToSignaler = useCallback(() => {
    console.log('--connectToSignaler, auth.token:', user?.token);
    socket = (() => {
      const s = io(
        url,
        {
          auth: {
            token: user?.token,
          },
          rejectUnauthorized: false, // WARN: please do not do this in production
        },
      );
      return s;
    })();
    socket?.on('event', (data) => { console.log('--SOCKETevent', data); });
    socket?.on('error', (error) => { console.log('--SOCKETerror', error); });
    socket?.on('disconnect', () => { console.log('--SOCKETdisconnect'); });
    socket?.on('connection', (socketarg) => { console.log('--SOCKETconnection', socketarg); });
    socket?.on('fdaTrigger', (data) => { console.log('--SOCKETfdaTrigger', data); });
    socket?.on('--SOCKETconnect_error', (err: any) => {
      console.error(err);
    });
  }, [user?.token, url]);

  const registerListeners = useCallback((
    onReceiveInit: (id: string) => void,
    onReceiveSignaling: (x: types.Signaling) => void,
    onReceiveConnectToMain: (remoteId: string) => void,
    onReceiveMain: (id: string) => void,
    onReceivePeerDisconnected: (remoteId: string) => void,
  ) => {
    socket?.on('event', (data) => { console.log('event', data); });
    socket?.on('error', (error) => { console.log('error', error); });
    socket?.on('disconnect', () => { console.log('disconnect'); });
    socket?.on('connection', (socketarg) => { console.log('connection', socketarg); });
    socket?.on('fdaTrigger', (data) => { console.log('fdaTrigger', data); });

    socket?.on('connect_error', (err: any) => {
      console.error(err);
    });

    socket?.on('connect', () => {
      setConnectionMessage('signaling socket connected');
      console.log('signaling socket connected');
    });

    socket?.on('disconnect', () => {
      setConnectionMessage('signaling socket disconnected');
      console.log('signaling socket disconnected');
    });

    socket?.on('nomain', () => {
      setConnectionMessage(
        'game host disconnected, no other available hosts found, please try again later',
      );
      console.log('game host disconnected');
    });

    socket?.on('fail', (reason: any) => {
      console.log('signaling socket fail, reason:', reason);
    });

    socket?.on('init', (id: string) => {
      onReceiveInit(id);
      console.log('own id:', id);
    });

    socket?.on('signaling', ({
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

    socket?.on('connectToMain', (remoteId: string) => {
      onReceiveConnectToMain(remoteId);
    });

    socket?.on('main', (id: string) => {
      onReceiveMain(id);
      console.log('you are main');
    });

    socket?.on('peerDisconnected', (remoteId: any) => {
      onReceivePeerDisconnected(remoteId);
      setConnectionMessage(`peer ${remoteId} disconnected`);
      console.log('peer', remoteId, 'disconnected');
    });
  }, [setConnectionMessage]);

  const unregisterListeners = useCallback(() => {
    socket?.off('event'); socket?.off('error'); socket?.off('disconnect'); socket?.off('connection'); socket?.off('fdaTrigger');
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
  }, []);

  const disconnectFromSignaler = useCallback(() => {
    unregisterListeners();
    socket?.disconnect();
  }, [unregisterListeners]);

  const sendSignaling = useCallback(({ remoteId, description, candidate }: types.Signaling) => {
    socket?.emit('signaling', { remoteId, candidate, description });
  }, []);

  return {
    connectToSignaler, disconnectFromSignaler, registerListeners, unregisterListeners, sendSignaling,
  };
};
