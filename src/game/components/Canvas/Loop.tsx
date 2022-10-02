import { memo } from "react";
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { useSetRecoilState, useRecoilValue } from 'recoil';

import * as networkingHooks from '../../../networking/hooks';
import { radiansToDegrees } from '../../../utils';
import {
  interpolationAlpha,
  sendIntervalClient,
  sendIntervalMain,
} from '../../../parameters';

import * as atoms from '../../../atoms';
import * as types from '../../../types';

const handleKeys = (delta: number, gameObject: types.GameObject) => {
  const o = gameObject;
  for (const key of o.keyDowns) {
    switch (key) {
      case types.Keys.UP:
        o.controlsUp += delta;
        o.controlsOverChannelsUp += delta;
        break;
      case types.Keys.DOWN:
        o.controlsDown += delta;
        o.controlsOverChannelsDown += delta;
        break;
      case types.Keys.LEFT:
        o.controlsLeft += delta;
        o.controlsOverChannelsLeft += delta;
        break;
      case types.Keys.RIGHT:
        o.controlsRight += delta;
        o.controlsOverChannelsRight += delta;
        break;
      default:
        break;
    }
  }
};

const handleCamera = (camera: THREE.Camera, gameObject: types.GameObject, object3D: THREE.Object3D) => {
  const c = camera;
  c.position.x = gameObject.position.x;
  c.position.y = gameObject.position.y;
  c.rotation.z = object3D.rotation.z;
  c.translateY(2);
};

const handleOverlayInfotext = (
  overlayInfotextRef: types.OverlayInfotextRef,
  gameObject: types.GameObject,
  object3D: THREE.Object3D,
) => {
  const overlayInfotext = overlayInfotextRef;
  if (overlayInfotext.current) {
    const degree = Math.round(radiansToDegrees(-object3D.rotation.z));
    const heading = degree < 0 ? degree + 360 : degree;
    overlayInfotext.current.textContent = `x: ${object3D.position.x.toFixed(0)}
    y: ${object3D.position.y.toFixed(0)}
    z: ${object3D.position.z.toFixed(0)}
    heading: ${heading}
    speed: ${gameObject.speed.toFixed(1)}`;
  }
};

const handleMovement = (delta: number, gameObject: types.GameObject, object3D: THREE.Object3D) => {
  const o = gameObject;
  const forceUp = delta > 1 ? o.controlsUp : delta * o.controlsUp;
  const forceDown = delta > 1 ? o.controlsDown : delta * o.controlsDown;
  const forceLeft = delta > 1 ? o.controlsLeft : delta * o.controlsLeft;
  const forceRight = delta > 1 ? o.controlsRight : delta * o.controlsRight;
  o.speed += forceUp;
  if (o.speed > 10) o.speed = 10;
  o.speed -= forceDown;
  if (o.speed < 0.3) o.speed = 0.3;
  object3D.rotateZ(o.rotationSpeed * forceLeft);
  object3D.rotateZ(-1 * o.rotationSpeed * forceRight);
  o.controlsUp -= forceUp;
  o.controlsDown -= forceDown;
  o.controlsLeft -= forceLeft;
  o.controlsRight -= forceRight;
  object3D.translateY(o.speed * delta);
};

const gatherUpdateData = (updateData: { [id: string]: types.UpdateObject }, o: types.GameObject) => {
  const data = updateData;
  data[o.id] = {
    uScore: o.score,
    uControlsUp: o.controlsOverChannelsUp,
    uControlsDown: o.controlsOverChannelsDown,
    uControlsLeft: o.controlsOverChannelsLeft,
    uControlsRight: o.controlsOverChannelsRight,
    uRotationSpeed: o.rotationSpeed,
    uSpeed: o.speed,
    uPositionX: o.position.x,
    uPositionY: o.position.y,
    uPositionZ: o.position.z,
    uQuaternionX: o.quaternion.x,
    uQuaternionY: o.quaternion.y,
    uQuaternionZ: o.quaternion.z,
    uQuaternionW: o.quaternion.w,
  };
};

