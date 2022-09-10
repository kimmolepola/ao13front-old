export const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);
export const radiansToDegrees = (radians: number) => radians * (180 / Math.PI);
export const parseIceUfrag = (sdp: any) => sdp
  .split('\r\n')
  .find((x: any) => x.includes('a=ice-ufrag:'))
  .replace('a=ice-ufrag:', '');
