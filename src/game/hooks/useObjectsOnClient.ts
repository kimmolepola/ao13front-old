import { useCallback } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import * as THREE from 'three';

import * as atoms from '../../atoms';
import * as types from '../../types';

export const useObjectsOnClient = () => {
  const objectsRef = useRecoilValue(atoms.objects);
  const setObjectIds = useSetRecoilState(atoms.objectIds);

  const handleUpdateData = useCallback((data: types.Update) => {
    if (objectsRef.current) {
      for (let i = (objectsRef.current).length; i > 0; i--) {
        const o = (objectsRef.current)[i];
        const u = data.data[o.id];
        if (u) {
          o.score = u.uScore;
          o.controlsOverChannelsUp += u.uControlsUp || 0;
          o.controlsDown += u.uControlsDown || 0;
          o.controlsLeft += u.uControlsLeft || 0;
          o.controlsUp += u.uControlsUp || 0;
          o.rotationSpeed = u.uRotationSpeed || 0;
          o.speed = u.uSpeed || 0;
          o.backendPosition.set(u.uPositionX, u.uPositionY, u.uPositionZ);
          o.backendQuaternion.set(u.uQuaternionX, u.uQuaternionY, u.uQuaternionZ, u.uQuaternionW);
        }
      }
    }
  }, [objectsRef]);

  const handleStateData = useCallback((data: types.State) => {
    let objectIdsChanged = false;
    for (let i = (objectsRef.current || []).length - 1; i > -1; i--) {
      const o = (objectsRef.current || [])[i];
      const s = data.data[o.id];
      if (!s) {
        objectIdsChanged = true;
        objectsRef.current?.splice(i, 1);
      } else {
        o.username = s.sUsername;
      }
    }
    Object.values(data.data).forEach((s) => {
      if (objectsRef.current) {
        if (!objectsRef.current.some((x) => x.id === s.sId)) {
          objectIdsChanged = true;
          objectsRef.current.push({
            id: s.sId,
            player: s.sPlayer,
            username: s.sUsername,
            score: s.sScore,
            controlsUp: 0,
            controlsDown: 0,
            controlsLeft: 0,
            controlsRight: 0,
            controlsOverChannelsUp: 0,
            controlsOverChannelsDown: 0,
            controlsOverChannelsLeft: 0,
            controlsOverChannelsRight: 0,
            rotationSpeed: s.sRotationSpeed,
            speed: s.sSpeed,
            position: new THREE.Vector3(s.sPositionX, s.sPositionY, s.sPositionZ),
            quaternion: new THREE.Quaternion(s.sQuaternionX, s.sQuaternionY, s.sQuaternionZ, s.sQuaternionW),
            backendPosition: new THREE.Vector3(s.sPositionX, s.sPositionY, s.sPositionZ),
            backendQuaternion: new THREE.Quaternion(s.sQuaternionX, s.sQuaternionY, s.sQuaternionZ, s.sQuaternionW),
            keyDowns: [],
            infoRef: undefined,
            object3D: undefined,
          });
        }
      }
    });
    if (objectIdsChanged) {
      const ids = Object.keys(data.data);
      setObjectIds(ids);
    }
  }, [objectsRef, setObjectIds]);

  return { handleUpdateData, handleStateData };
};
