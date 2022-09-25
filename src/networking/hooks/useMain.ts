import { useEffect, useCallback } from 'react';
import { useSetRecoilState, useRecoilValue, useRecoilState } from 'recoil';

import { saveGameState, getGameObject } from '../services/gameObject.service';

import * as parameters from "../../game/parameters"
import * as atoms from '../../atoms';
import * as types from '../../types';
import * as hooks from '.';

export const useMain = () => {
  const channelsOrdered = useRecoilValue(atoms.channelsOrdered);
  const channelsUnordered = useRecoilValue(atoms.channelsUnordered);
  const objects = useRecoilValue(atoms.objects);
  const [main, setMain] = useRecoilState(atoms.main);
  const [objectIds, setObjectIds] = useRecoilState(atoms.objectIds);
  const [connectedIds, setConnectedIds] = useRecoilState(atoms.connectedIds);
  const { sendOrdered } = hooks.useSendFromMain();
  const mainUpdatePeers = useCallback(() => {
    console.log('--updatePeers');
  }, []);

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
    const newObjectIds = objectIds.filter((x) => !disconnectedIds.includes(x))
    newObjectIds.push(...newIds);
    setObjectIds(newObjectIds);
  }, [channelsOrdered, channelsUnordered, connectedIds]);

  useEffect(() => {
    // channels change
    if (main) {
      onChannelsChanged();
    }
  }, [main, channelsOrdered, channelsUnordered, onChannelsChanged]);

  useEffect(() => {
    // main change
    let intervalId = 0;
    if (main) {
      intervalId = window.setInterval(() => {
        sendOrdered({
          type: types.NetDataType.STATE,
          data: (objects.current || []).reduce((acc: { [id: string]: types.StateObject }, cur) => {
            acc[cur.id] = {
              sId: cur.id,
              sUsername: cur.username,
              sScore: cur.score,
              sRotationSpeed: cur.rotationSpeed,
              sSpeed: cur.speed,
              sPositionX: cur.position.x,
              sPositionY: cur.position.y,
              sPositionZ: cur.position.z,
              sQuaternionX: cur.quaternion.x,
              sQuaternionY: cur.quaternion.y,
              sQuaternionZ: cur.quaternion.z,
              sQuaternionW: cur.quaternion.w,
            };
            return acc;
          }, {}),
        });
      }, parameters.sendIntervalMainState);
    }
    return () => clearInterval(intervalId);
  }, [main, objects, sendOrdered]);

  const onReceiveMain = useCallback((id: string) => {
    setMain(true);
    if (!objectIds.includes(id)) {
      setObjectIds([...objectIds, id]);
    }
  }, [setMain, objectIds, setObjectIds]);

  return { onReceiveMain };
};
