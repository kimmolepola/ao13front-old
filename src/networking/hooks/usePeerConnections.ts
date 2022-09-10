import { useCallback } from 'react';
import { useRecoilValue, useRecoilState, useSetRecoilState } from 'recoil';

import { saveGameState, getGameObject } from '../services/gameObject.service';

import * as atoms from '../../atoms';
import * as hooks from '.';

// import adapter from 'webrtc-adapter';
// import { io } from 'socket.io-client';
// import { receiveData } from '../services/game.service';
// import setupRelayConnection from '../relay';
// import { saveGameState, getGameObject } from '../services/gameObject.service';

export const usePeerConnections = (
  signaler: any,
  receiveData: Function,
  mainUpdatePeers: Function,
) => {
  const setConnectionMessage = useSetRecoilState(atoms.connectionMessage);
  const [remotes, setRemotes] = useRecoilState(atoms.remotes);
  const [objects, setObjects] = useRecoilState(atoms.objects)
  const ownId = useRecoilValue(atoms.ownId);
  const main = useRecoilValue(atoms.main);
  const createRTCPeerConnection = hooks.useRTCPeerConnection();
  const createOrderedChannel = hooks.useChannelOrdered();
  const createUnorderedChannel = hooks.useChannelUnordered();

  const disconnect = useCallback(() => {
    Object.values(remotes).forEach((x) => x.peerConnection.close());
    signaler.disconnect();
    setRemotes({});
  }, [remotes, setRemotes, signaler]);

  const mainHandleNewId = useCallback(async (newId: string) => {
    if (main && main === ownId) {
      if (!objects[newId]) {
        const { data } = await getGameObject(newId);
        if (data) {
          setObjects((x) => ({ ...x, [newId]: data }))
        }
      }
    }
  }, [main, ownId, objects]);

  const handleDeleteId = useCallback((delId: string) => {
    const newObjects = { ...objects };
    delete newObjects[delId];
    setObjects(newObjects)
  }, []);

  const start = useCallback((remoteId: string) => {
    setConnectionMessage(`connecting with peer ${remoteId}`);
    console.log('peer', remoteId, 'connecting');
    const peerConnection = createRTCPeerConnection(remoteId, mainHandleNewId, signaler);
    const orderedChannel = createOrderedChannel(peerConnection, receiveData, mainUpdatePeers);
    const unorderedChannel = createUnorderedChannel(peerConnection, receiveData);
    setRemotes((x) => ({ ...x, [remoteId]: { peerConnection, orderedChannel, unorderedChannel } }));
  }, [
    setConnectionMessage,
    createRTCPeerConnection,
    createOrderedChannel,
    createUnorderedChannel,
    mainHandleNewId,
    signaler,
    receiveData,
    mainUpdatePeers,
    setRemotes,
  ]);

  return { disconnect, start };
};

// export const usePeerConnection = () => {
//   const connect = ({
//     objects,
//     objectIds,
//     user,
//     setConnectionMessage,
//     setIds,
//     setId,
//     setChatMessages,
//     setMain,
//   }: any) => {
//     let ownId: any;
//     let main: any;
//     let remotes: any = {};
//     const channels: any = { ordered: [], unordered: [] };
//     let relay: any;
//     let signaler: any;

//     const getChannels = () => channels;
//     const getRelay = () => relay;
//     const setRelay = (x: any) => {
//       relay = x;
//     };
//     const getSignaler = () => signaler;

//     const disconnect = () => {
//       Object.keys(remotes).forEach((x) => {
//         if (remotes[x].pc) remotes[x].pc.close();
//       });
//       if (relay) relay.disconnect();
//       if (signaler) signaler.disconnect();
//       remotes = {};
//       relay = undefined;
//       signaler = undefined;
//     };

//     const mainHandleNewId = async (newId: any) => {
//       if (main && main === ownId) {
//         if (!objectIds.current.includes(newId)) {
//           // here fetch object info from database and create object
//           let obj = { username: newId, score: 0 };
//           let err = null;
//           if (!newId.includes('guest_')) {
//             const { data, error } = await getGameObject(newId);
//             obj = data;
//             err = error;
//           }
//           if (!err && typeof obj.score === 'number') {
//             objectIds.current.push(newId);
//             const obsCur = objects.current;
//             obsCur[newId] = {
//               username: obj.username,
//               score: obj.score,
//               startPosition: [0, 0, 1],
//               startQuaternion: [0, 0, 0, 1],
//               controls: {
//                 up: 0, down: 0, left: 0, right: 0,
//               },
//               controlsOverChannels: {
//                 up: 0, down: 0, left: 0, right: 0,
//               },
//               controlsOverRelay: {
//                 up: 0, down: 0, left: 0, right: 0,
//               },
//               speed: 0.3,
//               rotationSpeed: 1,
//               backendPosition: { x: 0, y: 0, z: 1 },
//               backendQuaternion: [0, 0, 0, 1],
//               keyDowns: [],
//             };
//             setIds((x: any) => {
//               if (!x.includes(newId)) {
//                 return [...x, newId];
//               }
//               return x;
//             });
//           } else {
//             const errorText = `Failed to create game object ${newId}. Error: ${err || 'Game object property "score" is not a number'}.
//               `;
//             console.error(errorText);
//           }
//         }
//       }
//     };

