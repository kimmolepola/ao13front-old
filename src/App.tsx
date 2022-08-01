import React, { useEffect, useState } from 'react';
import {
  useNavigate,
  BrowserRouter,
  Routes,
  Route,
} from 'react-router-dom';
import Game from './Game/Game';
import Frontpage from './Frontpage/Frontpage';
import { setToken } from './networking/services/auth.service';
import { getUser } from './networking/services/user.service';

const Container = () => {
  const history = useNavigate();
  const [user, setUser] = useState<any>();

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
      <Route path="/play" element={<Game refreshUser={refreshUser} history={history} user={user} />} />
      <Route
        path="*"
        element={(
          <Frontpage
            refreshUser={refreshUser}
            history={history}
            setUser={setUser}
            user={user}
          />
        )}
      />
    </Routes>
  );
};

const App = () => (
  <BrowserRouter>
    <Container />
  </BrowserRouter>
);

export default App;
