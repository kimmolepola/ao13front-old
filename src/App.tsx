import { useCallback, useEffect } from 'react';
import {
  Routes,
  Route,
} from 'react-router-dom';
import {
  useSetRecoilState,
} from 'recoil';

import Game from './Game/Game';
import Frontpage from './Frontpage/Frontpage';
import { setToken } from './networking/services/auth.service';
import { getUser } from './networking/services/user.service';

import * as atoms from './atoms';

const App = () => {
  const setUser = useSetRecoilState(atoms.user);

  const refreshUser = useCallback(async () => {
    const item = localStorage.getItem('loggedAo13User');
    if (item) {
      setToken(JSON.parse(item).token);
      const { data } = await getUser();
      setUser(data);
    }
    return true;
  }, [setUser]);

  useEffect(
    () => { refreshUser(); },
    [refreshUser],
  );

  return (
    <Routes>
      <Route path="/play" element={<Game refreshUser={refreshUser} />} />
      <Route
        path="*"
        element={(
          <Frontpage
            refreshUser={refreshUser}
          />
        )}
      />
    </Routes>
  );
};

export default App;
