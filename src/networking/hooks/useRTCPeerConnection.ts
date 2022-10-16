import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';

import iceServers from '../iceServers';

import * as atoms from '../../atoms';
import * as types from '../../types';

export const useRTCPeerConnection = () => {
  const setConnectionMessage = useSetRecoilState(atoms.connectionMessage);

  const createRTCPeerConnection = useCallback((
    remoteId: string,
    sendSignaling: (x: types.Signaling) => void,
  ) => {
    const peerConnection = new RTCPeerConnection({ iceServers });

    peerConnection.onconnectionstatechange = () => {
      switch (peerConnection.connectionState) {
        case 'failed':
          setConnectionMessage(`peer ${remoteId}, connection failed`);
          console.log('peer', remoteId, 'peer connection failed');
          break;
        case 'connected':
          setConnectionMessage(`peer ${remoteId}, connection ready`);
          console.log('peer', remoteId, 'peer connection ready');
          break;
        case 'closed':
          setConnectionMessage(`peer ${remoteId}, connection closed`);
          console.log('peer', remoteId, 'peer connection closed');
          break;
        default:
          break;
      }
    };

    peerConnection.onicecandidate = ({ candidate }) => {
      sendSignaling({ remoteId, candidate });
    };

    peerConnection.onnegotiationneeded = async () => {
      try {
        await peerConnection.setLocalDescription();
        sendSignaling(
          {
            remoteId,
            description: peerConnection.localDescription,
          },
        );
      } catch (err) {
        console.error(err);
      }
    };

    const handleSignaling = async (
      description: RTCSessionDescription | null | undefined,
      candidate: RTCIceCandidate | null | undefined,
    ) => {
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
    };

    return { peerConnection, handleSignaling };
  }, [setConnectionMessage]);

  return createRTCPeerConnection;
};
