import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import * as atoms from '../../atoms';

export const useIceServers = () => {
  const turnCredentials = useRecoilValue(atoms.turnCredentials);

  const iceServers = useMemo(() => [
    {
      urls: 'turns:turn.kimmolepola.com:443?transport=tcp',
      username: turnCredentials?.username,
      credential: turnCredentials?.password,
    },
  ], [turnCredentials]);

  return { iceServers };
};
