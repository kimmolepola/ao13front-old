import { useCallback } from 'react';
import { io } from 'socket.io-client';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import * as atoms from '../../atoms';

export const useSignaler = () => {
  const user = useRecoilValue(atoms.user);
  const setConnectionMessage = useSetRecoilState(atoms.connectionMessage);

  const create = useCallback(() => {
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

    return signaler;
  }, [setConnectionMessage, user]);
  return create;
};
