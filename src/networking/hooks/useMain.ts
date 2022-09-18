import { useEffect, useCallback } from 'react';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';

import { saveGameState, getGameObject } from '../services/gameObject.service';

import * as atoms from '../../atoms';
import * as types from '../../types';
import * as hooks from '.';

export const useMain = () => {
  const channelsOrdered = useRecoilValue(atoms.channelsOrdered);
  const channelsUnordered = useRecoilValue(atoms.channelsUnordered);
  const objects = useRecoilValue(atoms.objects);
  const [main, setMain] = useRecoilState(atoms.main);
  const [connectedIds, setConnectedIds] = useRecoilState(atoms.connectedIds);
  const { sendOnOrderedChannels } = hooks.useGameServiceForMain();
  const mainUpdatePeers = useCallback(() => {
    console.log('--updatePeers');
  }, []);

  const handleNewIds = useCallback((ids: string[]) => {
    ids.forEach(async (remoteId) => {
      const initialGameObject = (await getGameObject(remoteId)).data;
      if (objects.current && initialGameObject) {
        const gameObject = {
          ...initialGameObject,
          id: remoteId,
          controlsUp: 0,
          controlsDown: 0,
          controlsLeft: 0,
          controlsRight: 0,
          controlsOverChannelsUp: 0,
          controlsOverChannelsDown: 0,
          controlsOverChannelsLeft: 0,
          controlsOverChannelsRight: 0,
          rotationSpeed: 0,
          speed: 1,
          positionX: 0,
          positionY: 0,
          positionZ: 0,
          quaternionX: 0,
          quaternionY: 0,
          quaternionZ: 0,
          quaternionW: 0,
          backendPositionX: 0,
          backendPositionY: 0,
          backendPositionZ: 0,
          backendQuaternionX: 0,
          backendQuaternionY: 0,
          backendQuaternionZ: 0,
          backendQuaternionW: 0,
        };
        const oldInstanceIndex = objects.current.findIndex((x) => x.id === remoteId);
        if (oldInstanceIndex !== -1) {
          objects.current[oldInstanceIndex] = gameObject;
        } else {
          objects.current.push(gameObject);
        }
      } else {
        console.error('Failed to add new object, no objects.current or initialGameObject');
      }
    });
  }, [objects]);

  const handleDisconnectedIds = useCallback((ids: string[]) => {
    saveGameState((objects.current || []).map((x) => ({ remoteId: x.id, score: x.score })));
    ids.forEach((remoteId) => {
      const index = (objects.current || []).findIndex((x) => x.id === remoteId);
      if (index !== -1) {
        objects.current?.splice(index, 1);
      }
    });
  }, [objects]);

  const onChannelsChanged = useCallback(() => {
    const actuallyConnectedIds = channelsOrdered.reduce((prev: string[], cur) => {
      if (channelsUnordered.some((x) => x.remoteId === cur.remoteId)) {
        prev.push(cur.remoteId);
      }
      return prev;
    }, []);
    const newIds = actuallyConnectedIds.reduce((prev: string[], cur) => {
      if (!connectedIds.includes(cur)) {
        prev.push(cur);
      }
      return prev;
    }, []);
    const disconnectedIds = connectedIds.reduce((prev: string[], cur) => {
      if (!actuallyConnectedIds.includes(cur)) {
        prev.push(cur);
      }
      return prev;
    }, []);
    handleNewIds(newIds);
    handleDisconnectedIds(disconnectedIds);
  }, [channelsOrdered, channelsUnordered, connectedIds, handleNewIds, handleDisconnectedIds]);

  useEffect(() => {
    if (main) {
      onChannelsChanged();
    }
  }, [main, channelsOrdered, channelsUnordered, onChannelsChanged]);

  useEffect(() => {
    console.log('--useEffect main change');
    let intervalId = 0;
    if (main) {
      intervalId = window.setInterval(() => {
        sendOnOrderedChannels({
          type: types.NetDataType.State,
          data: (objects.current || []).reduce((acc: { [id: string]: types.StateObject }, cur) => {
            acc[cur.id] = {
              sId: cur.id,
              sUsername: cur.username,
              sScore: cur.score,
              sRotationSpeed: cur.rotationSpeed,
              sSpeed: cur.speed,
              sPositionX: cur.positionX,
              sPositionY: cur.positionY,
              sPositionZ: cur.positionZ,
              sQuaternionX: cur.quaternionX,
              sQuaternionY: cur.quaternionY,
              sQuaternionZ: cur.quaternionZ,
              sQuaternionW: cur.quaternionW,
            };
            return acc;
          }, {}),
        });
      }, 10000);
    }
    return () => clearInterval(intervalId);
  }, [main, objects, sendOnOrderedChannels]);

  const onReceiveMain = useCallback((id: string) => {
    setMain(true);
    if (!objects.current?.some((x) => x.id === id)) {
      handleNewIds([id]);
    }
  }, [setMain, handleNewIds, objects]);

  return { onReceiveMain };
};
