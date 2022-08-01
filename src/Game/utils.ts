export const degreesToRadians = (degrees: any) => degrees * (Math.PI / 180);
export const radiansToDegrees = (radians: any) => radians * (180 / Math.PI);
export const parseIceUfrag = (sdp: any) => sdp
  .split('\r\n')
  .find((x: any) => x.includes('a=ice-ufrag:'))
  .replace('a=ice-ufrag:', '');
