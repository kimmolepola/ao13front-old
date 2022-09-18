import * as THREE from 'three';
import { Quaternion } from 'three';
import { useThree, useFrame } from '@react-three/fiber';

import { useRecoilValue } from 'recoil';

import * as networkingHooks from '../../../networking/hooks';
import { radiansToDegrees } from '../../utils';
import {
  interpolationAlpha,
  sendInterval,
  relaySendInterval,
  sendIntervalMain,
  relaySendIntervalMain,
} from '../../parameters';

import * as atoms from '../../../atoms';
import * as types from '../../../types';
import * as hooks from './hooks';

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

const handleCamera = (camera: any, gameObject: types.GameObject, gameObjectElement: types.GameObjectElement) => {
  const c = camera;
  c.position.x = gameObject.positionX;
  c.position.y = gameObject.positionY;
  c.rotation.z = gameObjectElement.rotation.z;
  c.translateY(2);
};

const handleOverlayInfotext = (
  overlayInfotextRef: types.OverlayInfotextRef,
  gameObject: types.GameObject,
  gameObjectElement: types.GameObjectElement,
) => {
  const overlayInfotext = overlayInfotextRef;
  if (overlayInfotext.current) {
    const degree = Math.round(radiansToDegrees(-gameObjectElement.rotation.z));
    const heading = degree < 0 ? degree + 360 : degree;
    overlayInfotext.current.textContent = `x: ${gameObjectElement.position.x.toFixed(0)}
    y: ${gameObjectElement.position.y.toFixed(0)}
    z: ${gameObjectElement.position.z.toFixed(0)}
    heading: ${heading}
    speed: ${gameObject.speed.toFixed(1)}`;
  }
};

const handleMovement = (delta: number, gameObject: types.GameObject, gameObjectElement: types.GameObjectElement) => {
  const o = gameObject;
  const forceUp = delta > 1 ? o.controlsUp : delta * o.controlsUp;
  const forceDown = delta > 1 ? o.controlsDown : delta * o.controlsDown;
  const forceLeft = delta > 1 ? o.controlsLeft : delta * o.controlsLeft;
  const forceRight = delta > 1 ? o.controlsRight : delta * o.controlsRight;
  o.speed += forceUp;
  if (o.speed > 10) o.speed = 10;
  o.speed -= forceDown;
  if (o.speed < 0.3) o.speed = 0.3;
  gameObjectElement.rotateZ(o.rotationSpeed * forceLeft);
  gameObjectElement.rotateZ(-1 * o.rotationSpeed * forceRight);
  o.controlsUp -= forceUp;
  o.controlsDown -= forceDown;
  o.controlsLeft -= forceLeft;
  o.controlsRight -= forceRight;
  gameObjectElement.translateY(o.speed * delta);
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
    uPositionX: o.positionX,
    uPositionY: o.positionY,
    uPositionZ: o.positionZ,
    uQuaternionX: o.quaternionX,
    uQuaternionY: o.quaternionY,
    uQuaternionZ: o.quaternionZ,
    uQuaternionW: o.quaternionW,
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
  gameObjectElement: types.GameObjectElement,
  camera: any,
) => {
  const o = gameObject;
  o.infoRef.textContent = o.username;
  v.copy(gameObjectElement.position);
  v.project(camera);
  o.infoRef.style.top = `calc(${h * -v.y + h}px + 10%)`;
  o.infoRef.style.left = `${w * v.x + w}px`;
};

const Loop = () => {
  const main = useRecoilValue(atoms.main);
  const objects = useRecoilValue(atoms.objects);
  const ownId = useRecoilValue(atoms.ownId);
  const overlayInfotext = useRecoilValue(atoms.overlayInfotext);

  const { sendUnordered: sendUnorderedFromClient } = networkingHooks.useSendFromClient();
  const { sendUnordered: sendUnorderedFromMain } = networkingHooks.useSendFromMain();
  const { size, camera } = useThree();

  const v = new THREE.Vector3();
  const h = size.height / 2;
  const w = size.width / 2;

  let nextSendTime = Date.now();

  useFrame((state, delta) => {
    if (main) {
      const updateData: { [id: string]: types.UpdateObject } = {};

      for (let i = (objects.current || []).length; i > -1; i--) {
        const o = objects.current?.[i];
        if (o && o.elRef) {
          if (o.id === ownId) {
            // handle keys
            handleKeys(delta, o);
            // handle camera when for loop is on self
            handleCamera(camera, o, o.elRef);
            // handle own overlay info text
            handleOverlayInfotext(overlayInfotext, o, o.elRef);
          }
          // handle movement
          handleMovement(delta, o, o.elRef);
          if (Date.now() > nextSendTime) {
            // gather update data
            gatherUpdateData(updateData, o);
            // reset accumulated control values
            resetControlValues(o);
          }
          // handle infoRef
          // o.infoRef.textContent = o.username;
          // v.copy(o.elRef.position);
          // v.project(camera);
          // o.infoRef.style.top = `calc(${h * -v.y + h}px + 10%)`;
          // o.infoRef.style.left = `${w * v.x + w}px`;
        }
      }
      if (Date.now() > nextSendTime) {
        nextSendTime = Date.now() + sendIntervalMain;
        sendUnorderedFromMain({ type: types.NetDataType.UPDATE, data: updateData });
      }
    } else {
      for (let i = (objects.current || []).length; i > -1; i--) {
        const o = objects.current?.[i];
        if (o) { }
      }
    }
  });
  return <></> // eslint-disable-line
};
export default Loop;
