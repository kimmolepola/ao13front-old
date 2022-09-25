import { useEffect } from "react";
import { useRecoilValue } from "recoil";
import * as THREE from "three"

import { saveGameState, getGameObject } from '../../networking/services/gameObject.service';

import * as atoms from "../../atoms";
import * as types from "../../types";

const handleNewIds = (newIds: string[], objects: types.GameObject[]) => {
  newIds.forEach(async (id) => {
    const initialGameObject = (await getGameObject(id)).data;
    if (objects && initialGameObject) {
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
      console.error('Failed to add new object, no objects.current or initialGameObject');
    }
  });
};

const handleIndexesToRemove = (indexesToRemove: number[], objects: types.GameObject[]) => {
  saveGameState(objects.map((x) => ({ remoteId: x.id, score: x.score })));
  indexesToRemove.forEach((x) => {
    objects.splice(x, 1);
  })
};

const handleIdsChange = (objectIds: string[], objects: types.GameObject[]) => {
  const newIds = objectIds.filter((x) => !objects.some((xx) => xx.id === x))
  const indexesToRemove = objects.reduce((acc: number[], cur, i) => {
    if (!objectIds.includes(cur.id)) {
      acc.push(i);
    }
    return acc;
  }, [])
  handleNewIds(newIds, objects);
  handleIndexesToRemove(indexesToRemove, objects)
}

export const useObjects = () => {
  const objectIds = useRecoilValue(atoms.objectIds);
  const objectsRef = useRecoilValue(atoms.objects);

  useEffect(() => {
    const objects = objectsRef.current;
    if (objects) {
      handleIdsChange(objectIds, objects);
    }
  }, [objectIds])
};