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
