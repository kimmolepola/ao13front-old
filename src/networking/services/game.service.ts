import { RefObject } from 'react';

import { chatMessageTimeToLiveSeconds } from '../../Game/parameters';

import * as types from '../../types';

let doStuffTime = Date.now();

const logError = (error: any, data: any) => {
  if (
    error.message
    === "Failed to execute 'send' on 'RTCDataChannel': RTCDataChannel.readyState is not 'open'"
  ) {
    console.log(
      'Failed to send on data channel. This is expected if player disconnected.',
    );
  } else {
    console.error('Error:', error.message, 'Data:', data);
  }
};

export const sendDataOnUnorderedChannels = (data: any, unorderedChannelsRef: RefObject<types.Channel[] | null>) => {
  const stringData = JSON.stringify(data);
  unorderedChannelsRef.current?.forEach((x) => {
    try {
      x.send(stringData);
    } catch (error) {
      logError(error, data);
    }
  });
};

const processData = (arg: any) => {
  let data: any;
  switch (arg.type) {
    case 'chatMessage': {
      data = {
        username: arg.username,
        userId: arg.id,
        type: arg.type,
        chatMessage: arg.chatMessage,
        chatMessageId: arg.chatMessageId,
      };
      // if main is sending its own chat message, not relaying other client's message
      if (arg.main === arg.id && !arg.mainrelay) {
        arg.setChatMessages((x: any) => [data, ...x]);
        setTimeout(
          () => arg.setChatMessages((x: any) => x.filter((xx: any) => xx !== data)),
          chatMessageTimeToLiveSeconds * 1000,
        );
      }
      break;
    }
    default:
      data = arg;
      break;
  }
  return data;
};

export const sendDataOnOrderedChannels = (arg: any, orderedChannelsRef: RefObject<types.Channel[] | null>) => {
  const data = processData(arg);
  const dataString = JSON.stringify(data);
  orderedChannelsRef.current?.forEach((x) => {
    try {
      x.send(dataString);
    } catch (error) {
      logError(error, data);
    }
  });
};

export const receiveData = (
  remoteId: any,
  data: any,
  setChatMessages: any,
  objectIds: any,
  objects: any,
  setIds: any,
  ownId: any,
  connection: any,
  setMain: any,
) => {
  switch (data.type) {
    case 'update': // only non-main will receive these
      if (Date.now() > doStuffTime) {
        console.log('updatedata:', data);
        console.log('objects:', objects);
        doStuffTime = Date.now() + 30000;
      }
      for (let i = objectIds.current.length - 1; i > -1; i -= 1) {
        const objectLocal = objects.current[objectIds.current[i]];
        const objectBackend = data.update[objectIds.current[i]];
        if (objectLocal && objectBackend) {
          if (objectIds.current[i] !== ownId) {
            objectLocal.controls.up += objectBackend.controlsOverNetwork.up;
            objectLocal.controls.down += objectBackend.controlsOverNetwork.down;
            objectLocal.controls.left += objectBackend.controlsOverNetwork.left;
            objectLocal.controls.right
              += objectBackend.controlsOverNetwork.right;
          }
          objectLocal.rotationSpeed = objectBackend.rotationSpeed;
          objectLocal.speed = objectBackend.speed;
          objectLocal.backendPosition = objectBackend.position;
          objectLocal.backendQuaternion = objectBackend.quaternion;
        }
      }
      break;
    case 'controlsOverNetwork': // only main will receive these
      if (objects.current[remoteId]) {
        /* eslint-disable no-param-reassign */
        const {
          up, down, left, right,
        } = data.controlsOverNetwork;
        objects.current[remoteId].controlsOverRelay.up += up;
        objects.current[remoteId].controlsOverRelay.down += down;
        objects.current[remoteId].controlsOverRelay.left += left;
        objects.current[remoteId].controlsOverRelay.right += right;
        objects.current[remoteId].controlsOverChannels.up += up;
        objects.current[remoteId].controlsOverChannels.down += down;
        objects.current[remoteId].controlsOverChannels.left += left;
        objects.current[remoteId].controlsOverChannels.right += right;
        objects.current[remoteId].controls.up += up;
        objects.current[remoteId].controls.down += down;
        objects.current[remoteId].controls.left += left;
        objects.current[remoteId].controls.right += right;
        /* eslint-enable */
      }
      break;
    case 'updateObjects': {
      console.log('updateObjects-data:', data);
      // only non-main will receive these
      objectIds.current.splice(0, objectIds.current.length);
      objectIds.current.push(...data.ids);
      const objs = objects.current;
      data.ids.forEach((x: any) => {
        const obj = objs[x];
        const dataObj = data.objects[x];
        if (obj && obj.elref) {
          // obj.elref.position.set(...dataObj.startPosition);
          // obj.elref.quaternion.set(...dataObj.startQuaternion);
        } else {
          objs[x] = dataObj;
        }
      });
      setIds(data.ids);
      break;
    }
    case 'chatMessage': {
      let main;
      setMain((x: any) => {
        main = x;
        return x;
      });
      // if message comes from main trust the userId in the message,
      // otherwise use id given from backend
      const userId = remoteId === main ? data.userId : remoteId;
      const message = {
        ...data,
        userId,
        username: objects.current[userId]
          ? objects.current[userId].username
          : null,
      };
      if (main === ownId) {
        message.mainrelay = true; // main is relaying other client's message
        message.id = message.userId;
        sendDataOnOrderedChannels(message, connection);
      }
      setChatMessages((x: any) => [message, ...x]);
      setTimeout(
        () => setChatMessages((x: any) => x.filter((xx: any) => xx !== message)),
        chatMessageTimeToLiveSeconds * 1000,
      );
      break;
    }
    default:
      break;
  }
};
