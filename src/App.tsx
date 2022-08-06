import { useEffect } from 'react';
import {
  Routes,
  Route,
} from 'react-router-dom';
import {
  useRecoilState,
} from 'recoil';

import Game from './Game/Game';
import Frontpage from './Frontpage/Frontpage';
import { setToken } from './networking/services/auth.service';
import { getUser } from './networking/services/user.service';

import * as atoms from './atoms';

const App = () => {
  const [user, setUser] = useRecoilState(atoms.user);

  const refreshUser = async () => {
    console.log('refreshUser');
    const item = window.localStorage.getItem('loggedAo13User');
    if (item && item !== 'null' && item !== 'undefined') {
      console.log('refreshUser - setToken:', JSON.parse(item).token);
      setToken(JSON.parse(item).token);
      const { data, error } = await getUser();
      console.log('refreshUser - setUser:', data);
      setUser(data);
    }
    return true;
  };

  useEffect(
    () => { refreshUser(); },
    [],
  );

  useEffect(() => {
    console.log('useEffect[user]');
    if (user) {
      console.log(
        'useEffect[user] - localStorage.setItem:',
        JSON.stringify(user),
      );
      window.localStorage.setItem('loggedAo13User', JSON.stringify(user));
    } else {
      console.log('useEffect[user] - localStorage.removeItem - commented out');
      // window.localStorage.removeItem('loggedAo13User');
    }
    console.log('useEffect[user] - setToken:', user ? user.token : null);
    setToken(user ? user.token : null);
  }, [user]);

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
