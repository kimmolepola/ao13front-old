import { RefObject } from 'react';
import * as THREE from 'three';

export type PeerConnectionsDictionary = {
  [id: string]: {
    peerConnection: RTCPeerConnection,
    handleSignaling: (
      description: RTCSessionDescription | null | undefined,
      candidate: RTCIceCandidate | null | undefined
    ) => void
  }
}

export type PlayerState = {
  remoteId: string,
  score: number,
}

export type OverlayInfotextRef = RefObject<HTMLDivElement>

export type ChatMessage = {
  userId: string,
  username: string,
  messageId: string,
  message: string,
}

export enum Keys {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

export type GameObject = {
  id: string,
  player: boolean,
  username: string,
  score: number,
  controlsUp: number,
  controlsDown: number,
  controlsLeft: number,
  controlsRight: number,
  controlsOverChannelsUp: number,
  controlsOverChannelsDown: number,
  controlsOverChannelsLeft: number,
  controlsOverChannelsRight: number,
  rotationSpeed: number,
  speed: number,
  position: THREE.Vector3,
  quaternion: THREE.Quaternion,
  backendPosition: THREE.Vector3,
  backendQuaternion: THREE.Quaternion,
  keyDowns: Keys[],
  infoRef: HTMLDivElement | null | undefined,
  object3D: THREE.Object3D | undefined,
}

export enum NetDataType {
  CHATMESSAGE_CLIENT,
  CHATMESSAGE_MAIN,
  CONTROLS,
  UPDATE,
  STATE,
}

export type ChatMessageFromClient = {
  type: NetDataType.CHATMESSAGE_CLIENT,
  message: string,
}

export type ChatMessageFromMain = {
  type: NetDataType.CHATMESSAGE_MAIN,
  userId: string,
  messageId: string,
  message: string,
}

export type Controls = {
  type: NetDataType.CONTROLS,
  data: {
    up: number,
    down: number,
    left: number,
    right: number,
  }
}

export type UpdateObject = {
  uScore: number,
  uControlsUp: number,
  uControlsDown: number,
  uControlsLeft: number,
  uControlsRight: number,
  uRotationSpeed: number,
  uSpeed: number,
  uPositionX: number,
  uPositionY: number,
  uPositionZ: number,
  uQuaternionX: number,
  uQuaternionY: number,
  uQuaternionZ: number,
  uQuaternionW: number,
}

export type StateObject = {
  sId: string,
  sPlayer: boolean,
  sUsername: string,
  sScore: number,
  sRotationSpeed: number,
  sSpeed: number,
  sPositionX: number,
  sPositionY: number,
  sPositionZ: number,
  sQuaternionX: number,
  sQuaternionY: number,
  sQuaternionZ: number,
  sQuaternionW: number,
}

export type Update = {
  type: NetDataType.UPDATE,
  data: {
    [id: string]: UpdateObject
  },
}

export type State = {
  type: NetDataType.STATE,
  data: { [id: string]: StateObject },
}

export type NetData = ChatMessageFromClient | Controls | ChatMessageFromMain | Update | State;

export type Channel = {
  send: (stringData: string) => void
}

export type Signaling = {
  remoteId: string,
  description?: RTCSessionDescription | null,
  candidate?: RTCIceCandidate | null,
}

export type InitialGameObject = {
  username: string;
  score: number;
  player: boolean;
}
