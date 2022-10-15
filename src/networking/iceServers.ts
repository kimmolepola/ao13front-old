const stunServers = () => [
  'stun3.l.google.com:19305?transport=udp',
  'stun.l.google.com:19302?transport=udp',
];

const iceServers = [
  {
    urls: (() => {
      const servers = <string[]>[];
      const amountOfServersToTry = 4;
      for (let i = 0; i < amountOfServersToTry; i += 1) {
        servers.push(
          `stun:${stunServers()[Math.floor(Math.random() * stunServers().length)]}`,
        );
      }
      return servers;
    })(),
  },
];

export default iceServers;
