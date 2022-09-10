import * as hooks from '.';

export const useConnections = () => {
  const createRTCPeerConnection = hooks.useRTCPeerConnection();
  const createOrderedChannel = hooks.useChannelOrdered();
  const createUnorderedChannel = hooks.useChannelUnordered();
};