const resetControlValues = (gameObject: types.GameObject) => {
  const o = gameObject;
  o.controlsOverChannelsUp = 0;
  o.controlsOverChannelsDown = 0;
  o.controlsOverChannelsLeft = 0;
  o.controlsOverChannelsRight = 0;
};

const handleInfoRef = (
  gameObject: types.GameObject,
  v: THREE.Vector3,
  h: number,
  w: number,
  object3D: THREE.Object3D,
  camera: THREE.Camera,
) => {
  const o = gameObject;
  if (o.infoRef) {
    o.infoRef.textContent = o.username;
    v.copy(object3D.position);
    v.project(camera);
    o.infoRef.style.top = `calc(${h * -v.y + h}px + 10%)`;
    o.infoRef.style.left = `${w * v.x + w}px`;
  }
};

const gatherControlsData = (o: types.GameObject) => ({
  up: o.controlsOverChannelsUp,
  down: o.controlsOverChannelsDown,
  left: o.controlsOverChannelsLeft,
  right: o.controlsOverChannelsRight,
});

const interpolatePosition = (o: types.GameObject, object3D: THREE.Object3D) => {
  object3D.position.lerp(o.backendPosition, interpolationAlpha);
  object3D.quaternion.slerp(o.backendQuaternion, interpolationAlpha);
};

const Loop = () => {
  const main = useRecoilValue(atoms.main);
  const objects = useRecoilValue(atoms.objects);
  const ownId = useRecoilValue(atoms.ownId);
  const overlayInfotext = useRecoilValue(atoms.overlayInfotext);
  const setScore = useSetRecoilState(atoms.score);

  const { sendUnordered: sendUnorderedFromClient } = networkingHooks.useSendFromClient();
  const { sendUnordered: sendUnorderedFromMain } = networkingHooks.useSendFromMain();
  const { size, camera } = useThree();

  const v = new THREE.Vector3();
  const h = size.height / 2;
  const w = size.width / 2;

  let nextSendTime = Date.now();

  let nextScoreTime = Date.now();
  const scoreTimeInteval = 9875;

  useFrame((state, delta) => {
    if (main) { // main
      const updateData: { [id: string]: types.UpdateObject } = {};
      for (let i = (objects.current || []).length; i > -1; i--) {
        const o = objects.current?.[i];
        if (o && o.object3D) {
          if (o.id === ownId) {
            handleKeys(delta, o);
            handleCamera(camera, o, o.object3D);
            handleOverlayInfotext(overlayInfotext, o, o.object3D);
          }
          handleMovement(delta, o, o.object3D);
          if (Date.now() > nextSendTime) {
            gatherUpdateData(updateData, o);
            resetControlValues(o);
          }
          handleInfoRef(o, v, h, w, o.object3D, camera);
          // mock
          if (Date.now() > nextScoreTime) {
            nextScoreTime = Date.now() + scoreTimeInteval;
            o.score += 1;
            setScore(o.score);
          }
        }
      }
      if (Date.now() > nextSendTime) {
        nextSendTime = Date.now() + sendIntervalMain;
        sendUnorderedFromMain({ type: types.NetDataType.UPDATE, data: updateData });
      }
    } else { // client
      for (let i = (objects.current || []).length; i > -1; i--) {
        const o = objects.current?.[i];
        if (o && o.object3D) {
          if (o.id === ownId) {
            handleKeys(delta, o);
            handleCamera(camera, o, o.object3D);
            handleOverlayInfotext(overlayInfotext, o, o.object3D);
            if (Date.now() > nextSendTime) {
              nextSendTime = Date.now() + sendIntervalClient;
              sendUnorderedFromClient({ type: types.NetDataType.CONTROLS, data: gatherControlsData(o) });
              resetControlValues(o);
            }
          }
          handleMovement(delta, o, o.object3D);
          interpolatePosition(o, o.object3D);
          handleInfoRef(o, v, h, w, o.object3D, camera);
        }
      }
    }
  });
  return (<></>); // eslint-disable-line
};
export default memo(Loop);
