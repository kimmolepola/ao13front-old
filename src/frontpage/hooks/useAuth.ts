import { useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { setToken } from '../../networking/services/auth.service';

import * as atoms from '../../atoms';

export const useAuth = () => {
  const setUser = useSetRecoilState(atoms.user);
  const loadSavedUser = useCallback(() => {
    const item = JSON.parse(localStorage.getItem('user') || 'null');
    setUser(item);
    setToken(item?.token);
  }, [setUser]);

  return { loadSavedUser };
};
