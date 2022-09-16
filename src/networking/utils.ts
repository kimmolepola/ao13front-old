export const logError = (error: any, data: any) => {
  if (
    error.message
    === "Failed to execute 'send' on 'RTCDataChannel': RTCDataChannel.readyState is not 'open'"
  ) {
    console.log(
      'Failed to send on data channel. This is expected if player disconnected.',
    );
  } else {
    console.error('Error:', error.message, 'Data:', data);
  }
};
