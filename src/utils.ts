export const degreesToRadians = (degrees: number) => degrees * (Math.PI / 180);
export const radiansToDegrees = (radians: number) => radians * (180 / Math.PI);
export const parseIceUfrag = (sdp: any) =>
  sdp
    .split("\r\n")
    .find((x: any) => x.includes("a=ice-ufrag:"))
    .replace("a=ice-ufrag:", "");
export const logError = (error: any, data: any) => {
  if (
    error.message ===
    "Failed to execute 'send' on 'RTCDataChannel': RTCDataChannel.readyState is not 'open'"
  ) {
    console.log(
      "Failed to send on data channel. This is expected if player disconnected."
    );
  } else {
    console.error("Error:", error.message, "Data:", data);
  }
};
