import { useCallback } from 'react';
import { useRecoilState } from 'recoil';

import { getUser } from '../services/user.service';
import * as atoms from '../../atoms';

export const useUser = () => {
  const [user, setUser] = useRecoilState(atoms.user);

  const refreshUser = useCallback(async () => {
    console.log('--refre');
    if (user) {
      console.log('--user:', user);
      const { data } = await getUser();
      console.log('--data:', data);
      setUser(data);
    }
  }, [user, setUser]);

  console.log('--render, user:', user);

  return { refreshUser };
};
