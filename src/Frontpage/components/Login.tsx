import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';

import { login } from '../../networking/services/auth.service';

import * as atoms from '../../atoms';
import * as types from '../types';
import * as hooks from '../hooks';

const Login = () => {
  const setUser = useSetRecoilState(atoms.user);
  const navigate = useNavigate();

  const [validation, setValidation, resetValidation] = hooks.useValidation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = useCallback(async (e: any) => {
    e.preventDefault();
    const newValidation = {
      dirty: true,
      state: types.ValidationState.OPEN,
      login: undefined,
      username: username.length ? undefined : 'Required',
      password: password.length ? undefined : 'Required',
    };
    if (!newValidation.username && !newValidation.password) {
      newValidation.state = types.ValidationState.LOADING;
      setValidation(newValidation);
      const { data, error } = await login({ username, password });
      newValidation.login = error;
      newValidation.state = types.ValidationState.OPEN;
      if (!error) {
        setUser(data);
        setUsername('');
      }
    }
    setPassword('');
    setValidation({ ...newValidation });
  }, [password, setUser, username, setValidation]);

  const onChangeUsername = useCallback((e: any) => {
    resetValidation();
    setUsername(e.target.value);
  }, [resetValidation]);

  const onChangePassword = useCallback((e: any) => {
    resetValidation();
    setPassword(e.target.value);
  }, [resetValidation]);

  const onClickCreate = useCallback(() => {
    navigate('/createaccount');
  }, [navigate]);

  return (
    <div className="flex flex-col text-sm gap-4 items-center w-full">
      {validation.login && <div className="text-red-400">{validation.login}</div>}
      <form onSubmit={onSubmit} className="flex flex-col gap-2 w-full max-w-[5cm]">
        {validation.username && <div className="text-red-400">{validation.username}</div>}
        <input
          className={`pl-2 h-8 border ${validation.username && 'border-red-400'}`}
          autoCapitalize="none"
          onChange={onChangeUsername}
          value={username}
          placeholder="username or email"
        />
        {validation.password && <div className="text-red-400">{validation.password}</div>}
        <input
          className={`pl-2 h-8 border ${validation.password && 'border-red-400'}`}
          type="password"
          onChange={onChangePassword}
          value={password}
          placeholder="password"
        />

        <button
          className="h-8 border text-gray-100 bg-rose-900 hover:border-zinc-400 active:bg-rose-700"
          disabled={validation.state === types.ValidationState.LOADING}
          type="submit"
        >
          Log in
        </button>
      </form>
      <Link
        className="text-orange-800 hover:underline active:text-orange-500"
        to="/forgottenpassword"
      >
        Forgotten password?
      </Link>
      <button
        className="h-8 border text-gray-50 bg-orange-500 hover:border-zinc-400 active:bg-orange-400 w-full max-w-[5cm]"
        type="button"
        onClick={onClickCreate}
      >
        Create account
      </button>
      <div className="max-x-[5cm] text-zinc-900">
        for demo use please use
        <br />
        username: demo
        <br />
        password: demo
        <br />
      </div>
    </div>
  );
};

export default Login;
