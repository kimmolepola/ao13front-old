import { useRef, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';

import Game from './game';
import Frontpage from './frontpage';

import * as frontpageHooks from './frontpage/hooks';

const App = () => {
  const objectsRef = useRef([]);
  console.log('--App');
  const { loadSavedUser } = frontpageHooks.useAuth();

  useEffect(() => {
    loadSavedUser();
  }, [loadSavedUser]);

  return (
    <Routes>
      <Route path="/play" element={<Game objectsRef={objectsRef} />} />
      <Route path="*" element={(<Frontpage objectsRef={objectsRef} />)} />
    </Routes>
  );
};

export default App;
