import { RefObject } from 'react';

export type OverlayInfotextRef = RefObject<HTMLDivElement>

export type ChatMessage = {
  id: string,
  userId: string,
  username: string,
  message: string,
}

export enum Keys {
  UP = 'up',
  DOWN = 'down',
  LEFT = 'left',
  RIGHT = 'right'
}

export type GameObjectElement = { rotateZ: any, translateY: any, position: any, rotation: any };

export type GameObject = {
  id: string,
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
  positionX: number,
  positionY: number,
  positionZ: number,
  quaternionX: number,
  quaternionY: number,
  quaternionZ: number,
  quaternionW: number,
  backendPositionX: number,
  backendPositionY: number,
  backendPositionZ: number,
  backendQuaternionX: number,
  backendQuaternionY: number,
  backendQuaternionZ: number,
  backendQuaternionW: number,
  keyDowns: Keys[],
  elRef: GameObjectElement | undefined,
  infoRef: HTMLDivElement,
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
  id: string,
  userId: string,
  message: string,
}

export type Controls = {
  type: NetDataType.CONTROLS,
  up: number,
  down: number,
  left: number,
  right: number,
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
  description?: any,
  candidate?: any,
}

export type InitialGameObject = {
  username: string;
  score: number;
}
