import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import iceServers from '../iceServers';

import * as atoms from '../../atoms';

export const useRTCPeerConnection = () => {
  const setConnectionMessage = useSetRecoilState(atoms.connectionMessage);

  const create = useCallback((remoteId: string, mainHandleNewId: Function, signaler: { emit: Function }) => {
    const pc = new RTCPeerConnection({ iceServers });

    pc.onconnectionstatechange = () => {
      switch (pc.connectionState) {
        case 'failed':
          setConnectionMessage(`peer ${remoteId}, connection failed`);
          console.log('peer', remoteId, 'peer connection failed');
          break;
        case 'connected':
          setConnectionMessage(`peer ${remoteId}, connection ready`);
          console.log('peer', remoteId, 'peer connection ready');
          mainHandleNewId(remoteId);
          break;
        case 'closed':
          setConnectionMessage(`peer ${remoteId}, connection closed`);
          console.log('peer', remoteId, 'peer connection closed');
          break;
        default:
          break;
      }
    };

    pc.onicecandidate = ({ candidate }) => {
      signaler.emit('signaling', { remoteId, candidate });
    };

    pc.onnegotiationneeded = async () => {
      try {
        await pc.setLocalDescription();
        signaler.emit('signaling', {
          remoteId,
          description: pc.localDescription,
        });
      } catch (err) {
        console.error(err);
      }
    };

    return pc;
  }, [setConnectionMessage]);

  return create;
};
