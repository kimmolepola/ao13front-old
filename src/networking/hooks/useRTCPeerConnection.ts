import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import iceServers from '../iceServers';

import * as atoms from '../../atoms';
import * as types from '../../types';

export const useRTCPeerConnection = () => {
  const setConnectionMessage = useSetRecoilState(atoms.connectionMessage);

  const create = useCallback((
    remoteId: string,
    onPeerConnected: (remoteId: string) => void,
    sendSignaling: (x: types.Signaling) => void,
  ) => {
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
          onPeerConnected(remoteId);
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
      sendSignaling({ remoteId, candidate });
    };

    pc.onnegotiationneeded = async () => {
      try {
        await pc.setLocalDescription();
        sendSignaling(
          {
            remoteId,
            description: pc.localDescription,
          },
        );
      } catch (err) {
        console.error(err);
      }
    };

    return pc;
  }, [setConnectionMessage]);

  return create;
};
