import { Routes, Route } from 'react-router-dom';

import Game from './game';
import Frontpage from './frontpage';

const App = () => (
  <Routes>
    <Route path="/play" element={<Game />} />
    <Route path="*" element={(<Frontpage />)} />
  </Routes>
);

export default App;
