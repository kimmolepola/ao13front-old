import { useEffect, useCallback } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import * as THREE from "three";

import {
  savePlayerData,
  getGameObject,
} from "src/networking/services/gameObject.service";
import * as networkingHooks from "src/networking/hooks2";
import { objects } from "src/globals";

import * as parameters from "src/parameters";
import * as atoms from "src/atoms";
import * as types from "src/types";

const handleNewId = async (id: string) => {
  if (!objects.some((x) => x.id === id)) {
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
      objects.push(gameObject);
    } else {
      console.error("Failed to add new object, no initialGameObject");
    }
  }
  return objects.map((x) => x.id);
};

const savePlayerDataOnMain = async () => {
  const data =
    objects.reduce((acc: types.PlayerState[], cur) => {
      if (cur.player) {
        acc.push({ remoteId: cur.id, score: cur.score });
      }
      return acc;
    }, []) || [];
  await savePlayerData(data);
};

const handleSendState = (sendOrdered: (data: types.State) => void) => {
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

export const useObjectsOnMain2 = () => {
  const main = useRecoilValue(atoms.main);
  const setObjectIds = useSetRecoilState(atoms.objectIds);
  const { sendOrdered } = networkingHooks.useSendFromMain();

  const handleNewIdOnMain = useCallback(
    async (newId: string) => {
      console.log("--new id:", newId);
      const ids = await handleNewId(newId);
      setObjectIds(ids);
      console.log("--objects:", objects);
      console.log("--SET OBJECT IDS:", ids);
      handleSendState(sendOrdered);
    },
    [setObjectIds, sendOrdered]
  );

  const handleRemoveIdOnMain = useCallback(
    (idToRemove: string) => {
      savePlayerDataOnMain();
      const indexToRemove = objects.findIndex((x) => x.id === idToRemove);
      indexToRemove !== -1 && objects.splice(indexToRemove, 1);
      const ids = objects.map((x) => x.id);
      console.log("--handle remove, objects, ids:", objects, ids);
      setObjectIds(ids);
      handleSendState(sendOrdered);
    },
    [setObjectIds, sendOrdered]
  );

  useEffect(() => {
    // main change
    let sendMainStateIntervalId = 0;
    let savePlayerDataIntervalId = 0;
    if (main) {
      sendMainStateIntervalId = window.setInterval(() => {
        handleSendState(sendOrdered);
      }, parameters.sendIntervalMainState);
      savePlayerDataIntervalId = window.setInterval(() => {
        savePlayerDataOnMain();
      }, parameters.savePlayerDataInterval);
    }
    return () => {
      clearInterval(sendMainStateIntervalId);
      clearInterval(savePlayerDataIntervalId);
    };
  }, [main, sendOrdered]);

  const handleQuitForObjectsOnMain = useCallback(async () => {
    await savePlayerDataOnMain();
    objects.splice(0, objects.length);
    setObjectIds([]);
  }, [setObjectIds]);

  const handleReceiveControlsData = useCallback(
    (data: types.Controls, remoteId: string) => {
      const o = objects.find((x) => x.id === remoteId);
      if (o) {
        o.controlsUp += data.data.up || 0;
        o.controlsDown += data.data.down || 0;
        o.controlsLeft += data.data.left || 0;
        o.controlsRight += data.data.right || 0;
        o.controlsOverChannelsUp += data.data.up || 0;
        o.controlsOverChannelsDown += data.data.down || 0;
        o.controlsOverChannelsLeft += data.data.left || 0;
        o.controlsOverChannelsRight += data.data.right || 0;
      }
    },
    []
  );

  return {
    handleNewIdOnMain,
    handleRemoveIdOnMain,
    handleQuitForObjectsOnMain,
    handleReceiveControlsData,
  };
};