//     const handleDeleteId = (delId: any) => {
//       const objs = objects.current;
//       delete objs[delId];
//       const index = objectIds.current.indexOf(delId);
//       if (index !== -1) objectIds.current.splice(index, 1);
//       setIds((x: any) => x.filter((xx: any) => xx !== delId));
//     };

//     const start = (remoteId: any) => {
//       setConnectionMessage(`connecting with peer ${remoteId}`);
//       console.log('peer', remoteId, 'connecting');
//       const pc = new RTCPeerConnection({ iceServers });

//       pc.onconnectionstatechange = () => {
//         if (pc.connectionState === 'failed') {
//           setConnectionMessage(`peer ${remoteId}, connection failed`);
//           console.log('peer', remoteId, 'peer connection failed');
//           handleFailed(remoteId);
//         } else if (pc.connectionState === 'connected') {
//           setConnectionMessage(`peer ${remoteId}, connection ready`);
//           console.log('peer', remoteId, 'peer connection ready');
//           mainHandleNewId(remoteId);
//         } else if (pc.connectionState === 'closed') {
//           setConnectionMessage(`peer ${remoteId}, connection closed`);
//           console.log('peer', remoteId, 'peer connection closed');
//         }
//       };

//       pc.onicecandidate = ({ candidate }) => {
//         getSignaler().emit('signaling', { remoteId, candidate });
//       };

//       pc.onnegotiationneeded = async () => {
//         try {
//           await pc.setLocalDescription();
//           getSignaler().emit('signaling', {
//             remoteId,
//             description: pc.localDescription,
//           });
//         } catch (err) {
//           console.error(err);
//         }
//       };

//       const channelUnordered = pc.createDataChannel('unorderedChannel', {
//         ordered: false,
//         negotiated: true,
//         id: 0,
//       });

//       const channelOrdered = pc.createDataChannel('orderedChannel', {
//         negotiated: true,
//         id: 1,
//       });

//       channelUnordered.onclose = () => {
//         getChannels().unordered = getChannels().unordered.filter(
//           (xx: any) => xx !== channelUnordered,
//         );
//       };

//       channelUnordered.onopen = () => {
//         getChannels().unordered.push(channelUnordered);
//       };

//       channelUnordered.onmessage = ({ data }) => {
//         receiveData(
//           remoteId,
//           JSON.parse(data),
//           setChatMessages,
//           objectIds,
//           objects,
//           setIds,
//           ownId,
//           { getRelay, getChannels },
//           setMain,
//         );
//       };

//       channelOrdered.onclose = () => {
//         getChannels().ordered = getChannels().ordered.filter(
//           (xx: any) => xx !== channelOrdered,
//         );
//       };

//       channelOrdered.onopen = () => {
//         getChannels().ordered.push(channelOrdered);
//         if (main === ownId) {
//           setIds((x: any) => [...x]); // trigger mainUpdatePeers
//         }
//       };

//       channelOrdered.onmessage = ({ data }) => {
//         receiveData(
//           remoteId,
//           JSON.parse(data),
//           setChatMessages,
//           objectIds,
//           objects,
//           setIds,
//           ownId,
//           { getRelay, getChannels },
//           setMain,
//         );
//       };
//       remotes[remoteId] = { pc, channelUnordered, channelOrdered };
//     };

//     signaler.on('peerDisconnect', (remoteId: any) => {
//       setConnectionMessage(`peer ${remoteId} disconnect`);
//       console.log('peer', remoteId, 'disconnect');
//       if (main && main === ownId) {
//         saveGameState(
//           objectIds.current.reduce((acc: any, cur: any) => {
//             if (!cur.includes('guest_')) {
//               acc.push({
//                 playerId: cur,
//                 score: objects.current[cur].score,
//               });
//             }
//             return acc;
//           }, []),
//         );
//       }
//       handleDeleteId(remoteId);
//       if (remotes[remoteId]) remotes[remoteId].pc.close();
//       delete remotes[remoteId];
//       if (relay && !Object.keys(remotes).find((xx: any) => xx.relaySocket)) {
//         relay.disconnect();
//         relay = undefined;
//       }
//     });

//     signaler.on('connectToMain', (remoteId: any) => {
//       setMain(remoteId);
//       start(remoteId);
//     });

//     signaler.on('main', (arg: any) => {
//       main = arg;
//       setMain(arg);
//       if (relay) relay.emit('main', true);
//       mainHandleNewId(main);
//       console.log('you are main');
//     });

//     signaler.on('init', (clientId: any) => {
//       ownId = clientId;
//       setId(clientId);
//       console.log('own id:', clientId);
//     });

//     signaler.on('signaling', async ({ id: remoteId, description, candidate }: any) => {
//       if (!remotes[remoteId]) {
//         start(remoteId);
//       }
//       const { pc } = remotes[remoteId];
//       try {
//         if (description) {
//           await pc.setRemoteDescription(description);
//           if (description.type === 'offer') {
//             await pc.setLocalDescription();
//             signaler.emit('signaling', {
//               remoteId,
//               description: pc.localDescription,
//             });
//           }
//         } else if (candidate) {
//           await pc.addIceCandidate(candidate);
//         }
//       } catch (err) {
//         console.error(err);
//       }
//     });
//     return {
//       disconnect, getRelay, setRelay, getSignaler, getChannels,
//     };
//   };
//   return connect;
// };
