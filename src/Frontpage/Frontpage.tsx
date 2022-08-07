import { memo } from 'react';
import {
  Link, useLocation, Routes, Route,
} from 'react-router-dom';
import { useRecoilValue } from 'recoil';

import Login from './components/Login';
import ForgottenPassword from './components/ForgottenPassword';
import SignUp from './components/SignUp';
import ResetPassword from './components/ResetPassword';
import LoggedIn from './components/LoggedIn';
import AppBar from './components/AppBar';

import * as atoms from '../atoms';

const Frontpage = ({
  refreshUser,
}: { refreshUser: () => Promise<void> }) => {
  const user = useRecoilValue(atoms.user);
  const location = useLocation();

  return (
    <>
      {Boolean(user) && <AppBar />}
      <div className={`flex flex-col items-center absolute inset-0 bg-rose-50 text-zinc-900 gap-4 ${user ? 'pt-12 top-12' : 'pt-24'}`}>
        {!user && location.pathname === '/' ? <a href="/">AO13</a> : <Link to="/">AO13</Link>}
        <Routes>
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/forgottenpassword" element={<ForgottenPassword />} />
          <Route
            path="/signup"
            element={<SignUp />}
          />
          <Route
            path="*"
            element={!user
              ? <Login />
              : (
                <LoggedIn
                  refreshUser={refreshUser}
                />
              )}
          />
        </Routes>
      </div>
    </>
  );
};

export default memo(Frontpage);
