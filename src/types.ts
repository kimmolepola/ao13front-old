export type ChatMessage = {
  id: string,
  userId: string,
  username: string,
  message: string,
}

export type ChatMessageFromClient = {
  message: string,
}

export type ChatMessageFromMain = {
  id: string,
  userId: string,
  message: string,
}

export type Controls = [
  up: number,
  down: number,
  left: number,
  right: number,
]

export type Update = {
  [id: string]: [
    controlsUp: number,
    controlsDown: number,
    controlsLeft: number,
    controlsRight: number,
    rotationSpeed: number,
    speed: number,
    positionX: number,
    positionY: number,
    positionZ: number,
    quaternionX: number,
    quaternionY: number,
    quaternionZ: number,
    quaternionW: number,
  ]
}

export type AllObjectIds = string[]

export type NetDataFromClient = {
  chatMessageFromClient?: ChatMessageFromClient,
  controls?: Controls,
  allObjectIds: never,
  chatMessageFromMain: never,
  update: never,
}

export type NetDataFromMain = {
  allObjectIds?: AllObjectIds,
  chatMessageFromMain?: ChatMessageFromMain,
  update?: Update,
  chatMessageFromClient: never,
  controls: never,
}

export type Channel = {
  send: (stringData: string) => void
}

export type Signaling = {
  remoteId: string,
  description?: any,
  candidate?: any,
}

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
  backendPositionX: number,
  backendPositionY: number,
  backendPositionZ: number,
  backendQuaternionX: number,
  backendQuaternionY: number,
  backendQuaternionZ: number,
  backendQuaternionW: number,
}

export type InitialGameObject = {
  id: string,
  username: string;
  score: number;
}
