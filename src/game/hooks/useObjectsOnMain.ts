import { useEffect, useCallback, RefObject } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import * as THREE from 'three';

import { savePlayerData, getGameObject } from '../../networking/services/gameObject.service';
import * as networkingHooks from '../../networking/hooks';

import * as parameters from '../../parameters';
import * as atoms from '../../atoms';
import * as types from '../../types';

const handleNewIds = async (newIds: string[], o: types.GameObject[]) => {
  const objects = o;
  await Promise.all(newIds.map(async (id) => {
    const initialGameObject = (await getGameObject(id)).data;
    if (initialGameObject) {
      const gameObject = {
        ...initialGameObject,
        id,
        controlsUp: 0,
        controlsDown: 0,
        controlsLeft: 0,
        controlsRight: 0,
        controlsOverChannelsUp: 0,
        controlsOverChannelsDown: 0,
        controlsOverChannelsLeft: 0,
        controlsOverChannelsRight: 0,
        rotationSpeed: parameters.rotationSpeed,
        speed: parameters.speed,
        backendPosition: new THREE.Vector3(),
        backendQuaternion: new THREE.Quaternion(),
        keyDowns: [],
        infoElement: undefined,
        infoBoxElement: undefined,
        object3D: undefined,
      };
      const oldInstanceIndex = objects.findIndex((x) => x.id === id);
      if (oldInstanceIndex !== -1) {
        objects[oldInstanceIndex] = gameObject;
      } else {
        objects.push(gameObject);
      }
    } else {
      console.error('Failed to add new object, no initialGameObject');
    }
  }));
  return objects.map((x) => x.id);
};

const handleRemoveIds = (idsToRemove: string[], o: types.GameObject[]) => {
  const objects = o;
  const playerStateToSave = [];

  for (let i = objects.length - 1; i > -1; i--) {
    if (idsToRemove.includes(objects[i].id)) {
      if (objects[i].player) {
        playerStateToSave.push({
          remoteId: objects[i].id,
          score: objects[i].score,
        });
      }
      objects.splice(i, 1);
    }
  }
  savePlayerData(playerStateToSave);
  return objects.map((x) => x.id);
};

const handleSendState = (sendOrdered: (data: types.State) => void, objects: types.GameObject[]) => {
  sendOrdered({
    type: types.NetDataType.STATE,
    data: objects.reduce((acc: { [id: string]: types.StateObject }, cur) => {
      acc[cur.id] = {
        sId: cur.id,
        sPlayer: cur.player,
        sUsername: cur.username,
        sScore: cur.score,
        sRotationSpeed: cur.rotationSpeed,
        sSpeed: cur.speed,
        sPositionX: cur.object3D?.position.x || 0,
        sPositionY: cur.object3D?.position.y || 0,
        sPositionZ: cur.object3D?.position.z || 0,
        sQuaternionX: cur.object3D?.quaternion.x || 0,
        sQuaternionY: cur.object3D?.quaternion.y || 0,
        sQuaternionZ: cur.object3D?.quaternion.z || 0,
        sQuaternionW: cur.object3D?.quaternion.w || 0,
      };
      return acc;
    }, {}),
  });
};

export const useObjectsOnMain = (objectsRef: RefObject<types.GameObject[]>) => {
  const main = useRecoilValue(atoms.main);
  const setObjectIds = useSetRecoilState(atoms.objectIds);
  const { sendOrdered } = networkingHooks.useSendFromMain();

  const savePlayerDataOnMain = useCallback(() => {
    const data = objectsRef.current?.reduce((acc: types.PlayerState[], cur) => {
      if (cur.player) {
        acc.push({ remoteId: cur.id, score: cur.score });
      }
      return acc;
    }, []) || [];
    savePlayerData(data);
  }, [objectsRef]);

  const handlePossiblyNewIdOnMain = useCallback(async (id: string) => {
    if (objectsRef.current && !objectsRef.current.some((x) => x.id === id)) {
      const ids = await handleNewIds([id], objectsRef.current);
      setObjectIds(ids);
    }
  }, [objectsRef, setObjectIds]);

  const handleNewIdsOnMain = useCallback(async (newIds: string[]) => {
    if (objectsRef.current) {
      const ids = await handleNewIds(newIds, objectsRef.current);
      setObjectIds(ids);
    }
  }, [objectsRef, setObjectIds]);

  const handleRemoveIdsOnMain = useCallback((idsToRemove: string[]) => {
    if (objectsRef.current) {
      const ids = handleRemoveIds(idsToRemove, objectsRef.current);
      setObjectIds(ids);
    }
  }, [objectsRef, setObjectIds]);

  useEffect(() => {
    // main change
    let sendMainStateIntervalId = 0;
    let savePlayerDataIntervalId = 0;
    if (main) {
      sendMainStateIntervalId = window.setInterval(() => {
        if (objectsRef.current) {
          handleSendState(sendOrdered, objectsRef.current);
        }
      }, parameters.sendIntervalMainState);
      savePlayerDataIntervalId = window.setInterval(() => {
        savePlayerDataOnMain();
      }, parameters.savePlayerDataInterval);
    }
    return () => {
      clearInterval(sendMainStateIntervalId);
      clearInterval(savePlayerDataIntervalId);
    };
  }, [main, objectsRef, sendOrdered, savePlayerDataOnMain]);

  return {
    handlePossiblyNewIdOnMain,
    handleNewIdsOnMain,
    handleRemoveIdsOnMain,
  };
};
