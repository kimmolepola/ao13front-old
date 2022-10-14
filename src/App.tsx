import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Game from './game';
import Frontpage from './frontpage';

import * as frontpageHooks from './frontpage/hooks';

const App = () => {
  const { loadSavedUser } = frontpageHooks.useAuth();

  useEffect(() => {
    console.log('--LOAD SAVED');
    loadSavedUser();
  }, [loadSavedUser]);

  return (
    <Routes>
      <Route path="/play" element={<Game />} />
      <Route path="*" element={(<Frontpage />)} />
    </Routes>
  );
};

export default App;
