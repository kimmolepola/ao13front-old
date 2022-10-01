import { useEffect, useCallback } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import * as THREE from "three"

import { savePlayerData, getGameObject } from '../../networking/services/gameObject.service';
import * as networkingHooks from "../../networking/hooks"

import * as parameters from "../../parameters"
import * as atoms from "../../atoms";
import * as types from "../../types";

const handleNewIds = async (newIds: string[], objects: types.GameObject[]) => {
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
        rotationSpeed: 0,
        speed: 1,
        position: new THREE.Vector3(),
        quaternion: new THREE.Quaternion(),
        backendPosition: new THREE.Vector3(),
        backendQuaternion: new THREE.Quaternion(),
        keyDowns: [],
        infoRef: undefined,
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

const handleRemoveIds = (idsToRemove: string[], objects: types.GameObject[]) => {
  const playerStateToSave = [];

  for (let i = objects.length - 1; i > -1; i--) {
    if (idsToRemove.includes(objects[i].id)) {
      objects[i].player && playerStateToSave.push({
        remoteId: objects[i].id,
        score: objects[i].score
      })
      objects.splice(i, 1);
    }
  }
  savePlayerData(playerStateToSave);
  return objects.map((x) => x.id);
}

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
};

export const useObjectsOnMain = () => {
  const objectsRef = useRecoilValue(atoms.objects);
  const main = useRecoilValue(atoms.main);
  const setObjectIds = useSetRecoilState(atoms.objectIds);
  const { sendOrdered } = networkingHooks.useSendFromMain();

  const handlePossiblyNewIdOnMain = useCallback(async (id: string) => {
    if (objectsRef.current && !objectsRef.current.some((x) => x.id === id)) {
      const ids = await handleNewIds([id], objectsRef.current)
      setObjectIds(ids)
    }
  }, [objectsRef]);

  const handleNewIdsOnMain = useCallback(async (newIds: string[]) => {
    if (objectsRef.current) {
      const ids = await handleNewIds(newIds, objectsRef.current)
      setObjectIds(ids)
    }
  }, [objectsRef]);

  const handleRemoveIdsOnMain = useCallback((idsToRemove: string[]) => {
    if (objectsRef.current) {
      const ids = handleRemoveIds(idsToRemove, objectsRef.current)
      setObjectIds(ids)
    }
  }, [objectsRef]);

  useEffect(() => {
    // main change
    let intervalId = 0;
    if (main) {
      intervalId = window.setInterval(() => {
        objectsRef.current && handleSendState(sendOrdered, objectsRef.current)
      }, parameters.sendIntervalMainState);
    }
    return () => clearInterval(intervalId);
  }, [main, objectsRef, sendOrdered]);

  return { handlePossiblyNewIdOnMain, handleNewIdsOnMain, handleRemoveIdsOnMain }
};