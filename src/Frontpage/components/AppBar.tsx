import { useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRecoilState } from 'recoil';

import * as atoms from '../../atoms';

const AppBar = () => {
  const [user, setUser] = useRecoilState(atoms.user);
  const navigate = useNavigate();

  const onClickLogout = useCallback(() => {
    setUser(undefined);
    window.localStorage.removeItem('loggedAo13User');
    navigate('/');
  }, [navigate, setUser]);

  return (
    <div className="absolute left-0 right-0 top-0 h-12 bg-zinc-200 justify-between flex items-center border border-b-zinc-300">
      <div className="w-1/3 pl-3">
        <Link className="text-rose-900 hover:text-rose-700 active:text-rose-500 font-bold" to="/">
          AO13
        </Link>
      </div>
      <div className="w-1/3 flex justify-center">
        {user?.username && `Hi, ${user.username}`}
      </div>
      <div className="w-1/3 flex justify-end pr-3 gap-4">
        {user && !user.username.includes('guest_') && (
          <Link
            className="text-2xl text-zinc-700 hover:text-zinc-500 active:text-zinc-400"
            to="/settings"
          >
            {'\u2699'}
          </Link>
        )}
        <div className="flex flex-col justify-center">
          <button
            className="border text-zinc-700 hover:text-zinc-500 active:text-zinc-400 border-zinc-700 hover:border-zinc-500 active:border-zinc-400 pl-2 pr-2 rounded"
            onClick={onClickLogout}
            type="button"
          >
            logout
          </button>
        </div>
      </div>

    </div>
  );
};

export default AppBar;
